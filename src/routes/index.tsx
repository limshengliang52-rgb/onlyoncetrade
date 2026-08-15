import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import tr1 from "@/assets/tr-1.jpeg.asset.json";
import tr2 from "@/assets/tr-2.jpeg.asset.json";
import tr3 from "@/assets/tr-3.jpeg.asset.json";
import tr4 from "@/assets/tr-4.jpeg.asset.json";

import { PlatformNotice } from "@/components/PlatformNotice";
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
  TrendingUp,
  Sparkles,
  Target,
} from "lucide-react";

import ogImage from "@/assets/og-image.jpg";
import { EquityCurve, type EquityPoint } from "@/components/EquityCurve";
import { TradeScroller } from "@/components/TradeScroller";

import { getMemberCount } from "@/lib/member-count.functions";


const SITE_URL = "https://onlyoncetrade.com";

export const Route = createFileRoute("/")({
  component: Landing,
  loader: async () => {
    const { count } = await getMemberCount();
    return { memberCount: count };
  },

  head: () => ({
    meta: [
      { property: "og:image", content: `${SITE_URL}${ogImage}` },
      { name: "twitter:image", content: `${SITE_URL}${ogImage}` },
      { property: "og:url", content: SITE_URL },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
});


const WHATSAPP_URL = "https://wa.me/60136330303?text=" + encodeURIComponent("你好，我想咨询 OnlyOnce EA Trade");

const SECTION_NAV_ITEMS = [
  { id: "top", label: "MT5 EA" },
  { id: "how", label: "How it works" },
  { id: "features", label: "Features" },
  { id: "pricing", label: "Pricing" },
  { id: "backtest", label: "回测报告" },
  { id: "btc-backtest", label: "回测报告" },
  { id: "live-trade-records", label: "Live Trade Records" },
  { id: "capital", label: "Minimum Capital" },
  { id: "risk", label: "Risk Disclosure" },
  { id: "cta", label: "Get Started" },
  { id: "strategy", label: "Strategy" },
];

function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-gold/30 selection:text-foreground">
      <Nav />
      <SectionRail />
      <Hero />
      <HowItWorks />
      <Features />
      <Pricing />
      <XauBacktest />
      <BtcBacktest />
      <LiveTradeRecords />

      <MinCapital />
      <Risk />
      <CTA />
      <Strategy />
      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}

function SectionRail() {
  const [activeId, setActiveId] = useState(SECTION_NAV_ITEMS[0].id);

  useEffect(() => {
    const sections = SECTION_NAV_ITEMS
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      {
        rootMargin: "-28% 0px -52% 0px",
        threshold: [0.12, 0.25, 0.5, 0.75],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="页面区块导航"
      className="fixed right-7 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-3 xl:flex"
    >
      {SECTION_NAV_ITEMS.map((item, index) => {
        const active = item.id === activeId;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={active ? "true" : undefined}
            className="group flex items-center gap-3 text-right"
          >
            <span
              className={
                "max-w-0 overflow-hidden whitespace-nowrap font-sans text-[11px] font-semibold uppercase tracking-[0.2em] opacity-0 transition-all duration-300 group-hover:max-w-48 group-hover:opacity-100 " +
                (active ? "max-w-48 text-foreground opacity-100" : "text-muted-foreground")
              }
            >
              {String(index + 1).padStart(2, "0")} · {item.label}
            </span>
            <span
              className={
                "grid h-5 w-5 place-items-center rounded-full border transition-all duration-300 " +
                (active
                  ? "border-primary/70 bg-primary/15 shadow-[0_0_18px_oklch(0.65_0.18_270/0.45)]"
                  : "border-border/70 bg-background/40 group-hover:border-primary/45 group-hover:bg-primary/10")
              }
            >
              <span
                className={
                  "h-1.5 w-1.5 rounded-full transition-all duration-300 " +
                  (active ? "bg-primary" : "bg-muted-foreground/40 group-hover:bg-primary/70")
                }
              />
            </span>
          </a>
        );
      })}
    </nav>
  );
}

function FloatingWhatsApp() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
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
          <a href="#strategy" className="transition hover:text-foreground">策略</a>
          <a href="#how" className="transition hover:text-foreground">开通流程</a>
          <a href="#features" className="transition hover:text-foreground">功能</a>
          <a href="#pricing" className="transition hover:text-foreground">订阅方案</a>
          <a href="#risk" className="transition hover:text-foreground">风险说明</a>
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="/auth"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground transition hover:border-gold/40 hover:text-gold"
          >
            登录 / 注册
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full border border-gold/40 bg-gold/5 px-4 py-2 text-xs font-semibold text-gold transition hover:bg-gold/10 md:inline-flex"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}

function useMemberCount() {
  const { memberCount } = Route.useLoaderData();
  return memberCount;
}



function Hero() {
  const memberCount = useMemberCount();
  return (
    <section id="top" className="relative overflow-hidden bg-hero-radial">
      <div className="absolute inset-0 bg-grid-faint opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-20 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-xs font-medium text-gold font-sans">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            MT5 EA · 黄金与 BTC 策略
          </span>
          <h1 className="mobile-heading mt-6 font-display text-[28px] font-bold leading-[1.16] sm:text-5xl md:text-6xl">
            <span className="block">
              <span className="phrase">AI 自动化</span>
              <span className="phrase">交易系统</span>
            </span>
            <span className="mt-2 block text-[22px] leading-[1.18] gold-text sm:text-4xl md:text-5xl">
              <span className="phrase">黄金与 BTC</span>{" "}
              <span className="phrase">策略自动执行</span>
            </span>
          </h1>
          <div className="mobile-copy mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-muted-foreground md:text-lg">
            <p>OnlyOnce 为黄金与比特币交易者提供 MT5 策略自动执行、UID 授权、风险控制与订阅管理服务。会员开通后，把 EA 挂在自己的 MT5 账户，系统按规则化信号运行，并设有每日亏损保护。</p>
            <p className="mt-2 text-sm">交易存在风险，策略系统不保证盈利。请确认自身风险承受能力后再开通。</p>
          </div>
          <div className="mt-7 flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
            <span>已有 <span className="font-semibold text-foreground">{memberCount}</span> 位会员开通 EA 权限</span>
          </div>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#pricing"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_10px_40px_-10px_var(--gold)] transition hover:brightness-110 sm:w-auto"
            >
              立即开通
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-surface/60 px-7 py-3.5 text-sm font-semibold text-foreground transition hover:border-gold/40 sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp 咨询
            </a>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border/60 pt-8 text-center sm:gap-8">
            {[
              { k: "UID", v: "白名单授权" },
              { k: "月费制", v: "到期自动停止" },
              { k: "风控", v: "每日亏损保护" },
            ].map((s) => (
              <div key={s.k} className="text-center">
                <div className="font-display text-xl font-bold gold-text md:text-2xl">{s.k}</div>
                <div className="mt-1 text-xs text-muted-foreground md:text-sm">{s.v}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-xl border border-border/60 bg-surface/40 px-5 py-4 text-left text-xs leading-relaxed text-muted-foreground">
            <div className="mb-1 font-semibold text-foreground">安全说明 / Security Notice</div>
            <p>
              OnlyOnce EA Trade 是 MT5 EA 自动交易工具订阅服务。我们不会索取或收集 MT5 密码、
              银行密码、助记词、银行卡号码或远程设备权限。付款由 Stripe 安全处理，
              EA 授权只使用客户的 MT5 UID。
            </p>
            <p className="mt-2">
              OnlyOnce EA Trade is a legitimate MT5 Expert Advisor subscription service.
              We do not ask for or collect MT5 passwords, bank passwords, seed phrases,
              card numbers, or remote device access. Payments are processed securely by
              Stripe. EA authorization uses only the customer's MT5 UID.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Strategy() {
  return (
    <section id="strategy" className="relative border-t border-border/50 bg-surface/40 py-16">
      <div className="mx-auto max-w-4xl px-5 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
          <Target className="h-3 w-3" /> Strategy
        </span>
        <h2 className="mobile-heading mt-4 font-display text-2xl font-bold leading-tight md:text-3xl">
          <span className="phrase gold-text">进场逻辑</span>
          <span className="phrase">说明</span>
        </h2>
        <p className="mobile-copy mt-4 text-sm leading-relaxed text-muted-foreground">
          本策略主要根据市场趋势、关键价格结构和确认信号来判断进场机会。系统会先识别当前方向，再等待价格回到重要支撑/阻力、均线或结构区域附近。当趋势方向、价格位置与确认条件一致时，才会执行进场；若市场震荡过大、方向不清晰或风险条件不符合，则会过滤交易，减少不必要的开仓。
        </p>
        <p className="mobile-copy mt-3 text-xs leading-relaxed text-muted-foreground">
          这是规则化的执行逻辑，不代表未来盈利保证。任何 EA 都存在亏损风险，请确认自身风险承受能力后再开通。
        </p>
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
      desc: "30 天或 90 天订阅方案。默认同时开启 XAUUSD 与 BTCUSD 两个策略。",
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
    { icon: Coins, title: "黄金 + BTC 双策略", desc: "所有方案默认同时开启 XAUUSD 与 BTCUSD 两个策略。" },
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
  slug: "pro" | "plus";
  name: string;
  tagline: string;
  price: string;
  priceNote?: string;
  features: string[];
  cta: string;
  highlight?: boolean;
};

const PLAN_FEATURES = [
  "包含 XAUUSD EA + BTCUSD EA",
  "1 个 MT5 UID 授权绑定",
  "订阅到期前可在后台续费",
  "会员后台下载两个 EA",
  "支持 Windows / Mac 一键安装 EA 文件",
];

const plans: Plan[] = [
  {
    slug: "plus",
    name: "OnlyOnce EA Plus",
    tagline: "",
    price: "$99",
    priceNote: "/ 30 天",
    features: PLAN_FEATURES,
    cta: "订阅月费方案",
  },
  {
    slug: "pro",
    name: "OnlyOnce EA Pro",
    tagline: "",
    price: "$270",
    priceNote: "/ 90 天",
    highlight: true,
    features: PLAN_FEATURES,
    cta: "订阅 3 个月方案",
  },
];


function Pricing() {
  return (
    <section id="pricing" className="relative py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeader
          eyebrow="Pricing"
          title={
            <>
              <span className="phrase">开通</span>{" "}
              <span className="phrase gold-text">AI 全自动交易</span>
              <span className="phrase gold-text">策略授权</span>
            </>
          }
          sub="订阅到期前可续费。如需暂停续费，可在后台提交申请，由客服确认后处理。每个方案都包含 XAUUSD EA + BTCUSD EA，付款成功后自动加入 MT5 UID 白名单"
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-2 max-w-4xl mx-auto">
          {plans.map((p) => (
            <PlanCard key={p.name} plan={p} />
          ))}
        </div>

        <div className="mt-8 max-w-4xl mx-auto">
          <PlatformNotice variant="banner" />
        </div>

        <div className="mt-6 max-w-4xl mx-auto rounded-2xl border border-gold/25 bg-gold/5 p-5 text-xs leading-relaxed text-muted-foreground">
          <p className="text-foreground font-semibold">资金建议 / Recommended Capital</p>
          <p className="mt-2">
            如果同时运行 XAUUSD 与 BTCUSD 两个策略，建议账户资金准备至少
            <span className="text-foreground font-semibold"> 1,000 USD</span>。
            资金过小可能导致回撤压力变大，用户需自行承担交易风险。
          </p>
          <p className="mt-2">
            If running both XAUUSD and BTCUSD strategies at the same time, we recommend preparing at least
            <span className="text-foreground font-semibold"> 1,000 USD</span> account balance.
            Smaller balances may experience higher drawdown pressure. Trading risk is borne by the user.
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          * 所有方案均为 UID 授权制，不出售 EA 文件所有权。订阅到期前可续费。如需暂停续费，可在后台提交申请，由客服确认后处理。
        </p>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground/80">
          本服务仅提供 EA 工具授权与技术说明，不构成投资建议，也不承诺任何收益。交易存在亏损风险，请自行评估后使用。
        </p>

      </div>
    </section>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={
        "relative flex flex-col rounded-2xl p-6 sm:p-8 group/card " +
        (plan.highlight
          ? "card-lux ring-gold border border-gold/40 plan-card-hover"
          : "card-lux plan-card-hover")
      }
    >
      {plan.highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-gradient px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground shadow-lg">
          推荐
        </span>
      )}
      <div>
        <h3 className="mobile-heading font-display text-[22px] font-bold leading-snug sm:text-2xl">{plan.name}</h3>
        {plan.tagline && (
          <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1">
        <span className="font-display text-[34px] font-bold leading-none gold-text sm:text-4xl">{plan.price}</span>
        {plan.priceNote && (
          <span className="pb-1.5 text-sm text-muted-foreground">{plan.priceNote}</span>
        )}
      </div>
      <div className="my-7 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <ul className="flex-1 space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span className="mobile-copy text-foreground/90">{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <PlatformNotice variant="compact" />
      </div>

      <a
        href={`/checkout/${plan.slug}`}
        className={
          "mt-5 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300 " +
          (plan.highlight
            ? "bg-gold-gradient text-primary-foreground shadow-[0_10px_30px_-10px_var(--gold)] hover:shadow-[0_10px_45px_-10px_var(--gold)] group-hover/card:shadow-[0_0_35px_-8px_var(--gold)] group-hover/card:brightness-110"
            : "border border-gold/30 bg-gold/5 text-gold hover:border-gold/50 hover:bg-gold/10 hover:shadow-[0_0_25px_-8px_oklch(0.65_0.18_270/0.35)] group-hover/card:shadow-[0_0_25px_-8px_oklch(0.65_0.18_270/0.3)] group-hover/card:bg-gold/10")
        }
      >
        {plan.cta}
      </a>
    </div>

  );
}

type MonthlyRow = { m: string; profit: number; pct: number; pf: number; wr: number; trades?: number };
type StatItem = { label: string; value: string; unit?: string };

/** Smooth start→end illustrative curve (no invented monthly rows). */
function buildDemoCurve(initialBalance: string, finalBalance: string): EquityPoint[] {
  const parse = (s: string) => Number(s.replace(/[^0-9.]/g, "")) || 0;
  const start = parse(initialBalance);
  const end = parse(finalBalance);
  const steps = 24;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const eased = Math.pow(t, 1.6);
    return { label: i === 0 ? "Start" : i === steps ? "End" : "", value: Number((start + (end - start) * eased).toFixed(2)) };
  });
}


function StrategyBacktestSection({
  id,
  eyebrow,
  symbol,
  strategyName,
  headlinePct,
  headlineUsd,
  initialBalance,
  finalBalance,
  period,
  stats,
  months,
  curve,
  showTrades = false,
  tableYearLabel,
}: {
  id: string;
  eyebrow: string;
  symbol: string;
  strategyName: string;
  headlinePct: string;
  headlineUsd: string;
  initialBalance: string;
  finalBalance: string;
  period: string;
  stats: StatItem[];
  months: MonthlyRow[];
  curve?: EquityPoint[];
  showTrades?: boolean;
  tableYearLabel: string;
}) {
  return (
    <section id={id} className="relative border-y border-border/50 bg-surface/40 py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeader
          eyebrow={eyebrow}
          title={
            <>
              <span className="block">
                <span className="phrase">OnlyOnce</span>{" "}
                <span className="phrase font-sans">{symbol} EA</span>
              </span>
              <span className="block gold-text">回测战绩</span>
            </>
          }
          sub="数据来自 MT5 Strategy Tester。历史回测不代表未来保证收益，仅用于展示策略历史表现、交易频率与波动。"
          icon={<TrendingUp className="h-4 w-4" />}
        />

        <div className="mt-10 card-lux ring-gold relative overflow-hidden rounded-3xl p-5 sm:p-8 md:p-10">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" aria-hidden />

          {/* dashboard header */}
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-primary sm:text-[11px] sm:tracking-[0.24em]">
                Strategy Backtest · {tableYearLabel}
              </span>
              <h3 className="mt-2 font-display text-xl font-bold sm:text-2xl">
                OnlyOnce <span className="font-sans">{symbol}</span> EA
              </h3>
              <p className="mt-1 break-words text-xs text-muted-foreground/80 font-sans">
                {period} · {strategyName}
              </p>
            </div>
            <div className="min-w-0 text-left sm:text-right">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Cumulative ROI
              </div>
              <div className="mt-1 font-display text-3xl font-bold leading-none gold-text sm:text-4xl md:text-5xl">
                {headlinePct}%
              </div>
              <div className="mt-1 font-sans text-xs text-muted-foreground">{headlineUsd}</div>
            </div>
          </div>

          {/* equity curve */}
          <div className="relative mt-6">
            <EquityCurve points={curve && curve.length > 1 ? curve : buildDemoCurve(initialBalance, finalBalance)} />
            {!(curve && curve.length > 1) && (
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground font-sans">
                该曲线仅为初始资金到最终余额的走势示意，逐月明细以 MT5 Strategy Tester 原始报告为准。
              </p>
            )}
          </div>


          <p className="relative mt-4 text-xs text-muted-foreground font-sans">
            初始资金 <span className="text-foreground">{initialBalance}</span> · 最终余额{" "}
            <span className="text-foreground">{finalBalance}</span>
          </p>

          {/* metric grid */}
          <div className="relative mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="min-w-0 rounded-xl border border-primary/15 bg-background/40 p-4">
                <div className="text-[10px] font-semibold uppercase leading-snug tracking-[0.08em] text-muted-foreground sm:tracking-[0.16em]">{s.label}</div>
                <div className="mt-2 font-display text-lg font-bold text-foreground sm:text-xl">
                  <span className="break-words font-sans">{s.value}</span>
                  {s.unit && <span className="ml-1 text-sm text-muted-foreground font-sans">{s.unit}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {months.length > 0 && (
        <div className="mt-8">
          <div className="card-lux rounded-2xl p-5 sm:p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-lg font-semibold">每月回测表现</h3>
              <span className="text-[11px] font-sans text-muted-foreground">{tableYearLabel} · {symbol}</span>
            </div>
            <div className="mt-6 overflow-x-auto rounded-xl border border-border/60">
              <table className={`w-full text-sm ${showTrades ? "min-w-[560px]" : "min-w-[440px]"}`}>
                <thead>
                  <tr className="bg-background/40 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-3 text-left font-sans">月份</th>
                    <th className="px-3 py-3 text-right font-sans">收益</th>
                    <th className="px-3 py-3 text-right font-sans">胜率</th>
                    <th className="px-3 py-3 text-right font-sans">盈利因子</th>
                    {showTrades && <th className="px-3 py-3 text-right font-sans">交易次数</th>}
                  </tr>
                </thead>
                <tbody>
                  {months.map((row, i) => {
                    const positive = row.profit >= 0;
                    const color = positive ? "text-primary" : "text-destructive";
                    const sign = positive ? "+" : "";
                    return (
                      <tr key={row.m} className={i % 2 ? "bg-background/20" : ""}>
                        <td className="px-3 py-2.5 font-sans font-medium text-foreground">{row.m}</td>
                        <td className={`px-3 py-2.5 text-right font-sans font-semibold ${color}`}>
                          {sign}{row.pct.toFixed(2)}%
                          <span className="block text-[11px] text-muted-foreground sm:ml-1 sm:inline sm:text-xs">({sign}{row.profit.toFixed(2)} USD)</span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-sans text-foreground/80">{row.wr.toFixed(2)}%</td>
                        <td className="px-3 py-2.5 text-right font-sans text-foreground/80">{row.pf.toFixed(2)}</td>
                        {showTrades && <td className="px-3 py-2.5 text-right font-sans text-foreground/80">{row.trades ?? "-"}</td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        )}

        <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground font-sans">
          回测数据基于历史 MT5 数据，不代表未来保证收益。交易存在风险，请根据自身资金情况谨慎使用。
        </p>
      </div>
    </section>
  );
}

const XAU_MONTHS: MonthlyRow[] = [
  { m: "Jan", profit: 119.32, pct: 23.86, pf: 1.26, wr: 29.03, trades: 31 },
  { m: "Feb", profit: 54.2, pct: 8.75, pf: 1.13, wr: 19.05, trades: 21 },
  { m: "Mar", profit: 342.81, pct: 50.9, pf: 1.54, wr: 37.5, trades: 24 },
  { m: "Apr", profit: 67.69, pct: 6.66, pf: 1.1, wr: 35.29, trades: 34 },
  { m: "May", profit: -50.63, pct: -4.67, pf: 0.88, wr: 29.17, trades: 24 },
  { m: "Jun", profit: 324.74, pct: 31.42, pf: 1.88, wr: 40.0, trades: 20 },
  { m: "Jul", profit: 257.07, pct: 18.93, pf: 1.61, wr: 38.1, trades: 21 },
];

const XAU_CURVE: EquityPoint[] = [
  { label: "Start", value: 500 },
  { label: "Jan", value: 619.32 },
  { label: "Feb", value: 673.52 },
  { label: "Mar", value: 1016.33 },
  { label: "Apr", value: 1084.02 },
  { label: "May", value: 1033.4 },
  { label: "Jun", value: 1358.13 },
  { label: "Jul", value: 1800.42 },
];

function XauBacktest() {
  return (

    <StrategyBacktestSection
      id="backtest"
      eyebrow="回测报告"
      symbol="XAUUSD"
      strategyName="OnlyOnce XAUUSD EA RR2.5（原版）"
      headlinePct="+260.08"
      headlineUsd="+1,300.42 USD"
      initialBalance="500 USD"
      finalBalance="1,800.42 USD"
      period="2026-01-01 – 2026-07-30"
      tableYearLabel="2026"
      stats={[
        { label: "Profit Factor", value: "1.34" },
        { label: "Sharpe Ratio", value: "3.44" },
        { label: "Trades", value: "188" },
        { label: "Win Rate", value: "31.38", unit: "%" },
        { label: "Balance Max Drawdown", value: "34.60", unit: "%" },
        { label: "Equity Max Drawdown", value: "35.48", unit: "%" },
      ]}
      months={XAU_MONTHS}
      curve={XAU_CURVE}
      showTrades
    />


  );
}

const BTC_MONTHS: MonthlyRow[] = [
  { m: "Jan", profit: 55.52, pct: 11.1, pf: 1.97, wr: 57.14, trades: 7 },
  { m: "Feb", profit: 10.05, pct: 1.81, pf: 1.55, wr: 50.0, trades: 2 },
  { m: "Mar", profit: -27.27, pct: -4.82, pf: 0.7, wr: 28.57, trades: 7 },
  { m: "Apr", profit: 194.0, pct: 35.76, pf: 4.66, wr: 70.0, trades: 10 },
  { m: "May", profit: 112.49, pct: 14.88, pf: 1.84, wr: 55.56, trades: 9 },
  { m: "Jun", profit: -60.79, pct: -6.99, pf: 0.75, wr: 27.27, trades: 11 },
  { m: "Jul", profit: 841.25, pct: 103.27, pf: 3.85, wr: 68.18, trades: 22 },
];

const BTC_CURVE: EquityPoint[] = (() => {
  let bal = 500;
  const pts: EquityPoint[] = [{ label: "Start", value: bal }];
  for (const row of BTC_MONTHS) {
    bal += row.profit;
    pts.push({ label: row.m, value: Number(bal.toFixed(2)) });
  }
  return pts;
})();

function BtcBacktest() {
  return (
    <StrategyBacktestSection
      id="btc-backtest"
      eyebrow="回测报告"
      symbol="BTCUSD"
      strategyName="OnlyOnce BTC EA"
      headlinePct="+222.94"
      headlineUsd="+1,114.68 USD"
      initialBalance="500 USD"
      finalBalance="1,614.68 USD"
      period="2026 Jan–Jul"
      tableYearLabel="2026"
      stats={[
        { label: "Profit Factor", value: "2.37" },
        { label: "Win Rate", value: "61.11", unit: "%" },
        { label: "Sharpe Ratio", value: "9.65" },
        { label: "Trades", value: "72" },
        { label: "Balance Max Drawdown", value: "145.78", unit: "USD" },
        { label: "Equity Max Drawdown", value: "186.62", unit: "USD" },
      ]}
      months={BTC_MONTHS}
      curve={BTC_CURVE}
      showTrades
    />
  );
}

const TRADE_RECORDS = [
  { src: tr1.url, symbol: "XAUUSD", roi: "+354.02%", date: "2026-07-28" },
  { src: tr2.url, symbol: "XAUUSD", roi: "+455.04%", date: "2026-07-30" },
  { src: tr3.url, symbol: "XAUUSD", roi: "+1,132.65%", date: "2026-08-05" },
  { src: tr4.url, symbol: "XAUUSD", roi: "-177.97%", date: "2026-08-05" },
];

function LiveTradeRecords() {
  return (
    <section id="live-trade-records" className="relative border-t border-border/50 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeader
          eyebrow="Live Trade Records"
          title={<>会员 <span className="gold-text">战绩展示</span></>}
          icon={<Activity className="h-4 w-4" />}
        />
        <div className="mx-auto mt-10 max-w-md">
          <TradeScroller items={TRADE_RECORDS} />
        </div>
        

      </div>
    </section>
  );
}

function MinCapital() {
  return (
    <section id="capital" className="relative py-20">
      <div className="mx-auto max-w-5xl px-5">
        <div className="card-lux relative overflow-hidden rounded-3xl p-8 md:p-12">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gold/10 blur-3xl" aria-hidden />
          <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-start">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gold-gradient text-primary-foreground shadow-lg">
              <Wallet className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">Minimum Capital</span>
              <h3 className="mobile-heading mt-2 font-display text-[25px] font-bold leading-tight md:text-3xl">
                <span className="phrase">建议最低起始资金：</span>
                <span className="phrase gold-text">500 USD</span>
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

        <div className="mt-10 rounded-2xl border border-border/60 bg-surface/40 p-6 text-sm leading-relaxed text-muted-foreground">
          <p className="text-foreground">
            OnlyOnce EA is a trading automation tool for MetaTrader 5 (MT5).
            Past performance does not guarantee future results. Trading in financial
            markets involves substantial risk and is not suitable for every investor.
          </p>
          <p className="mt-3">
            <span className="text-foreground font-medium">Your security matters.</span>{" "}
            We will never ask for your MT5 password, broker login password, bank
            password, wallet seed phrase, or remote access to your device. Our EA
            files run only inside MT5 and do not collect passwords, seed phrases,
            banking details, or personal device data.
          </p>
          <p className="mt-3 text-xs">
            OnlyOnce EA 交易自动化工具仅用于 MetaTrader 5。历史表现不代表未来收益。
            我们不会索取您的 MT5 密码、经纪商密码、银行密码、钱包助记词或远程设备控制权限。
          </p>
        </div>

      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="cta" className="relative py-24">
      <div className="mx-auto max-w-4xl px-5">
        <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-surface-elevated via-surface to-background p-10 text-center md:p-16">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" aria-hidden />
          <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-gold/10 blur-3xl" aria-hidden />
          <div className="absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-gold/10 blur-3xl" aria-hidden />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
              Get Started
            </span>
            <h2 className="mobile-heading mt-6 font-display text-[28px] font-bold leading-tight md:text-5xl">
              <span className="block">开通</span>
              <span className="block gold-text">AI 全自动交易</span>
              <span className="block gold-text">策略授权</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              登录账户，选择方案并填写你的 MT5 UID，Stripe 安全付款后系统自动加入 XAUUSD + BTCUSD 白名单。订阅到期前可续费。如需暂停续费，可在后台提交申请，由客服确认后处理。
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-gradient px-8 py-4 text-sm font-semibold text-primary-foreground shadow-[0_15px_50px_-15px_var(--gold)] transition hover:brightness-110"
              >
                查看订阅方案 <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface/60 px-8 py-4 text-sm font-semibold text-foreground transition hover:border-gold/40"
              >
                <MessageCircle className="h-5 w-5" /> WhatsApp 咨询
              </a>
            </div>
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
            <a href="/privacy-policy" className="transition hover:text-foreground">Privacy Policy</a>
            <a href="/terms" className="transition hover:text-foreground">Terms of Service</a>
            <a href="/refund-policy" className="transition hover:text-foreground">Refund Policy</a>
            <a href="/risk-disclosure" className="transition hover:text-foreground">Risk Disclosure</a>
            <a href="/contact" className="transition hover:text-foreground">Contact</a>
          </nav>
        </div>
        <p className="text-center leading-relaxed">
          本服务仅提供 EA 工具授权与技术说明，不构成任何投资建议或收益承诺。交易存在亏损风险，请自行评估后使用。
        </p>
        <p className="text-center leading-relaxed">
          OnlyOnce EA is a trading automation tool. Past performance and backtest results do not guarantee future profits.
          Trading involves risk and users are responsible for their own trading decisions.
        </p>
        <p className="text-center leading-relaxed">
          OnlyOnce EA Trade 不是交易商、经纪商或投资顾问。本网站不收集 MT5 密码、银行密码、助记词或银行卡信息。
          We never ask for MT5 passwords, bank credentials, seed phrases, or remote device access.
        </p>
        <p className="text-center">
          © {new Date().getFullYear()} OnlyOnce EA Trade · Privacy Policy | Terms of Service | Refund Policy | Risk Disclosure | Contact
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
      <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-gold/25 bg-gold/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gold sm:text-[11px] sm:tracking-[0.2em]">
        {icon} {eyebrow}
      </span>
      <h2 className="mobile-heading mt-5 font-display text-[28px] font-bold leading-[1.16] md:text-4xl">{title}</h2>
      {sub && <p className="mobile-copy mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">{sub}</p>}
    </div>
  );
}
