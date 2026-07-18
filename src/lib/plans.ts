export type PlanKey = "basic" | "access";

export const PLAN_CATALOG: Record<
  PlanKey,
  {
    key: PlanKey;
    name: string;
    priceId: string;
    amountMYR: number;
    originalMYR?: number;
    tagline: string;
    features: string[];
  }
> = {
  basic: {
    key: "basic",
    name: "Basic Access",
    priceId: "plan_basic_monthly",
    amountMYR: 199,
    originalMYR: 299,
    tagline: "适合先测试一个品种",
    features: ["1 个 MT5 UID 授权", "BTC 或黄金 二选一", "默认风控参数", "月费权限，到期自动停止"],
  },
  access: {
    key: "access",
    name: "Access",
    priceId: "plan_access_monthly",
    amountMYR: 299,
    originalMYR: 399,
    tagline: "适合同时跑两个品种",
    features: ["1 个 MT5 UID 授权", "BTC 与黄金 同时开启", "优先参数检查", "月费权限，到期自动停止"],
  },
};

export function planFromPriceId(priceId?: string | null): PlanKey | null {
  if (!priceId) return null;
  for (const p of Object.values(PLAN_CATALOG)) if (p.priceId === priceId) return p.key;
  return null;
}
