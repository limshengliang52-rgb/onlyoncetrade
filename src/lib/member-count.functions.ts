import { createServerFn } from "@tanstack/react-start";

const BASE_COUNT = 80;

/**
 * 首页会员人数 = 80 基数 + 当前有效已付款授权会员数（去重）。
 * 只统计 status = active 且未过期的订阅；取消 / 过期 / 暂停不计入。
 * 同一用户或同一 MT5 UID 的多次续费只算一次。
 */
export const getMemberCount = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id, mt5_uid")
      .eq("status", "active")
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
