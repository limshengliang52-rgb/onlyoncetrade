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

const ID_RE = /^[A-Za-z0-9_-]{3,64}$/;

export const Route = createFileRoute("/api/public/ea-license/check")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const account_id = url.searchParams.get("account_id")?.trim() ?? "";
        const uid = url.searchParams.get("uid")?.trim() ?? "";
        const product = url.searchParams.get("product")?.trim() ?? "";
        const version = url.searchParams.get("version")?.trim() ?? "";
        const signature = url.searchParams.get("signature")?.trim() ?? "";

        const expectedKey = process.env.EA_LICENSE_API_KEY;
        if (!expectedKey || signature !== expectedKey) {
          return respond({ authorized: false, reason: "invalid_signature" }, 401);
        }
        if (!ID_RE.test(account_id) || !ID_RE.test(product)) {
          return respond({ authorized: false, reason: "invalid_params" }, 400);
        }

        const admin = getAdmin();
        const nowIso = new Date().toISOString();

        // Lazy-expire ea_licenses
        await admin
          .from("ea_licenses")
          .update({ status: "expired" })
          .eq("mt5_account_id", account_id)
          .eq("product", product)
          .eq("status", "active")
          .lt("expires_at", nowIso);

        const { data, error } = await admin
          .from("ea_licenses")
          .select("status, expires_at, uid, member_name")
          .eq("mt5_account_id", account_id)
          .eq("product", product)
          .maybeSingle();

        if (error) {
          console.error("ea-license check error", error);
          return respond({ authorized: false, reason: "server_error" }, 500);
        }

        if (data) {
          if (data.status === "suspended") {
            return respond({ authorized: false, reason: "suspended" });
          }
          if (data.status !== "active" || new Date(data.expires_at) < new Date()) {
            return respond({ authorized: false, reason: "expired", expires_at: data.expires_at });
          }
          if (uid && data.uid && uid !== data.uid) {
            return respond({ authorized: false, reason: "uid_mismatch" });
          }
          void version;
          return respond({ authorized: true, status: "active", expires_at: data.expires_at });
        }

        // Fallback: subscriptions by MT5 UID (real paid customers)
        const productKey = product.toLowerCase().includes("btc")
          ? "btc"
          : product.toLowerCase().includes("xau") || product.toLowerCase().includes("gold")
            ? "xau"
            : product.toLowerCase();

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
        if (!allowed.includes(productKey)) {
          return respond({ authorized: false, reason: "product_not_allowed" });
        }
        void uid;
        void version;
        return respond({ authorized: true, status: "active", expires_at: sub.expires_at });
      },
    },
  },
});
      },
    },
  },
});
