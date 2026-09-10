import { useState, useMemo, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Image as ImageIcon,
  Pencil,
  Eye,
  Check,
  Search,
  Filter,
  ExternalLink,
  Sparkles,
  Layers,
  ChevronRight,
  FolderTree,
  Home,
  MessageCircle,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import {
  useCategories,
  getCustomCategories,
  updateCategoryBanner,
  resetCategoriesToDefault,
} from "@/data/category-store";
import { PRESET_BANNER_ASSETS, type PresetBannerAsset } from "@/data/banner-assets";
import { type Category } from "@/data/catalog";
import { WHATSAPP } from "@/data/products";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/banners")({
  component: AdminBannersPage,
});

export interface EditableBannerItem {
  id: string;
  type: "homepage" | "root_category" | "subcategory";
  categoryName: string;
  parentName?: string;
  parentId?: string | null;
  slug: string;
  title: string;
  subtitle: string;
  eyebrow: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  sortOrder: number;
}

function AdminBannersPage() {
  const [categoriesList, setCategoriesList] = useState<Category[]>(() => getCustomCategories());
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "homepage" | "root" | "subcategory">("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  // Active banner being edited
  const [editingBanner, setEditingBanner] = useState<EditableBannerItem | null>(null);

  // Reload categories on custom update
  useEffect(() => {
    const handleUpdate = () => {
      setCategoriesList(getCustomCategories());
    };
    window.addEventListener("ia_categories_updated", handleUpdate);
    return () => window.removeEventListener("ia_categories_updated", handleUpdate);
  }, []);

  // Map of categories by ID
  const categoryMap = useMemo(
    () => new Map(categoriesList.map((c) => [c.id, c])),
    [categoriesList],
  );

  // Root categories
  const rootCategories = useMemo(
    () => categoriesList.filter((c) => c.parentId === null),
    [categoriesList],
  );

  // Convert categories into standard EditableBannerItems
  const allBanners = useMemo<EditableBannerItem[]>(() => {
    const items: EditableBannerItem[] = [];

    categoriesList.forEach((cat) => {
      const isRoot = cat.parentId === null;
      const parent = cat.parentId ? categoryMap.get(cat.parentId) : undefined;

      // Category / Subcategory banner
      items.push({
        id: cat.id,
        type: isRoot ? "root_category" : "subcategory",
        categoryName: cat.name,
        parentName: parent?.name,
        parentId: cat.parentId,
        slug: cat.slug,
        title: cat.bannerTitle || `${cat.name} Collection`,
        subtitle:
          cat.bannerSubtitle || cat.description || "Browse authentic products with fast delivery.",
        eyebrow: isRoot ? "AUTHENTIC SHOP" : parent?.name || "SHOP DEPARTMENTS",
        image: cat.bannerImage,
        ctaText: cat.bannerCTA || "Shop now",
        ctaLink: isRoot
          ? `/category/${cat.slug}`
          : `/category/${parent?.slug || "all"}/${cat.slug}`,
        isActive: cat.isActive !== false,
        sortOrder: cat.sortOrder || 0,
      });
    });

    return items;
  }, [categoriesList, categoryMap]);

  // Filter banners based on user controls
  const filteredBanners = useMemo(() => {
    return allBanners.filter((b) => {
      // Type filter
      if (typeFilter === "root" && b.type !== "root_category") return false;
      if (typeFilter === "subcategory" && b.type !== "subcategory") return false;
      if (typeFilter === "homepage" && b.type !== "root_category") return false; // root categories power homepage

      // Department filter
      if (departmentFilter !== "all") {
        const matchesRoot = b.id === departmentFilter;
        const matchesParent = b.parentId === departmentFilter;
        if (!matchesRoot && !matchesParent) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = b.categoryName.toLowerCase().includes(q);
        const matchTitle = b.title.toLowerCase().includes(q);
        const matchSub = b.subtitle.toLowerCase().includes(q);
        const matchParent = (b.parentName || "").toLowerCase().includes(q);
        if (!matchName && !matchTitle && !matchSub && !matchParent) return false;
      }

      return true;
    });
  }, [allBanners, typeFilter, departmentFilter, searchQuery]);

  const handleSaveEdit = (updated: EditableBannerItem) => {
    updateCategoryBanner(updated.id, {
      bannerTitle: updated.title,
      bannerSubtitle: updated.subtitle,
      bannerImage: updated.image,
      bannerCTA: updated.ctaText,
      isActive: updated.isActive,
    });
    toast.success(`Banner updated for "${updated.categoryName}"`);
    setEditingBanner(null);
  };

  const handleResetDefaults = () => {
    if (confirm("Reset all category banners to factory default images and copy?")) {
      resetCategoriesToDefault();
      toast.success("All banners reset to default");
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header & Quick Overview */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#00a884]">
              Visual Merchandising
            </span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              {allBanners.length} Banners Configured
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Banners & Visual Merchandising Hub
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Show and customize banners for <strong>all categories and subcategories</strong>. Every
            card matches the exact look and feel of the storefront homepage.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-2xs hover:bg-slate-50 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </button>

          <Link
            to="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#00a884] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#008f70] transition"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>View Live Storefront</span>
          </Link>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Type Tabs */}
          <div className="flex flex-wrap items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setTypeFilter("all")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                typeFilter === "all"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Banners ({allBanners.length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("homepage")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                typeFilter === "homepage"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Homepage Hero Slides ({rootCategories.length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("root")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                typeFilter === "root"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Main Departments ({rootCategories.length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("subcategory")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                typeFilter === "subcategory"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Subcategories ({allBanners.length - rootCategories.length})
            </button>
          </div>

          {/* Department Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-600">Filter Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs focus:border-[#00a884] focus:outline-none"
            >
              <option value="all">All Departments</option>
              {rootCategories.map((rc) => (
                <option key={rc.id} value={rc.id}>
                  {rc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by category name, banner headline, or subtitle..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#00a884] focus:bg-white focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 3. Banners Grid with Home-Page Identical Visual Cards */}
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong>{filteredBanners.length}</strong> banners matching filters
          </span>
          <span className="text-[11px] font-bold text-[#00a884]">
            Click "Edit Banner" to customize image, title, subtitle & button
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {filteredBanners.map((banner) => (
            <div
              key={banner.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs transition hover:shadow-lg"
            >
              {/* Card Header & Taxonomy Tags */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      banner.type === "root_category"
                        ? "bg-emerald-100 text-emerald-900"
                        : "bg-sky-100 text-sky-900"
                    }`}
                  >
                    {banner.type === "root_category"
                      ? "Primary Department"
                      : `Subcategory: ${banner.parentName || "Catalog"}`}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-500">#{banner.id}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      banner.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        banner.isActive ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                    {banner.isActive ? "Active on Site" : "Hidden"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingBanner(banner)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-2xs hover:border-[#00a884] hover:text-[#00a884] transition"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit Banner</span>
                  </button>
                </div>
              </div>

              {/* STOREFRONT LIVE BANNER PREVIEW (Identical to Homepage & Category Shell) */}
              <div className="relative min-h-[220px] w-full overflow-hidden bg-slate-900 flex items-center">
                {/* Banner Background Image */}
                <img
                  src={banner.image}
                  alt={banner.categoryName}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Dark Gradient Overlay for optimal contrast */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />

                {/* Banner Content Layout */}
                <div className="relative z-10 flex flex-col items-start gap-2.5 p-6 sm:p-8 w-full max-w-xl">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#d4af37] drop-shadow-xs">
                    {banner.eyebrow || banner.categoryName}
                  </span>

                  <h3 className="text-xl font-black leading-tight tracking-tight text-white sm:text-2xl drop-shadow-sm">
                    {banner.title}
                  </h3>

                  <p className="line-clamp-2 text-xs leading-relaxed text-white/85 sm:text-sm">
                    {banner.subtitle}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="inline-flex items-center rounded-full bg-[#d4af37] px-4 py-1.5 text-xs font-bold text-slate-950 shadow-md">
                      {banner.ctaText}
                    </span>

                    <a
                      href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                        `Hello IA DEWEALTH, I want to order from ${banner.categoryName}`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-white/30 transition"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>WhatsApp Order</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Card Footer with Quick Links */}
              <div className="flex items-center justify-between bg-white px-5 py-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <FolderTree className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    Department:{" "}
                    <strong className="text-slate-800">
                      {banner.parentName || banner.categoryName}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to={banner.ctaLink}
                    target="_blank"
                    className="inline-flex items-center gap-1 font-bold text-slate-600 hover:text-[#00a884] transition"
                  >
                    <span>View Category Page</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setEditingBanner(banner)}
                    className="font-bold text-[#00a884] hover:underline"
                  >
                    Customize
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. VISUAL BANNER EDITOR MODAL */}
      {editingBanner && (
        <BannerEditorModal
          banner={editingBanner}
          onClose={() => setEditingBanner(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

/**
 * Modal to edit banner content, headline, image, and preset assets.
 */
function BannerEditorModal({
  banner,
  onClose,
  onSave,
}: {
  banner: EditableBannerItem;
  onClose: () => void;
  onSave: (updated: EditableBannerItem) => void;
}) {
  const [form, setForm] = useState<EditableBannerItem>({ ...banner });
  const [selectedAssetCat, setSelectedAssetCat] = useState<string>("all");

  const assetCategories = useMemo(() => {
    const set = new Set(PRESET_BANNER_ASSETS.map((a) => a.category));
    return ["all", ...Array.from(set)];
  }, []);

  const filteredAssets = useMemo(() => {
    if (selectedAssetCat === "all") return PRESET_BANNER_ASSETS;
    return PRESET_BANNER_ASSETS.filter((a) => a.category === selectedAssetCat);
  }, [selectedAssetCat]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#00a884]">
              LIVE BANNER EDITOR
            </span>
            <h2 className="text-lg font-black text-slate-900">Edit Banner: {form.categoryName}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* LIVE PREVIEW BOX (WYSIWYG) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Live Storefront Card Preview
              </span>
              <span className="text-[11px] font-bold text-emerald-600">
                Updates in real-time as you type
              </span>
            </div>

            <div className="relative min-h-[220px] w-full overflow-hidden rounded-2xl bg-slate-900 flex items-center shadow-md">
              <img
                src={form.image}
                alt={form.categoryName}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />

              <div className="relative z-10 flex flex-col items-start gap-2.5 p-6 sm:p-8 w-full max-w-xl">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#d4af37]">
                  {form.eyebrow || form.categoryName}
                </span>

                <h3 className="text-2xl font-black leading-tight tracking-tight text-white drop-shadow-sm">
                  {form.title || "Banner Title Here"}
                </h3>

                <p className="text-xs leading-relaxed text-white/85 sm:text-sm line-clamp-2">
                  {form.subtitle || "Banner subtitle and description will display here."}
                </p>

                <div className="flex items-center gap-2 pt-2">
                  <span className="inline-flex items-center rounded-full bg-[#d4af37] px-4 py-1.5 text-xs font-bold text-slate-950 shadow-md">
                    {form.ctaText || "Shop now"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-semibold text-white">
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* FORM FIELDS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Title */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700">Banner Headline / Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Crispy Without The Oil"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:border-[#00a884] focus:outline-none"
              />
            </div>

            {/* Subtitle */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Banner Subtitle / Description
              </label>
              <textarea
                rows={2}
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="Brief description that excites customers about this category..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#00a884] focus:outline-none"
              />
            </div>

            {/* Eyebrow */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Eyebrow / Small Badge</label>
              <input
                type="text"
                value={form.eyebrow}
                onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
                placeholder="e.g. AUTHENTIC TECH"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900 focus:border-[#00a884] focus:outline-none"
              />
            </div>

            {/* Button Text */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Button CTA Text</label>
              <input
                type="text"
                value={form.ctaText}
                onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                placeholder="e.g. Shop Air Fryers"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900 focus:border-[#00a884] focus:outline-none"
              />
            </div>

            {/* Banner Image URL */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700">Banner Image URL</label>
              <input
                type="text"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://... or select from preset gallery below"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-mono text-slate-800 focus:border-[#00a884] focus:outline-none"
              />
            </div>
          </div>

          {/* PRESET IMAGE GALLERY PICKER */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-[#00a884]" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Preset Curated Image Gallery
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                <span>Filter:</span>
                <select
                  value={selectedAssetCat}
                  onChange={(e) => setSelectedAssetCat(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 focus:outline-none"
                >
                  {assetCategories.map((c) => (
                    <option key={c} value={c}>
                      {c === "all" ? "All Image Presets" : c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-[180px] overflow-y-auto p-1">
              {filteredAssets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => setForm({ ...form, image: asset.url })}
                  className={`group relative overflow-hidden rounded-lg border-2 text-left transition ${
                    form.image === asset.url
                      ? "border-[#00a884] ring-2 ring-[#00a884]/20 shadow-xs"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <img src={asset.url} alt={asset.name} className="h-14 w-full object-cover" />
                  <div className="p-1 bg-white">
                    <p className="truncate text-[10px] font-bold text-slate-700">{asset.name}</p>
                  </div>
                  {form.image === asset.url && (
                    <div className="absolute top-1 right-1 rounded-full bg-[#00a884] p-0.5 text-white">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onSave(form)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#00a884] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-[#008f70] transition"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Save Banner Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
