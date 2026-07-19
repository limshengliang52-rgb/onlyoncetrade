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

const UID_RE = /^[A-Za-z0-9_-]{3,32}$/;
const PRODUCT_RE = /^[A-Za-z0-9_-]{2,32}$/;

// Map plan -> allowed products (fallback when subscriptions.products is empty)
function planProducts(plan: string): string[] {
  if (plan === "access" || plan === "pro") return ["xau", "btc"];
  return ["xau"];
}

// Normalize the requested product to internal keys (xau/btc)
function normalizeProduct(p: string): string {
  const s = p.toLowerCase();
  if (s.includes("btc")) return "btc";
  if (s.includes("xau") || s.includes("gold")) return "xau";
  return s;
}

export const Route = createFileRoute("/api/public/check")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const uid = url.searchParams.get("uid")?.trim() ?? "";
        const rawProduct = url.searchParams.get("product")?.trim() ?? "";
        const apiKey =
          url.searchParams.get("api_key")?.trim() ??
          url.searchParams.get("signature")?.trim() ??
          request.headers.get("x-api-key")?.trim() ??
          "";

        const nowIso = new Date().toISOString();

        // Optional API key gate: if EA_LICENSE_API_KEY is set, require it.
        const expectedKey = process.env.EA_LICENSE_API_KEY;
        if (expectedKey && apiKey !== expectedKey) {
          return respond(
            {
              authorized: false,
              status: "unauthorized",
              uid,
              server_time: nowIso,
              message: "invalid api_key",
            },
            401,
          );
        }

        if (!uid || !UID_RE.test(uid)) {
          return respond(
            {
              authorized: false,
              status: "invalid_uid",
              uid,
              server_time: nowIso,
              message: "invalid uid",
            },
            400,
          );
        }
        if (rawProduct && !PRODUCT_RE.test(rawProduct)) {
          return respond(
            {
              authorized: false,
              status: "invalid_product",
              uid,
              server_time: nowIso,
              message: "invalid product",
            },
            400,
          );
        }

        const admin = getAdmin();

        // Lazy-expire: mark any active subscription past its expires_at as expired.
        await admin
          .from("subscriptions")
          .update({ status: "expired" })
          .eq("mt5_uid", uid)
          .eq("status", "active")
          .lt("expires_at", nowIso);

        const { data, error } = await admin
          .from("subscriptions")
          .select("plan, products, expires_at, started_at, status")
          .eq("mt5_uid", uid)
          .eq("status", "active")
          .gt("expires_at", nowIso)
          .order("expires_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("check error", error);
          return respond(
            {
              authorized: false,
              status: "server_error",
              uid,
              server_time: nowIso,
              message: "server error",
            },
            500,
          );
        }

        if (!data) {
          return respond({
            authorized: false,
            status: "not_found",
            uid,
            server_time: nowIso,
            message: "license not found or inactive",
          });
        }

        const allowed: string[] =
          Array.isArray(data.products) && data.products.length
            ? (data.products as string[])
            : planProducts(String(data.plan));

        if (rawProduct) {
          const wanted = normalizeProduct(rawProduct);
          if (!allowed.includes(wanted)) {
            return respond({
              authorized: false,
              status: "product_not_allowed",
              uid,
              plan: data.plan,
              product: rawProduct,
              expires_at: data.expires_at,
              server_time: nowIso,
              message: `plan ${data.plan} not authorized for ${wanted}`,
            });
          }
        }

        return respond({
          authorized: true,
          status: "active",
          uid,
          plan: data.plan,
          product: rawProduct || null,
          products: allowed,
          expires_at: data.expires_at,
          started_at: data.started_at,
          server_time: nowIso,
          message: "license active",
        });
      },
    },
  },
});
