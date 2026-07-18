import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import {
  createEACheckoutSession,
  getMySubscriptions,
  getMyPayments,
} from "@/lib/subscriptions.functions";
import { PLAN_CATALOG, type PlanKey } from "@/lib/plans";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { Sparkles, LogOut, ShieldCheck, Clock, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

const mt5Re = /^[A-Za-z0-9_-]{3,32}$/;

function DashboardPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setEmail(data.user?.email ?? null);
      if (data.user) {
        const { data: role } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .eq("role", "admin")
          .maybeSingle();
        setIsAdmin(!!role);
      }
    });
  }, []);

  const subsQuery = useQuery({
    queryKey: ["my-subs"],
    queryFn: () => getMySubscriptions(),
  });
  const paysQuery = useQuery({
    queryKey: ["my-pays"],
    queryFn: () => getMyPayments(),
  });

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PaymentTestModeBanner />
      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-gold-gradient text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-bold">
              AITrade <span className="gold-text">Access</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted-foreground md:inline">{email}</span>
            {isAdmin && (
              <Link
                to="/admin"
                className="rounded-full border border-gold/40 bg-gold/5 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/10"
              >
                管理后台
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-3 w-3" /> 退出
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="font-display text-3xl font-bold">我的授权</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          管理 MT5 UID 授权、查看到期时间与付款记录
        </p>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">开通 / 续费</h2>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {(Object.values(PLAN_CATALOG) as (typeof PLAN_CATALOG)[PlanKey][]).map((plan) => (
              <PurchaseCard key={plan.key} plan={plan} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold">当前订阅</h2>
          <div className="card-lux mt-4 overflow-hidden rounded-2xl">
            {subsQuery.isLoading ? (
              <p className="p-6 text-sm text-muted-foreground">加载中...</p>
            ) : !subsQuery.data?.length ? (
              <p className="p-6 text-sm text-muted-foreground">
                尚无订阅。选择上方方案完成付款后自动开通。
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-background/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 text-left normal-case tracking-normal">MT5 UID</th>
                    <th className="px-5 py-3 text-left">方案</th>
                    <th className="px-5 py-3 text-left">状态</th>
                    <th className="px-5 py-3 text-left">到期时间</th>
                  </tr>
                </thead>
                <tbody>
                  {subsQuery.data.map((s: any) => {
                    const active =
                      s.status === "active" && new Date(s.expires_at) > new Date();
                    return (
                      <tr key={s.id} className="border-t border-border/40">
                        <td className="px-5 py-3 font-mono">{s.mt5_uid}</td>
                        <td className="px-5 py-3">{PLAN_CATALOG[s.plan as PlanKey]?.name ?? s.plan}</td>
                        <td className="px-5 py-3">
                          <span
                            className={
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs " +
                              (active
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-muted text-muted-foreground")
                            }
                          >
                            {active ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            {active ? "生效中" : s.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {s.expires_at ? new Date(s.expires_at).toLocaleString() : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold">付款记录</h2>
          <div className="card-lux mt-4 overflow-hidden rounded-2xl">
            {paysQuery.isLoading ? (
              <p className="p-6 text-sm text-muted-foreground">加载中...</p>
            ) : !paysQuery.data?.length ? (
              <p className="p-6 text-sm text-muted-foreground">无付款记录</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-background/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 text-left">时间</th>
                    <th className="px-5 py-3 text-left">方案</th>
                    <th className="px-5 py-3 text-left normal-case tracking-normal">MT5 UID</th>
                    <th className="px-5 py-3 text-left">金额</th>
                    <th className="px-5 py-3 text-left">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {paysQuery.data.map((p: any) => (
                    <tr key={p.id} className="border-t border-border/40">
                      <td className="px-5 py-3 text-muted-foreground">
                        {new Date(p.created_at).toLocaleString()}
                      </td>
                      <td className="px-5 py-3">
                        {p.plan ? PLAN_CATALOG[p.plan as PlanKey]?.name ?? p.plan : "-"}
                      </td>
                      <td className="px-5 py-3 font-mono">{p.mt5_uid ?? "-"}</td>
                      <td className="px-5 py-3">
                        {(p.amount_cents / 100).toFixed(2)}{" "}
                        <span className="text-xs uppercase text-muted-foreground">
                          {p.currency}
                        </span>
                      </td>
                      <td className="px-5 py-3">{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="card-lux mt-12 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-gold" />
            <div className="text-sm text-muted-foreground">
              <p className="text-foreground">EA 授权检测接口</p>
              <p className="mt-1">
                EA 在启动/交易前会调用：
                <code className="ml-1 rounded bg-background/60 px-1.5 py-0.5 font-mono text-xs">
                  GET /api/public/check?uid=你的MT5UID
                </code>
              </p>
              <p className="mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3" /> 到期后接口自动返回 not_found，EA 停止交易。
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function PurchaseCard({ plan }: { plan: (typeof PLAN_CATALOG)[PlanKey] }) {
  const [mt5Uid, setMt5Uid] = useState("");
  const [checkoutSecret, setCheckoutSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setError(null);
    if (!mt5Re.test(mt5Uid)) {
      setError("MT5 UID 需 3-32 位字母数字（可含 _ / -）");
      return;
    }
    setLoading(true);
    try {
      const result = await createEACheckoutSession({
        data: {
          plan: plan.key,
          mt5Uid,
          returnUrl: `${window.location.origin}/dashboard?checkout=success`,
          environment: getStripeEnvironment(),
        },
      });
      if ("error" in result) throw new Error(result.error);
      if (!result.clientSecret) throw new Error("未返回 client secret");
      setCheckoutSecret(result.clientSecret);
    } catch (err: any) {
      setError(err?.message ?? "创建结账失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card-lux rounded-2xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display text-lg font-bold">{plan.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{plan.tagline}</p>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl font-bold gold-text">${plan.amountUSD}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">/ 月</div>
        </div>
      </div>

      <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
        {plan.features.map((f) => (
          <li key={f}>· {f}</li>
        ))}
      </ul>

      {!checkoutSecret ? (
        <div className="mt-5">
          <label className="text-sm font-medium text-foreground font-sans">MT5 账户 UID</label>
          <input
            value={mt5Uid}
            onChange={(e) => setMt5Uid(e.target.value.trim())}
            placeholder="例如 12345678"
            className="mt-1 w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-gold/60"
          />
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          <button
            onClick={startCheckout}
            disabled={loading}
            className="mt-3 w-full rounded-lg bg-gold-gradient px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {loading ? "创建结账中..." : "立即付款开通 / 续费 30 天"}
          </button>
        </div>
      ) : (
        <div className="mt-5">
          <EmbeddedCheckoutProvider
            stripe={getStripe()}
            options={{ fetchClientSecret: async () => checkoutSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
          <button
            onClick={() => setCheckoutSecret(null)}
            className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            取消
          </button>
        </div>
      )}
    </div>
  );
}
