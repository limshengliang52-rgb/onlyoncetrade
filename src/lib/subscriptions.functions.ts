import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  type StripeEnv,
  createStripeClient,
  getStripeErrorMessage,
} from "@/lib/stripe.server";
import { PLAN_CATALOG, type PlanKey } from "@/lib/plans";

const mt5UidRe = /^[A-Za-z0-9_-]{3,32}$/;

type CheckoutResult = { clientSecret: string } | { error: string };

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string; userId: string },
): Promise<string> {
  if (!/^[a-zA-Z0-9-]+$/.test(options.userId)) throw new Error("Invalid userId");
  const found = await stripe.customers.search({
    query: `metadata['userId']:'${options.userId}'`,
    limit: 1,
  });
  if (found.data.length) return found.data[0].id;
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const c = existing.data[0];
      if (c.metadata?.userId !== options.userId) {
        await stripe.customers.update(c.id, {
          metadata: { ...c.metadata, userId: options.userId },
        });
      }
      return c.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    metadata: { userId: options.userId },
  });
  return created.id;
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createEACheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    plan: PlanKey;
    mt5Uid: string;
    email: string;
    returnUrl: string;
    environment: StripeEnv;
  }) => {
    const schema = z.object({
      plan: z.enum(["basic", "access"]),
      mt5Uid: z.string().regex(mt5UidRe, "MT5 UID 需 3-32 位字母数字"),
      email: z.string().regex(emailRe, "请输入有效的邮箱地址"),
      returnUrl: z.string().url(),
      environment: z.enum(["sandbox", "live"]),
    });
    return schema.parse(data);
  })
  .handler(async ({ data, context }): Promise<CheckoutResult> => {
    try {
      const catalog = PLAN_CATALOG[data.plan];
      const stripe = createStripeClient(data.environment);
      const { data: userData } = await context.supabase.auth.getUser();
      const authEmail = userData.user?.email;
      // Prefer the email the user typed in at checkout (e.g. Gmail for EA delivery),
      // but fall back to their auth email if they left it blank.
      const email = data.email?.trim() || authEmail;
      const customerId = await resolveOrCreateCustomer(stripe, {
        email: email ?? undefined,
        userId: context.userId,
      });

      const prices = await stripe.prices.list({ lookup_keys: [catalog.priceId], limit: 1 });
      if (!prices.data.length) throw new Error("价格未找到，请联系管理员");
      const price = prices.data[0];

      // Recurring subscription line item. The catalog price object is monthly;
      // for the 3-month plan we build a price_data with interval_count = 3.
      const lineItem =
        catalog.intervalCount === 1
          ? { price: price.id, quantity: 1 }
          : {
              quantity: 1,
              price_data: {
                currency: "usd",
                product:
                  typeof price.product === "string" ? price.product : price.product.id,
                unit_amount: catalog.amountUSD * 100,
                recurring: { interval: "month", interval_count: catalog.intervalCount },
              },
            };

      const metadata = {
        userId: context.userId,
        plan: data.plan,
        mt5_uid: data.mt5Uid,
      };

      const session = await stripe.checkout.sessions.create({
        line_items: [lineItem],
        mode: "subscription",
        ui_mode: "embedded_page" as any,
        return_url: data.returnUrl,
        customer: customerId,
        subscription_data: {
          description: `${catalog.name} · MT5 ${data.mt5Uid}`,
          metadata,
        },
        metadata,
      } as any);

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      console.error("createEACheckoutSession failed", error);
      return { error: getStripeErrorMessage(error) };
    }
  });

/**
 * 会员自助续费：一次性付款，webhook 会在现有 expires_at 基础上叠加 30 / 90 天。
 */
export const createEARenewalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    plan: PlanKey;
    subscriptionId: string;
    returnUrl: string;
    environment: StripeEnv;
  }) =>
    z
      .object({
        plan: z.enum(["basic", "access"]),
        subscriptionId: z.string().uuid(),
        returnUrl: z.string().url(),
        environment: z.enum(["sandbox", "live"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }): Promise<CheckoutResult> => {
    try {
      const catalog = PLAN_CATALOG[data.plan];
      const { data: sub, error } = await context.supabase
        .from("subscriptions")
        .select("id, mt5_uid, user_id")
        .eq("id", data.subscriptionId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!sub || sub.user_id !== context.userId) throw new Error("订阅不存在");

      const stripe = createStripeClient(data.environment);
      const { data: userData } = await context.supabase.auth.getUser();
      const customerId = await resolveOrCreateCustomer(stripe, {
        email: userData.user?.email ?? undefined,
        userId: context.userId,
      });

      const prices = await stripe.prices.list({ lookup_keys: [catalog.priceId], limit: 1 });
      const productId = prices.data.length
        ? typeof prices.data[0].product === "string"
          ? prices.data[0].product
          : prices.data[0].product.id
        : null;

      const metadata = {
        userId: context.userId,
        plan: data.plan,
        mt5_uid: sub.mt5_uid as string,
        renewal: "1",
      };

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: catalog.amountUSD * 100,
              ...(productId
                ? { product: productId }
                : { product_data: { name: `${catalog.name} 续费` } }),
            },
          },
        ],
        mode: "payment",
        ui_mode: "embedded_page" as any,
        return_url: data.returnUrl,
        customer: customerId,
        payment_intent_data: {
          description: `${catalog.name} 续费 ${catalog.durationDays} 天 · MT5 ${sub.mt5_uid}`,
        },
        metadata,
      } as any);

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      console.error("createEARenewalSession failed", error);
      return { error: getStripeErrorMessage(error) };
    }
  });

