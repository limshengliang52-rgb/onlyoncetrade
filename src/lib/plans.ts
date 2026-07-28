export type PlanKey = "basic" | "access";

export const PLAN_CATALOG: Record<
  PlanKey,
  {
    key: PlanKey;
    name: string;
    priceId: string;
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
    name: "OnlyOnce Dual Strategy Access",
    priceId: "plan_access_30d_usd",
    amountUSD: 79,
    durationDays: 30,
    durationLabel: "/ 月",
    tagline: "同时开启 XAUUSD 黄金 + BTCUSD 比特币策略",
    products: ["xau", "btc"],
    features: [
      "XAUUSD 黄金策略 + BTCUSD 比特币策略",
      "1 个 MT5 UID 授权绑定",
      "30 天权限，到期自动停止授权",
      "会员后台可下载两个 EA 策略文件",
    ],
  },
  basic: {
    key: "basic",
    name: "OnlyOnce Dual Strategy 3-Month Access",
    priceId: "plan_dual_3m_199_usd",
    amountUSD: 199,
    durationDays: 90,
    durationLabel: "/ 3 个月",
    tagline: "一次开通 3 个月，比月付更划算",
    products: ["xau", "btc"],
    features: [
      "XAUUSD 黄金策略 + BTCUSD 比特币策略",
      "1 个 MT5 UID 授权绑定",
      "90 天权限，到期自动停止授权",
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
