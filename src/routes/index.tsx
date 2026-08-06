import { createFileRoute } from "@tanstack/react-router";


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

function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-gold/30 selection:text-foreground">
      <Nav />
      <Hero />
      <HowItWorks />
      <Features />
      <Pricing />
      <XauBacktest />
      <BtcBacktest />
      <TradeRecords />
      <MinCapital />
      <Risk />
      <CTA />
      <Strategy />
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
          <h1
            className="mt-6 font-display text-[30px] font-bold tracking-tight sm:text-5xl md:text-6xl"
            style={{ wordBreak: "keep-all", overflowWrap: "normal", textWrap: "balance", lineHeight: 1.12 }}
          >
            <span className="block">AI 自动化交易系统</span>
            <span className="mt-1 block text-[22px] gold-text sm:text-4xl md:text-5xl">
              黄金与 BTC 策略自动执行
            </span>
          </h1>
          <div className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground [text-wrap:pretty] md:text-lg">
            <p>OnlyOnce 为黄金与比特币交易者提供 MT5 策略自动执行、UID 授权、风险控制与订阅管理服务。会员开通后，把 EA 挂在自己的 MT5 账户，系统按规则化信号运行，并设有每日亏损保护。</p>
            <p className="mt-2 text-sm">交易存在风险，策略系统不保证盈利。请确认自身风险承受能力后再开通。</p>
          </div>
          <div className="mt-7 flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
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
        <h2 className="mt-4 font-display text-2xl font-bold md:text-3xl">
          <span className="gold-text">进场逻辑</span> 说明
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          本策略主要根据市场趋势、关键价格结构和确认信号来判断进场机会。系统会先识别当前方向，再等待价格回到重要支撑/阻力、均线或结构区域附近。当趋势方向、价格位置与确认条件一致时，才会执行进场；若市场震荡过大、方向不清晰或风险条件不符合，则会过滤交易，减少不必要的开仓。
        </p>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
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
          title={<>开通 <span className="gold-text">AI 全自动交易策略授权</span></>}
          sub="订阅到期前可续费，用户也可在后台暂停续约。每个方案都包含 XAUUSD EA + BTCUSD EA，付款成功后自动加入 MT5 UID 白名单"
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
          * 所有方案均为 UID 授权制，不出售 EA 文件所有权。订阅到期前可续费，用户也可在后台暂停续约。
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
        <h3 className="font-display text-2xl font-bold whitespace-nowrap">{plan.name}</h3>
        {plan.tagline && (
          <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
        )}
      </div>

      <div className="mt-4 flex items-end gap-3">
        <span className="font-display text-4xl font-bold gold-text">{plan.price}</span>
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
            <span className="text-foreground/90">{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <PlatformNotice variant="compact" />
      </div>

      <a
        href={`/checkout/${plan.slug}`}
        className={
          "mt-5 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition " +
          (plan.highlight
            ? "bg-gold-gradient text-primary-foreground shadow-[0_10px_30px_-10px_var(--gold)] hover:brightness-110"
            : "border border-gold/30 bg-gold/5 text-gold hover:bg-gold/10")
        }
      >
        {plan.cta}
      </a>
    </div>

  );
}