/**
 * 会员自助暂停续约：取消 Stripe 自动续费，但保留当前周期授权，
 * 到期后 EA 授权 API 自动返回 authorized:false。
 */
export const pauseMySubscriptionRenewal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; environment: StripeEnv }) =>
    z.object({ id: z.string().uuid(), environment: z.enum(["sandbox", "live"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: sub, error } = await context.supabase
      .from("subscriptions")
      .select("id, user_id, stripe_subscription_id")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!sub || sub.user_id !== context.userId) throw new Error("订阅不存在");

    let stripeError: string | null = null;
    if (sub.stripe_subscription_id) {
      try {
        const stripe = createStripeClient(data.environment);
        await stripe.subscriptions.update(sub.stripe_subscription_id as string, {
          cancel_at_period_end: true,
        });
      } catch (e) {
        stripeError = getStripeErrorMessage(e);
        console.error("pauseMySubscriptionRenewal: stripe update failed", e);
      }
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: upErr } = await supabaseAdmin
      .from("subscriptions")
      .update({ cancel_at_period_end: true, next_billing_at: null })
      .eq("id", data.id);
    if (upErr) throw new Error(upErr.message);

    return { ok: true, stripeError };
  });

export const verifyEACheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { sessionId: string; environment: StripeEnv }) => {
    return z
      .object({
        sessionId: z.string().min(10).max(200),
        environment: z.enum(["sandbox", "live"]),
      })
      .parse(data);
  })
  .handler(async ({ data, context }) => {
    try {
      const stripe = createStripeClient(data.environment);
      const session = await stripe.checkout.sessions.retrieve(data.sessionId);
      const metadataUserId = (session.metadata as any)?.userId;
      if (metadataUserId && metadataUserId !== context.userId) {
        return { verified: false as const, reason: "user_mismatch" };
      }
      const paid = session.payment_status === "paid";
      return {
        verified: paid,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency,
        plan: (session.metadata as any)?.plan ?? null,
        mt5_uid: (session.metadata as any)?.mt5_uid ?? null,
        customer_email:
          (session.customer_details?.email as string | undefined) ??
          (session.customer_email as string | undefined) ??
          null,
      };
    } catch (error) {
      console.error("verifyEACheckoutSession failed", error);
      return { verified: false as const, reason: "stripe_error", error: getStripeErrorMessage(error) };
    }
  });

export const getMySubscriptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getMyPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("payments")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

async function requireAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("需要管理员权限");
}

export const adminListSubscriptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: subs, error } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    const ids = Array.from(new Set((subs ?? []).map((s: any) => s.user_id)));
    let profiles: Record<string, { email: string | null; display_name: string | null }> = {};
    if (ids.length) {
      const { data: profs } = await supabaseAdmin
        .from("profiles")
        .select("id, email, display_name")
        .in("id", ids);
      profiles = Object.fromEntries(
        (profs ?? []).map((p: any) => [p.id, { email: p.email, display_name: p.display_name }]),
      );
    }
    return (subs ?? []).map((s: any) => ({ ...s, profile: profiles[s.user_id] ?? null }));
  });

