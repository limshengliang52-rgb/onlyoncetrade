export type PlanKey = "basic" | "access";
export type PlanSlug = "pro" | "plus";

// URL slug → internal plan key (DB enum). Old slugs like "basic" / "access"
// are intentionally NOT accepted at /checkout/:slug — they redirect to pricing.
export const PLAN_SLUG_TO_KEY: Record<PlanSlug, PlanKey> = {
  pro: "basic", // $270 / 90 days (OnlyOnce EA Pro)
  plus: "access", // $120 / 30 days (OnlyOnce EA Plus)
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
    name: "OnlyOnce EA Plus",
    priceId: "plan_plus_monthly_sub_usd",
    intervalCount: 1,
    billingLabel: "$120 / 30 天",
    amountUSD: 120,
    durationDays: 30,
    durationLabel: "/ 月",
    tagline: "30 天订阅方案，包含 XAUUSD EA + BTCUSD EA",
    products: ["xau", "btc"],
    features: [
      "包含 XAUUSD EA + BTCUSD EA",
      "1 个 MT5 UID 授权绑定",
      "到期前可续费；如需暂停续费，可在后台提交申请，由客服确认后处理",
      "会员后台可下载两个 EA 策略文件",
    ],
  },
  basic: {
    key: "basic",
    slug: "pro",
    name: "OnlyOnce EA Pro",
    priceId: "plan_pro_3month_sub_usd",
    intervalCount: 3,
    billingLabel: "$270 / 90 天",
    amountUSD: 270,
    durationDays: 90,
    durationLabel: "/ 3 个月",
    tagline: "90 天订阅方案，比月付更划算",
    products: ["xau", "btc"],
    features: [
      "包含 XAUUSD EA + BTCUSD EA",
      "1 个 MT5 UID 授权绑定",
      "到期前可续费；如需暂停续费，可在后台提交申请，由客服确认后处理",
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
