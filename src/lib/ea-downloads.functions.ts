import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type FileKey =
  | "xau_ea"
  | "xau_set"
  | "xau_windows"
  | "xau_mac"
  | "btc_windows"
  | "btc_mac"
  | "guide_cn"
  | "guide_en"
  | "guide_mac";

export type EADownloadFile = {
  key: FileKey;
  label: string;
  url: string | null;
  missing?: boolean;
  filename?: string;
};

export type EADownloadsResult = {
  authorized: boolean;
  reason?: "no_subscription" | "expired";
  plan?: string;
  products?: string[];
  expires_at?: string | null;
  mt5_uid?: string;
  files: EADownloadFile[];
};

type StorageObject = {
  name: string;
  updated_at?: string | null;
  created_at?: string | null;
};

function pickLatest(
  objects: StorageObject[],
  predicate: (name: string) => boolean,
): StorageObject | null {
  const matches = objects.filter((o) => predicate(o.name));
  if (!matches.length) return null;
  matches.sort((a, b) => {
    const at = new Date(a.updated_at || a.created_at || 0).getTime();
    const bt = new Date(b.updated_at || b.created_at || 0).getTime();
    return bt - at;
  });
  return matches[0];
}

function matcherFor(key: FileKey): (name: string) => boolean {
  const lower = (s: string) => s.toLowerCase();
  switch (key) {
    // RR2.5 原版黄金 EA：优先精确匹配 OnlyOnce_XAUUSD_EA.ex5 / .set
    case "xau_ea":
      return (n) => {
        const l = lower(n);
        return l === "onlyonce_xauusd_ea.ex5" || (l.endsWith(".ex5") && l.includes("xauusd"));
      };
    case "xau_set":
      return (n) => {
        const l = lower(n);
        return l === "onlyonce_xauusd_ea.set" || (l.endsWith(".set") && l.includes("xauusd"));
      };
    case "xau_windows":
      return (n) => {
        const l = lower(n);
        return l.endsWith(".zip") && l.includes("xau") && l.includes("windows");
      };
    case "xau_mac":
      return (n) => {
        const l = lower(n);
        return l.endsWith(".zip") && l.includes("xau") && l.includes("mac");
      };
    case "btc_windows":
      return (n) => {
        const l = lower(n);
        return l.endsWith(".zip") && l.includes("btc") && l.includes("windows");
      };
    case "btc_mac":
      return (n) => {
        const l = lower(n);
        return l.endsWith(".zip") && l.includes("btc") && l.includes("mac");
      };
    case "guide_cn":
      return (n) => {
        const l = lower(n);
        return (
          l.endsWith(".pdf") &&
          !l.includes("mac") &&
          (l.includes("guide_cn") || l.includes("install_guide_cn"))
        );
      };
    case "guide_en":
      return (n) => {
        const l = lower(n);
        return (
          l.endsWith(".pdf") &&
          !l.includes("mac") &&
          (l.includes("guide_en") || l.includes("install_guide_en"))
        );
      };
    case "guide_mac":
      return (n) => {
        const l = lower(n);
        return l.endsWith(".pdf") && l.includes("mac");
      };
  }
}

export const getEADownloads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<EADownloadsResult> => {
    const nowIso = new Date().toISOString();
    const { data: sub, error } = await context.supabase
      .from("subscriptions")
      .select("plan, products, expires_at, status, mt5_uid")
      .eq("user_id", context.userId)
      .eq("status", "active")
      .gt("expires_at", nowIso)
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);

    if (!sub) {
      return { authorized: false, reason: "no_subscription", files: [] };
    }

    // Strictly follow subscriptions.products. Legacy rows with an empty
    // products array default to XAU only — admins must explicitly grant BTC.
    const products: string[] =
      Array.isArray(sub.products) && sub.products.length
        ? (sub.products as string[])
        : ["xau"];

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: listing, error: listErr } = await supabaseAdmin.storage
      .from("ea-files")
      .list("", { limit: 1000, sortBy: { column: "updated_at", order: "desc" } });
    if (listErr) throw new Error(listErr.message);
    const objects: StorageObject[] = (listing ?? []).filter((o) => o.name);

    const wanted: { key: FileKey; label: string }[] = [];
    if (products.includes("xau")) {
      wanted.push({ key: "xau_windows", label: "下载 XAUUSD EA (Windows)" });
      wanted.push({ key: "xau_mac", label: "下载 XAUUSD EA (MacBook)" });
    }
    if (products.includes("btc")) {
      wanted.push({ key: "btc_windows", label: "下载 BTCUSD EA (Windows)" });
      wanted.push({ key: "btc_mac", label: "下载 BTCUSD EA (MacBook)" });
    }
    wanted.push({ key: "guide_cn", label: "Windows 安装说明 (中文 PDF)" });
    wanted.push({ key: "guide_en", label: "Windows Install Guide (English PDF)" });
    wanted.push({ key: "guide_mac", label: "Mac 安装教学 PDF (中英)" });

    const files = await Promise.all(
      wanted.map(async (f): Promise<EADownloadFile> => {
        const match = pickLatest(objects, matcherFor(f.key));
        if (!match) {
          return { key: f.key, label: f.label, url: null, missing: true };
        }
        const { data: signed, error: sErr } = await supabaseAdmin.storage
          .from("ea-files")
          .createSignedUrl(match.name, 300, { download: true });
        if (sErr || !signed) {
          return { key: f.key, label: f.label, url: null, missing: true, filename: match.name };
        }
        return { key: f.key, label: f.label, url: signed.signedUrl, filename: match.name };
      }),
    );

    return {
      authorized: true,
      plan: sub.plan as string,
      products,
      expires_at: sub.expires_at as string | null,
      mt5_uid: sub.mt5_uid as string,
      files,
    };
  });
