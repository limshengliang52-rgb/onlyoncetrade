import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import {
  createEACheckoutSession,
  verifyEACheckoutSession,
} from "@/lib/subscriptions.functions";
import { PLAN_CATALOG, PLAN_SLUG_TO_KEY, slugFromParam, type PlanKey } from "@/lib/plans";
import { redirect } from "@tanstack/react-router";

import {
  Sparkles,
  ArrowLeft,
  Check,
  ShieldCheck,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";

const mt5Re = /^[A-Za-z0-9_-]{3,32}$/;

export const Route = createFileRoute("/_authenticated/checkout/$plan")({
  validateSearch: (s: Record<string, unknown>) => ({
    checkout: typeof s.checkout === "string" ? s.checkout : undefined,
    uid: typeof s.uid === "string" ? s.uid : undefined,
    session_id: typeof s.session_id === "string" ? s.session_id : undefined,
  }),
  beforeLoad: ({ params }) => {
    // Only new "pro" / "plus" slugs are valid. Old links like /checkout/basic
    // or /checkout/access (old $25 plan) redirect to the current pricing page.
    if (!slugFromParam(params.plan)) {
      throw redirect({ to: "/", hash: "pricing" });
    }
  },
  component: CheckoutPage,
});

function CheckoutPage() {
  const { plan: planParam } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();

  const plan = useMemo(() => {
    const slug = slugFromParam(planParam);
    if (!slug) return null;
    return PLAN_CATALOG[PLAN_SLUG_TO_KEY[slug]];
  }, [planParam]);

  const [mt5Uid, setMt5Uid] = useState(search.uid ?? "");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [riskAccepted, setRiskAccepted] = useState(false);

  const success = search.checkout === "success";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  if (!plan) {
    return (
      <main className="min-h-screen bg-background px-5 py-16 text-foreground">
        <div className="mx-auto max-w-md text-center">
          <p className="text-sm text-muted-foreground">未知的方案</p>
          <Link to="/" className="mt-4 inline-block text-sm text-gold underline">返回首页</Link>
        </div>
      </main>
    );
  }

  async function startCheckout() {
    if (!plan) return;
    setError(null);
    if (!mt5Re.test(mt5Uid)) {
      setError("MT5 UID 需 3-32 位字母数字（可含 _ / -）");
      return;
    }
    if (!email) {
      setError("请先登录以获取邮箱");
      return;
    }
    if (!riskAccepted) {
      setError("请先阅读并勾选风险声明后再继续付款");
      return;
    }
    setLoading(true);
    try {
      const result = await createEACheckoutSession({
        data: {
          plan: plan.key,
          mt5Uid,
          email,
          returnUrl: `${window.location.origin}/checkout/${plan.slug}?checkout=success&uid=${encodeURIComponent(mt5Uid)}&session_id={CHECKOUT_SESSION_ID}`,
          environment: getStripeEnvironment(),
        },
      });
      if ("error" in result) throw new Error(result.error);
      if (!result.clientSecret) throw new Error("未返回 client secret");
      setClientSecret(result.clientSecret);
    } catch (err: any) {
      setError(err?.message ?? "创建结账失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">

      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-gold-gradient text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-bold">
              OnlyOnce <span className="gold-text">EA Trade</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="hidden md:inline">{email}</span>
            <Link
              to="/dashboard"
              className="rounded-full border border-border px-3 py-1.5 hover:text-foreground"
            >
              我的授权
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10">
        <Link
          to="/"
          hash="pricing"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> 返回方案
        </Link>

        {success ? (
          <SuccessBlock plan={plan} mt5Uid={mt5Uid || search.uid || ""} sessionId={search.session_id ?? null} />
        ) : (
          <div className="mt-6 grid gap-8 md:grid-cols-[1fr_1.1fr]">
            <section className="card-lux rounded-2xl p-7">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                Selected plan
              </span>
              <h1 className="mt-2 font-display text-3xl font-bold">{plan.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>

              <div className="mt-6 flex items-end gap-3">
                <span className="font-display text-4xl font-bold gold-text">${plan.amountUSD}</span>
                <span className="pb-1.5 text-sm text-muted-foreground">{plan.durationLabel}</span>
              </div>

              <ul className="mt-6 space-y-2.5 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7 rounded-xl border border-border/60 bg-background/40 p-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 text-foreground">
                  <ShieldCheck className="h-4 w-4 text-gold" /> 付款成功后自动开通授权
                </div>
                <p className="mt-2 leading-relaxed">
                  系统会把你的 <span className="font-sans">MT5</span> UID 加入白名单，
                  {plan.durationDays} 天到期后自动停止授权，可随时续费。
                </p>
              </div>

              <div className="mt-4 rounded-xl border border-gold/25 bg-gold/5 p-4 text-[11px] leading-relaxed text-muted-foreground">
                <p className="text-foreground font-semibold">资金建议</p>
                <p className="mt-1">
                  同时运行 XAUUSD 与 BTCUSD 两个策略，建议账户资金至少
                  <span className="text-foreground"> 1,000 USD</span>，资金过小会放大回撤压力。交易风险由用户自行承担。
                </p>
              </div>
            </section>

            <section className="card-lux rounded-2xl p-7">
              {!clientSecret ? (
                <>
                  <h2 className="font-display text-xl font-bold">填写 <span className="font-sans">MT5</span> UID</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    请输入需要授权的 <span className="font-sans">MT5</span> 账户 UID（付款后不可修改）。
                  </p>

                  <label className="mt-6 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    MT5 账户 UID
                  </label>
                  <input
                    autoFocus
                    value={mt5Uid}
                    onChange={(e) => setMt5Uid(e.target.value.trim())}
                    placeholder="例如 12345678"
                    className="mt-2 w-full rounded-lg border border-border bg-background/60 px-4 py-3 text-base font-mono outline-none focus:border-gold/60"
                  />
                  {error && (
                    <p className="mt-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                      {error}
                    </p>
                  )}

                  <label className="mt-6 flex items-start gap-3 rounded-lg border border-border/60 bg-background/40 p-3 text-xs leading-relaxed text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={riskAccepted}
                      onChange={(e) => setRiskAccepted(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-gold"
                    />
                    <span>
                      我已阅读并理解{" "}
                      <a href="/risk-disclosure" target="_blank" className="text-gold underline">风险声明</a>
                      ，明白 EA 不保证盈利，交易亏损风险由我自行承担。
                    </span>
                  </label>

                  <button
                    onClick={startCheckout}
                    disabled={loading || !riskAccepted}
                    className="mt-4 w-full rounded-full bg-gold-gradient px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_var(--gold)] transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "正在创建结账..." : `付款 $${plan.amountUSD} 开通 ${plan.durationDays} 天授权`}
                  </button>
                  <p className="mt-3 text-center text-[11px] text-muted-foreground">
                    使用 Stripe 安全结账 · 支持 Visa / Mastercard
                  </p>
                </>
              ) : (
                <>
                  <h2 className="font-display text-xl font-bold">安全支付</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    授权 UID：<span className="font-mono text-foreground">{mt5Uid}</span>
                  </p>
                  <div className="mt-5 overflow-hidden rounded-xl">
                    <EmbeddedCheckoutProvider
                      stripe={getStripe()}
                      options={{ fetchClientSecret: async () => clientSecret }}
                    >
                      <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                  </div>
                  <button
                    onClick={() => setClientSecret(null)}
                    className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
                  >
                    修改 UID / 取消
                  </button>
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function SuccessBlock({
  plan,
  mt5Uid,
  sessionId,
}: {
  plan: (typeof PLAN_CATALOG)[PlanKey];
  mt5Uid: string;
  sessionId: string | null;
}) {
  const [state, setState] = useState<
    | { status: "checking" }
    | { status: "verified"; amount: number | null; currency: string | null; email: string | null }
    | { status: "pending"; message: string }
    | { status: "error"; message: string }
  >(sessionId ? { status: "checking" } : { status: "error", message: "缺少 session_id，无法确认付款。请勿手动跳转此页面。" });

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await verifyEACheckoutSession({
          data: { sessionId, environment: getStripeEnvironment() },
        });
        if (cancelled) return;
        if ("verified" in res && res.verified) {
          setState({
            status: "verified",
            amount: (res as any).amount_total ?? null,
            currency: (res as any).currency ?? null,
            email: (res as any).customer_email ?? null,
          });
        } else if ("payment_status" in res) {
          setState({
            status: "pending",
            message: `Stripe 状态：${(res as any).payment_status ?? "未知"}。若已扣款请稍等或联系客服。`,
          });
        } else {
          setState({
            status: "error",
            message: (res as any).error ?? "无法验证付款，请联系客服。",
          });
        }
      } catch (e: any) {
        if (!cancelled) setState({ status: "error", message: e?.message ?? "验证失败" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const waMsg = encodeURIComponent(
    `你好，我刚开通了 OnlyOnce EA Trade「${plan.name}」，MT5 UID: ${mt5Uid}，请发送 EA 文件与安装指引，谢谢！`,
  );
  const waUrl = `https://wa.me/60136330303?text=${waMsg}`;

  return (
    <div className="mx-auto mt-8 max-w-2xl">
      <div className="card-lux rounded-2xl p-8 text-center">
        {state.status === "checking" && (
          <>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/15 text-gold animate-pulse">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-bold">正在向 Stripe 确认付款…</h1>
            <p className="mt-2 text-sm text-muted-foreground">请勿关闭此页面。</p>
          </>
        )}

        {state.status === "pending" && (
          <>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-orange-500/15 text-orange-400">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-bold">付款尚未确认</h1>
            <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
          </>
        )}

        {state.status === "error" && (
          <>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-500/15 text-red-400">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-bold">无法确认付款</h1>
            <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
          </>
        )}

        {state.status === "verified" && (
          <>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h1 className="mt-5 font-display text-3xl font-bold">付款已确认</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {plan.name} 已开通 {plan.durationDays} 天授权。UID{" "}
              <span className="font-mono text-foreground">{mt5Uid}</span> 已进入 XAUUSD + BTCUSD 白名单。
              {state.amount != null && state.currency && (
                <>
                  {" "}
                  已收款 <span className="text-foreground">
                    {(state.amount / 100).toFixed(2)} {state.currency.toUpperCase()}
                  </span>
                  。
                </>
              )}
            </p>

            <div className="mt-8 grid gap-3">
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-gradient px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_var(--gold)] transition hover:brightness-110"
              >
                <MessageCircle className="h-4 w-4" /> 通过 WhatsApp 领取 EA 文件
              </a>
              <p className="text-[11px] text-muted-foreground">
                为确保你收到最新版本与安装指引，EA 文件由客服在 WhatsApp 内直接发送。
              </p>
            </div>

            <div className="mt-8 rounded-xl border border-border/60 bg-background/40 p-5 text-left text-xs leading-relaxed text-muted-foreground">
              <p className="text-foreground">EA 安装步骤：</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>下载 EA 文件（<span className="font-sans">.ex5</span>）并放入 <span className="font-sans">MT5</span> → 数据文件夹 → MQL5/Experts。</li>
                <li>重启 <span className="font-sans">MT5</span>，在导航栏找到 OnlyOnce EA，拖到 XAUUSD 或 BTCUSD 图表。</li>
                <li>EA 启动后会自动校验你的 UID，白名单内即可开始交易。</li>
              </ol>
            </div>
          </>
        )}

        <div className="mt-6 flex items-center justify-center gap-3 text-xs">
          <Link
            to="/dashboard"
            className="rounded-full border border-border px-4 py-2 text-muted-foreground hover:text-foreground"
          >
            查看我的授权
          </Link>
        </div>
      </div>
    </div>
  );
}
