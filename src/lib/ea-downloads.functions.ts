import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// File paths inside the private `ea-files` bucket.
// Upload the actual EA files via the Supabase Storage UI at these keys.
const FILE_PATHS = {
  xau: "OnlyOnce_XAUUSD_EA.ex5",
  btc: "OnlyOnce_BTC_EA.ex5",
  guide: "OnlyOnce_Install_Guide.pdf",
} as const;

export type EADownloadFile = {
  key: "xau" | "btc" | "guide";
  label: string;
  url: string | null;
  missing?: boolean;
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

    const products: string[] =
      Array.isArray(sub.products) && sub.products.length
        ? (sub.products as string[])
        : sub.plan === "access"
          ? ["xau", "btc"]
          : ["xau"];

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const wanted: { key: "xau" | "btc" | "guide"; label: string; path: string }[] = [];
    if (products.includes("xau")) wanted.push({ key: "xau", label: "下载 XAUUSD EA", path: FILE_PATHS.xau });
    if (products.includes("btc")) wanted.push({ key: "btc", label: "下载 BTC EA", path: FILE_PATHS.btc });
    wanted.push({ key: "guide", label: "下载安装说明", path: FILE_PATHS.guide });

    const files = await Promise.all(
      wanted.map(async (f) => {
        const { data: signed, error: sErr } = await supabaseAdmin.storage
          .from("ea-files")
          .createSignedUrl(f.path, 300, { download: true });
        if (sErr || !signed) {
          return { key: f.key, label: f.label, url: null, missing: true } satisfies EADownloadFile;
        }
        return { key: f.key, label: f.label, url: signed.signedUrl } satisfies EADownloadFile;
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
