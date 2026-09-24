import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ShieldCheck,
  Package,
  FolderTree,
  MessageSquare,
  Star,
  ImageIcon,
  Images,
  Settings as SettingsIcon,
  History,
  Check,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Lock,
  Eye,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { SuperAdminOnly } from "@/components/admin/guard";
import { PageHead, Panel, Btn } from "@/components/admin/kit";
import {
  useAdminPermissions,
  DEFAULT_ADMIN_PERMISSIONS,
  type AdminPermissions,
} from "@/data/permissions-store";
import { logActivity } from "@/lib/admin-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/permissions")({
  component: () => (
    <SuperAdminOnly>
      <AdminPermissionsPage />
    </SuperAdminOnly>
  ),
});

interface ModuleConfig {
  key: keyof AdminPermissions;
  title: string;
  description: string;
  icon: typeof Package;
  actions: { key: string; label: string; description: string }[];
}

const MODULES: ModuleConfig[] = [
  {
    key: "products",
    title: "Products & Catalog",
    description: "Manage product inventory, pricing, images, categories, and promotional tags.",
    icon: Package,
    actions: [
      { key: "canView", label: "View Products", description: "Browse catalog and product list" },
      {
        key: "canEdit",
        label: "Edit Details",
        description: "Modify price, stock, specs, and status",
      },
      { key: "canCreate", label: "Add Products", description: "Create new product entries" },
      {
        key: "canDelete",
        label: "Delete Products",
        description: "Remove product records permanently",
      },
    ],
  },
  {
    key: "categories",
    title: "Categories & Taxonomy",
    description: "Manage store departments, subcategories, banner graphics, and parent trees.",
    icon: FolderTree,
    actions: [
      { key: "canView", label: "View Categories", description: "See taxonomy and hierarchy" },
      {
        key: "canEdit",
        label: "Edit & Reorder",
        description: "Change names, slugs, and banner art",
      },
      { key: "canDelete", label: "Delete Categories", description: "Delete department listings" },
    ],
  },
  {
    key: "inquiries",
    title: "Customer Inquiries",
    description: "View and respond to customer WhatsApp inquiries and product order messages.",
    icon: MessageSquare,
    actions: [
      { key: "canView", label: "View Inquiries", description: "Read incoming customer queries" },
      {
        key: "canRespond",
        label: "Respond & Update Status",
        description: "Mark answered or handled",
      },
      { key: "canDelete", label: "Delete Inquiries", description: "Purge inquiry records" },
    ],
  },
  {
    key: "reviews",
    title: "Customer Reviews",
    description: "Moderate and approve customer testimonials and ratings before public display.",
    icon: Star,
    actions: [
      { key: "canView", label: "View Reviews", description: "Inspect submitted customer reviews" },
      { key: "canModerate", label: "Approve & Reject", description: "Publish or dismiss ratings" },
    ],
  },
  {
    key: "banners",
    title: "Banners & Promos",
    description: "Control promotional banners across all categories and homepage hero slots.",
    icon: ImageIcon,
    actions: [
      { key: "canView", label: "View Banners", description: "Inspect active promo creatives" },
      {
        key: "canEdit",
        label: "Edit Banners",
        description: "Upload banner art, headlines, & links",
      },
    ],
  },
  {
    key: "media",
    title: "Media Library",
    description: "Manage cloud storage assets, uploaded product photos, and branding graphics.",
    icon: Images,
    actions: [
      { key: "canView", label: "View Media", description: "Browse uploaded images and files" },
      { key: "canUpload", label: "Upload Media", description: "Upload new pictures and assets" },
      { key: "canDelete", label: "Delete Media", description: "Delete uploaded image files" },
    ],
  },
  {
    key: "settings",
    title: "Store Settings & Delivery",
    description: "Store branding, contact info, Google Maps coordinates, and WhatsApp checkout.",
    icon: SettingsIcon,
    actions: [
      { key: "canView", label: "View Settings", description: "Inspect current hub configuration" },
      {
        key: "canEdit",
        label: "Edit Settings",
        description: "Change store contacts, hours, & maps",
      },
    ],
  },
  {
    key: "activity",
    title: "Audit & Activity Log",
    description: "Full system history of all actions performed by staff across the catalog.",
    icon: History,
    actions: [
      {
        key: "canView",
        label: "View Activity Log",
        description: "Access audit logs and timestamps",
      },
    ],
  },
];

