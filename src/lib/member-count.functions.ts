import { createServerFn } from "@tanstack/react-start";

const BASE_COUNT = 33;

export const getMemberCount = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error } = await supabaseAdmin
      .from("payments")
      .select("*", { count: "exact", head: true })
      .eq("status", "paid");
    if (error) return { count: BASE_COUNT };
    return { count: BASE_COUNT + (count ?? 0) };
  } catch {
    return { count: BASE_COUNT };
  }
});
