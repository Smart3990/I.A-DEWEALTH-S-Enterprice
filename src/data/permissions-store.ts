import { useState, useEffect } from "react";

export interface ModulePermission {
  canView: boolean;
  canEdit?: boolean;
  canCreate?: boolean;
  canDelete?: boolean;
  canRespond?: boolean;
  canModerate?: boolean;
  canUpload?: boolean;
}

export interface AdminPermissions {
  products: { canView: boolean; canEdit: boolean; canCreate: boolean; canDelete: boolean };
  categories: { canView: boolean; canEdit: boolean; canDelete: boolean };
  inquiries: { canView: boolean; canRespond: boolean; canDelete: boolean };
  reviews: { canView: boolean; canModerate: boolean };
  news: { canView: boolean; canEdit: boolean };
  banners: { canView: boolean; canEdit: boolean };
  media: { canView: boolean; canUpload: boolean; canDelete: boolean };
  settings: { canView: boolean; canEdit: boolean };
  activity: { canView: boolean };
}

export const DEFAULT_ADMIN_PERMISSIONS: AdminPermissions = {
  products: { canView: true, canEdit: true, canCreate: true, canDelete: false },
  categories: { canView: true, canEdit: false, canDelete: false },
  inquiries: { canView: true, canRespond: true, canDelete: false },
  reviews: { canView: true, canModerate: true },
  news: { canView: true, canEdit: true },
  banners: { canView: true, canEdit: false },
  media: { canView: true, canUpload: true, canDelete: false },
  settings: { canView: false, canEdit: false },
  activity: { canView: false },
};

const STORAGE_KEY = "ia_admin_permissions_config";
const EVENT_KEY = "ia_admin_permissions_updated";

export function getAdminPermissions(): AdminPermissions {
  if (typeof window === "undefined") return DEFAULT_ADMIN_PERMISSIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ADMIN_PERMISSIONS));
      return DEFAULT_ADMIN_PERMISSIONS;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_ADMIN_PERMISSIONS,
      ...parsed,
      products: { ...DEFAULT_ADMIN_PERMISSIONS.products, ...parsed.products },
      categories: { ...DEFAULT_ADMIN_PERMISSIONS.categories, ...parsed.categories },
      inquiries: { ...DEFAULT_ADMIN_PERMISSIONS.inquiries, ...parsed.inquiries },
      reviews: { ...DEFAULT_ADMIN_PERMISSIONS.reviews, ...parsed.reviews },
      banners: { ...DEFAULT_ADMIN_PERMISSIONS.banners, ...parsed.banners },
      news: { ...DEFAULT_ADMIN_PERMISSIONS.news, ...(parsed.news || {}) },
      media: { ...DEFAULT_ADMIN_PERMISSIONS.media, ...parsed.media },
      settings: { ...DEFAULT_ADMIN_PERMISSIONS.settings, ...parsed.settings },
      activity: { ...DEFAULT_ADMIN_PERMISSIONS.activity, ...parsed.activity },
    };
  } catch {
    return DEFAULT_ADMIN_PERMISSIONS;
  }
}

export function saveAdminPermissions(next: AdminPermissions): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT_KEY));
  } catch (e) {
    console.error("Failed to save admin permissions:", e);
  }
}

export function useAdminPermissions(): [AdminPermissions, (next: AdminPermissions) => void] {
  const [perms, setPerms] = useState<AdminPermissions>(() => getAdminPermissions());

  useEffect(() => {
    const handler = () => {
      setPerms(getAdminPermissions());
    };
    window.addEventListener(EVENT_KEY, handler);
    return () => window.removeEventListener(EVENT_KEY, handler);
  }, []);

  const update = (next: AdminPermissions) => {
    saveAdminPermissions(next);
    setPerms(next);
  };

  return [perms, update];
}

/** Check whether a given role has view/access permission for a specific module */
export function canAccessModule(
  role: string | null | undefined,
  moduleKey: keyof AdminPermissions | string,
): boolean {
  if (role === "super_admin") return true;
  if (role !== "admin") return false;

  const perms = getAdminPermissions();
  const mod = perms[moduleKey as keyof AdminPermissions];
  if (!mod) return true; // Default allow for unspecified modules
  return Boolean(mod.canView);
}

/** Check fine-grained action permission (e.g. 'canDelete', 'canEdit') for an admin */
export function canPerformAction(
  role: string | null | undefined,
  moduleKey: keyof AdminPermissions,
  action:
    "canView" | "canEdit" | "canCreate" | "canDelete" | "canRespond" | "canModerate" | "canUpload",
): boolean {
  if (role === "super_admin") return true;
  if (role !== "admin") return false;

  const perms = getAdminPermissions();
  const mod = perms[moduleKey];
  if (!mod) return false;
  return Boolean((mod as Record<string, boolean>)[action]);
}