function AdminPermissionsPage() {
  const [persistedPerms, setPersistedPerms] = useAdminPermissions();
  const [form, setForm] = useState<AdminPermissions>(() => ({ ...persistedPerms }));
  const [saved, setSaved] = useState(false);

  // Quick preset helper
  function applyPreset(preset: "catalog" | "support" | "full" | "default") {
    let next: AdminPermissions;
    if (preset === "catalog") {
      next = {
        products: { canView: true, canEdit: true, canCreate: true, canDelete: false },
        categories: { canView: true, canEdit: true, canDelete: false },
        inquiries: { canView: false, canRespond: false, canDelete: false },
        reviews: { canView: false, canModerate: false },
        banners: { canView: true, canEdit: true },
        media: { canView: true, canUpload: true, canDelete: false },
        settings: { canView: false, canEdit: false },
        activity: { canView: false },
      };
    } else if (preset === "support") {
      next = {
        products: { canView: true, canEdit: false, canCreate: false, canDelete: false },
        categories: { canView: true, canEdit: false, canDelete: false },
        inquiries: { canView: true, canRespond: true, canDelete: false },
        reviews: { canView: true, canModerate: true },
        banners: { canView: false, canEdit: false },
        media: { canView: false, canUpload: false, canDelete: false },
        settings: { canView: false, canEdit: false },
        activity: { canView: false },
      };
    } else if (preset === "full") {
      next = {
        products: { canView: true, canEdit: true, canCreate: true, canDelete: true },
        categories: { canView: true, canEdit: true, canDelete: true },
        inquiries: { canView: true, canRespond: true, canDelete: true },
        reviews: { canView: true, canModerate: true },
        banners: { canView: true, canEdit: true },
        media: { canView: true, canUpload: true, canDelete: true },
        settings: { canView: true, canEdit: true },
        activity: { canView: true },
      };
    } else {
      next = { ...DEFAULT_ADMIN_PERMISSIONS };
    }
    setForm(next);
    toast.info(`Applied ${preset.toUpperCase()} permissions preset`);
  }

  function toggleAction(moduleKey: keyof AdminPermissions, actionKey: string) {
    setForm((prev) => {
      const currentModule = prev[moduleKey] as Record<string, boolean>;
      const nextValue = !currentModule[actionKey];

      const updatedModule = {
        ...currentModule,
        [actionKey]: nextValue,
      };

      // If viewing is disabled, disable all sub-actions for that module
      if (actionKey === "canView" && !nextValue) {
        Object.keys(updatedModule).forEach((k) => {
          updatedModule[k] = false;
        });
      }
      // If any sub-action is enabled, ensure canView is also enabled
      if (actionKey !== "canView" && nextValue) {
        updatedModule.canView = true;
      }

      return {
        ...prev,
        [moduleKey]: updatedModule,
      };
    });
  }

  function handleSave() {
    setPersistedPerms(form);
    logActivity("Updated role permissions for Standard Admin users");
    setSaved(true);
    toast.success("Role permissions updated successfully");
    setTimeout(() => setSaved(false), 3000);
  }

  function handleReset() {
    setForm({ ...DEFAULT_ADMIN_PERMISSIONS });
    setPersistedPerms({ ...DEFAULT_ADMIN_PERMISSIONS });
    toast.info("Reset permissions to system defaults");
  }

  const enabledModulesCount = Object.values(form).filter((m) => m.canView).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHead
          title="Admin Role Permissions"
          description="Control what standard administrators can access, view, edit, or manage across the console."
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Overview Info Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#00a884] border border-emerald-100">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">SuperAdmin Access Governance</h2>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold text-[#00a884] uppercase tracking-wider">
                  Active
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600 max-w-2xl leading-relaxed">
                As System SuperAdmin, you hold unrestricted access to all features. Below, you can
                precisely customize which sidebar navigation tabs and operations standard Admin
                accounts are permitted to access.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-50 p-2.5 border border-slate-200">
            <div className="text-right">
              <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Accessible Modules
              </span>
              <span className="text-lg font-black text-slate-900">
                {enabledModulesCount} / {MODULES.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Quick Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mr-1">
            <Sparkles className="h-3.5 w-3.5 text-slate-400" />
            Quick Presets:
          </span>
          <button
            type="button"
            onClick={() => applyPreset("default")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Recommended Default
          </button>
          <button
            type="button"
            onClick={() => applyPreset("catalog")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Catalog Operator
          </button>
          <button
            type="button"
            onClick={() => applyPreset("support")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Customer Support Only
          </button>
          <button
            type="button"
            onClick={() => applyPreset("full")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Full Operations Admin
          </button>
        </div>
      </div>

      {/* Modules Permission Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {MODULES.map((m) => {
          const Icon = m.icon;
          const currentModPerms = form[m.key] as Record<string, boolean>;
          const isModuleVisible = Boolean(currentModPerms.canView);

          return (
            <div
              key={m.key}
              className={`flex flex-col justify-between rounded-2xl border transition-all ${
                isModuleVisible
                  ? "border-slate-200 bg-white shadow-xs"
                  : "border-slate-200/60 bg-slate-50/60 opacity-80"
              }`}
            >
              <div className="p-5">
                {/* Card Header with Master Visibility Switch */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                        isModuleVisible
                          ? "bg-[#00a884]/10 text-[#00a884]"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{m.title}</h3>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{m.description}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleAction(m.key, "canView")}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      isModuleVisible
                        ? "bg-[#00a884] text-white shadow-xs"
                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    }`}
                  >
                    {isModuleVisible ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Visible to Admin</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5" />
                        <span>Hidden (No Access)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Granular Action Checkboxes */}
                <div className="mt-4 space-y-2">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                    Granular Privileges
                  </span>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {m.actions.map((act) => {
                      const isChecked = Boolean(currentModPerms[act.key]);
                      const isMasterDisabled = !isModuleVisible && act.key !== "canView";

                      return (
                        <label
                          key={act.key}
                          className={`flex items-start gap-2.5 rounded-xl border p-2.5 transition cursor-pointer ${
                            isChecked && isModuleVisible
                              ? "border-[#00a884]/30 bg-[#00a884]/5"
                              : "border-slate-100 bg-slate-50/50 hover:bg-slate-50"
                          } ${isMasterDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isMasterDisabled}
                            onChange={() => toggleAction(m.key, act.key)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#00a884] focus:ring-[#00a884]"
                          />
                          <div className="min-w-0">
                            <span className="block text-xs font-bold text-slate-800 leading-tight">
                              {act.label}
                            </span>
                            <span className="block text-[10px] text-slate-500 leading-tight mt-0.5">
                              {act.description}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Status Footer */}
              <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-2.5 rounded-b-2xl flex items-center justify-between text-[11px]">
                <span className="text-slate-500">
                  {isModuleVisible ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Standard Admins can navigate here
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Hidden from Standard Admin sidebar
                    </span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Save Bar */}
      <div className="sticky bottom-4 z-10 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Btn onClick={handleSave}>Save Permissions</Btn>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              Permissions successfully saved and applied!
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400 font-medium hidden sm:inline">
          Changes take effect instantly for all logged-in administrators.
        </span>
      </div>
    </div>
  );
}
export default AdminPermissionsPage;