type MonthlyRow = { m: string; profit: number; pct: number; pf: number; wr: number; trades?: number };
type StatItem = { label: string; value: string; unit?: string };

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
          title={<>OnlyOnce <span className="font-sans">{symbol}</span> EA <span className="gold-text">回测战绩</span></>}
          sub="数据来自 MT5 Strategy Tester。历史回测不代表未来保证收益，仅用于展示策略历史表现、交易频率与波动。"
          icon={<TrendingUp className="h-4 w-4" />}
        />

        <div className="mt-10 card-lux ring-gold relative overflow-hidden rounded-3xl p-5 sm:p-8 md:p-10">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" aria-hidden />

          {/* dashboard header */}
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
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
            {curve && curve.length > 1 ? (
              <EquityCurve points={curve} />
            ) : (
              <div className="rounded-2xl border border-primary/20 bg-background/50 p-5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Equity Curve
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground font-sans">
                  该策略的月度明细以 MT5 Strategy Tester 原始报告为准，暂不在此展示逐月资金曲线，避免任何推算或美化。
                </p>
              </div>
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
                <div className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{s.label}</div>
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
            <div className="flex items-center justify-between">
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
                    const color = positive ? "text-emerald-400" : "text-red-400";
                    const sign = positive ? "+" : "";
                    return (
                      <tr key={row.m} className={i % 2 ? "bg-background/20" : ""}>
                        <td className="px-3 py-2.5 font-sans font-medium text-foreground">{row.m}</td>
                        <td className={`px-3 py-2.5 text-right font-sans font-semibold ${color}`}>
                          {sign}{row.pct.toFixed(2)}%
                          <span className="ml-1 text-xs text-muted-foreground">({sign}{row.profit.toFixed(2)} USD)</span>
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

function XauBacktest() {
  return (
    <StrategyBacktestSection
      id="backtest"
      eyebrow="回测报告"
      symbol="XAUUSD"
      strategyName="OnlyOnce XAUUSD EA RR2.5（原版）"
      headlinePct="+223.04"
      headlineUsd="+1,115.20 USD"
      initialBalance="500 USD"
      finalBalance="1,615.20 USD"
      period="2026-01-01 – 2026-07-30"
      tableYearLabel="2026"
      stats={[
        { label: "盈利因子 (PF)", value: "1.33" },
        { label: "夏普比率", value: "2.86" },
        { label: "总交易单数", value: "172" },
        { label: "胜率", value: "33.72", unit: "%" },
        { label: "余额最大回撤", value: "约 140+", unit: "USD" },
        { label: "净值最大回撤", value: "约 140+", unit: "USD" },
      ]}
      months={[]}
    />
  );
}

const BTC_MONTHS: MonthlyRow[] = [
  { m: "Jan", profit: 54.39, pct: 10.88, pf: 1.96, wr: 57.14, trades: 7 },
  { m: "Feb", profit: 10.0, pct: 1.8, pf: 1.55, wr: 50.0, trades: 2 },
  { m: "Mar", profit: -26.25, pct: -4.65, pf: 0.7, wr: 28.57, trades: 7 },
  { m: "Apr", profit: 147.72, pct: 27.45, pf: 3.79, wr: 66.67, trades: 9 },
  { m: "May", profit: 199.93, pct: 29.15, pf: 4.06, wr: 71.43, trades: 7 },
  { m: "Jun", profit: -76.67, pct: -8.66, pf: 0.61, wr: 22.22, trades: 9 },
  { m: "Jul", profit: 571.94, pct: 70.69, pf: 3.05, wr: 63.16, trades: 19 },
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
      headlinePct="+176.21"
      headlineUsd="+881.04 USD"
      initialBalance="500 USD"
      finalBalance="1,381.04 USD"
      period="2026 Jan–Jul"
      tableYearLabel="2026"
      stats={[
        { label: "Profit Factor", value: "2.16" },
        { label: "Win Rate", value: "53.33", unit: "%" },
        { label: "Trades", value: "60" },
        { label: "Max Drawdown", value: "18.43", unit: "%" },
      ]}
      months={BTC_MONTHS}
      curve={BTC_CURVE}
      showTrades
    />
  );
}

function TradeRecords() {
  const slots = [1, 2, 3];
  return (
    <section id="trade-records" className="relative border-t border-border/50 py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeader
          eyebrow="Trade Records"
          title={<>会员 <span className="gold-text">分享记录</span></>}
          sub="此区域用于展示会员自愿分享的交易截图。内容仅供参考，不代表任何收益承诺。"
          icon={<Activity className="h-4 w-4" />}
        />
        <div className="mt-10 -mx-5 overflow-x-auto px-5 pb-2">
          <div className="flex min-w-0 gap-4 sm:grid sm:grid-cols-3 sm:gap-5">
            {slots.map((n) => (
              <div
                key={n}
                className="relative w-[78vw] shrink-0 overflow-hidden rounded-2xl border border-primary/20 bg-background/40 p-5 sm:w-auto"
              >
                <div className="pointer-events-none absolute inset-0 bg-grid-faint opacity-50" aria-hidden />
                <div className="relative flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-primary/25 bg-surface/40">
                  <span className="px-4 text-center text-xs leading-relaxed text-muted-foreground font-sans">
                    等待上传交易截图
                    <br />
                    Trade record coming soon
                  </span>
                </div>
                <div className="relative mt-4 flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-foreground">会员记录 #{n}</span>
                  <span className="shrink-0 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10px] font-sans text-primary">
                    Pending
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground font-sans">
          会员分享记录为个别账户的历史结果，市场环境、资金规模与风险设置不同，结果不可复制。
        </p>
      </div>
    </section>
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
              开通
              <br className="hidden sm:block" />
              <span className="gold-text"> AI 全自动交易策略授权</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              登录账户，选择方案并填写你的 MT5 UID，Stripe 安全付款后系统自动加入 XAUUSD + BTCUSD 白名单。订阅到期前可续费，用户也可在后台暂停续约。
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
      <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
        {icon} {eyebrow}
      </span>
      <h2 className="mt-5 font-display text-3xl font-bold leading-tight md:text-4xl">{title}</h2>
      {sub && <p className="mt-4 text-sm text-muted-foreground md:text-base">{sub}</p>}
    </div>
  );
}
