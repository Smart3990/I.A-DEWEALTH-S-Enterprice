/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Throws unless the caller holds the super_admin role. */
async function assertSuperAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw new Error(error.message);
  const roles = (data ?? []).map((r: { role: string }) => r.role);
  if (!roles.includes("super_admin"))
    throw new Error("Only a System Admin can manage administrators");
}

/** Throws with the database message when a Supabase call failed. */
function check<T extends { error: { message: string } | null }>(result: T, action: string): T {
  if (result.error) throw new Error(`${action}: ${result.error.message}`);
  return result;
}

async function countActiveSuperAdmins(supabaseAdmin: any): Promise<number> {
  const { data: roles } = await supabaseAdmin
    .from("user_roles")
    .select("user_id")
    .eq("role", "super_admin");
  const ids = (roles ?? []).map((r: { user_id: string }) => r.user_id);
  if (!ids.length) return 0;
  const { data: active } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .in("id", ids)
    .eq("is_active", true);
  return (active ?? []).length;
}

export const listAdministrators = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [profiles, roles] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").order("created_at"),
      supabaseAdmin.from("user_roles").select("user_id, role"),
    ]);
    check(profiles, "Could not load administrators");
    check(roles, "Could not load roles");
    return (profiles.data ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      isActive: p.is_active,
      isSelf: p.id === context.userId,
      role:
        (roles.data ?? []).find((r) => r.user_id === p.id && r.role === "super_admin")?.role ??
        (roles.data ?? []).find((r) => r.user_id === p.id)?.role ??
        "admin",
    }));
  });

export const createAdministrator = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        name: z.string().trim().min(1, "Name is required"),
        email: z.string().trim().toLowerCase().email("Enter a valid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        role: z.enum(["admin", "super_admin"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { name: data.name },
    });
    if (error || !created.user) {
      const msg = error?.message ?? "Could not create the account";
      if (/already (been )?registered|already exists/i.test(msg)) {
        throw new Error(
          `${data.email} already has an account. Edit that administrator instead, or use a different email.`,
        );
      }
      throw new Error(msg);
    }

    const userId = created.user.id;
    try {
      check(
        await supabaseAdmin
          .from("profiles")
          .upsert({ id: userId, name: data.name, email: data.email, is_active: true }),
        "Could not save the profile",
      );
      check(
        await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: data.role }),
        "Could not assign the role",
      );
    } catch (err) {
      // Don't leave a login behind that has no admin role.
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw err;
    }

    await supabaseAdmin.from("activity_log").insert({
      admin_name: "System",
      action: `Created administrator ${data.email} (${data.role})`,
    });

    return { id: userId };
  });

export const updateAdministrator = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().trim().min(1, "Name is required"),
        isActive: z.boolean(),
        role: z.enum(["admin", "super_admin"]),
        password: z
          .string()
          .min(8, "Password must be at least 8 characters")
          .optional()
          .or(z.literal("")),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.id === context.userId && (!data.isActive || data.role !== "super_admin")) {
      throw new Error("You cannot deactivate or demote your own account.");
    }

    const { data: currentRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", data.id);
    const wasSuper = (currentRoles ?? []).some((r) => r.role === "super_admin");
    if (wasSuper && (data.role !== "super_admin" || !data.isActive)) {
      if ((await countActiveSuperAdmins(supabaseAdmin)) <= 1) {
        throw new Error("At least one active System Admin is required.");
      }
    }

    check(
      await supabaseAdmin
        .from("profiles")
        .update({ name: data.name, is_active: data.isActive })
        .eq("id", data.id),
      "Could not update the profile",
    );
    check(
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.id, role: data.role }, { onConflict: "user_id,role" }),
      "Could not update the role",
    );
    check(
      await supabaseAdmin.from("user_roles").delete().eq("user_id", data.id).neq("role", data.role),
      "Could not update the role",
    );
    if (data.password) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(data.id, {
        password: data.password,
      });
      if (error) throw new Error(`Could not change the password: ${error.message}`);
    }
    await supabaseAdmin
      .from("activity_log")
      .insert({ admin_name: "System", action: `Updated administrator ${data.name}` });
    return { ok: true };
  });

export const deleteAdministrator = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    if (data.id === context.userId) throw new Error("You cannot remove your own account");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", data.id);
    if ((roles ?? []).some((r) => r.role === "super_admin")) {
      if ((await countActiveSuperAdmins(supabaseAdmin)) <= 1) {
        throw new Error("At least one active System Admin is required.");
      }
    }

    check(
      await supabaseAdmin.from("user_roles").delete().eq("user_id", data.id),
      "Could not remove the role",
    );
    check(
      await supabaseAdmin.from("profiles").delete().eq("id", data.id),
      "Could not remove the profile",
    );
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.id);
    if (error) throw new Error(`Could not delete the login: ${error.message}`);
    await supabaseAdmin
      .from("activity_log")
      .insert({ admin_name: "System", action: `Removed an administrator` });
    return { ok: true };
  });
