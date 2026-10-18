import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  DEFAULT_ADMIN_PERMISSIONS,
  mergeAdminPermissions,
  type AdminPermissions,
} from "@/data/permissions-store";

// Like the site config and news ticker, the rules live as JSON in a reserved banners row.
export const PERMISSIONS_ROW_ID = "00000000-0000-0000-0000-000000000004";

export type PermissionAction =
  "canView" | "canEdit" | "canCreate" | "canDelete" | "canRespond" | "canModerate" | "canUpload";

export type PermissionCheck = [keyof AdminPermissions, ...PermissionAction[]];

export async function loadAdminPermissions(): Promise<AdminPermissions> {
  const { data } = await supabaseAdmin
    .from("banners")
    .select("subtitle")
    .eq("id", PERMISSIONS_ROW_ID)
    .maybeSingle();
  if (!data?.subtitle) return DEFAULT_ADMIN_PERMISSIONS;
  try {
    return mergeAdminPermissions(JSON.parse(data.subtitle));
  } catch {
    return DEFAULT_ADMIN_PERMISSIONS;
  }
}

/** True when the rules grant at least one of the listed actions on the module. */
export function allows(perms: AdminPermissions, [module, ...actions]: PermissionCheck): boolean {
  const mod = perms[module] as Record<string, boolean | undefined>;
  return actions.some((action) => Boolean(mod?.[action]));
}

export async function saveAdminPermissionsRow(perms: AdminPermissions) {
  // Column names follow the live banners table (see api/admin/news.ts).
  return supabaseAdmin.from("banners").upsert({
    id: PERMISSIONS_ROW_ID,
    title: "admin_permissions",
    subtitle: JSON.stringify(perms),
    badge: "",
    cta_text: "",
    cta_link: "",
    image_url: "",
    gradient: "",
    position: "admin_permissions",
    is_active: false,
    sort_order: 0,
  } as never);
}
