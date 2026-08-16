import { createServerFn } from "@tanstack/react-start";

/** 当前显示总人数基线：现在正好显示 90 位 */
const BASE_COUNT = 90;

/** 基线时间点：只统计此时间之后新增的有效付费授权客户 */
const BASELINE_AT = "2026-08-02T17:00:00.000Z";

/**
 * 首页会员人数 = 80 + 基线时间之后新增的有效付款并开通授权的客户数（去重）。
 * 历史已有的 active 用户不再叠加；取消 / 过期 / 暂停不计；
 * 同一用户或同一 MT5 UID 续费只算一次。
 */
export const getMemberCount = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id, mt5_uid")
      .eq("status", "active")
      .gt("created_at", BASELINE_AT)
      .gt("expires_at", new Date().toISOString());
    if (error) return { count: BASE_COUNT };

    const seen = new Set<string>();
    for (const row of data ?? []) {
      const key = (row.user_id as string | null) ?? `uid:${row.mt5_uid ?? ""}`;
      if (key) seen.add(key);
    }
    return { count: BASE_COUNT + seen.size };
  } catch {
    return { count: BASE_COUNT };
  }
});
