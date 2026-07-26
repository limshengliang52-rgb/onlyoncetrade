import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "账户入口维护中 · OnlyOnce EA Trade" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthMaintenancePage,
});

function AuthMaintenancePage() {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-5 py-16 text-center">
      <h1 className="font-display text-2xl font-bold">账户入口维护中</h1>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
        账户登录入口暂时维护中。如需查询订阅或 UID 授权，请通过官方 WhatsApp 联系客服。
      </p>
      <a
        href="https://wa.me/60136330303"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center justify-center rounded-full border border-gold/40 bg-gold/5 px-5 py-2.5 text-xs font-semibold text-gold transition hover:bg-gold/10"
      >
        WhatsApp 联系客服
      </a>
      <a href="/" className="mt-6 text-xs text-muted-foreground underline underline-offset-4">
        返回首页
      </a>
    </main>
  );
}
