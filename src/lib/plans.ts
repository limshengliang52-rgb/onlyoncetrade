export type PlanKey = "basic" | "access";
export type PlanSlug = "pro" | "plus";

// URL slug → internal plan key (DB enum). Old slugs like "basic" / "access"
// are intentionally NOT accepted at /checkout/:slug — they redirect to pricing.
export const PLAN_SLUG_TO_KEY: Record<PlanSlug, PlanKey> = {
  pro: "basic", // $240 / 90 days (Only One EA Pro)
  plus: "access", // $99 / 30 days (Only One EA Plus)
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
    name: "Only One EA Plus",
    priceId: "plan_plus_monthly_sub_usd",
    intervalCount: 1,
    billingLabel: "$99 / 30 天",
    amountUSD: 99,
    durationDays: 30,
    durationLabel: "/ 月",
    tagline: "30 天订阅方案，包含 XAUUSD EA + BTCUSD EA",
    products: ["xau", "btc"],
    features: [
      "包含 XAUUSD EA + BTCUSD EA",
      "1 个 MT5 UID 授权绑定",
      "到期前可续费，也可在后台暂停续约",
      "会员后台可下载两个 EA 策略文件",
    ],
  },
  basic: {
    key: "basic",
    slug: "pro",
    name: "Only One EA Pro",
    priceId: "plan_pro_3month_sub_usd",
    intervalCount: 3,
    billingLabel: "$240 / 90 天",
    amountUSD: 240,
    durationDays: 90,
    durationLabel: "/ 3 个月",
    tagline: "90 天订阅方案，比月付更划算",
    products: ["xau", "btc"],
    features: [
      "包含 XAUUSD EA + BTCUSD EA",
      "1 个 MT5 UID 授权绑定",
      "到期前可续费，也可在后台暂停续约",
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
