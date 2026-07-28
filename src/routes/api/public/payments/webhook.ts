import { createFileRoute } from "@tanstack/react-router";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";
import { planDurationDays, planProducts, type PlanKey } from "@/lib/plans";

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

const DAY_MS = 86400_000;

async function handleCheckoutCompleted(session: any, env: StripeEnv) {
  const productsFor = (p: PlanKey) => planProducts(p);
  const admin = getAdmin();
  const userId = session.metadata?.userId as string | undefined;
  const plan = (session.metadata?.plan as "basic" | "access" | undefined) ?? null;
  const mt5Uid = session.metadata?.mt5_uid as string | undefined;
  const sessionId = session.id as string;
  const paymentIntent =
    typeof session.payment_intent === "string" ? session.payment_intent : null;
  const customerEmail =
    (session.customer_details?.email as string | undefined) ??
    (session.customer_email as string | undefined) ??
    null;

  if (!userId || !plan || !mt5Uid) {
    console.error("Webhook missing metadata", { userId, plan, mt5Uid, sessionId });
    return;
  }

  // Only credit access once payment is actually collected.
  if (session.payment_status && session.payment_status !== "paid") {
    console.log("Webhook received unpaid session; skipping", sessionId, session.payment_status);
    return;
  }

  // Idempotency: payment row unique on stripe_session_id
  const { data: existingPayment } = await admin
    .from("payments")
    .select("id, subscription_id")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();
  if (existingPayment) return;

  // Find or create active subscription for this user+mt5_uid, extend by 30 days
  const { data: activeSub } = await admin
    .from("subscriptions")
    .select("id, expires_at")
    .eq("user_id", userId)
    .eq("mt5_uid", mt5Uid)
    .in("status", ["active", "pending"])
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const now = new Date();
  let subId: string;
  if (activeSub) {
    const base =
      activeSub.expires_at && new Date(activeSub.expires_at as string) > now
        ? new Date(activeSub.expires_at as string)
        : now;
    const newExpires = new Date(base.getTime() + MONTH_MS);
    const { error } = await admin
      .from("subscriptions")
      .update({
        plan,
        status: "active",
        started_at: activeSub.expires_at ?? now.toISOString(),
        expires_at: newExpires.toISOString(),
        products: productsFor(plan),
        stripe_session_id: sessionId,
        stripe_payment_intent: paymentIntent,
        customer_email: customerEmail,
        source: "stripe",
      })
      .eq("id", activeSub.id);
    if (error) throw error;
    subId = activeSub.id as string;
  } else {
    const { data: inserted, error } = await admin
      .from("subscriptions")
      .insert({
        user_id: userId,
        mt5_uid: mt5Uid,
        plan,
        status: "active",
        started_at: now.toISOString(),
        expires_at: new Date(now.getTime() + MONTH_MS).toISOString(),
        products: productsFor(plan),
        stripe_session_id: sessionId,
        stripe_payment_intent: paymentIntent,
        customer_email: customerEmail,
        source: "stripe",
      })
      .select("id")
      .single();
    if (error) throw error;
    subId = inserted.id as string;
  }

  const amount = Number(session.amount_total ?? 0);
  const currency = String(session.currency ?? "usd");
  const { error: payErr } = await admin.from("payments").insert({
    user_id: userId,
    subscription_id: subId,
    stripe_session_id: sessionId,
    stripe_payment_intent: paymentIntent,
    customer_email: customerEmail,
    amount_cents: amount,
    currency,
    status: "paid",
    plan,
    mt5_uid: mt5Uid,
    source: "stripe",
    metadata: { environment: env },
  });
  if (payErr && !payErr.message.includes("duplicate")) throw payErr;
}

async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);
  switch (event.type) {
    case "checkout.session.completed":
    case "transaction.completed":
      await handleCheckoutCompleted(event.data.object, env);
      break;
    default:
      console.log("Unhandled event:", event.type);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          return Response.json({ received: true, ignored: "invalid env" });
        }
        try {
          await handleWebhook(request, rawEnv);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
