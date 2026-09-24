import { useState, useMemo, useEffect, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Filter,
  LayoutGrid,
  List,
  Package,
  Flame,
  Sparkles,
  TrendingUp,
  Tag,
  CheckCircle2,
  AlertTriangle,
  FolderTree,
  ArrowUpDown,
  RefreshCw,
  ChevronRight,
  Layers,
  Folder,
  Cloud,
  UploadCloud,
  Check,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cedi } from "@/components/store";
import { logActivity } from "@/lib/admin-auth";
import {
  getAllProducts,
  updateProductCategory,
  deleteProduct as deleteLocalProduct,
  deleteMultipleProducts,
  getDeletedProductIds,
  isLegacyOldProduct,
  EVENT_KEY,
  type AdminProduct,
} from "@/data/products-store";
import { getCustomCategories } from "@/data/category-store";
import { type Category } from "@/data/catalog";
import {
  ProductEditorModal,
  type ProductRecord,
  type CategoryOption,
  type BannerOption,
} from "@/components/admin/ProductEditorModal";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  component: ProductsAdmin,
});

const DEPARTMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "phones-tablets": { bg: "bg-transparent", text: "text-slate-700", border: "border-slate-200" },
  "computers-laptops": { bg: "bg-transparent", text: "text-slate-700", border: "border-slate-200" },
  "gadgets-electronics": {
    bg: "bg-transparent",
    text: "text-slate-700",
    border: "border-slate-200",
  },
  "kitchen-appliances": {
    bg: "bg-transparent",
    text: "text-slate-700",
    border: "border-slate-200",
  },
  "cars-vehicles": { bg: "bg-transparent", text: "text-slate-700", border: "border-slate-200" },
  accessories: { bg: "bg-transparent", text: "text-slate-700", border: "border-slate-200" },
};

