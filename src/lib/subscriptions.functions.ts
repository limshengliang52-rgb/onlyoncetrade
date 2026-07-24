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

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: price.id, quantity: 1 }],
        mode: "payment",
        ui_mode: "embedded_page" as any,
        return_url: data.returnUrl,
        customer: customerId,
        payment_intent_data: {
          description: `${catalog.name} · MT5 ${data.mt5Uid}`,
        },
        metadata: {
          userId: context.userId,
          plan: data.plan,
          mt5_uid: data.mt5Uid,
        },
      } as any);

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      console.error("createEACheckoutSession failed", error);
      return { error: getStripeErrorMessage(error) };
    }
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
        : data.plan === "access"
          ? ["xau", "btc"]
          : ["xau"];
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
