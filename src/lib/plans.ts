export type PlanKey = "basic" | "access";

export const PLAN_CATALOG: Record<
  PlanKey,
  {
    key: PlanKey;
    name: string;
    priceId: string;
    amountUSD: number;
    originalUSD?: number;
    tagline: string;
    features: string[];
  }
> = {
  basic: {
    key: "basic",
    name: "Basic Access",
    priceId: "plan_basic_30d_promo25",
    amountUSD: 25,
    originalUSD: 49,
    tagline: "适合先测试一个品种",
    features: ["1 个 MT5 UID 授权", "BTC 或黄金 二选一", "默认风控参数", "30 天权限，到期自动停止"],
  },
  access: {
    key: "access",
    name: "Access",
    priceId: "plan_access_30d_usd",
    amountUSD: 79,
    originalUSD: 99,
    tagline: "适合同时跑两个品种",
    features: ["1 个 MT5 UID 授权", "黄金与 BTC 同时开启", "默认风控参数", "30 天权限，到期自动停止"],
  },
};

export function planFromPriceId(priceId?: string | null): PlanKey | null {
  if (!priceId) return null;
  for (const p of Object.values(PLAN_CATALOG)) if (p.priceId === priceId) return p.key;
  return null;
}
