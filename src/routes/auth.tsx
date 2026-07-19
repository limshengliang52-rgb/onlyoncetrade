import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Sparkles, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const goNext = () => {
    if (next && next.startsWith("/")) {
      window.location.assign(next);
    } else {
      navigate({ to: "/dashboard" });
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) goNext();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        goNext();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}${next ?? "/dashboard"}` },
        });
        if (error) throw error;
        // 邮箱已开启自动确认，直接登录
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) {
          setInfo("注册成功，请使用邮箱和密码登录。");
        } else {
          goNext();
        }
      }
    } catch (err: any) {
      setError(translateAuthError(err?.message));
    } finally {
      setLoading(false);
    }
  }

  function translateAuthError(msg?: string): string {
    if (!msg) return "操作失败，请重试";
    const m = msg.toLowerCase();
    if (m.includes("invalid login")) return "邮箱或密码错误";
    if (m.includes("email not confirmed")) return "邮箱未验证，请查收验证邮件";
    if (m.includes("user already registered")) return "该邮箱已注册，请直接登录";
    if (m.includes("password should be at least")) return "密码至少 6 位";
    if (m.includes("weak") || m.includes("pwned")) return "密码过于简单，请使用更复杂的密码";
    if (m.includes("rate limit") || m.includes("too many")) return "请求过于频繁，请稍后再试";
    if (m.includes("invalid email")) return "邮箱格式不正确";
    return msg;
  }


  async function handleGoogle() {
    setError(null);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        setError(result.error.message ?? "Google 登录失败");
        return;
      }
      if (result.redirected) return;
      goNext();
    } catch (err: any) {
      setError(err?.message ?? "Google 登录失败");
    }
  }

  return (
    <main className="min-h-screen bg-hero-radial px-5 py-12 text-foreground">
      <div className="mx-auto max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> 返回首页
        </Link>
        <div className="mt-6 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-gold-gradient text-primary-foreground shadow-[0_4px_20px_-6px_var(--gold)]">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            OnlyOnce <span className="gold-text">EA Trade</span>
          </span>
        </div>

        <div className="card-lux mt-8 rounded-2xl p-8">
          <h1 className="font-display text-2xl font-bold">
            {mode === "login" ? "登录账户" : "创建账户"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            登录后可开通 EA 授权、管理 MT5 UID
          </p>

          <button
            onClick={handleGoogle}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background/60 px-4 py-3 text-sm font-medium transition hover:bg-background"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21.35 11.1H12v3.2h5.35c-.23 1.5-1.6 4.4-5.35 4.4a5.7 5.7 0 010-11.4c1.63 0 2.73.7 3.35 1.3l2.3-2.2C15.9 5 14.15 4.3 12 4.3a8.2 8.2 0 100 16.4c4.73 0 7.85-3.3 7.85-8 0-.53-.05-.94-.1-1.35z"
              />
            </svg>
            使用 Google 登录
          </button>

          <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> 或 <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">邮箱</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-gold/60"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">密码</label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-gold/60"
              />
            </div>

            {error && (
              <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {error}
              </p>
            )}
            {info && (
              <p className="rounded-md border border-gold/40 bg-gold/10 px-3 py-2 text-xs text-gold">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gold-gradient px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_var(--gold)] transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "处理中..." : mode === "login" ? "登录" : "注册"}
            </button>
          </form>

          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
              setInfo(null);
            }}
            className="mt-4 w-full text-center text-xs text-muted-foreground transition hover:text-foreground"
          >
            {mode === "login" ? "还没有账户？注册" : "已有账户？登录"}
          </button>
        </div>
      </div>
    </main>
  );
}
