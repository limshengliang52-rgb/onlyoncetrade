import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  approveSuspendEALicense,
  deleteEALicense,
  extendEALicense,
  listEALicenses,
  rejectSuspendEALicense,
  requestSuspendEALicense,
  setEALicenseStatus,
  upsertEALicense,
  type EALicenseInput,
} from "@/lib/ea-licenses.functions";

import { ArrowLeft, ShieldAlert, Sparkles, Pencil, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/ea-licenses")({
  component: EALicensesPage,
});

const emptyForm: EALicenseInput = {
  member_name: "",
  email: "",
  phone: "",
  mt5_account_id: "",
  uid: "",
  product: "onlyonce_xau_b2",
  status: "active",
  expires_at: "",
  notes: "",
};

function toLocalInput(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

function EALicensesPage() {
  const qc = useQueryClient();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [form, setForm] = useState<EALicenseInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

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

  const list = useQuery({
    queryKey: ["ea-licenses"],
    queryFn: () => listEALicenses(),
    enabled: authorized === true,
  });

  const upsert = useMutation({
    mutationFn: (v: EALicenseInput) => upsertEALicense({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ea-licenses"] });
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
    },
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteEALicense({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ea-licenses"] }),
  });
  const extend = useMutation({
    mutationFn: (v: { id: string; days: number }) => extendEALicense({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ea-licenses"] }),
  });
  const setStatus = useMutation({
    mutationFn: (v: { id: string; status: "active" | "expired" | "suspended" }) =>
      setEALicenseStatus({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ea-licenses"] }),
  });

  const apiBase = useMemo(
    () => (typeof window !== "undefined" ? window.location.origin : "https://onlyoncetrade.com"),
    [],
  );

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
          <Link
            to="/admin"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> 返回 Admin
          </Link>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-gold-gradient text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-bold">
              EA <span className="gold-text">License</span>
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10">
        <section className="card-lux rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold">EA WebRequest 接入</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            请把以下 URL 加进 MT5 的 <span className="font-mono">工具 → 选项 → EA → 允许的 URL</span>：
          </p>
          <div className="mt-2 rounded-lg border border-border bg-background/60 px-3 py-2 font-mono text-xs break-all">
            {apiBase}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            EA 请求样例（signature 使用环境变量 <span className="font-mono">EA_LICENSE_API_KEY</span>，请勿写进前端）：
          </p>
          <div className="mt-2 rounded-lg border border-border bg-background/60 px-3 py-2 font-mono text-[11px] break-all">
            GET {apiBase}/api/public/ea-license/check?account_id=33722337&amp;uid=U123&amp;product=onlyonce_xau_b2&amp;version=1.0.0&amp;signature=YOUR_API_KEY
          </div>
        </section>

        <section className="mt-8 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">会员授权</h2>
          <button
            onClick={() => {
              setForm(emptyForm);
              setEditingId(null);
              setShowForm(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-gold-gradient px-3 py-2 text-xs font-semibold text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> 新增授权
          </button>
        </section>

        {showForm && (
          <section className="card-lux mt-4 rounded-2xl p-6">
            <h3 className="font-display text-base font-semibold">
              {editingId ? "编辑授权" : "新增授权"}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                upsert.mutate({ ...form, id: editingId ?? undefined });
              }}
              className="mt-4 grid gap-3 md:grid-cols-6"
            >
              <input
                required
                value={form.member_name}
                onChange={(e) => setForm({ ...form, member_name: e.target.value })}
                placeholder="会员姓名"
                className="rounded-lg border border-border bg-background/60 px-3 py-2 text-xs md:col-span-2"
              />
              <input
                value={form.email ?? ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="邮箱"
                className="rounded-lg border border-border bg-background/60 px-3 py-2 text-xs md:col-span-2"
              />
              <input
                value={form.phone ?? ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="电话"
                className="rounded-lg border border-border bg-background/60 px-3 py-2 text-xs md:col-span-2"
              />
              <input
                required
                value={form.mt5_account_id}
                onChange={(e) => setForm({ ...form, mt5_account_id: e.target.value })}
                placeholder="MT5 账号 ID"
                className="rounded-lg border border-border bg-background/60 px-3 py-2 text-xs md:col-span-2"
              />
              <input
                value={form.uid ?? ""}
                onChange={(e) => setForm({ ...form, uid: e.target.value })}
                placeholder="会员 UID（可选）"
                className="rounded-lg border border-border bg-background/60 px-3 py-2 text-xs md:col-span-2"
              />
              <input
                required
                value={form.product}
                onChange={(e) => setForm({ ...form, product: e.target.value })}
                placeholder="EA 产品名 (onlyonce_xau_b2)"
                className="rounded-lg border border-border bg-background/60 px-3 py-2 text-xs md:col-span-2"
              />
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="rounded-lg border border-border bg-background/60 px-3 py-2 text-xs md:col-span-2"
              >
                <option value="active">active</option>
                <option value="suspended">suspended</option>
                <option value="expired">expired</option>
              </select>
              <input
                required
                type="datetime-local"
                value={toLocalInput(form.expires_at)}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className="rounded-lg border border-border bg-background/60 px-3 py-2 text-xs md:col-span-2"
              />
              <input
                value={form.notes ?? ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="备注"
                className="rounded-lg border border-border bg-background/60 px-3 py-2 text-xs md:col-span-2"
              />
              <div className="flex gap-2 md:col-span-6">
                <button
                  type="submit"
                  disabled={upsert.isPending}
                  className="rounded-lg bg-gold-gradient px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {upsert.isPending ? "保存中..." : "保存"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  className="rounded-lg border border-border px-4 py-2 text-xs"
                >
                  取消
                </button>
                {upsert.error instanceof Error && (
                  <p className="self-center text-xs text-red-400">{upsert.error.message}</p>
                )}
              </div>
            </form>
          </section>
        )}

        <div className="card-lux mt-4 overflow-hidden rounded-2xl">
          {list.isLoading ? (
            <p className="p-6 text-sm text-muted-foreground">加载中...</p>
          ) : !list.data?.length ? (
            <p className="p-6 text-sm text-muted-foreground">暂无授权</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-background/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">会员</th>
                    <th className="px-4 py-3 text-left">MT5 账号</th>
                    <th className="px-4 py-3 text-left">产品</th>
                    <th className="px-4 py-3 text-left">状态</th>
                    <th className="px-4 py-3 text-left">到期</th>
                    <th className="px-4 py-3 text-left">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {list.data.map((r: any) => (
                    <tr key={r.id} className="border-t border-border/40 align-top">
                      <td className="px-4 py-3">
                        <div className="font-medium">{r.member_name}</div>
                        <div className="text-[11px] text-muted-foreground">{r.email ?? "-"}</div>
                        <div className="text-[11px] text-muted-foreground">{r.phone ?? ""}</div>
                        {r.uid && (
                          <div className="text-[11px] font-mono text-muted-foreground">UID: {r.uid}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{r.mt5_account_id}</td>
                      <td className="px-4 py-3 font-mono text-xs">{r.product}</td>
                      <td className="px-4 py-3">
                        <select
                          value={r.status}
                          onChange={(e) =>
                            setStatus.mutate({ id: r.id, status: e.target.value as any })
                          }
                          className="rounded border border-border bg-background/60 px-2 py-1 text-xs"
                        >
                          <option value="active">active</option>
                          <option value="suspended">suspended</option>
                          <option value="expired">expired</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {r.expires_at ? new Date(r.expires_at).toLocaleString() : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => extend.mutate({ id: r.id, days: 30 })}
                            className="rounded-md border border-gold/40 bg-gold/5 px-2 py-1 text-[10px] font-semibold text-gold hover:bg-gold/10"
                          >
                            +30天
                          </button>
                          <button
                            onClick={() => {
                              if (!confirm("确认扣除 30 天？")) return;
                              extend.mutate({ id: r.id, days: -30 });
                            }}
                            className="rounded-md border border-orange-500/40 bg-orange-500/5 px-2 py-1 text-[10px] font-semibold text-orange-400 hover:bg-orange-500/10"
                          >
                            -30天
                          </button>
                          <button
                            onClick={() => {
                              const raw = prompt("自定义天数（正数=延期，负数=扣减）", "7");
                              if (!raw) return;
                              const n = parseInt(raw);
                              if (!Number.isInteger(n) || n === 0) return alert("请输入非零整数");
                              extend.mutate({ id: r.id, days: n });
                            }}
                            className="rounded-md border border-border bg-background/40 px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground"
                          >
                            自定义
                          </button>
                          {r.status === "active" ? (
                            <button
                              onClick={() => setStatus.mutate({ id: r.id, status: "suspended" })}
                              className="rounded-md border border-red-500/40 bg-red-500/5 px-2 py-1 text-[10px] font-semibold text-red-400 hover:bg-red-500/10"
                            >
                              停用
                            </button>
                          ) : (
                            <button
                              onClick={() => setStatus.mutate({ id: r.id, status: "active" })}
                              className="rounded-md border border-emerald-500/40 bg-emerald-500/5 px-2 py-1 text-[10px] font-semibold text-emerald-400 hover:bg-emerald-500/10"
                            >
                              激活
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setForm({
                                member_name: r.member_name,
                                email: r.email ?? "",
                                phone: r.phone ?? "",
                                mt5_account_id: r.mt5_account_id,
                                uid: r.uid ?? "",
                                product: r.product,
                                status: r.status,
                                expires_at: r.expires_at,
                                notes: r.notes ?? "",
                              });
                              setEditingId(r.id);
                              setShowForm(true);
                            }}
                            className="rounded-md border border-border px-2 py-1 text-[10px] font-semibold hover:bg-muted"
                          >
                            <Pencil className="inline h-3 w-3" /> 编辑
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`删除 ${r.member_name} 的授权？`)) del.mutate(r.id);
                            }}
                            className="rounded-md border border-red-500/40 bg-red-500/5 px-2 py-1 text-[10px] font-semibold text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="inline h-3 w-3" /> 删除
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
