import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { PermissionCheck } from "./admin-permissions.server";

export type AdminCaller = { userId: string; email: string; role: "super_admin" | "admin" };

/**
 * Verifies the request comes from an active administrator.
 * Returns the caller, or a 401/403 Response to send back as-is.
 */
export async function requireAdminRequest(
  request: Request,
  options: { superAdminOnly?: boolean; permission?: PermissionCheck } = {},
): Promise<AdminCaller | Response> {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) {
    return Response.json({ error: "Please sign in as an administrator." }, { status: 401 });
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  const user = userData?.user;
  if (userError || !user) {
    return Response.json(
      { error: "Your admin session has expired. Please sign in again." },
      { status: 401 },
    );
  }

  const [{ data: roles }, { data: profile }] = await Promise.all([
    supabaseAdmin.from("user_roles").select("role").eq("user_id", user.id),
    supabaseAdmin.from("profiles").select("is_active").eq("id", user.id).maybeSingle(),
  ]);
  const list = (roles ?? []).map((r) => r.role);
  const role = list.includes("super_admin")
    ? "super_admin"
    : list.includes("admin")
      ? "admin"
      : null;

  if (!role || profile?.is_active === false) {
    return Response.json(
      { error: "This account does not have administrator access." },
      { status: 403 },
    );
  }
  if (options.superAdminOnly && role !== "super_admin") {
    return Response.json({ error: "Only a System Admin can do this." }, { status: 403 });
  }
  // System Admins can do everything; Admins are limited by the rules on the Permissions page.
  if (options.permission && role !== "super_admin") {
    const { loadAdminPermissions, allows } = await import("./admin-permissions.server");
    if (!allows(await loadAdminPermissions(), options.permission)) {
      return Response.json(
        { error: "Your admin role is not allowed to do this. Ask a System Admin for access." },
        { status: 403 },
      );
    }
  }

  return { userId: user.id, email: user.email ?? "", role };
}
