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
          return respond({ ok: false, status: "unauthorized", message: "Invalid signature" }, 401);
        }
        if (!ID_RE.test(account_id) || !ID_RE.test(product)) {
          return respond({ ok: false, status: "invalid", message: "Invalid parameters" }, 400);
        }

        const admin = getAdmin();
        const nowIso = new Date().toISOString();

        // Lazy-expire
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
          return respond({ ok: false, status: "server_error", message: "Server error" }, 500);
        }
        if (!data) {
          return respond({
            ok: false,
            status: "not_found",
            account_id,
            product,
            server_time: nowIso,
            message: "License not found",
          });
        }
        if (data.status === "suspended") {
          return respond({
            ok: false,
            status: "suspended",
            account_id,
            product,
            server_time: nowIso,
            message: "License suspended",
          });
        }
        if (data.status !== "active" || new Date(data.expires_at) < new Date()) {
          return respond({
            ok: false,
            status: "expired",
            account_id,
            product,
            expires_at: data.expires_at,
            server_time: nowIso,
            message: "Membership expired",
          });
        }
        if (uid && data.uid && uid !== data.uid) {
          return respond({
            ok: false,
            status: "uid_mismatch",
            account_id,
            product,
            server_time: nowIso,
            message: "UID mismatch",
          });
        }

        // Optional: log version
        void version;

        return respond({
          ok: true,
          status: "active",
          account_id,
          product,
          expires_at: data.expires_at,
          server_time: nowIso,
          message: "Authorized",
        });
      },
    },
  },
});
