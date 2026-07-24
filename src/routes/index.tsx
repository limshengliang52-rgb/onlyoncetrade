import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getMemberCount } from "@/lib/member-count.functions";
import {
  ShieldCheck,
  KeyRound,
  Activity,
  Gauge,
  Coins,
  FlaskConical,
  RefreshCw,
  CalendarClock,
  ArrowRight,
  Check,
  AlertTriangle,
  Wallet,
  MessageCircle,
  LineChart,
  Sparkles,
} from "lucide-react";

import ogImage from "@/assets/og-image.jpg";

const SITE_URL = "https://onlyoncetrade.com";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { property: "og:image", content: `${SITE_URL}${ogImage}` },
      { name: "twitter:image", content: `${SITE_URL}${ogImage}` },
      { property: "og:url", content: SITE_URL },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
});

const WHATSAPP_URL = "https://wa.me/60136330303?text=" + encodeURIComponent("你好，我想开通 OnlyOnce EA Trade 月费权限");

function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-gold/30 selection:text-foreground">
      <Nav />
      <Hero />
      <HowItWorks />
      <Features />
      <Pricing />
      <MinCapital />
      <Risk />
      <CTA />
      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}

function FloatingWhatsApp() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp 客服"
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-gold-gradient px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_8px_30px_-6px_var(--gold)] transition-transform hover:scale-105 active:scale-95"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <a href="#top" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-gold-gradient text-primary-foreground shadow-[0_4px_20px_-6px_var(--gold)]">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            OnlyOnce <span className="gold-text">EA Trade</span>
          </span>
        </a>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#how" className="transition hover:text-foreground">开通流程</a>
          <a href="#features" className="transition hover:text-foreground">功能</a>
          <a href="#pricing" className="transition hover:text-foreground">订阅方案</a>
          <a href="#risk" className="transition hover:text-foreground">风险说明</a>
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="/auth"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
          >
            登录
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-full border border-gold/40 bg-gold/5 px-4 py-2 text-xs font-semibold text-gold transition hover:bg-gold/10 md:inline-flex"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-hero-radial">
      <div className="absolute inset-0 bg-grid-faint opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-20 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-xs font-medium text-gold font-sans">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            MT5 EA · Monthly License
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            付月费开通 <span className="gold-text">EA 权限</span>
            <br className="hidden sm:block" />
            让系统按策略自动执行交易
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            OnlyOnce EA Trade 采用 <span className="text-foreground">UID 白名单授权</span> 模式，会员开通后把 EA 挂在自己的 MT5 账户，
            系统根据策略信号、风险比例与每日亏损保护自动执行 —— 不是一次性卖 EA 文件，到期自动停止授权。
          </p>
          <div className="mt-7 flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
            <span>已有 <span className="font-semibold text-foreground">{useMemberCount()}</span> 位会员付款开通 EA 权限</span>
          </div>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#pricing"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_10px_40px_-10px_var(--gold)] transition hover:brightness-110 sm:w-auto"
            >
              查看订阅方案
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-surface/60 px-7 py-3.5 text-sm font-semibold text-foreground transition hover:border-gold/40 sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp 咨询
            </a>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border/60 pt-8 text-left sm:gap-8">
            {[
              { k: "UID", v: "白名单授权" },
              { k: "月费制", v: "到期自动停止" },
              { k: "风控", v: "每日亏损保护" },
            ].map((s) => (
              <div key={s.k} className="text-center sm:text-left">
                <div className="font-display text-xl font-bold gold-text md:text-2xl">{s.k}</div>
                <div className="mt-1 text-xs text-muted-foreground md:text-sm">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      icon: KeyRound,
      title: <>提交 <span className="font-sans">MT5</span> UID</>,
      desc: "会员付款后提交交易账号 UID，我们把账号加入 EA 授权白名单，仅授权账号能启动策略。",
    },
    {
      n: "02",
      icon: CalendarClock,
      title: "开通 EA 权限",
      desc: "系统按月授权，到期自动停止权限。可选择黄金、BTC 或指定策略版本。",
    },
    {
      n: "03",
      icon: Activity,
      title: "挂上 EA 自动执行",
      desc: "EA 按预设策略与风控执行交易，会员可查看运行状态、风险设置与更新通知。",
    },
  ];
  return (
    <section id="how" className="relative py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeader
          eyebrow="How it works"
          title={<>三步开通 <span className="gold-text">EA 授权</span></>}
          sub="从付款到 EA 在你的 MT5 上运行，全程清晰可追溯"
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="card-lux rounded-2xl p-7">
              <div className="flex items-center justify-between">
                <span className="font-display text-4xl font-bold text-gold/45">{s.n}</span>
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-gold/25 bg-gold/5 text-gold">
                  <s.icon className="h-5 w-5" />
                </span>
              </div>
              <h3 className="mt-6 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: KeyRound, title: "UID 授权管理", desc: "以 MT5 账号 UID 为单位加入/移除白名单，权限归属清晰。" },
    { icon: CalendarClock, title: "月费订阅权限", desc: "按月计费，到期未续费自动停止授权，无绑定长期合约。" },
    { icon: RefreshCw, title: "EA 策略版本更新", desc: "策略迭代时统一推送新版本，会员始终使用最新参数。" },
    { icon: ShieldCheck, title: "每日亏损保护", desc: "内建 Daily Loss Guard，触发阈值自动停止当日交易。" },
    { icon: Coins, title: "黄金 / BTC 模式", desc: "可选 XAUUSD 或 BTCUSD 策略版本，或同时开启。" },
    { icon: FlaskConical, title: "实盘前测试验证", desc: "建议先用小资金账户挂载 EA，确认表现与风险后再逐步放大。" },
  ];
  return (
    <section id="features" className="relative border-y border-border/50 bg-surface/40 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeader
          eyebrow="Features"
          title={<>专为 <span className="font-sans">MT5</span> EA 授权 <span className="gold-text">而设计</span></>}
          sub="从授权、风控到策略更新，全部围绕订阅制运作"
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f) => (
            <div key={f.title} className="card-lux group rounded-2xl p-6 transition hover:-translate-y-0.5 hover:border-gold/40">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold/10 text-gold ring-1 ring-inset ring-gold/20 transition group-hover:bg-gold/15">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type Plan = {
  key: "basic" | "access";
  name: string;
  tagline: string;
  price: string;
  original?: string;
  priceNote?: string;
  features: string[];
  cta: string;
  highlight?: boolean;
};

const plans: Plan[] = [
  {
    key: "basic",
    name: "Basic Access",
    tagline: "适合先测试一个品种",
    price: "$25",
    original: "$49",
    priceNote: "/ 30 天",
    features: [
      "1 个 MT5 UID 授权",
      "BTC 或黄金 二选一",
      "建议 500 USD 起始资金",
      "默认风控参数",
    ],
    cta: "立即开通",
  },
  {
    key: "access",
    name: "Pro Access",
    tagline: "适合同时跑两个品种",
    price: "$79",
    original: "$99",
    priceNote: "/ 30 天",
    highlight: true,
    features: [
      "1 个 MT5 UID 授权",
      "BTC 与 黄金 同时开启",
      "建议 500 USD 起始资金",
      "优先参数检查",
    ],
    cta: "立即开通",
  },
];

function Pricing() {
  return (
    <section id="pricing" className="relative py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeader
          eyebrow="Pricing"
          title={<>选择你的 <span className="gold-text">EA 授权方案</span></>}
          sub="限时优惠价，可随时通过 WhatsApp 咨询升级或续费"
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-2 max-w-4xl mx-auto">
          {plans.map((p) => (
            <PlanCard key={p.name} plan={p} />
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          * 优惠价为限时活动价，恢复原价后可能调整。所有月费方案到期后自动停止 EA 授权。
        </p>
      </div>
    </section>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={
        "relative flex flex-col rounded-2xl p-8 " +
        (plan.highlight
          ? "card-lux ring-gold border border-gold/40"
          : "card-lux")
      }
    >
      {plan.highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-gradient px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground shadow-lg">
          推荐
        </span>
      )}
      <div>
        <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
      </div>

      <div className="mt-6 flex items-end gap-3">
        <span className="font-display text-4xl font-bold gold-text">{plan.price}</span>
        {plan.priceNote && (
          <span className="pb-1.5 text-sm text-muted-foreground">{plan.priceNote}</span>
        )}
      </div>
      {plan.original && (
        <div className="mt-2 flex items-center gap-2">
          <span className="price-strike font-display text-2xl font-bold">
            {plan.original}
            <span className="price-strike-line" />
          </span>
          <span className="rounded-md border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
            限时优惠
          </span>
        </div>
      )}

      <div className="my-7 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <ul className="flex-1 space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span className="text-foreground/90">{f}</span>
          </li>
        ))}
      </ul>

      <a
        href={`/checkout/${plan.key}`}
        className={
          "mt-8 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition " +
          (plan.highlight
            ? "bg-gold-gradient text-primary-foreground shadow-[0_10px_30px_-10px_var(--gold)] hover:brightness-110"
            : "border border-gold/30 bg-gold/5 text-gold hover:bg-gold/10")
        }
      >
        {plan.cta} <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  );
}

