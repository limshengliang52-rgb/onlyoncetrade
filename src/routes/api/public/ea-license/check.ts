import { createFileRoute } from "@tanstack/react-router";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _admin: SupabaseClient | null = null;
function getAdmin(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }
  return _admin;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...CORS },
  });
}

const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

// HMAC-SHA256 license signature so the EA can verify the response is genuine.
async function signLicense(parts: {
  uid: string;
  product: string;
  status: string;
  expires_at: string;
}): Promise<string> {
  const secret =
    process.env.LICENSE_SECRET || process.env.EA_LICENSE_API_KEY || "";
  if (!secret) return "";
  const payload = `${parts.uid}|${parts.product}|${parts.status}|${parts.expires_at}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function pickParam(url: URL, ...keys: string[]): string {
  for (const k of keys) {
    const v = url.searchParams.get(k);
    if (v && v.trim()) return v.trim();
  }
  return "";
}

function normalizeProduct(raw: string): { product: string; key: string } {
  const p = raw.toLowerCase();
  if (!p) return { product: "", key: "" };
  if (p.includes("btc")) return { product: raw, key: "btc" };
  if (p.includes("xau") || p.includes("gold")) return { product: raw, key: "xau" };
  return { product: raw, key: p };
}

export const Route = createFileRoute("/api/public/ea-license/check")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const account_id = pickParam(url, "mt5_account_id", "account_id", "account", "mt5_uid", "uid");
        const uid = pickParam(url, "uid", "mt5_uid");
        const productRaw = pickParam(url, "product", "symbol", "ea") || "xauusd";
        const { product, key: productKey } = normalizeProduct(productRaw);
        const signature = pickParam(url, "signature");

        // Signature is optional (enhancement only). Reject only if provided AND wrong.
        const expectedKey = process.env.EA_LICENSE_API_KEY;
        if (signature && expectedKey && signature !== expectedKey) {
          return respond({ authorized: false, reason: "invalid_signature" });
        }

        if (!account_id || !ID_RE.test(account_id)) {
          return respond({ authorized: false, reason: "invalid_params" });
        }

        const admin = getAdmin();
        const nowIso = new Date().toISOString();

        // Lazy-expire ea_licenses matching this account+product
        await admin
          .from("ea_licenses")
          .update({ status: "expired" })
          .eq("mt5_account_id", account_id)
          .eq("status", "active")
          .lt("expires_at", nowIso);

        // Try ea_licenses: exact product match first, then any product for this account
        let licenseRow: any = null;
        {
          const { data } = await admin
            .from("ea_licenses")
            .select("status, expires_at, uid, product")
            .eq("mt5_account_id", account_id)
            .eq("product", product)
            .maybeSingle();
          licenseRow = data;
        }
        if (!licenseRow && product) {
          const { data } = await admin
            .from("ea_licenses")
            .select("status, expires_at, uid, product")
            .eq("mt5_account_id", account_id)
            .ilike("product", `%${productKey}%`)
            .order("expires_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          licenseRow = data;
        }

        if (licenseRow) {
          if (licenseRow.status === "suspended") {
            return respond({ authorized: false, reason: "suspended" });
          }
          if (licenseRow.status !== "active" || new Date(licenseRow.expires_at) < new Date()) {
            return respond({ authorized: false, reason: "expired", expires_at: licenseRow.expires_at });
          }
          if (uid && licenseRow.uid && uid !== licenseRow.uid) {
            return respond({ authorized: false, reason: "uid_mismatch" });
          }
          return respond({
            authorized: true,
            status: "active",
            expires_at: licenseRow.expires_at,
            product: licenseRow.product,
            uid: licenseRow.uid ?? uid ?? null,
          });
        }

        // Fallback: subscriptions by MT5 UID (real paid customers)
        await admin
          .from("subscriptions")
          .update({ status: "expired" })
          .eq("mt5_uid", account_id)
          .eq("status", "active")
          .lt("expires_at", nowIso);

        const { data: sub } = await admin
          .from("subscriptions")
          .select("plan, products, status, expires_at")
          .eq("mt5_uid", account_id)
          .in("status", ["active", "expired", "cancelled"])
          .order("expires_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!sub) {
          return respond({ authorized: false, reason: "not_found" });
        }
        if (sub.status === "cancelled") {
          return respond({ authorized: false, reason: "suspended" });
        }
        if (sub.status !== "active" || !sub.expires_at || new Date(sub.expires_at as string) < new Date()) {
          return respond({ authorized: false, reason: "expired", expires_at: sub.expires_at });
        }
        const allowed: string[] =
          Array.isArray(sub.products) && sub.products.length
            ? (sub.products as string[])
            : sub.plan === "access"
              ? ["xau", "btc"]
              : ["xau"];
        if (productKey && !allowed.includes(productKey)) {
          return respond({ authorized: false, reason: "product_not_allowed" });
        }
        return respond({
          authorized: true,
          status: "active",
          expires_at: sub.expires_at,
          product: productRaw,
          uid: account_id,
        });
      },
    },
  },
});
