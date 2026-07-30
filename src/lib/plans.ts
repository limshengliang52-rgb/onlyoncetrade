export type PlanKey = "basic" | "access";
export type PlanSlug = "pro" | "plus";

// URL slug → internal plan key (DB enum). Old slugs like "basic" / "access"
// are intentionally NOT accepted at /checkout/:slug — they redirect to pricing.
export const PLAN_SLUG_TO_KEY: Record<PlanSlug, PlanKey> = {
  pro: "basic", // $199 / 90 days (OnlyOnce Pro)
  plus: "access", // $79 / 30 days (OnlyOnce Plus)
};

export const PLAN_KEY_TO_SLUG: Record<PlanKey, PlanSlug> = {
  basic: "pro",
  access: "plus",
};

export function slugFromParam(param: string): PlanSlug | null {
  return param === "pro" || param === "plus" ? param : null;
}

export const PLAN_CATALOG: Record<
  PlanKey,
  {
    key: PlanKey;
    slug: PlanSlug;
    name: string;
    priceId: string;
    intervalCount: number;
    billingLabel: string;
    amountUSD: number;
    originalUSD?: number;
    durationDays: number;
    durationLabel: string;
    tagline: string;
    features: string[];
    products: string[];
  }
> = {
  access: {
    key: "access",
    slug: "plus",
    name: "OnlyOnce Plus",
    priceId: "plan_plus_monthly_sub_usd",
    intervalCount: 1,
    billingLabel: "$79 / 月，自动续费",
    amountUSD: 79,
    durationDays: 30,
    durationLabel: "/ 月",
    tagline: "月费自动续费订阅，XAUUSD 黄金 + BTCUSD 比特币双策略",
    products: ["xau", "btc"],
    features: [
      "OnlyOnce XAUUSD EA RR2.5 黄金策略 + BTCUSD 比特币策略",
      "1 个 MT5 UID 授权绑定",
      "每 30 天自动续费，未暂停即持续授权",
      "会员后台可下载两个 EA 策略文件",
    ],
  },
  basic: {
    key: "basic",
    slug: "pro",
    name: "OnlyOnce Pro",
    priceId: "plan_pro_3month_sub_usd",
    intervalCount: 3,
    billingLabel: "$199 / 3 个月，自动续费",
    amountUSD: 199,
    durationDays: 90,
    durationLabel: "/ 3 个月",
    tagline: "3 个月周期自动续费订阅，比月付更划算",
    products: ["xau", "btc"],
    features: [
      "OnlyOnce XAUUSD EA RR2.5 黄金策略 + BTCUSD 比特币策略",
      "1 个 MT5 UID 授权绑定",
      "每 3 个月自动续费，未暂停即持续授权",
      "会员后台可下载两个 EA 策略文件",
    ],
  },
};

export function planFromPriceId(priceId?: string | null): PlanKey | null {
  if (!priceId) return null;
  for (const p of Object.values(PLAN_CATALOG)) if (p.priceId === priceId) return p.key;
  return null;
}

export function planDurationDays(plan: PlanKey): number {
  return PLAN_CATALOG[plan]?.durationDays ?? 30;
}

export function planProducts(plan: PlanKey): string[] {
  return PLAN_CATALOG[plan]?.products ?? ["xau", "btc"];
}