function MinCapital() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-5xl px-5">
        <div className="card-lux relative overflow-hidden rounded-3xl p-8 md:p-12">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gold/10 blur-3xl" aria-hidden />
          <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-start">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gold-gradient text-primary-foreground shadow-lg">
              <Wallet className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">Minimum Capital</span>
              <h3 className="mt-2 font-display text-2xl font-bold md:text-3xl">
                建议最低起始资金：<span className="gold-text">500 USD</span>
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                这是为了让 EA 的<span className="text-foreground"> 风控、止损距离与 MT5 最小手数 </span>
                有足够空间正常运行。低过 500 USD 也许可以挂上 EA，
                但实际风险比例可能会被最小手数放大，不适合直接实盘放大。
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                我们建议先用 <span className="text-foreground">500 USD 起始资金</span> 验证策略表现，
                确认对回撤、点差与滑点的承受度后再逐步加大。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Risk() {
  const points = [
    { icon: Gauge, title: "EA 是执行工具，不是收益保证", desc: "策略按预设逻辑自动执行，无法保证任何收益率或胜率。" },
    { icon: LineChart, title: "结果受市场与执行环境影响", desc: "交易结果会受市场行情、点差、滑点、网络延迟与策略表现影响。" },
    { icon: FlaskConical, title: "先小资金验证", desc: "建议先用小资金账户挂载 EA，确认表现与风险后再逐步实盘。" },
  ];
  return (
    <section id="risk" className="relative border-t border-border/50 bg-surface/40 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeader
          eyebrow="Risk Disclosure"
          title={<>请务必阅读 <span className="gold-text">风险说明</span></>}
          sub="金融交易涉及风险，理解规则后再开通授权"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {points.map((p) => (
            <div key={p.title} className="card-lux rounded-2xl p-6">
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-gold/25 bg-gold/5 text-gold">
                <p.icon className="h-5 w-5" />
              </span>
              <h4 className="mt-5 text-base font-semibold">{p.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-4xl px-5">
        <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-surface-elevated via-surface to-background p-10 text-center md:p-16">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" aria-hidden />
          <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-gold/10 blur-3xl" aria-hidden />
          <div className="absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-gold/10 blur-3xl" aria-hidden />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
              Get Started
            </span>
            <h2 className="mt-6 font-display text-3xl font-bold leading-tight md:text-5xl">
              提交 UID，开通你的
              <br className="hidden sm:block" />
              <span className="gold-text"> EA 月费权限</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              通过 WhatsApp 联系我们，提供你的 MT5 UID 与所选方案，
              我们会在确认付款后完成白名单授权。
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-gold-gradient px-8 py-4 text-sm font-semibold text-primary-foreground shadow-[0_15px_50px_-15px_var(--gold)] transition hover:brightness-110"
            >
              <MessageCircle className="h-5 w-5" /> WhatsApp 申请开通
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 text-xs text-muted-foreground">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded bg-gold-gradient text-primary-foreground">
              <Sparkles className="h-3 w-3" />
            </span>
            <span className="font-display font-semibold text-foreground">OnlyOnce EA Trade</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <a href="/risk-disclosure" className="transition hover:text-foreground">风险声明</a>
            <a href="/terms" className="transition hover:text-foreground">服务条款</a>
            <a href="/refund-policy" className="transition hover:text-foreground">退款政策</a>
            <a href="/privacy-policy" className="transition hover:text-foreground">隐私政策</a>
          </nav>
        </div>
        <p className="text-center">
          © {new Date().getFullYear()} OnlyOnce EA Trade · MT5 EA 月费授权服务 · 交易涉及风险，请谨慎参与
        </p>
      </div>
    </footer>
  );
}

function SectionHeader({
  eyebrow,
  title,
  sub,
  icon,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
        {icon} {eyebrow}
      </span>
      <h2 className="mt-5 font-display text-3xl font-bold leading-tight md:text-4xl">{title}</h2>
      {sub && <p className="mt-4 text-sm text-muted-foreground md:text-base">{sub}</p>}
    </div>
  );
}
