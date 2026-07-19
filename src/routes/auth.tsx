import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Sparkles, ArrowLeft, LoaderCircle } from "lucide-react";

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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : undefined;

  const goNext = () => {
    if (safeNext) {
      window.location.assign(safeNext);
    } else {
      navigate({ to: "/dashboard" });
    }
  };

  const getAuthRedirectUri = () => {
    const authPath = safeNext ? `/auth?next=${encodeURIComponent(safeNext)}` : "/auth";
    return `${window.location.origin}${authPath}`;
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
          options: { emailRedirectTo: `${window.location.origin}${safeNext ?? "/dashboard"}` },
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
    if (m.includes("popup was blocked")) return "浏览器阻止了 Google 登录窗口，请允许弹窗后再点一次。";
    if (m.includes("cancelled")) return "Google 登录已取消，请重新点击按钮。";
    return msg;
  }


  async function handleGoogle() {
    setError(null);
    setInfo("正在打开 Google 登录窗口...");
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: getAuthRedirectUri(),
        extraParams: { prompt: "select_account" },
      });
      if (result.error) {
        setInfo(null);
        setError(translateAuthError(result.error.message ?? "Google 登录失败"));
        return;
      }
      if (result.redirected) return;
      setInfo("登录成功，正在进入...");
      goNext();
    } catch (err: any) {
      setInfo(null);
      setError(translateAuthError(err?.message ?? "Google 登录失败"));
    } finally {
      setGoogleLoading(false);
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
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-gray-800 shadow-lg shadow-black/30 ring-1 ring-white/20 transition hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {googleLoading ? (
              <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3c-2 1.4-4.6 2.3-7.4 2.3-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.3 5.3C41.6 35.2 44 30 44 24c0-1.3-.1-2.4-.4-3.5z"/>
              </svg>
            )}
            {googleLoading ? "正在连接 Google..." : "使用 Google 一键登录"}
          </button>

          {error && (
            <p className="mt-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}
          {info && (
            <p className="mt-3 rounded-md border border-gold/40 bg-gold/10 px-3 py-2 text-xs text-gold">
              {info}
            </p>
          )}

          <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> 或使用邮箱 <span className="h-px flex-1 bg-border" />
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
