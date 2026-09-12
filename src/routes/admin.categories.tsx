import { useState, useMemo, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  FolderTree,
  Image as ImageIcon,
  ExternalLink,
  Pencil,
  Search,
  Filter,
  Sparkles,
  Layers,
  Eye,
  Check,
  X,
  Plus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ResourceManager, type Field, Btn } from "@/components/admin/kit";
import { ImageUploadInput } from "@/components/admin/ImageUploadInput";
import { getCustomCategories, updateCategoryBanner, type Category } from "@/data/category-store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesAdmin,
});

function CategoriesAdmin() {
  const [viewMode, setViewMode] = useState<"visual" | "table">("visual");
  const [search, setSearch] = useState("");
  const [parentFilter, setParentFilter] = useState<string>("all");
  const [categoriesList, setCategoriesList] = useState<Category[]>(() => getCustomCategories());
  const [editingBannerCat, setEditingBannerCat] = useState<Category | null>(null);

  // Sync with custom categories updates
  useEffect(() => {
    const handleUpdate = () => {
      setCategoriesList(getCustomCategories());
    };
    window.addEventListener("ia_categories_updated", handleUpdate);
    return () => window.removeEventListener("ia_categories_updated", handleUpdate);
  }, []);

  const { data: dbCategories = [] } = useQuery({
    queryKey: ["admin", "category-options"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id, name").order("name");
      return data ?? [];
    },
  });

  const categoryMap = useMemo(
    () => new Map(categoriesList.map((c) => [c.id, c])),
    [categoriesList],
  );

  const rootCategories = useMemo(
    () => categoriesList.filter((c) => c.parentId === null),
    [categoriesList],
  );

  const filteredCategories = useMemo(() => {
    return categoriesList.filter((cat) => {
      if (parentFilter !== "all") {
        if (parentFilter === "root" && cat.parentId !== null) return false;
        if (parentFilter !== "root" && cat.parentId !== parentFilter && cat.id !== parentFilter)
          return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const mName = cat.name.toLowerCase().includes(q);
        const mTitle = (cat.bannerTitle || "").toLowerCase().includes(q);
        const mSub = (cat.bannerSubtitle || "").toLowerCase().includes(q);
        if (!mName && !mTitle && !mSub) return false;
      }
      return true;
    });
  }, [categoriesList, parentFilter, search]);

  const fields: Field[] = [
    { key: "name", label: "Category name" },
    { key: "slug", label: "URL slug" },
    {
      key: "parent_id",
      label: "Parent category",
      type: "select",
      options: dbCategories.map((c) => ({ value: c.id, label: c.name })),
    },
    { key: "icon", label: "Icon name" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "banner_image", label: "Banner image URL", full: true },
    { key: "banner_title", label: "Banner title" },
    { key: "banner_subtitle", label: "Banner subtitle" },
    { key: "banner_cta", label: "Button text", default: "Shop now" },
    { key: "sort_order", label: "Sort order", type: "number" },
    { key: "is_active", label: "Visible on site", type: "bool", default: true },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#00a884]">
              Catalog Architecture
            </span>
            <span className="text-xs font-bold text-amber-600">
              {categoriesList.length} Categories & Linked Banners
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Categories & Visual Banners
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Manage your store's department structure and see every category linked directly to its
            promotional banner.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl bg-white p-1 shadow-2xs border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode("visual")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "visual"
                  ? "bg-[#00a884] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Visual Banners View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "table"
                  ? "bg-[#00a884] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Taxonomy Table
            </button>
          </div>

          <Link
            to="/admin/banners"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            <ImageIcon className="h-3.5 w-3.5 text-amber-600" />
            <span>Open Banners Hub</span>
          </Link>
        </div>
      </div>

      {viewMode === "visual" ? (
        <div className="space-y-6">
          {/* Controls */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search category or banner headline..."
                className="w-full text-xs font-medium text-slate-800 placeholder-slate-400 outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-bold text-slate-600">Filter:</span>
              <select
                value={parentFilter}
                onChange={(e) => setParentFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">All ({categoriesList.length})</option>
                <option value="root">Root Departments ({rootCategories.length})</option>
                {rootCategories.map((rc) => (
                  <option key={rc.id} value={rc.id}>
                    Under: {rc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Cards with Linked Banners */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((cat) => {
              const isRoot = cat.parentId === null;
              const parent = cat.parentId ? categoryMap.get(cat.parentId) : undefined;
              const categoryLink = isRoot
                ? `/category/${cat.slug}`
                : `/category/${parent?.slug || "all"}/${cat.slug}`;

              return (
                <div
                  key={cat.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs transition hover:shadow-md"
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-2.5 text-xs">
                    <div>
                      <span className="font-black text-slate-900">{cat.name}</span>
                      <span className="ml-2 font-mono text-[10px] text-slate-400">#{cat.id}</span>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wide text-amber-600">
                      {isRoot ? "Root Dept" : parent?.name || "Subcategory"}
                    </span>
                  </div>

                  {/* Linked Banner Preview */}
                  <div className="relative h-36 w-full overflow-hidden bg-slate-900 flex items-center">
                    <img
                      src={cat.bannerImage}
                      alt={cat.name}
                      className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/30" />

                    <div className="relative z-10 p-4 text-white">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#d4af37]">
                        LINKED BANNER
                      </span>
                      <h4 className="mt-0.5 text-sm font-black leading-snug line-clamp-1 drop-shadow-xs">
                        {cat.bannerTitle || `${cat.name} Collection`}
                      </h4>
                      <p className="mt-1 line-clamp-1 text-[11px] text-white/80">
                        {cat.bannerSubtitle || cat.description}
                      </p>
                      <div className="mt-2 inline-flex items-center rounded-full bg-[#d4af37] px-2.5 py-0.5 text-[10px] font-bold text-slate-950">
                        {cat.bannerCTA || "Shop now"}
                      </div>
                    </div>
                  </div>

                  {/* Footer with actions */}
                  <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-2.5 text-xs">
                    <Link
                      to={categoryLink}
                      target="_blank"
                      className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-[#00a884] transition text-[11px]"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View Category</span>
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setEditingBannerCat(cat)}
                      className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-100 transition"
                    >
                      <Pencil className="h-3 w-3" />
                      <span>Edit Banner</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Table View */
        <ResourceManager
          title="Taxonomy & Hierarchy Table"
          description="Edit raw database records for categories."
          table="categories"
          orderBy="sort_order"
          idField="id"
          newIdLabel="Category ID (lowercase, no spaces)"
          canWrite
          columns={[
            { key: "banner_image", label: "Banner" },
            { key: "name", label: "Name" },
            { key: "banner_title", label: "Banner Title" },
            { key: "parent_id", label: "Parent" },
            { key: "sort_order", label: "Order" },
            { key: "is_active", label: "Visible" },
          ]}
          fields={fields}
        />
      )}

      {/* Quick Banner Edit Modal */}
      {editingBannerCat && (
        <QuickCategoryBannerModal
          category={editingBannerCat}
          onClose={() => setEditingBannerCat(null)}
          onSave={(updated) => {
            updateCategoryBanner(updated.id, {
              bannerTitle: updated.bannerTitle,
              bannerSubtitle: updated.bannerSubtitle,
              bannerImage: updated.bannerImage,
              bannerCTA: updated.bannerCTA,
            });
            toast.success(`Banner updated for "${updated.name}"`);
            setEditingBannerCat(null);
          }}
        />
      )}
    </div>
  );
}

function QuickCategoryBannerModal({
  category,
  onClose,
  onSave,
}: {
  category: Category;
  onClose: () => void;
  onSave: (cat: Category) => void;
}) {
  const [form, setForm] = useState<Category>({ ...category });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden my-8 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
              CATEGORY BANNER LINK
            </span>
            <h3 className="text-base font-black text-slate-900">Edit Banner: {category.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Live Card Preview */}
        <div className="relative h-28 w-full overflow-hidden rounded-xl bg-slate-900 flex items-center shadow-xs">
          <img
            src={form.bannerImage}
            alt={form.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
          <div className="relative z-10 p-4 text-white">
            <h4 className="text-xs font-black line-clamp-1">{form.bannerTitle}</h4>
            <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5">{form.bannerSubtitle}</p>
            <span className="mt-1.5 inline-block rounded-full bg-[#d4af37] px-2 py-0.5 text-[9px] font-bold text-slate-950">
              {form.bannerCTA || "Shop now"}
            </span>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Banner Headline</label>
            <input
              type="text"
              value={form.bannerTitle}
              onChange={(e) => setForm({ ...form, bannerTitle: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-900 focus:border-[#00a884] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Banner Subtitle</label>
            <input
              type="text"
              value={form.bannerSubtitle}
              onChange={(e) => setForm({ ...form, bannerSubtitle: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-900 focus:border-[#00a884] focus:outline-none"
            />
          </div>

          <div>
            <ImageUploadInput
              label="Banner Image URL"
              value={form.bannerImage}
              onChange={(url) => setForm({ ...form, bannerImage: url })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">CTA Button Text</label>
            <input
              type="text"
              value={form.bannerCTA || "Shop now"}
              onChange={(e) => setForm({ ...form, bannerCTA: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-900 focus:border-[#00a884] focus:outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(form)}
            className="rounded-xl bg-[#00a884] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#009676] transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