function ProductsAdmin() {
  const qc = useQueryClient();

  // Search, filter, and view mode state
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "out_of_stock">("all");
  const [placementFilter, setPlacementFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "title" | "price_asc" | "price_desc" | "stock">(
    "newest",
  );
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<ProductRecord | null>(null);
  const [productToDelete, setProductToDelete] = useState<{ id: string; title: string } | null>(
    null,
  );

  // Multi-Select Products for Bulk Operations
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Cloud Database Sync Status
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [cloudSyncInfo, setCloudSyncInfo] = useState<{
    cloudCount: number;
    unsyncedCount: number;
    lastSyncedAt: string | null;
  }>({
    cloudCount: 0,
    unsyncedCount: 0,
    lastSyncedAt: null,
  });

  // 1. Categories & Taxonomy from Category Store
  const categoriesList = useMemo(() => getCustomCategories(), []);
  const categoryMap = useMemo(
    () => new Map(categoriesList.map((c) => [c.id, c])),
    [categoriesList],
  );

  const rootDepartments = useMemo(
    () => categoriesList.filter((c) => c.parentId === null),
    [categoriesList],
  );

  const subcategories = useMemo(
    () => categoriesList.filter((c) => c.parentId !== null),
    [categoriesList],
  );

  // Helper to get root department for any category ID
  const getDepartmentForCategory = useCallback(
    (catId: string): Category | undefined => {
      let current = categoryMap.get(catId);
      while (current && current.parentId) {
        const parent = categoryMap.get(current.parentId);
        if (!parent) break;
        current = parent;
      }
      return current;
    },
    [categoryMap],
  );

  // 2. Fetch Products: Fetch from /api/admin/products (Supabase authoritative cloud), merge with local
  const {
    data: products = [],
    isLoading: productsLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin", "products-catalog"],
    queryFn: async () => {
      const deletedIds = getDeletedProductIds();

      // 1. Always load all products from local unified store
      const local = getAllProducts();
      const mergedMap = new Map<string, ProductRecord>();

      // Populate local products first
      local.forEach((p) => {
        if (deletedIds.has(p.id) || isLegacyOldProduct(p.id, p.name || p.title)) return;
        const title = p.name || p.title || "Product";
        const img = p.image || p.image_url || "";
        mergedMap.set(p.id, {
          id: p.id,
          name: title,
          title: title,
          price: Number(p.price) || 0,
          compare_at_price: p.was ?? p.originalPrice,
          original_price: p.originalPrice ?? p.was,
          was_price: p.was ?? p.originalPrice,
          stock: p.stock ?? 15,
          category_id: p.categoryId || p.category,
          category: p.category || p.categoryId,
          brand: p.brand || "",
          image_url: img,
          image: img,
          images: p.images || [],
          short_description: p.spec || p.shortDescription || "",
          spec: p.spec || p.shortDescription || "",
          is_deal: !!(p.deal || p.isDeal),
          is_super_deal: !!(p.deal || p.isDeal),
          is_featured: !!(p.featured || p.isFeatured),
          is_best_seller: !!(p.bestSeller || p.isBestseller),
          is_new_arrival: !!(p.newArrival || p.isNew),
          is_clearance: !!p.clearance,
          top_pick: !!p.topPick,
          rating: p.rating || 4.8,
          sold_count: p.sold || 0,
          created_at: p.addedAt || new Date().toISOString(),
        } as unknown as ProductRecord);
      });

      // 2. Fetch from /api/admin/products (authoritative cloud PostgreSQL)
      let remoteRows: Record<string, unknown>[] = [];
      try {
        const res = await fetch("/api/admin/products");
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.products) && json.products.length > 0) {
            remoteRows = json.products;
          }
        }
      } catch (apiErr) {
        console.warn("API /api/admin/products fetch skipped, trying direct client:", apiErr);
      }

      // Fallback to direct client query if server API was unavailable
      if (remoteRows.length === 0) {
        try {
          const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10000);
          if (!error && data && data.length > 0) {
            remoteRows = data as Record<string, unknown>[];
          }
        } catch (err) {
          console.warn("Supabase products direct fetch skipped:", err);
        }
      }

      if (remoteRows.length > 0) {
        remoteRows.forEach((row: Record<string, unknown>) => {
          const rowId = String(row.id || "");
          const rowName = String(row.name || row.title || "");
          if (deletedIds.has(rowId) || isLegacyOldProduct(rowId, rowName)) return;
          const existing = mergedMap.get(rowId);
          const rowImages = Array.isArray(row.images) ? row.images : [];
          const rowImage = String(row.image || row.image_url || (rowImages[0] ?? ""));
          const existingImages = Array.isArray(existing?.images) ? existing.images : [];
          const existingImage = existing?.image || existing?.image_url || (existingImages[0] ?? "");
          const finalImage = existingImage || rowImage || "";

          // Remote Supabase database record is authoritative so all devices see exactly the same updated data
          mergedMap.set(rowId, {
            ...(existing || {}),
            ...row,
            id: rowId,
            name: String(row.name || row.title || existing?.name || existing?.title || "Product"),
            title: String(row.title || row.name || existing?.title || existing?.name || "Product"),
            price:
              row.price !== undefined && row.price !== null
                ? Number(row.price)
                : Number(existing?.price) || 0,
            was_price:
              row.was_price !== undefined && row.was_price !== null
                ? Number(row.was_price)
                : Number(
                    row.original_price ??
                      existing?.was_price ??
                      existing?.original_price ??
                      row.price ??
                      0,
                  ),
            stock:
              row.stock !== undefined && row.stock !== null
                ? Number(row.stock)
                : Number(existing?.stock) || 10,
            image: finalImage,
            image_url: finalImage,
            images:
              rowImages.length > 0
                ? rowImages
                : existingImages.length > 0
                  ? existingImages
                  : finalImage
                    ? [finalImage]
                    : [],
            category_id: (row.category_id as string | null) || existing?.category_id || undefined,
            brand: (row.brand as string) || existing?.brand || "",
            spec: (row.spec as string) || existing?.spec || existing?.short_description || "",
            is_active: row.is_active !== undefined ? Boolean(row.is_active) : true,
            is_deal: Boolean(row.is_deal ?? row.is_super_deal),
            is_super_deal: Boolean(row.is_super_deal ?? row.is_deal),
            is_featured: Boolean(row.is_featured),
            is_best_seller: Boolean(row.is_best_seller ?? row.is_bestseller),
            is_new_arrival: Boolean(row.is_new_arrival ?? row.is_new),
            is_clearance: Boolean(row.is_clearance),
            top_pick: Boolean(row.top_pick ?? row.is_top_pick),
          } as ProductRecord);
        });
      }

      // Check for locally authored products that haven't reached Supabase yet
      const remoteIdSet = new Set(remoteRows.map((r) => String(r.id)));
      const unsynced = local.filter((p) => !deletedIds.has(p.id) && !remoteIdSet.has(String(p.id)));

      setCloudSyncInfo({
        cloudCount: remoteRows.length,
        unsyncedCount: unsynced.length,
        lastSyncedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });

      // Background auto-sync of any unsynced local products
      if (unsynced.length > 0) {
        fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products: unsynced }),
        })
          .then((r) => r.json())
          .then((res) => {
            if (res.success) {
              setCloudSyncInfo((prev) => ({ ...prev, unsyncedCount: 0 }));
            }
          })
          .catch(() => {});
      }

      return Array.from(mergedMap.values()).filter(
        (p) => !deletedIds.has(p.id) && !isLegacyOldProduct(p.id, p.name || p.title),
      );
    },
  });

  // Manual Trigger: Force Sync All to Supabase Cloud Database
  const handleSyncAllToCloud = useCallback(async () => {
    try {
      setIsSyncingCloud(true);
      const local = getAllProducts();
      const deletedIds = getDeletedProductIds();
      const validLocal = local.filter((p) => !deletedIds.has(p.id));

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: validLocal }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || "Failed to sync to database");
      }

      const data = (await res.json()) as { count?: number };
      toast.success(
        `✓ Successfully synced ${data.count || validLocal.length} products to cloud database! Visible across all devices.`,
      );
      setCloudSyncInfo((prev) => ({
        ...prev,
        unsyncedCount: 0,
        lastSyncedAt: new Date().toLocaleTimeString(),
      }));
      refetch();
      qc.invalidateQueries({ queryKey: ["admin", "dashboard-v2"] });
      qc.invalidateQueries({ queryKey: ["storefront"] });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to sync to database";
      toast.error(`Sync error: ${msg}`);
    } finally {
      setIsSyncingCloud(false);
    }
  }, [qc, refetch]);

  // Listen to product update events for instant reactive list refresh
  useEffect(() => {
    const handleUpdated = () => {
      refetch();
    };
    window.addEventListener(EVENT_KEY, handleUpdated);
    return () => window.removeEventListener(EVENT_KEY, handleUpdated);
  }, [refetch]);

  // Re-listen for local product updates
  useEffect(() => {
    const handleUpdate = () => refetch();
    window.addEventListener("ia_products_updated", handleUpdate);
    return () => window.removeEventListener("ia_products_updated", handleUpdate);
  }, [refetch]);

  // 3. Department Product Counts
  const departmentCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    rootDepartments.forEach((d) => {
      counts[d.id] = 0;
    });

    products.forEach((p) => {
      const catId = p.category_id || p.category || "";
      const dept = getDepartmentForCategory(catId);
      if (dept && counts[dept.id] !== undefined) {
        counts[dept.id] += 1;
      }
    });

    return counts;
  }, [products, rootDepartments, getDepartmentForCategory]);

  // 4. Subcategories available under the selected Department
  const availableSubcategories = useMemo(() => {
    if (selectedDepartment === "all") {
      return subcategories;
    }
    return subcategories.filter((s) => s.parentId === selectedDepartment);
  }, [selectedDepartment, subcategories]);

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // 1. Delete locally and mark in persistent deleted registry
      deleteLocalProduct(id);

      // 2. Delete on backend server API
      try {
        await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      } catch (err) {
        console.warn("[API Product Delete]", err);
      }

      // 3. Delete directly from Supabase
      try {
        await supabase.from("products").delete().eq("id", id);
      } catch (err) {
        console.warn("[Supabase Product Delete]", err);
      }

      await logActivity(`Deleted product: ${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      if (deletedId) {
        qc.setQueryData<ProductRecord[]>(["admin", "products-catalog"], (old) =>
          old ? old.filter((p) => p.id !== deletedId) : [],
        );
      }
      refetch();
      qc.invalidateQueries({ queryKey: ["admin", "dashboard-v2"] });
      qc.invalidateQueries({ queryKey: ["storefront"] });
      toast.success("Product deleted successfully");
    },
    onError: (err) => {
      toast.error("Failed to delete product: " + String(err));
    },
  });

  // Quick Category Reassignment Handler
  const handleQuickCategoryChange = async (productId: string, newCategoryId: string) => {
    updateProductCategory(productId, newCategoryId);
    try {
      await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, category_id: newCategoryId }),
      });
    } catch {
      // ignore
    }
    const catName = categoryMap.get(newCategoryId)?.name || newCategoryId;
    toast.success(`Product re-categorised into "${catName}"`);
    refetch();
    qc.invalidateQueries({ queryKey: ["storefront"] });
  };

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const title = p.name || p.title || "";
        const desc = p.spec || p.short_description || "";
        const brand = p.brand || p.specifications?.brand || "";
        const catId = p.category_id || p.category || "";
        const dept = getDepartmentForCategory(catId);

        // Department Filter
        if (selectedDepartment !== "all") {
          if (!dept || dept.id !== selectedDepartment) return false;
        }

        // Subcategory Filter
        if (selectedSubcategory !== "all") {
          if (catId !== selectedSubcategory) return false;
        }

        // Search Filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = title.toLowerCase().includes(q);
          const matchId = (p.id || "").toLowerCase().includes(q);
          const matchDesc = desc.toLowerCase().includes(q);
          const matchBrand = brand.toLowerCase().includes(q);
          const matchCat = (categoryMap.get(catId)?.name || "").toLowerCase().includes(q);
          if (!matchTitle && !matchId && !matchDesc && !matchBrand && !matchCat) return false;
        }

        // Stock status
        if (stockFilter === "in_stock" && (p.stock ?? 0) <= 0) return false;
        if (stockFilter === "out_of_stock" && (p.stock ?? 0) > 0) return false;

        // Placements
        const isDeal = p.is_deal || p.is_super_deal;
        const isBestseller = p.is_best_seller || p.is_bestseller;
        const isNewArrival = p.is_new_arrival || p.is_new;

        if (placementFilter === "super_deals" && !isDeal) return false;
        if (placementFilter === "featured" && !p.is_featured) return false;
        if (placementFilter === "bestseller" && !isBestseller) return false;
        if (placementFilter === "new_arrival" && !isNewArrival) return false;
        if (placementFilter === "clearance" && !p.is_clearance) return false;

        return true;
      })
      .sort((a, b) => {
        const titleA = a.name || a.title || "";
        const titleB = b.name || b.title || "";
        if (sortBy === "title") return titleA.localeCompare(titleB);
        if (sortBy === "price_asc") return (a.price || 0) - (b.price || 0);
        if (sortBy === "price_desc") return (b.price || 0) - (a.price || 0);
        if (sortBy === "stock") return (b.stock || 0) - (a.stock || 0);
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [
    products,
    search,
    selectedDepartment,
    selectedSubcategory,
    stockFilter,
    placementFilter,
    sortBy,
    categoryMap,
    getDepartmentForCategory,
  ]);

  function handleOpenCreate() {
    setActiveProduct(null);
    setModalOpen(true);
  }

  function handleOpenEdit(product: ProductRecord) {
    setActiveProduct(product);
    setModalOpen(true);
  }

  function handleModalSaved() {
    refetch();
    qc.invalidateQueries({ queryKey: ["admin", "dashboard-v2"] });
    qc.invalidateQueries({ queryKey: ["admin", "products-catalog"] });
    qc.invalidateQueries({ queryKey: ["storefront"] });
    toast.success("Product saved successfully");
  }

  // Multi-Select Product Handlers
  const toggleSelectProduct = useCallback((id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const toggleSelectAllFiltered = useCallback(() => {
    const filteredIds = filteredProducts.map((p) => p.id);
    const allSelected =
      filteredIds.length > 0 && filteredIds.every((id) => selectedProductIds.includes(id));
    if (allSelected) {
      setSelectedProductIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedProductIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  }, [filteredProducts, selectedProductIds]);

  const clearSelection = useCallback(() => {
    setSelectedProductIds([]);
  }, []);

  const handleBulkDelete = useCallback(async () => {
    if (selectedProductIds.length === 0) return;
    setIsBulkDeleting(true);
    const idsToDelete = [...selectedProductIds];
    try {
      // 1. Delete locally & mark in persistent deleted registry
      deleteMultipleProducts(idsToDelete);

      // 2. Delete on backend server API
      try {
        await fetch("/api/admin/products", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: idsToDelete }),
        });
      } catch (err) {
        console.warn("[API Bulk Delete]", err);
      }

      // 3. Delete directly from Supabase
      try {
        await supabase.from("products").delete().in("id", idsToDelete);
      } catch (err) {
        console.warn("[Supabase Bulk Delete]", err);
      }

      await logActivity(`Bulk deleted ${idsToDelete.length} products`);

      qc.setQueryData<ProductRecord[]>(["admin", "products-catalog"], (old) =>
        old ? old.filter((p) => !idsToDelete.includes(p.id)) : [],
      );

      refetch();
      qc.invalidateQueries({ queryKey: ["admin", "dashboard-v2"] });
      qc.invalidateQueries({ queryKey: ["storefront"] });

      toast.success(`Successfully deleted ${idsToDelete.length} products`);
      setSelectedProductIds([]);
      setShowBulkDeleteModal(false);
    } catch (err) {
      toast.error("Failed to delete selected products: " + String(err));
    } finally {
      setIsBulkDeleting(false);
    }
  }, [selectedProductIds, qc, refetch]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-2xl bg-white p-5 shadow-xs border-0 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00a884]">
              CATALOG & CATEGORISATION
            </span>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Products & Inventory
              </h1>
              <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-semibold text-slate-700">
                {products.length} Products Live
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Easily categorize all products across departments & subcategories, update inventory
              stock, and manage promotional tags.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => refetch()}
              title="Refresh Catalog"
              className="rounded-xl bg-slate-100 hover:bg-slate-200 p-2.5 text-slate-600 transition border-0"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <Link
              to="/admin/banners"
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition border-0"
            >
              <span>Manage Category Banners</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>

            <button
              onClick={handleOpenCreate}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#00a884] px-4 py-2 text-xs font-bold text-white shadow-sm shadow-[#00a884]/25 transition hover:bg-[#009676] border-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cloud Database Synchronization Status Banner (Light Theme) */}
      <div className="rounded-2xl bg-white p-4 text-slate-900 shadow-xs sm:p-5 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#00a884] border border-emerald-100">
              <Cloud className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#00a884]">
                  Cloud Database Sync Engine
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Live Across All Devices
                </span>
              </div>
              <h2 className="text-sm font-bold text-slate-900 sm:text-base mt-0.5">
                {products.length} Products Active in Catalog
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
                Every product is persisted in Supabase PostgreSQL & Cloudinary CDN. Unlimited
                products can be uploaded and will immediately display across all phones, tablets,
                and different browsers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            {cloudSyncInfo.unsyncedCount > 0 && (
              <span className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-800">
                {cloudSyncInfo.unsyncedCount} browser-cached waiting for sync
              </span>
            )}

            <button
              type="button"
              disabled={isSyncingCloud}
              onClick={handleSyncAllToCloud}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#00a884] hover:bg-[#009676] text-white px-4 py-2.5 text-xs font-bold transition shadow-xs disabled:opacity-50 border-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncingCloud ? "animate-spin" : ""}`} />
              <span>{isSyncingCloud ? "Syncing with Cloud..." : "Sync to Cloud Database"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Selection Action Bar (Appears when 1 or more products are checked) */}
      {selectedProductIds.length > 0 && (
        <div className="sticky top-3 z-30 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-white p-3.5 shadow-md animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#00a884] border border-emerald-200">
              <Check className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  {selectedProductIds.length}{" "}
                  {selectedProductIds.length === 1 ? "Product" : "Products"} Selected
                </span>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Bulk Actions Ready
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Delete all selected items in one click from inventory and cloud database
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSelectAllFiltered}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              {filteredProducts.length > 0 &&
              filteredProducts.every((p) => selectedProductIds.includes(p.id))
                ? "Deselect Filtered"
                : `Select All Filtered (${filteredProducts.length})`}
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setShowBulkDeleteModal(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Selected ({selectedProductIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* DEPARTMENT PILL SELECTOR: Click any Department to filter immediately */}
      <div className="rounded-2xl bg-white p-4 shadow-xs border-0 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderTree className="h-4 w-4 text-[#00a884]" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">
              Department Classification
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {rootDepartments.length} Primary Departments • {subcategories.length} Subcategories
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              setSelectedDepartment("all");
              setSelectedSubcategory("all");
            }}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition border-0 ${
              selectedDepartment === "all"
                ? "bg-[#00a884] text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>All Departments</span>
            <span
              className={`rounded-full px-2 py-0.2 text-[10px] font-extrabold ${
                selectedDepartment === "all"
                  ? "bg-white/25 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {departmentCounts.all || 0}
            </span>
          </button>

          {rootDepartments.map((dept) => {
            const count = departmentCounts[dept.id] || 0;
            const isSelected = selectedDepartment === dept.id;
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => {
                  setSelectedDepartment(dept.id);
                  setSelectedSubcategory("all");
                }}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition border-0 ${
                  isSelected
                    ? "bg-[#00a884] text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{dept.name}</span>
                <span
                  className={`rounded-full px-2 py-0.2 text-[10px] font-extrabold ${
                    isSelected ? "bg-white/25 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-white p-4 shadow-xs border-0 space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by title, SKU, brand, specs, or category..."
              className="w-full rounded-xl bg-slate-100 pl-10 pr-4 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden border-0 transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 self-end md:self-auto">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-xl p-2 transition border-0 cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#00a884] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`rounded-xl p-2 transition border-0 cursor-pointer ${
                viewMode === "table"
                  ? "bg-[#00a884] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              title="Table List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          {/* Subcategory Filter (Contextual) */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase text-slate-500">Subcategory:</span>
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden border-0"
            >
              <option value="all">All Subcategories ({availableSubcategories.length})</option>
              {availableSubcategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase text-slate-500">Stock:</span>
            <select
              value={stockFilter}
              onChange={(e) =>
                setStockFilter(e.target.value as "all" | "in_stock" | "out_of_stock")
              }
              className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden border-0"
            >
              <option value="all">All Stock Levels</option>
              <option value="in_stock">In Stock Only</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          {/* Promotion / Placement Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase text-slate-500">Placement:</span>
            <select
              value={placementFilter}
              onChange={(e) => setPlacementFilter(e.target.value)}
              className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden border-0"
            >
              <option value="all">All Placements</option>
              <option value="super_deals">Super Deals Only</option>
              <option value="featured">Homepage Featured</option>
              <option value="bestseller">Best Sellers</option>
              <option value="new_arrival">New Arrivals</option>
              <option value="clearance">Clearance</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 ml-auto">
            <ArrowUpDown className="h-3 w-3 text-slate-400" />
            <span className="text-[11px] font-bold uppercase text-slate-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as "newest" | "title" | "price_asc" | "price_desc" | "stock",
                )
              }
              className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden border-0"
            >
              <option value="newest">Recently Added</option>
              <option value="title">Title (A - Z)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="stock">Stock Level</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header with Select-All Option */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 px-1">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none font-semibold text-slate-700 hover:text-slate-900">
            <input
              type="checkbox"
              checked={
                filteredProducts.length > 0 &&
                filteredProducts.every((p) => selectedProductIds.includes(p.id))
              }
              onChange={toggleSelectAllFiltered}
              className="h-4 w-4 rounded border-slate-300 text-[#00a884] focus:ring-[#00a884] cursor-pointer"
            />
            <span>Select All Filtered ({filteredProducts.length})</span>
          </label>
          <span className="text-slate-300">•</span>
          <span>
            Showing <strong>{filteredProducts.length}</strong> products matching filters
          </span>
        </div>
        <span className="text-[11px] font-bold text-[#00a884]">
          Tip: Check boxes to select multiple products and delete them in 1 click
        </span>
      </div>

      {/* Loading Skeleton */}
      {productsLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white p-4"
            />
          ))}
        </div>
      )}

      {/* Product Content: Grid Mode */}
      {!productsLoading && viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((p) => {
            const catId = p.category_id || p.category || "";
            const cat = categoryMap.get(catId);
            const dept = getDepartmentForCategory(catId);
            const inStock = (p.stock ?? 0) > 0;
            const title = p.name || p.title || "Product";
            const badge = p.tag || p.badge || "";
            const spec = p.spec || p.short_description || "";
            const wasPrice = p.was_price ?? p.original_price;
            const isDeal = p.is_deal || p.is_super_deal;
            const discount =
              wasPrice && wasPrice > p.price
                ? Math.round(((wasPrice - p.price) / wasPrice) * 100)
                : 0;

            const deptStyle = dept
              ? DEPARTMENT_COLORS[dept.id] || {
                  bg: "bg-slate-100",
                  text: "text-slate-800",
                  border: "border-slate-200",
                }
              : { bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-200" };

            const isSelected = selectedProductIds.includes(p.id);

            return (
              <div
                key={p.id}
                className={`group flex flex-col justify-between overflow-hidden rounded-2xl bg-white shadow-xs transition hover:shadow-md ${
                  isSelected ? "ring-2 ring-[#00a884] shadow-md" : "border border-slate-200"
                }`}
              >
                {/* Image Section */}
                <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                  {/* Selection Checkbox */}
                  <div className="absolute left-2.5 top-2.5 z-20">
                    <label
                      onClick={(e) => e.stopPropagation()}
                      className={`flex h-7 w-7 items-center justify-center rounded-lg shadow-sm border cursor-pointer transition ${
                        isSelected
                          ? "bg-[#00a884] border-[#00a884] text-white"
                          : "bg-white/95 border-slate-300 text-transparent hover:border-slate-400"
                      }`}
                      title={isSelected ? "Deselect product" : "Select product"}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectProduct(p.id)}
                        className="sr-only"
                      />
                      <Check
                        className={`h-4 w-4 stroke-[3] ${isSelected ? "opacity-100" : "opacity-0"}`}
                      />
                    </label>
                  </div>

                  {p.image ? (
                    <img
                      src={p.image}
                      alt={title}
                      className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                      <Package className="h-10 w-10" />
                    </div>
                  )}

                  {/* Overlaid Badges */}
                  <div className="absolute left-11 top-2.5 flex flex-col gap-1 items-start">
                    {isDeal && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-2xs">
                        <Flame className="h-3 w-3" /> SUPER DEAL
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-2xs">
                        -{discount}%
                      </span>
                    )}
                    {badge && (
                      <span className="rounded-md bg-[#00a884] px-2 py-0.5 text-[10px] font-extrabold text-white shadow-2xs">
                        {badge}
                      </span>
                    )}
                  </div>

                  {/* Stock Level Badge */}
                  <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        inStock
                          ? "bg-white/95 text-emerald-700 shadow-2xs"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {inStock ? `${p.stock} in stock` : "Out of stock"}
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
                  <div className="space-y-2">
                    {/* Visual Taxonomy Breadcrumb Tag */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${deptStyle.bg} ${deptStyle.text} border ${deptStyle.border}`}
                      >
                        <span>{dept?.name || "General"}</span>
                        <ChevronRight className="h-2.5 w-2.5 opacity-60" />
                        <span>{cat?.name || "Uncategorized"}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">{p.id}</span>
                    </div>

                    {/* Product Title */}
                    <h3
                      onClick={() => handleOpenEdit(p)}
                      className="cursor-pointer text-sm font-bold text-slate-900 line-clamp-2 hover:text-[#00a884] leading-snug"
                      title={title}
                    >
                      {title}
                    </h3>

                    {spec && <p className="text-[11px] text-slate-500 line-clamp-1">{spec}</p>}
                  </div>

                  {/* DIRECT CATEGORY RE-ASSIGNMENT CONTROL */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Assigned Category:
                    </span>
                    <select
                      value={catId}
                      onChange={(e) => handleQuickCategoryChange(p.id, e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-800 shadow-2xs focus:border-[#00a884] focus:outline-none"
                    >
                      {rootDepartments.map((rd) => {
                        const subs = subcategories.filter((s) => s.parentId === rd.id);
                        return (
                          <optgroup key={rd.id} label={`📁 ${rd.name}`}>
                            {subs.map((sub) => (
                              <option key={sub.id} value={sub.id}>
                                {sub.name}
                              </option>
                            ))}
                          </optgroup>
                        );
                      })}
                    </select>
                  </div>

                  {/* Price Row & Card Actions */}
                  <div className="border-t border-slate-100 pt-3">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-black text-slate-900">{cedi(p.price)}</span>
                        {wasPrice && wasPrice > p.price && (
                          <span className="text-xs text-slate-400 line-through">
                            {cedi(wasPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-3 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="flex-1 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#00a884] hover:bg-[#009676] py-2 text-xs font-bold text-white shadow-xs transition"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Edit Product</span>
                      </button>

                      <a
                        href={`/product/${p.id}`}
                        target="_blank"
                        rel="noreferrer"
                        title="View on Storefront"
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 shadow-2xs"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          setProductToDelete({
                            id: p.id,
                            title: p.title || p.name || "this product",
                          });
                        }}
                        title="Delete Product"
                        className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 shadow-2xs transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Content: Table List Mode */}
      {!productsLoading && viewMode === "table" && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-xs border-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="w-10 px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredProducts.length > 0 &&
                        filteredProducts.every((p) => selectedProductIds.includes(p.id))
                      }
                      onChange={toggleSelectAllFiltered}
                      className="h-4 w-4 rounded border-slate-300 text-[#00a884] focus:ring-[#00a884] cursor-pointer"
                      title="Select all"
                    />
                  </th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Department & Category</th>
                  <th className="px-4 py-3">Reassign Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const catId = p.category_id || p.category || "";
                  const cat = categoryMap.get(catId);
                  const dept = getDepartmentForCategory(catId);
                  const inStock = (p.stock ?? 0) > 0;
                  const title = p.name || p.title || "Product";
                  const isSelected = selectedProductIds.includes(p.id);

                  return (
                    <tr
                      key={p.id}
                      className={`transition ${isSelected ? "bg-emerald-50/50" : "hover:bg-slate-50/50"}`}
                    >
                      <td className="w-10 px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectProduct(p.id)}
                          className="h-4 w-4 rounded border-slate-300 text-[#00a884] focus:ring-[#00a884] cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover border border-slate-100"
                          />
                          <div>
                            <span className="font-bold text-slate-900 line-clamp-1">{title}</span>
                            <span className="font-mono text-[10px] text-slate-400">ID: {p.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-slate-700">
                          <span className="font-bold">{dept?.name || "General"}</span>
                          <ChevronRight className="h-3 w-3 text-slate-400" />
                          <span className="text-[#00a884] font-bold">
                            {cat?.name || "Unassigned"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={catId}
                          onChange={(e) => handleQuickCategoryChange(p.id, e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-800 shadow-2xs focus:border-[#00a884] focus:outline-none"
                        >
                          {rootDepartments.map((rd) => {
                            const subs = subcategories.filter((s) => s.parentId === rd.id);
                            return (
                              <optgroup key={rd.id} label={`📁 ${rd.name}`}>
                                {subs.map((sub) => (
                                  <option key={sub.id} value={sub.id}>
                                    {sub.name}
                                  </option>
                                ))}
                              </optgroup>
                            );
                          })}
                        </select>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {cedi(p.price)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md border border-slate-200 bg-transparent px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {p.stock} units
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 shadow-2xs cursor-pointer"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <a
                            href={`/product/${p.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 shadow-2xs"
                            title="View live"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              setProductToDelete({ id: p.id, title: title || "this product" });
                            }}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 shadow-2xs transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Editor Modal */}
      {modalOpen && (
        <ProductEditorModal
          isOpen={modalOpen}
          product={activeProduct}
          categories={categoriesList.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            banner_image: c.bannerImage,
            banner_title: c.bannerTitle,
            banner_subtitle: c.bannerSubtitle,
          }))}
          banners={[]}
          onClose={() => setModalOpen(false)}
          onSaved={handleModalSaved}
        />
      )}

      {/* Delete Confirmation Modal (Iframe-safe, accessible) */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Product</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-bold text-slate-900">
                &ldquo;{productToDelete.title}&rdquo;
              </span>
              ? It will be permanently removed from your storefront and inventory.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => setProductToDelete(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={async () => {
                  const target = productToDelete.id;
                  try {
                    await deleteMutation.mutateAsync(target);
                  } finally {
                    setProductToDelete(null);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50 transition cursor-pointer"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal (Iframe-safe, accessible) */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete {selectedProductIds.length} Products
                </h3>
                <p className="text-xs text-slate-500">This bulk action cannot be undone.</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <span className="font-bold text-slate-900">
                {selectedProductIds.length} selected products
              </span>{" "}
              from the storefront, inventory, and cloud database?
            </p>

            <div className="mt-3 max-h-36 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-2.5 space-y-1">
              {products
                .filter((p) => selectedProductIds.includes(p.id))
                .slice(0, 10)
                .map((p) => (
                  <div key={p.id} className="flex items-center gap-2 text-xs text-slate-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                    <span className="font-semibold truncate">{p.name || p.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">({p.id})</span>
                  </div>
                ))}
              {selectedProductIds.length > 10 && (
                <div className="text-[11px] text-slate-400 italic pt-1 text-center">
                  + {selectedProductIds.length - 10} more items
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isBulkDeleting}
                onClick={() => setShowBulkDeleteModal(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isBulkDeleting}
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50 transition cursor-pointer"
              >
                {isBulkDeleting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting {selectedProductIds.length} Products...</span>
                  </>
                ) : (
                  <span>Delete {selectedProductIds.length} Products</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
