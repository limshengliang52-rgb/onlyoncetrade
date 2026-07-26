import { createFileRoute } from "@tanstack/react-router";

const WHATSAPP_URL =
  "https://wa.me/60136330303?text=" +
  encodeURIComponent("你好，我想咨询 OnlyOnce EA Trade 订阅开通");

export const Route = createFileRoute("/_authenticated/checkout/$plan")({
  validateSearch: (s: Record<string, unknown>) => ({
    checkout: typeof s.checkout === "string" ? s.checkout : undefined,
    uid: typeof s.uid === "string" ? s.uid : undefined,
    session_id: typeof s.session_id === "string" ? s.session_id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "付款入口维护中 · OnlyOnce EA Trade" },
      { name: "robots", content: "noindex,nofollow" },
      {
        name: "description",
        content:
          "OnlyOnce EA Trade 线上付款入口暂时维护中，请通过官方 WhatsApp 咨询开通方式。",
      },
    ],
  }),
  component: CheckoutMaintenance,
});

function CheckoutMaintenance() {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-xl flex-col items-center justify-center px-5 py-16 text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Maintenance
      </span>
      <h1 className="mt-6 font-display text-2xl font-bold md:text-3xl">
        线上付款入口暂时维护中
      </h1>
      <p className="mt-5 text-sm leading-relaxed text-muted-foreground md:text-base">
        为了配合安全审核，线上付款流程暂时关闭。
        请通过官方 WhatsApp 咨询套餐、MT5 UID 授权与开通方式，客服会协助后续流程。
      </p>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        本站不会索取您的 MT5 密码、经纪商密码、银行卡信息、交易所 API Key 或钱包助记词。
      </p>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-gold-gradient px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_10px_40px_-10px_var(--gold)] transition hover:brightness-110"
      >
        通过 WhatsApp 咨询开通
      </a>
      <a
        href="/"
        className="mt-4 text-xs font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        返回首页
      </a>
    </main>
  );
}
