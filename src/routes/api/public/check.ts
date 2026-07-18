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

export const Route = createFileRoute("/api/public/check")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => {
        const uid = new URL(request.url).searchParams.get("uid")?.trim();
        if (!uid || !/^[A-Za-z0-9_-]{3,32}$/.test(uid)) {
          return respond({ authorized: false, reason: "invalid_uid" }, 400);
        }

        const admin = getAdmin();
        const nowIso = new Date().toISOString();

        // Lazy-expire: any active row whose expires_at has passed becomes 'expired'
        await admin
          .from("subscriptions")
          .update({ status: "expired" })
          .eq("mt5_uid", uid)
          .eq("status", "active")
          .lt("expires_at", nowIso);

        const { data, error } = await admin
          .from("subscriptions")
          .select("plan, expires_at, started_at")
          .eq("mt5_uid", uid)
          .eq("status", "active")
          .gt("expires_at", nowIso)
          .order("expires_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("check error", error);
          return respond({ authorized: false, reason: "server_error" }, 500);
        }

        if (!data) return respond({ authorized: false, reason: "not_found" }, 200);

        return respond({
          authorized: true,
          plan: data.plan,
          expires_at: data.expires_at,
          started_at: data.started_at,
          server_time: nowIso,
        });
      },
    },
  },
});
