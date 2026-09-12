import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  LayoutTemplate,
  Sliders,
  Sparkles,
  ExternalLink,
  Flame,
  Package,
  Star,
  CheckCircle2,
  Eye,
  Info,
  Layers,
} from "lucide-react";
import { ResourceManager } from "@/components/admin/kit";
import { SuperAdminOnly } from "@/components/admin/guard";

export const Route = createFileRoute("/admin/homepage")({
  component: HomepageAdmin,
});

function HomepageAdmin() {
  const [activeTab, setActiveTab] = useState<"visual" | "raw">("visual");

  const sectionsGuide = [
    {
      order: 1,
      id: "hero",
      title: "Hero Banner Carousel",
      eyebrow: "TOP OF HOMEPAGE",
      description:
        "The dynamic full-width banner at the very top of your store. Automatically rotates through flagship categories (Phones, Computing, Audio, Appliances, Accessories) with direct 'Shop Now' buttons.",
      location: "Screen 1 - Above the fold (first thing shoppers see)",
      managedAt: "/admin/banners",
      managedLabel: "Banners & Promos",
      badgeColor: "bg-sky-100 text-sky-800 border-sky-200",
      icon: Sparkles,
      previewNote: "Full-width photography slides with dark gradient and gold/green CTA button.",
    },
    {
      order: 2,
      id: "deals",
      title: "Super Deals & Flash Countdown",
      eyebrow: "SECTION 2",
      description:
        "High-contrast promotional bar displaying products with 20%+ discounts or tagged with flash deals. Features an active live countdown timer.",
      location: "Immediately below Hero carousel",
      managedAt: "/admin/products",
      managedLabel: "Product Deals",
      badgeColor: "bg-red-100 text-red-800 border-red-200",
      icon: Flame,
      previewNote: "Gradient card with red/amber fire badge and ticking countdown timer.",
    },
    {
      order: 3,
      id: "all-products",
      title: "All Products Marketplace Grid",
      eyebrow: "SECTION 3",
      description:
        "The core shopping catalogue displaying authentic imported tech, appliances, and accessories with instant WhatsApp checkout and cart buttons.",
      location: "Main central area of the homepage",
      managedAt: "/admin/products",
      managedLabel: "Products Catalog",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: Package,
      previewNote: "4-column responsive grid with product cards, badges, and pricing in GHS.",
    },
    {
      order: 4,
      id: "reviews",
      title: "Customer Reviews & Testimonials",
      eyebrow: "SECTION 4",
      description:
        "Real customer ratings, buyer testimonials from Accra & Kumasi, and 5-star feedback carousel building store trust.",
      location: "Bottom section, directly above footer",
      managedAt: "/admin/reviews",
      managedLabel: "Reviews Moderation",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      icon: Star,
      previewNote: "Carousel cards featuring verified buyer badges, comments, and star ratings.",
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
                Storefront Layout
              </span>
              <span className="text-xs font-bold text-amber-600">4 Core Sections</span>
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Homepage Sections Guide & Controls
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Understand exactly where every section appears on the storefront homepage and how it
              is controlled.
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
                Visual Guide
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("raw")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  activeTab === "raw"
                    ? "bg-[#00a884] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Database Rows
              </button>
            </div>

            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
            >
              <Eye className="h-3.5 w-3.5 text-[#00a884]" />
              <span>Preview Live Homepage</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Informational Callout */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-2xs flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-blue-950">How the Homepage Works: </span>
            The storefront homepage displays in a strict vertical sequence from top to bottom. Each
            section has a specialized management hub (e.g. Banners in Banners & Promos, Reviews in
            Reviews & Ratings, Deals in Products). Use this guide to see the exact visual order.
          </div>
        </div>

        {activeTab === "visual" ? (
          <div className="space-y-4">
            {/* Visual Sequence Map */}
            <div className="grid grid-cols-1 gap-4">
              {sectionsGuide.map((sec) => {
                const Icon = sec.icon;
                return (
                  <div
                    key={sec.id}
                    className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      {/* Step Number Badge */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-black text-slate-900 border border-slate-200 text-sm">
                        #{sec.order}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${sec.badgeColor}`}
                          >
                            {sec.eyebrow}
                          </span>
                          <h3 className="text-base font-black text-slate-900">{sec.title}</h3>
                        </div>

                        <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                          {sec.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">
                            📍 Position: {sec.location}
                          </span>
                          <span>•</span>
                          <span className="italic">{sec.previewNote}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Link to Manage */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Link
                        to={sec.managedAt}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#00a884] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#009676] transition"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>Manage in {sec.managedLabel}</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Raw Database Table for SuperAdmins */
          <ResourceManager
            title="Homepage Section Database Records"
            description="Configure section keys, custom titles, item limits, and visibility flags in the database."
            table="homepage_sections"
            orderBy="sort_order"
            canWrite
            columns={[
              { key: "key", label: "Section Key" },
              { key: "title", label: "Title" },
              { key: "item_limit", label: "Items Limit" },
              { key: "sort_order", label: "Order" },
              { key: "is_active", label: "Active" },
            ]}
            fields={[
              { key: "key", label: "Section key (e.g. deals, hero, reviews)" },
              { key: "eyebrow", label: "Small label above title" },
              { key: "title", label: "Title", full: true },
              { key: "subtitle", label: "Subtitle", full: true },
              { key: "item_limit", label: "How many products", type: "number", default: 8 },
              { key: "sort_order", label: "Sort order", type: "number" },
              { key: "is_active", label: "Show on homepage", type: "bool", default: true },
            ]}
          />
        )}
      </div>
    </SuperAdminOnly>
  );
}