export const adminListPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminUpsertSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    id?: string;
    user_email?: string;
    mt5_uid: string;
    plan: PlanKey;
    extend_days: number;
    products?: string[];
    notes?: string;
  }) => {
    const schema = z.object({
      id: z.string().uuid().optional(),
      user_email: z.string().email().optional(),
      mt5_uid: z.string().regex(mt5UidRe),
      plan: z.enum(["basic", "access"]),
      extend_days: z.number().int().min(-3650).max(3650).refine((n) => n !== 0, "天数不能为 0"),
      products: z.array(z.enum(["xau", "btc"])).min(1).max(2).optional(),
      notes: z.string().max(500).optional(),
    });
    return schema.parse(d);
  })
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const products =
      data.products && data.products.length
        ? Array.from(new Set(data.products))
        : ["xau", "btc"];
    let subId = data.id;
    let userId: string | null = null;

    if (subId) {
      const { data: existing } = await supabaseAdmin
        .from("subscriptions")
        .select("user_id, expires_at")
        .eq("id", subId)
        .maybeSingle();
      if (!existing) throw new Error("订阅不存在");
      userId = existing.user_id as string;
      const base =
        existing.expires_at && new Date(existing.expires_at as string) > new Date()
          ? new Date(existing.expires_at as string)
          : new Date();
      const newExpires = new Date(base.getTime() + data.extend_days * 86400_000);
      const { error } = await supabaseAdmin
        .from("subscriptions")
        .update({
          plan: data.plan,
          mt5_uid: data.mt5_uid,
          status: "active",
          products,
          expires_at: newExpires.toISOString(),
          started_at: existing.expires_at ?? new Date().toISOString(),
          notes: data.notes ?? null,
        })
        .eq("id", subId);
      if (error) throw new Error(error.message);
      return { ok: true, subscription_id: subId, user_id: userId };
    }

    if (!data.user_email) throw new Error("必须提供订阅 ID 或用户邮箱");
    if (data.extend_days < 1) throw new Error("新建订阅时天数必须大于 0");
    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", data.user_email)
      .maybeSingle();
    if (!prof) throw new Error(`用户不存在: ${data.user_email}`);
    userId = prof.id as string;

    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + data.extend_days * 86400_000);
    const { data: inserted, error } = await supabaseAdmin
      .from("subscriptions")
      .insert({
        user_id: userId,
        mt5_uid: data.mt5_uid,
        plan: data.plan,
        status: "active",
        products,
        started_at: startedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        notes: data.notes ?? "手动开通",
        source: "manual",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, subscription_id: inserted.id, user_id: userId };
  });

export const adminSetSubscriptionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: "active" | "expired" | "cancelled" }) => {
    return z
      .object({ id: z.string().uuid(), status: z.enum(["active", "expired", "cancelled"]) })
      .parse(d);
  })
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminUpdateSubscriptionUid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; mt5_uid: string }) => {
    return z
      .object({ id: z.string().uuid(), mt5_uid: z.string().regex(mt5UidRe, "MT5 UID 需 3-32 位字母数字") })
      .parse(d);
  })
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update({ mt5_uid: data.mt5_uid })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminUpdateSubscriptionProducts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; products: string[] }) => {
    return z
      .object({
        id: z.string().uuid(),
        products: z.array(z.enum(["xau", "btc"])).min(1).max(2),
      })
      .parse(d);
  })
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const products = Array.from(new Set(data.products));
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update({ products })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true, products };
  });

/**
 * 申请暂停授权（不会立即停授权）：只写入 suspend_requested_at，
 * 状态显示为「暂停申请待审核 / 待管理员同意」，需管理员确认后才真正暂停。
 */
export const requestSuspendSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; note?: string }) =>
    z.object({ id: z.string().uuid(), note: z.string().max(300).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: sub, error: readErr } = await supabaseAdmin
      .from("subscriptions")
      .select("id, user_id, suspend_requested_at")
      .eq("id", data.id)
      .maybeSingle();
    if (readErr) throw new Error(readErr.message);
    if (!sub) throw new Error("订阅不存在");

    if (sub.user_id !== context.userId) {
      await requireAdmin(context);
    }
    if (sub.suspend_requested_at) return { ok: true, alreadyPending: true };

    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update({
        suspend_requested_at: new Date().toISOString(),
        suspend_requested_by: context.userId,
        suspend_request_note: data.note ?? null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true, alreadyPending: false };
  });

/** 管理员驳回 / 取消暂停申请 */
export const cancelSuspendRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update({
        suspend_requested_at: null,
        suspend_requested_by: null,
        suspend_request_note: null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * 管理员同意暂停：本地订阅置为 cancelled（EA 授权 API 立即返回 authorized:false），
 * 同时取消 Stripe 自动续费，避免下一期继续扣款。必须先有待审核的暂停申请。
 */
export const adminSuspendSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; environment: StripeEnv }) =>
    z
      .object({ id: z.string().uuid(), environment: z.enum(["sandbox", "live"]) })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: sub, error: readErr } = await supabaseAdmin
      .from("subscriptions")
      .select("id, stripe_subscription_id, suspend_requested_at")
      .eq("id", data.id)
      .maybeSingle();
    if (readErr) throw new Error(readErr.message);
    if (!sub) throw new Error("订阅不存在");
    if (!sub.suspend_requested_at) throw new Error("该订阅没有待审核的暂停申请，请先提交暂停申请");


    const { data: sub, error: readErr } = await supabaseAdmin
      .from("subscriptions")
      .select("id, stripe_subscription_id")
      .eq("id", data.id)
      .maybeSingle();
    if (readErr) throw new Error(readErr.message);
    if (!sub) throw new Error("订阅不存在");

    let stripeCancelled = false;
    let stripeError: string | null = null;
    if (sub.stripe_subscription_id) {
      try {
        const stripe = createStripeClient(data.environment);
        await stripe.subscriptions.cancel(sub.stripe_subscription_id as string);
        stripeCancelled = true;
      } catch (error) {
        stripeError = getStripeErrorMessage(error);
        console.error("suspend: stripe cancel failed", error);
      }
    }

    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update({
        status: "cancelled",
        cancel_at_period_end: true,
        next_billing_at: null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    return { ok: true, stripeCancelled, stripeError };
  });
