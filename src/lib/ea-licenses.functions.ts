import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function requireAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("需要管理员权限");
}

const licenseSchema = z.object({
  id: z.string().uuid().optional(),
  member_name: z.string().min(1).max(120),
  email: z.string().email().optional().or(z.literal("")).transform((v) => v || undefined),
  phone: z.string().max(40).optional().or(z.literal("")).transform((v) => v || undefined),
  mt5_account_id: z.string().regex(/^[A-Za-z0-9_-]{3,64}$/),
  uid: z.string().max(64).optional().or(z.literal("")).transform((v) => v || undefined),
  product: z.string().regex(/^[A-Za-z0-9_-]{3,64}$/),
  status: z.enum(["active", "expired", "suspended"]).default("active"),
  expires_at: z.string().min(1),
  notes: z.string().max(500).optional().or(z.literal("")).transform((v) => v || undefined),
});

export type EALicenseInput = z.input<typeof licenseSchema>;

export const listEALicenses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("ea_licenses")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertEALicense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: EALicenseInput) => licenseSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = {
      member_name: data.member_name,
      email: data.email ?? null,
      phone: data.phone ?? null,
      mt5_account_id: data.mt5_account_id,
      uid: data.uid ?? null,
      product: data.product,
      status: data.status,
      expires_at: new Date(data.expires_at).toISOString(),
      notes: data.notes ?? null,
    };
    if (data.id) {
      const { error } = await supabaseAdmin.from("ea_licenses").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: inserted, error } = await supabaseAdmin
      .from("ea_licenses")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: inserted.id };
  });

export const deleteEALicense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("ea_licenses").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const extendEALicense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; days: number }) =>
    z
      .object({
        id: z.string().uuid(),
        days: z.number().int().min(-3650).max(3650).refine((n) => n !== 0, "days 不能为 0"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("ea_licenses")
      .select("expires_at")
      .eq("id", data.id)
      .maybeSingle();
    if (!existing) throw new Error("授权不存在");
    const base =
      existing.expires_at && new Date(existing.expires_at as string) > new Date()
        ? new Date(existing.expires_at as string)
        : new Date();
    const newExpires = new Date(base.getTime() + data.days * 86400_000);
    const patch = (
      data.days > 0
        ? { expires_at: newExpires.toISOString(), status: "active" as const }
        : { expires_at: newExpires.toISOString() }
    );
    const { error } = await supabaseAdmin
      .from("ea_licenses")
      .update(patch)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true, expires_at: newExpires.toISOString() };
  });


export const setEALicenseStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: "active" | "expired" | "suspended" }) =>
    z
      .object({ id: z.string().uuid(), status: z.enum(["active", "expired", "suspended"]) })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.status === "suspended") {
      const { data: row } = await supabaseAdmin
        .from("ea_licenses")
        .select("suspend_requested_at")
        .eq("id", data.id)
        .maybeSingle();
      if (!row) throw new Error("授权不存在");
      if (!(row as any).suspend_requested_at) {
        throw new Error("暂停授权需先提交暂停申请，并由管理员点击「同意暂停」");
      }
    }
    const patch =
      data.status === "suspended"
        ? { status: data.status }
        : {
            status: data.status,
            suspend_requested_at: null,
            suspend_requested_by: null,
            suspend_request_note: null,
          };

    const { error } = await supabaseAdmin
      .from("ea_licenses")
      .update(patch)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * 提交暂停授权申请：不会立即停用授权，仅标记为「待管理员同意」。
 */
export const requestSuspendEALicense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; note?: string }) =>
    z.object({ id: z.string().uuid(), note: z.string().max(300).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("ea_licenses")
      .select("id")
      .eq("id", data.id)
      .maybeSingle();
    if (!row) throw new Error("授权不存在");
    const { error } = await supabaseAdmin
      .from("ea_licenses")
      .update({
        suspend_requested_at: new Date().toISOString(),
        suspend_requested_by: context.userId,
        suspend_request_note: data.note ?? null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** 管理员同意暂停：授权真正变为 suspended（EA 授权检查将不通过） */
export const approveSuspendEALicense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("ea_licenses")
      .select("suspend_requested_at")
      .eq("id", data.id)
      .maybeSingle();
    if (!row) throw new Error("授权不存在");
    if (!(row as any).suspend_requested_at) throw new Error("没有待审核的暂停申请");
    const { error } = await supabaseAdmin
      .from("ea_licenses")
      .update({
        status: "suspended",
        suspend_requested_at: null,
        suspend_requested_by: null,
        suspend_request_note: null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** 管理员驳回暂停申请 */
export const rejectSuspendEALicense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("ea_licenses")
      .update({
        suspend_requested_at: null,
        suspend_requested_by: null,
        suspend_request_note: null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

