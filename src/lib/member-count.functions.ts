import { createServerFn } from "@tanstack/react-start";

const TOTAL_COUNT = 80;

/**
 * 首页会员人数固定显示为 80 位。
 */
export const getMemberCount = createServerFn({ method: "GET" }).handler(async () => {
  return { count: TOTAL_COUNT };
});
