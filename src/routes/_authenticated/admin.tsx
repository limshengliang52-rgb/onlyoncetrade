import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  adminListPayments,
  adminListSubscriptions,
  adminSuspendSubscription,
  adminUpdateSubscriptionUid,
  adminUpsertSubscription,
  cancelSuspendRequest,
  requestSuspendSubscription,
} from "@/lib/subscriptions.functions";

import { PLAN_CATALOG, type PlanKey } from "@/lib/plans";
import { getStripeEnvironment } from "@/lib/stripe";
import { Sparkles, ArrowLeft, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

function AdminPage() {
  const qc = useQueryClient();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return setAuthorized(false);
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setAuthorized(!!role);
    });
  }, []);

  const subs = useQuery({
    queryKey: ["admin-subs"],
    queryFn: () => adminListSubscriptions(),
    enabled: authorized === true,
  });
  const pays = useQuery({
    queryKey: ["admin-pays"],
    queryFn: () => adminListPayments(),
    enabled: authorized === true,
  });

  const upsert = useMutation({
    mutationFn: (v: Parameters<typeof adminUpsertSubscription>[0]["data"]) =>
      adminUpsertSubscription({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-subs"] });
    },
  });
  const suspend = useMutation({
    mutationFn: (v: { id: string; environment: "sandbox" | "live" }) =>
      adminSuspendSubscription({ data: v }),
    onSuccess: (r: any) => {
      toast.success(
        r?.stripeCancelled
          ? "已暂停授权，并已取消 Stripe 自动续费"
          : "已暂停授权（该订阅没有 Stripe 自动续费记录）",
      );
      if (r?.stripeError) toast.error(`Stripe 取消失败：${r.stripeError}`);
      qc.invalidateQueries({ queryKey: ["admin-subs"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "暂停失败"),
  });
  const updateUid = useMutation({
    mutationFn: (v: { id: string; mt5_uid: string }) => adminUpdateSubscriptionUid({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-subs"] }),
    onError: (e: any) => alert(e?.message ?? "更新失败"),
  });

  if (authorized === null) {
    return <div className="p-10 text-center text-sm text-muted-foreground">加载中...</div>;
  }
  if (!authorized) {
    return (
      <div className="mx-auto max-w-lg p-10 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-red-400" />
        <p className="mt-4 text-sm text-muted-foreground">需要管理员权限</p>
        <Link to="/dashboard" className="mt-6 inline-block text-xs text-gold underline">
          返回控制台
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> 返回控制台
          </Link>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-gold-gradient text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-bold">
              Admin <span className="gold-text">Console</span>
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-6">
          <Link
            to="/ea-licenses"
            className="inline-flex items-center gap-2 rounded-lg border border-gold/40 bg-gold/5 px-4 py-2 text-xs font-semibold text-gold hover:bg-gold/10"
          >
            <Sparkles className="h-3.5 w-3.5" /> EA 会员授权管理 →
          </Link>
        </div>
        <section className="card-lux rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">手动开通 / 延期</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            输入订阅 ID（延期已有订阅）或用户邮箱 + MT5 UID（新建订阅）
          </p>
          <ManualForm
            loading={upsert.isPending}
            error={upsert.error instanceof Error ? upsert.error.message : null}
            onSubmit={(v) => upsert.mutate(v)}
          />
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">所有订阅</h2>
          <div className="card-lux mt-4 overflow-hidden rounded-2xl">
            {subs.isLoading ? (
              <p className="p-6 text-sm text-muted-foreground">加载中...</p>
            ) : !subs.data?.length ? (
              <p className="p-6 text-sm text-muted-foreground">暂无订阅</p>
            ) : (
              (() => {
                const lastPayBySub = new Map<string, string>();
                const lastPayByUid = new Map<string, string>();
                for (const p of (pays.data ?? []) as any[]) {
                  if (p.status !== "paid") continue;
                  if (p.subscription_id && !lastPayBySub.has(p.subscription_id)) {
                    lastPayBySub.set(p.subscription_id, p.created_at);
                  }
                  if (p.mt5_uid && !lastPayByUid.has(p.mt5_uid)) {
                    lastPayByUid.set(p.mt5_uid, p.created_at);
                  }
                }
                return (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-background/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left">用户</th>
                      <th className="px-4 py-3 text-left">MT5 UID</th>
                      <th className="px-4 py-3 text-left">方案</th>
                      <th className="px-4 py-3 text-left">来源</th>
                      <th className="px-4 py-3 text-left">状态</th>
                      <th className="px-4 py-3 text-left">到期</th>
                      <th className="px-4 py-3 text-left">剩余天数</th>
                      <th className="px-4 py-3 text-left">最后付款</th>
                      <th className="px-4 py-3 text-left">Stripe</th>
                      <th className="px-4 py-3 text-left">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subs.data.map((s: any) => {
                      const lastPay = lastPayBySub.get(s.id) ?? lastPayByUid.get(s.mt5_uid);
                      const remainingDays = s.expires_at
                        ? Math.ceil((new Date(s.expires_at).getTime() - Date.now()) / 86400_000)
                        : null;
                      return (
                      <tr key={s.id} className="border-t border-border/40">
                        <td className="px-4 py-3">
                          <div className="text-xs">{s.profile?.email ?? s.customer_email ?? s.user_id}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          <div className="flex items-center gap-2">
                            <span>{s.mt5_uid}</span>
                            <button
                              onClick={() => {
                                const raw = prompt("输入新的 MT5 UID (3-32 位字母数字)", s.mt5_uid);
                                if (!raw) return;
                                const next = raw.trim();
                                if (next === s.mt5_uid) return;
                                updateUid.mutate({ id: s.id, mt5_uid: next });
                              }}
                              className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground"
                            >
                              改
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">{PLAN_CATALOG[s.plan as PlanKey]?.name ?? s.plan}</td>
                        

                        <td className="px-4 py-3">
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                            s.source === "stripe"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-orange-500/10 text-orange-400"
                          }`}>
                            {s.source === "stripe" ? "Stripe 付款" : "手动"}
                          </span>
                        </td>
                        <td className="px-4 py-3">{s.status}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {s.expires_at ? new Date(s.expires_at).toLocaleString() : "-"}
                        </td>
                        <td className={`px-4 py-3 text-xs font-semibold ${
                          remainingDays === null
                            ? "text-muted-foreground"
                            : remainingDays <= 0
                              ? "text-red-400"
                              : remainingDays <= 7
                                ? "text-orange-400"
                                : "text-emerald-400"
                        }`}>
                          {remainingDays === null ? "-" : remainingDays <= 0 ? "已过期" : `${remainingDays} 天`}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {lastPay ? new Date(lastPay).toLocaleString() : "-"}
                        </td>
                        <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">
                          {s.stripe_session_id ? (
                            <div className="max-w-[180px] truncate" title={s.stripe_session_id}>
                              {s.stripe_session_id}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/50">-</span>
                          )}
                          {s.stripe_payment_intent && (
                            <div className="max-w-[180px] truncate text-muted-foreground/70" title={s.stripe_payment_intent}>
                              {s.stripe_payment_intent}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              onClick={() => {
                                if (
                                  !confirm(
                                    "确认暂停此客户授权？\n将立即停止 EA 授权，并取消 Stripe 自动续费。",
                                  )
                                )
                                  return;
                                suspend.mutate({ id: s.id, environment: getStripeEnvironment() });
                              }}
                              disabled={suspend.isPending}
                              className="rounded-md border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-[11px] font-bold text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                            >
                              暂停授权
                            </button>
                            <button
                              onClick={() => {
                                const raw = prompt(
                                  "调整天数（正数=延期，负数=扣减）",
                                  "7",
                                );
                                if (!raw) return;
                                const n = parseInt(raw);
                                if (!Number.isInteger(n) || n === 0) return alert("请输入非零整数");
                                upsert.mutate({
                                  id: s.id,
                                  mt5_uid: s.mt5_uid,
                                  plan: s.plan,
                                  products: s.products ?? undefined,
                                  extend_days: n,
                                });
                              }}
                              className="text-[10px] text-muted-foreground/70 underline hover:text-muted-foreground"
                            >
                              调整天数
                            </button>
                          </div>
                        </td>

                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
                );
              })()
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">最新付款</h2>
          <div className="card-lux mt-4 overflow-hidden rounded-2xl">
            {pays.isLoading ? (
              <p className="p-6 text-sm text-muted-foreground">加载中...</p>
            ) : !pays.data?.length ? (
              <p className="p-6 text-sm text-muted-foreground">暂无付款</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-background/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">时间</th>
                    <th className="px-4 py-3 text-left">邮箱</th>
                    <th className="px-4 py-3 text-left">方案</th>
                    <th className="px-4 py-3 text-left">MT5 UID</th>
                    <th className="px-4 py-3 text-left">金额</th>
                    <th className="px-4 py-3 text-left">状态</th>
                    <th className="px-4 py-3 text-left">Stripe Session / PI</th>
                  </tr>
                </thead>
                <tbody>
                  {pays.data.map((p: any) => (
                    <tr key={p.id} className="border-t border-border/40">
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(p.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs">{p.customer_email ?? "-"}</td>
                      <td className="px-4 py-3">
                        {p.plan ? PLAN_CATALOG[p.plan as PlanKey]?.name ?? p.plan : "-"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{p.mt5_uid ?? "-"}</td>
                      <td className="px-4 py-3">
                        {(p.amount_cents / 100).toFixed(2)} {p.currency?.toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                          p.status === "paid"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">
                        {p.stripe_session_id ? (
                          <div className="max-w-[200px] truncate" title={p.stripe_session_id}>
                            {p.stripe_session_id}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                        {p.stripe_payment_intent && (
                          <div className="max-w-[200px] truncate text-muted-foreground/70" title={p.stripe_payment_intent}>
                            {p.stripe_payment_intent}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function ManualForm({
  onSubmit,
  loading,
  error,
}: {
  onSubmit: (v: {
    id?: string;
    user_email?: string;
    mt5_uid: string;
    plan: PlanKey;
    extend_days: number;
    products?: string[];
    notes?: string;
  }) => void;
  loading: boolean;
  error: string | null;
}) {
  const [id, setId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [mt5, setMt5] = useState("");
  const [plan, setPlan] = useState<PlanKey>("access");
  const [days, setDays] = useState(30);
  const [products, setProducts] = useState<string[]>(["xau", "btc"]);

  function toggle(p: string) {
    setProducts((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          id: id.trim() || undefined,
          user_email: userEmail.trim() || undefined,
          mt5_uid: mt5.trim(),
          plan,
          extend_days: days,
          products: products.length ? products : undefined,
        });
      }}
      className="mt-4 grid gap-3 md:grid-cols-6"
    >
      <input
        value={id}
        onChange={(e) => setId(e.target.value)}
        placeholder="订阅 ID（可选）"
        className="rounded-lg border border-border bg-background/60 px-3 py-2 text-xs md:col-span-2"
      />
      <input
        value={userEmail}
        onChange={(e) => setUserEmail(e.target.value)}
        placeholder="用户邮箱（新建时必填）"
        className="rounded-lg border border-border bg-background/60 px-3 py-2 text-xs md:col-span-2"
      />
      <input
        value={mt5}
        onChange={(e) => setMt5(e.target.value)}
        required
        placeholder="MT5 UID"
        className="rounded-lg border border-border bg-background/60 px-3 py-2 text-xs md:col-span-2"
      />
      <select
        value={plan}
        onChange={(e) => {
          const p = e.target.value as PlanKey;
          setPlan(p);
          setProducts(["xau", "btc"]);
          setDays(p === "basic" ? 90 : 30);
        }}
        className="rounded-lg border border-border bg-background/60 px-3 py-2 text-xs md:col-span-2"
      >
        {Object.values(PLAN_CATALOG).map((p) => (
          <option key={p.key} value={p.key}>
            {p.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        min={-3650}
        max={3650}
        value={days}
        onChange={(e) => setDays(parseInt(e.target.value) || 30)}
        placeholder="天数（正=延期 / 负=扣减，仅对已有订阅）"
        className="rounded-lg border border-border bg-background/60 px-3 py-2 text-xs md:col-span-2"
      />
      <div className="flex items-center gap-3 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs md:col-span-2">
        <span className="text-muted-foreground">授权产品:</span>
        {(["xau", "btc"] as const).map((p) => (
          <label key={p} className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={products.includes(p)}
              onChange={() => toggle(p)}
            />
            <span className="font-mono">{p === "xau" ? "XAUUSD RR2.5" : "BTCUSD"}</span>
          </label>
        ))}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-gold-gradient px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60 md:col-span-2"
      >
        {loading ? "提交中..." : "提交"}
      </button>
      {error && <p className="text-xs text-red-400 md:col-span-6">{error}</p>}
    </form>
  );
}
