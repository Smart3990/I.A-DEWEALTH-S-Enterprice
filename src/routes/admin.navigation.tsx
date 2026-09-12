import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Compass,
  Menu,
  ExternalLink,
  Eye,
  Info,
  Layers,
  Smartphone,
  Tag,
  Truck,
  Sparkles,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { ResourceManager } from "@/components/admin/kit";
import { SuperAdminOnly } from "@/components/admin/guard";
import { useCategories } from "@/data/category-store";

export const Route = createFileRoute("/admin/navigation")({
  component: NavigationAdmin,
});

function NavigationAdmin() {
  const [activeTab, setActiveTab] = useState<"visual" | "database">("visual");
  const { roots } = useCategories();

  const discoverLinks = [
    {
      name: "Super Deals",
      path: "/deals",
      description: "Flash sales, discounts >= 20%, and time-limited deals.",
      badge: "High Priority",
      badgeColor: "bg-red-100 text-red-800 border-red-200",
      icon: Flame,
    },
    {
      name: "Top Picks",
      path: "/top-picks",
      description: "Staff-curated flagship tech and best-value recommendations.",
      badge: "Curated",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: Sparkles,
    },
    {
      name: "New Arrivals",
      path: "/new-arrivals",
      description: "Freshly imported arrivals and latest inventory drops.",
      badge: "Fresh Stock",
      badgeColor: "bg-sky-100 text-sky-800 border-sky-200",
      icon: Tag,
    },
    {
      name: "Best Sellers",
      path: "/best-sellers",
      description: "Highest-demand products frequently ordered across Ghana.",
      badge: "Popular",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
      icon: CheckCircle2,
    },
    {
      name: "Clearance",
      path: "/clearance",
      description: "Last-chance inventory bargains and discontinued units.",
      badge: "Bargain",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      icon: Tag,
    },
    {
      name: "Nationwide Delivery",
      path: "/delivery",
      description: "Accra same-day courier dispatch, regional pickup hubs, and store address.",
      badge: "Logistics",
      badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
      icon: Truck,
    },
  ];

  return (
    <SuperAdminOnly>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#00a884]">
                Storefront Menu Architecture
              </span>
              <span className="text-xs font-bold text-amber-600">Header & Mobile Menus</span>
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Store Navigation & Menu Structure
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Here is how customer navigation works across the top navigation bar and mobile drawer.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl bg-white p-1 shadow-2xs border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab("visual")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  activeTab === "visual"
                    ? "bg-[#00a884] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Visual Menu Guide
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("database")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  activeTab === "database"
                    ? "bg-[#00a884] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Custom Nav Items
              </button>
            </div>

            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
            >
              <Eye className="h-3.5 w-3.5 text-[#00a884]" />
              <span>Preview Live Header</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Informational Callout */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-2xs flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-blue-950">Where does this appear on the shop? </span>
            The store navigation is split into two layers: (1) The{" "}
            <strong>Primary Department Menu</strong> (automatically generated from your root
            categories in Categories Admin) which appears on desktop as hover drop-downs, and (2)
            The <strong>Discover Shortcuts</strong> (Deals, Top Picks, New Arrivals, Clearance,
            Delivery) displayed in the mobile drawer and top navigation links.
          </div>
        </div>

        {activeTab === "visual" ? (
          <div className="space-y-6">
            {/* 1. Primary Department Bar Simulation */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-black text-white uppercase">
                    Layer 1
                  </span>
                  <h3 className="text-sm font-black text-slate-900">
                    Desktop Main Category Navigation Bar
                  </h3>
                </div>
                <Link
                  to="/admin/categories"
                  className="text-xs font-bold text-[#00a884] hover:underline flex items-center gap-1"
                >
                  <span>Manage in Categories</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <p className="text-xs text-slate-500">
                These tabs are rendered horizontally across desktop screens. Hovering over any tab
                opens its subcategories menu and linked promotional banner.
              </p>

              {/* Visual simulated navbar */}
              <div className="rounded-xl bg-[#0f172a] p-3 text-white flex flex-wrap items-center justify-center gap-2">
                {roots.map((root) => (
                  <Link
                    key={root.id}
                    to={`/category/${root.slug}`}
                    target="_blank"
                    className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-emerald-400 transition"
                  >
                    {root.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* 2. Discover & Promotional Links */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white uppercase">
                    Layer 2
                  </span>
                  <h3 className="text-sm font-black text-slate-900">
                    Featured Discover Links & Mobile Menu
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-400">6 Core Shortcuts</span>
              </div>

              <p className="text-xs text-slate-500">
                These dedicated landing pages allow customers to filter by sales velocity,
                discounts, or delivery information.
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {discoverLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <div
                      key={link.path}
                      className="flex flex-col justify-between rounded-xl border border-slate-200 p-4 transition hover:border-[#00a884] hover:shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase ${link.badgeColor}`}
                          >
                            {link.badge}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">{link.path}</span>
                        </div>
                        <h4 className="mt-2 text-sm font-black text-slate-900">{link.name}</h4>
                        <p className="mt-1 text-xs text-slate-600">{link.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <Link
                          to={link.path}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#00a884] hover:underline"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View Page</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Custom nav items editor in DB */
          <ResourceManager
            title="Custom Navigation Items"
            description="Manage auxiliary or custom links stored in the nav_items database table."
            table="nav_items"
            orderBy="sort_order"
            canWrite
            columns={[
              { key: "label", label: "Label" },
              { key: "path", label: "Link" },
              { key: "sort_order", label: "Order" },
              { key: "is_active", label: "Active" },
            ]}
            fields={[
              { key: "label", label: "Label" },
              { key: "path", label: "Link (e.g. /deals)" },
              { key: "sort_order", label: "Sort order", type: "number" },
              { key: "is_active", label: "Show in menu", type: "bool", default: true },
            ]}
          />
        )}
      </div>
    </SuperAdminOnly>
  );
}
