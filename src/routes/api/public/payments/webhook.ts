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
  const stripeSubscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : (session.subscription?.id ?? null);
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
  const durationMs = planDurationDays(plan) * DAY_MS;
  let subId: string;
  if (activeSub) {
    const base =
      activeSub.expires_at && new Date(activeSub.expires_at as string) > now
        ? new Date(activeSub.expires_at as string)
        : now;
    const newExpires = new Date(base.getTime() + durationMs);
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
        stripe_subscription_id: stripeSubscriptionId,
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
        expires_at: new Date(now.getTime() + durationMs).toISOString(),
        products: productsFor(plan),
        stripe_session_id: sessionId,
        stripe_payment_intent: paymentIntent,
        stripe_subscription_id: stripeSubscriptionId,
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

/** Recurring subscription lifecycle → local subscription row. */
async function handleStripeSubscription(sub: any, env: StripeEnv) {
  const admin = getAdmin();
  const userId = sub.metadata?.userId as string | undefined;
  const mt5Uid = sub.metadata?.mt5_uid as string | undefined;
  const plan = (sub.metadata?.plan as PlanKey | undefined) ?? null;
  const item = sub.items?.data?.[0];
  const periodEnd = item?.current_period_end ?? sub.current_period_end;
  const periodEndIso = periodEnd ? new Date(periodEnd * 1000).toISOString() : null;

  const activeLike = ["active", "trialing", "past_due"].includes(String(sub.status));
  const localStatus = activeLike ? "active" : "cancelled";

  const patch: Record<string, unknown> = {
    status: localStatus,
    stripe_subscription_id: sub.id,
    cancel_at_period_end: !!sub.cancel_at_period_end,
    source: "stripe",
    ...(periodEndIso && { expires_at: periodEndIso, next_billing_at: periodEndIso }),
    ...(plan && { plan, products: planProducts(plan) }),
  };

  // Match by stripe subscription id first, then by user + uid.
  const { data: existing } = await admin
    .from("subscriptions")
    .select("id")
    .eq("stripe_subscription_id", sub.id)
    .maybeSingle();

  if (existing) {
    const { error } = await admin.from("subscriptions").update(patch).eq("id", existing.id);
    if (error) throw error;
    return;
  }

  if (!userId || !mt5Uid || !plan) {
    console.error("subscription event missing metadata", sub.id);
    return;
  }

  const { data: byUid } = await admin
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("mt5_uid", mt5Uid)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (byUid) {
    const { error } = await admin.from("subscriptions").update(patch).eq("id", byUid.id);
    if (error) throw error;
    return;
  }

  const now = new Date();
  const { error } = await admin.from("subscriptions").insert({
    user_id: userId,
    mt5_uid: mt5Uid,
    plan,
    started_at: now.toISOString(),
    expires_at:
      periodEndIso ?? new Date(now.getTime() + planDurationDays(plan) * DAY_MS).toISOString(),
    products: planProducts(plan),
    ...patch,
  });
  if (error) throw error;
}

async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);
  switch (event.type) {
    case "checkout.session.completed":
    case "transaction.completed":
      await handleCheckoutCompleted(event.data.object, env);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await handleStripeSubscription(event.data.object, env);
      break;
    case "invoice.paid": {
      const inv = event.data.object;
      const subId =
        typeof inv.subscription === "string"
          ? inv.subscription
          : (inv.subscription?.id ??
            inv.parent?.subscription_details?.subscription ??
            null);
      if (subId) {
        const periodEnd = inv.lines?.data?.[0]?.period?.end;
        const patch: Record<string, unknown> = { status: "active" };
        if (periodEnd) {
          const iso = new Date(periodEnd * 1000).toISOString();
          patch.expires_at = iso;
          patch.next_billing_at = iso;
        }
        await getAdmin()
          .from("subscriptions")
          .update(patch)
          .eq("stripe_subscription_id", typeof subId === "string" ? subId : subId.id);
      }
      break;
    }
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
