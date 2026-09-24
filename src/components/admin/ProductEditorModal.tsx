import { useState, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  X,
  ExternalLink,
  Package,
  Flame,
  Sparkles,
  TrendingUp,
  Tag,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Image as ImageIcon,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Phone,
  FolderTree,
  Sliders,
  DollarSign,
  Boxes,
  Upload,
  ArrowLeft,
  ArrowRight,
  Star,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logActivity, useAdminSession } from "@/lib/admin-auth";
import {
  ImageUploadInput,
  uploadImageFile,
  uploadMultipleImageFiles,
} from "@/components/admin/ImageUploadInput";
import { upsertProduct, deleteProduct } from "@/data/products-store";
import { toast } from "sonner";
import { cedi } from "@/components/store";

export function generateProductSlug(rawTitle: string): string {
  return rawTitle
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateSkuId(rawTitle?: string, prefix = "SKU-IAD"): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  if (rawTitle) {
    const cleanWord = rawTitle
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 4)
      .toUpperCase();
    if (cleanWord) {
      return `${prefix}-${cleanWord}-${timestamp}`;
    }
  }
  return `${prefix}-${timestamp}-${random}`;
}

export type ProductRecord = {
  id: string;
  name?: string | null;
  title?: string | null;
  slug?: string | null;
  category_id?: string | null;
  category?: string | null;
  price: number;
  was_price?: number | null;
  original_price?: number | null;
  badge?: string | null;
  tag?: string | null;
  rating?: number | null;
  reviews?: number | null;
  reviews_count?: number | null;
  image?: string | null;
  images?: string[] | null;
  is_active?: boolean | null;
  is_featured?: boolean | null;
  is_deal?: boolean | null;
  is_super_deal?: boolean | null;
  is_clearance?: boolean | null;
  is_top_pick?: boolean | null;
  is_new_arrival?: boolean | null;
  is_new?: boolean | null;
  is_best_seller?: boolean | null;
  is_bestseller?: boolean | null;
  spec?: string | null;
  short_description?: string | null;
  description?: string | null;
  brand?: string | null;
  seller?: string | null;
  condition?: string | null;
  specifications?: Record<string, string | undefined> | null;
  stock?: number | null;
  in_stock?: boolean | null;
  created_at?: string;
  updated_at?: string;
};

export type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  banner_image?: string | null;
  banner_title?: string | null;
  banner_subtitle?: string | null;
};

export type BannerOption = {
  id: string;
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  image_url?: string | null;
  cta_link?: string | null;
  position?: string | null;
};

// Default neutral placeholder asset for new product creation (not an actual product photograph)
const DEFAULT_PLACEHOLDER_IMAGE = "/assets/product-placeholder.svg";

// Curated verified asset presets for quick one-click image populating
const IMAGE_PRESETS = [
  {
    label: "Smartphone",
    url: "https://res.cloudinary.com/i90i25pj/image/upload/v1788979866/iadewealth/p-smartphone.jpg",
  },
  {
    label: "Laptop",
    url: "https://res.cloudinary.com/i90i25pj/image/upload/v1788979861/iadewealth/p-laptop.jpg",
  },
  {
    label: "Tablet",
    url: "https://res.cloudinary.com/i90i25pj/image/upload/v1788979867/iadewealth/p-tablet.jpg",
  },
  {
    label: "Car / Vehicle",
    url: "https://res.cloudinary.com/i90i25pj/image/upload/v1788979845/iadewealth/cars-hero.jpg",
  },
  {
    label: "Car Mount",
    url: "https://res.cloudinary.com/i90i25pj/image/upload/v1788979841/iadewealth/car-mount.jpg",
  },
  {
    label: "MagSafe Stand",
    url: "https://res.cloudinary.com/i90i25pj/image/upload/v1788979857/iadewealth/magsafe-stand.jpg",
  },
  {
    label: "Monitor",
    url: "https://res.cloudinary.com/i90i25pj/image/upload/v1788979862/iadewealth/p-monitor.jpg",
  },
  {
    label: "Keyboard",
    url: "https://res.cloudinary.com/i90i25pj/image/upload/v1788979860/iadewealth/p-keyboard.jpg",
  },
  {
    label: "Thunderbolt Dock",
    url: "https://res.cloudinary.com/i90i25pj/image/upload/v1788979846/iadewealth/dock-thunderbolt.jpg",
  },
];

interface ProductEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductRecord | null;
  categories: CategoryOption[];
  banners: BannerOption[];
  onSaved: () => void;
  onDelete?: (id: string) => void;
}

export function ProductEditorModal({
  isOpen,
  onClose,
  product,
  categories,
  banners,
  onSaved,
  onDelete,
}: ProductEditorModalProps) {
  const isNew = !product;

  // Form states - no default values forced when creating new products
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugUserModified, setIsSlugUserModified] = useState(false);
  const [isIdUserModified, setIsIdUserModified] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [originalPrice, setOriginalPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [badge, setBadge] = useState("");
  const [rating, setRating] = useState<number | "">("");
  const [reviewsCount, setReviewsCount] = useState<number | "">("");
  const [image, setImage] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");

  // Placements & Badges
  const [isActive, setIsActive] = useState(true);
  const [isSuperDeal, setIsSuperDeal] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isTopPick, setIsTopPick] = useState(false);
  const [isClearance, setIsClearance] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);

  const { role } = useAdminSession();
  const isSystemAdmin = role === "super_admin";
  const qc = useQueryClient();

  // Specifications - no default values forced
  const [specBrand, setSpecBrand] = useState("");
  const [specCondition, setSpecCondition] = useState("");
  const [specSeller, setSpecSeller] = useState("");
  const [specWarranty, setSpecWarranty] = useState("");
  const [specDelivery, setSpecDelivery] = useState("");

  // UI status
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<
    "general" | "pricing" | "placements" | "media" | "specs"
  >("general");

  // Populate form whenever product changes or modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (product) {
      setId(product.id || "");
      setTitle(product.title || product.name || "");
      setSlug(product.slug || "");
      setCategoryId(
        product.category_id ||
          ((product as unknown as { category?: string }).category as string) ||
          ((product as unknown as { categoryId?: string }).categoryId as string) ||
          (categories[0]?.id ?? ""),
      );
      setPrice(Number(product.price) || 0);
      setOriginalPrice(
        product.original_price != null
          ? Number(product.original_price)
          : product.was_price != null
            ? Number(product.was_price)
            : "",
      );
      setStock(product.stock != null ? Number(product.stock) : 0);
      setBadge(product.badge || product.tag || "");
      setRating(product.rating != null ? Number(product.rating) : "");
      setReviewsCount(
        product.reviews_count != null
          ? Number(product.reviews_count)
          : product.reviews != null
            ? Number(product.reviews)
            : "",
      );
      setImage(
        product.image ||
          (product as unknown as { image_url?: string }).image_url ||
          DEFAULT_PLACEHOLDER_IMAGE,
      );
      setImages(Array.isArray(product.images) ? product.images : []);
      setShortDescription(product.short_description || product.spec || "");
      setDescription(product.description || "");

      setIsActive(product.is_active !== false);
      setIsSuperDeal(Boolean(product.is_super_deal ?? product.is_deal));
      setIsFeatured(Boolean(product.is_featured));
      setIsBestseller(Boolean(product.is_bestseller ?? product.is_best_seller));
      setIsNewArrival(Boolean(product.is_new ?? product.is_new_arrival));
      setIsTopPick(Boolean(product.is_top_pick));
      setIsClearance(Boolean(product.is_clearance));

      const specs = product.specifications || {};
      setSpecBrand(specs.brand || product.brand || "");
      setSpecCondition(specs.condition || product.condition || "Brand New");
      setSpecSeller(specs.seller || product.seller || "IA Dewealth Official Store");
      setSpecWarranty(specs.warranty || "12 Months Official Warranty");
      setSpecDelivery(specs.delivery || "Same-day Accra dispatch, 24-48h nationwide");
    } else {
      // New product: The admin creating the item must choose everything without forced defaults.
      // Uses a placeholder image graphic (not a real product photograph) and empty inputs.
      setId("");
      setTitle("");
      setSlug("");
      setIsSlugUserModified(false);
      setIsIdUserModified(false);
      setCategoryId(""); // Must be chosen by admin
      setPrice(""); // Must be entered by admin
      setOriginalPrice("");
      setStock(""); // Must be entered by admin
      setBadge("");
      setRating("");
      setReviewsCount("");
      setImage(DEFAULT_PLACEHOLDER_IMAGE); // Placeholder image instead of an actual photograph
      setImages([]);
      setShortDescription("");
      setDescription("");

      setIsActive(true);
      setIsSuperDeal(false);
      setIsFeatured(true);
      setIsBestseller(false);
      setIsNewArrival(true);
      setIsTopPick(false);
      setIsClearance(false);

      setSpecBrand("");
      setSpecCondition(""); // Must be chosen by admin
      setSpecSeller("");
      setSpecWarranty("");
      setSpecDelivery("");
    }
    setErrorMsg("");
  }, [isOpen, product, categories]);

  // Derive connected category object
  const connectedCategory = useMemo(() => {
    return categories.find((c) => c.id === categoryId) || null;
  }, [categories, categoryId]);

  // Derive matching banners connected to this category or deals
  const connectedBanners = useMemo(() => {
    if (!connectedCategory) return [];
    return banners.filter(
      (b) =>
        (b.cta_link && b.cta_link.includes(connectedCategory.slug)) ||
        (isSuperDeal && b.cta_link === "/deals"),
    );
  }, [banners, connectedCategory, isSuperDeal]);

  // Calculate discount percentage
  const discountPercent = useMemo(() => {
    const numPrice = typeof price === "number" ? price : 0;
    if (typeof originalPrice === "number" && originalPrice > numPrice && originalPrice > 0) {
      return Math.round(((originalPrice - numPrice) / originalPrice) * 100);
    }
    return 0;
  }, [price, originalPrice]);

  if (!isOpen) return null;

  async function handleSave() {
    if (!title.trim()) {
      setErrorMsg("Please enter a product title / name.");
      setActiveTab("general");
      return;
    }
    if (!categoryId.trim()) {
      setErrorMsg("Please select a category department. The category must be chosen by the admin.");
      setActiveTab("general");
      return;
    }
    if (price === "" || Number(price) < 0 || isNaN(Number(price))) {
      setErrorMsg("Please enter a valid selling price (e.g. 1500).");
      setActiveTab("pricing");
      return;
    }
    const finalId = id.trim() || generateSkuId(title, "SKU-IAD");
    if (!finalId) {
      setErrorMsg("Product ID / SKU is required.");
      setActiveTab("general");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    try {
      const generatedSlug = slug.trim() || generateProductSlug(title) || finalId;
      const finalPrice = Number(price);
      const finalStock = stock === "" ? 0 : Math.max(0, Number(stock));
      const finalRating = typeof rating === "number" ? rating : 4.8;
      const finalReviews = typeof reviewsCount === "number" ? reviewsCount : 0;
      const effectiveImage = image.trim() || DEFAULT_PLACEHOLDER_IMAGE;
      const effectiveImages =
        images.filter(Boolean).length > 0 ? images.filter(Boolean) : [effectiveImage];

      // If product ID changed, remove the old product entry
      if (product && product.id && product.id.trim() !== finalId) {
        deleteProduct(product.id.trim());
        try {
          await fetch(`/api/admin/products?id=${encodeURIComponent(product.id.trim())}`, {
            method: "DELETE",
          });
        } catch {
          // ignore
        }
        try {
          await supabase.from("products").delete().eq("id", product.id.trim());
        } catch {
          // ignore
        }
      }

      // 1. Immediately persist to local unified products store
      upsertProduct({
        id: finalId,
        title: title.trim(),
        name: title.trim(),
        slug: generatedSlug,
        categoryId: categoryId.trim(),
        category: categoryId.trim(),
        price: finalPrice,
        originalPrice:
          typeof originalPrice === "number" && originalPrice > 0 ? originalPrice : undefined,
        stock: finalStock,
        inStock: finalStock > 0,
        badge: badge.trim(),
        rating: finalRating,
        reviewsCount: finalReviews,
        image: effectiveImage,
        image_url: effectiveImage,
        images: effectiveImages,
        description: description.trim(),
        shortDescription: shortDescription.trim(),
        specifications: {
          brand: specBrand.trim(),
          seller: specSeller.trim() || "IA Dewealth Official Store",
          condition: specCondition.trim() || "Brand New",
          warranty: specWarranty.trim(),
          delivery: specDelivery.trim(),
        },
        isDeal: isSuperDeal,
        isFeatured: isFeatured,
        isBestseller: isBestseller,
        isNew: isNewArrival,
        addedAt: isSuperDeal || isNewArrival ? new Date().toISOString() : undefined,
      });

      // 2. Persist to Supabase products table via server API
      const productPayload = {
        id: finalId,
        title: title.trim(),
        name: title.trim(),
        slug: generatedSlug,
        category_id: categoryId.trim() || null,
        category: categoryId.trim() || null,
        price: finalPrice,
        original_price: typeof originalPrice === "number" ? originalPrice : finalPrice,
        originalPrice: typeof originalPrice === "number" ? originalPrice : finalPrice,
        was_price: typeof originalPrice === "number" ? originalPrice : finalPrice,
        stock: finalStock,
        badge: badge.trim(),
        rating: finalRating,
        reviews_count: finalReviews,
        image: effectiveImage,
        images: effectiveImages,
        short_description: shortDescription.trim(),
        description: description.trim(),
        brand: specBrand.trim(),
        seller: specSeller.trim() || "IA Dewealth Official Store",
        condition: specCondition.trim() || "Brand New",
        specifications: {
          brand: specBrand.trim(),
          seller: specSeller.trim() || "IA Dewealth Official Store",
          condition: specCondition.trim() || "Brand New",
          warranty: specWarranty.trim(),
          delivery: specDelivery.trim(),
          spec: shortDescription.trim(),
        },
        is_active: isActive,
        is_deal: isSuperDeal,
        is_super_deal: isSuperDeal,
        is_featured: isFeatured,
        is_best_seller: isBestseller,
        is_bestseller: isBestseller,
        is_new_arrival: isNewArrival,
        is_new: isNewArrival,
        is_top_pick: isTopPick,
        is_clearance: isClearance,
      };

      try {
        const apiRes = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productPayload),
        });

        if (!apiRes.ok) {
          const apiErr = await apiRes.json().catch(() => ({}));
          throw new Error(apiErr.error || `Server returned ${apiRes.status}`);
        }

        const apiData = await apiRes.json().catch(() => ({}));
        if (apiData.product) {
          // Keep local store strictly in sync with authoritative server data
          upsertProduct(apiData.product);
        }
      } catch (dbErr) {
        console.error("Product cloud save error:", dbErr);
        // Direct client fallback attempt
        try {
          await supabase.from("products").upsert({
            id: finalId,
            title: title.trim(),
            slug: generatedSlug,
            category_id: categoryId.trim() || null,
            price: finalPrice,
            original_price: typeof originalPrice === "number" ? originalPrice : finalPrice,
            stock: finalStock,
            badge: badge.trim(),
            rating: finalRating,
            reviews_count: finalReviews,
            image: effectiveImage,
            images: effectiveImages,
            short_description: shortDescription.trim(),
            description: description.trim(),
            is_active: isActive,
            is_super_deal: isSuperDeal,
            is_featured: isFeatured,
            is_bestseller: isBestseller,
            is_new: isNewArrival,
            is_top_pick: isTopPick,
            is_clearance: isClearance,
            specifications: {
              brand: specBrand.trim(),
              seller: specSeller.trim() || "IA Dewealth Official Store",
              condition: specCondition.trim() || "Brand New",
            },
            updated_at: new Date().toISOString(),
          });
        } catch {
          // continue
        }
      }

      qc.invalidateQueries({ queryKey: ["admin", "products-catalog"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard-v2"] });
      qc.invalidateQueries({ queryKey: ["storefront"] });

      await logActivity(
        isNew ? `Created new product: ${title}` : `Updated product card: ${title} (${finalId})`,
      );

      toast.success("✓ Product saved and synchronized across all devices!");
      onSaved();
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to save product. Check inputs and try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  function handleAddGalleryImage() {
    if (!newGalleryUrl.trim()) return;
    const splitUrls = newGalleryUrl
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
    if (splitUrls.length > 0) {
      setImages((prev) => [...prev, ...splitUrls]);
      setNewGalleryUrl("");
      toast.success(
        splitUrls.length === 1 ? "Added image URL!" : `Added ${splitUrls.length} image URLs!`,
      );
    }
  }

  async function handleGalleryFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    setIsUploadingGallery(true);
    setUploadProgressText(`Uploading ${files.length} image${files.length > 1 ? "s" : ""}...`);
    try {
      const uploadedUrls = await uploadMultipleImageFiles(files);
      if (uploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...uploadedUrls]);
        toast.success(
          uploadedUrls.length === 1
            ? "1 additional image uploaded!"
            : `${uploadedUrls.length} additional images uploaded successfully!`,
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image files";
      toast.error(msg);
    } finally {
      setIsUploadingGallery(false);
      setUploadProgressText("");
      e.target.value = "";
    }
  }

  async function handleGalleryDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingGallery(false);
    const droppedFiles = Array.from(e.dataTransfer.files || []).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (droppedFiles.length === 0) {
      toast.error("Please drop valid image files (PNG, JPG, WebP)");
      return;
    }
    setIsUploadingGallery(true);
    setUploadProgressText(
      `Uploading ${droppedFiles.length} image${droppedFiles.length > 1 ? "s" : ""}...`,
    );
    try {
      const uploadedUrls = await uploadMultipleImageFiles(droppedFiles);
      if (uploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...uploadedUrls]);
        toast.success(
          uploadedUrls.length === 1
            ? "1 additional image uploaded!"
            : `${uploadedUrls.length} additional images uploaded successfully!`,
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload dropped images";
      toast.error(msg);
    } finally {
      setIsUploadingGallery(false);
      setUploadProgressText("");
    }
  }

  function handleSetAsCover(index: number) {
    const selected = images[index];
    if (!selected) return;
    const oldPrimary = image;
    setImage(selected);
    setImages((prev) => {
      const remaining = prev.filter((_, i) => i !== index);
      return oldPrimary && !remaining.includes(oldPrimary) ? [oldPrimary, ...remaining] : remaining;
    });
    toast.success("Set as primary cover image!");
  }

  function handleMoveGalleryImage(index: number, direction: "left" | "right") {
    setImages((prev) => {
      const next = [...prev];
      const targetIdx = direction === "left" ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      const temp = next[index];
      next[index] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  }

  function handleRemoveGalleryImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 backdrop-blur-sm sm:p-4 md:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Sticky Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#00a884]/10 p-2 text-[#00a884]">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  {isNew ? "Create New Product" : "Edit Complete Product Card"}
                </h2>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-600">
                  {id || "new-item"}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connected live to storefront card, category departments, and promotional banners.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {!isNew && (
              <a
                href={`/product/${product?.id}`}
                target="_blank"
                rel="noreferrer"
                className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:inline-flex"
              >
                <span>Storefront View</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
              </a>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#00a884] px-4 py-2 text-xs font-bold text-white shadow-sm shadow-[#00a884]/25 transition hover:bg-[#009676] disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="flex items-center gap-2 bg-red-50 px-6 py-2.5 text-xs font-semibold text-red-700 border-b border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Body: Split 2-Column Layout */}
        <div className="flex flex-1 flex-col overflow-y-auto lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Real-Time Storefront Card & Connections     */}
          {/* ========================================================= */}
          <div className="w-full lg:w-[380px] shrink-0 bg-slate-50/60 p-5 space-y-5 overflow-y-auto">
            {/* Live Storefront Preview Card */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  LIVE STOREFRONT CARD
                </span>
                <span
                  className={`text-[11px] font-bold ${isActive ? "text-emerald-600" : "text-slate-400"}`}
                >
                  {isActive ? "Visible on Store" : "Hidden"}
                </span>
              </div>

              {/* Authentic Product Card Mirror */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                {/* Image Container with Badges */}
                <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                  {image ? (
                    <img
                      src={image}
                      alt={title || "Product image"}
                      className="h-full w-full object-cover object-center transition duration-300"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                      <ImageIcon className="h-12 w-12" />
                    </div>
                  )}

                  {/* Overlaid Badges */}
                  <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5 items-start">
                    {isSuperDeal && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
                        <Flame className="h-3 w-3" /> SUPER DEAL
                      </span>
                    )}
                    {discountPercent > 0 && (
                      <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
                        -{discountPercent}% OFF
                      </span>
                    )}
                    {badge && (
                      <span className="rounded-md bg-[#00a884] px-2 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
                        {badge}
                      </span>
                    )}
                  </div>

                  {/* Condition Tag */}
                  <div className="absolute right-2.5 top-2.5">
                    <span className="rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                      {specCondition}
                    </span>
                  </div>
                </div>

                {/* Card Info Details */}
                <div className="p-4 space-y-2">
                  {/* Category chip */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#00a884]">
                      {connectedCategory?.name || "General Catalog"}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        stock > 0 ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {stock > 0 ? `In Stock (${stock})` : "Out of Stock"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                    {title || "Untitled Product"}
                  </h3>

                  {/* Short spec highlight */}
                  {shortDescription && (
                    <p className="text-[11px] text-slate-500 line-clamp-1">{shortDescription}</p>
                  )}

                  {/* Price Row */}
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-base font-extrabold text-slate-900">
                      {cedi(price || 0)}
                    </span>
                    {typeof originalPrice === "number" && originalPrice > price && (
                      <span className="text-xs text-slate-400 line-through">
                        {cedi(originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* WhatsApp Inbound Button Simulator */}
                  <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-[#00a884] py-2 text-xs font-bold text-white shadow-xs">
                    <Phone className="h-3.5 w-3.5" />
                    <span>Order on WhatsApp</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Connected Category & Banner Section Details */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  CONNECTED CATEGORY
                </span>
                {connectedCategory && (
                  <a
                    href={`/category/${connectedCategory.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-[#00a884] hover:underline"
                  >
                    View Page ↗
                  </a>
                )}
              </div>

              {connectedCategory ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-slate-100 p-1.5 text-slate-700">
                      <FolderTree className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{connectedCategory.name}</p>
                      <p className="font-mono text-[10px] text-slate-400">
                        /category/{connectedCategory.slug}
                      </p>
                    </div>
                  </div>

                  {connectedCategory.banner_image && (
                    <div className="overflow-hidden rounded-lg border border-slate-200">
                      <div className="relative h-16 w-full bg-slate-100">
                        <img
                          src={connectedCategory.banner_image}
                          alt={connectedCategory.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center p-2.5">
                          <p className="text-[11px] font-bold text-white line-clamp-1">
                            {connectedCategory.banner_title || connectedCategory.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="text-[10.5px] text-slate-500">
                    Customers visiting the {connectedCategory.name} category page see this product
                    in its department listing.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No category assigned yet.</p>
              )}
            </div>

            {/* Connected Promotional Banner Section */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                PROMOTIONAL SECTION LINK
              </span>

              {connectedBanners.length > 0 ? (
                <div className="space-y-2">
                  {connectedBanners.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50 p-2 text-xs"
                    >
                      {b.image_url && (
                        <img
                          src={b.image_url}
                          alt={b.title}
                          className="h-10 w-12 rounded object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-800 line-clamp-1">{b.title}</p>
                        <p className="text-[10px] text-slate-400">
                          {b.badge || "Homepage Banner"} · Links to {b.cta_link}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-500">
                  <p className="font-medium">Direct Placement Active</p>
                  <p className="mt-0.5 text-[10.5px] text-slate-400">
                    {isSuperDeal
                      ? "Wired into the Super Deals section & deals carousel."
                      : isFeatured
                        ? "Featured in the main homepage hero showcase."
                        : "Listed in standard category department and catalog search."}
                  </p>
                </div>
              )}
            </div>

            {/* WhatsApp Order Inquiry Text Simulator */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                WHATSAPP ORDER MESSAGE PREVIEW
              </span>
              <div className="rounded-lg bg-[#e7f7ed] p-2.5 font-mono text-[10.5px] text-[#0b4d3c] leading-relaxed">
                Hello I.A Dewealth! I'm interested in ordering "{title || "this product"}" (
                {cedi(price || 0)}). Please confirm availability and delivery in Accra.
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Full Details Editor Tabs & Fields           */}
          {/* ========================================================= */}
          <div className="flex-1 p-5 sm:p-6 space-y-6 overflow-y-auto">
            {/* Top Navigation Tabs */}
            <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-3">
              {[
                { id: "general", label: "General & Identity", icon: Package },
                { id: "pricing", label: "Pricing & Stock", icon: DollarSign },
                { id: "placements", label: "Promotions & Badges", icon: Flame },
                { id: "media", label: "Images & Gallery", icon: ImageIcon },
                { id: "specs", label: "Specifications", icon: Sliders },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    activeTab === tab.id
                      ? "bg-[#00a884] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB 1: General & Identity */}
            {activeTab === "general" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setTitle(newTitle);
                      if (!isSlugUserModified) {
                        setSlug(generateProductSlug(newTitle));
                      }
                      if (isNew && !isIdUserModified) {
                        setId(generateSkuId(newTitle, "SKU-IAD"));
                      }
                    }}
                    placeholder="e.g. Nova X9 Pro 5G 256GB Smartphone"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20 focus:outline-hidden"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700">
                        Product ID / SKU <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const newId = generateSkuId(title, "SKU-IAD");
                          setId(newId);
                          setIsIdUserModified(false);
                          toast.success(`Generated SKU: ${newId}`);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00a884] hover:text-[#009676] cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3" /> Auto Generate
                      </button>
                    </div>
                    <input
                      type="text"
                      value={id}
                      disabled={!isNew}
                      onChange={(e) => {
                        setId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""));
                        setIsIdUserModified(true);
                      }}
                      placeholder="e.g. SKU-IAD-NOVA-8X2"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-mono text-slate-800 disabled:bg-slate-100 disabled:text-slate-500"
                    />
                    <p className="mt-1 text-[10px] text-slate-400">
                      Unique identifier used in database and inventory URLs.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      Category Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className={`mt-1.5 w-full rounded-xl border px-3.5 py-2 text-xs font-bold focus:border-[#00a884] focus:outline-hidden ${
                        !categoryId
                          ? "border-amber-300 bg-amber-50/50 text-slate-500"
                          : "border-slate-200 bg-white text-slate-800"
                      }`}
                    >
                      <option value="">-- Select Category Department (Required) --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.slug})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Primary Product Photo with Direct Device Upload & URL Preview */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
                  <ImageUploadInput
                    label="Product Image (Main Photo on Cards & Storefront)"
                    value={image}
                    onChange={(newUrl) => {
                      setImage(newUrl);
                      setImages((prev) => (prev.length ? [newUrl, ...prev.slice(1)] : [newUrl]));
                    }}
                    placeholder="Paste image URL (https://...) or upload directly from device"
                    helperText="Upload or paste image. Supports PNG, JPG, WebP. Displayed on catalog cards and product details."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Short Specification Highlight (Shown on Cards)
                  </label>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder='e.g. 6.7" AMOLED 120Hz • 50MP OIS Camera • 5000mAh'
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-[#00a884] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Full Description & Feature Overview
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide full description, specifications, in-box contents, and warranty details..."
                    className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-xs leading-relaxed text-slate-800 focus:border-[#00a884] focus:outline-hidden"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700">SEO URL Slug</label>
                      <button
                        type="button"
                        onClick={() => {
                          const generated = generateProductSlug(title || id);
                          setSlug(generated);
                          setIsSlugUserModified(false);
                          toast.success(`Generated Slug: ${generated}`);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00a884] hover:text-[#009676] cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3" /> Auto Generate
                      </button>
                    </div>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value);
                        setIsSlugUserModified(true);
                      }}
                      placeholder="e.g. nova-x9-pro-5g-smartphone"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-mono text-slate-800 focus:border-[#00a884] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      Hardware Condition
                    </label>
                    <select
                      value={specCondition}
                      onChange={(e) => setSpecCondition(e.target.value)}
                      className={`mt-1.5 w-full rounded-xl border px-3.5 py-2 text-xs font-bold ${
                        !specCondition
                          ? "border-amber-300 bg-amber-50/50 text-slate-500"
                          : "border-slate-200 bg-white text-slate-800"
                      }`}
                    >
                      <option value="">-- Choose Condition --</option>
                      <option value="Brand New">Brand New (Sealed)</option>
                      <option value="Refurbished">Refurbished (Certified Grade A)</option>
                      <option value="Used">Used (Foreign Direct Import)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Pricing & Stock */}
            {activeTab === "pricing" && (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                    <label className="block text-xs font-extrabold text-slate-800">
                      Selling Price (Ghana Cedis GHS) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                        GHS
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={price}
                        onChange={(e) =>
                          setPrice(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        placeholder="Enter selling price (e.g. 1500)"
                        className="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-3.5 py-2 text-sm font-black text-slate-900 focus:border-[#00a884] focus:outline-hidden"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Active price charged to customers in store and WhatsApp.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                    <label className="block text-xs font-extrabold text-slate-800">
                      Original / Was Price (Strike-through)
                    </label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                        GHS
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={originalPrice}
                        onChange={(e) =>
                          setOriginalPrice(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        placeholder="Optional regular price"
                        className="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-[#00a884] focus:outline-hidden"
                      />
                    </div>
                    {discountPercent > 0 && (
                      <p className="mt-1 text-[11px] font-bold text-amber-600">
                        Shows -{discountPercent}% OFF badge on storefront card!
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <label className="block text-xs font-bold text-slate-800">
                      Inventory Units in Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) =>
                        setStock(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="e.g. 10"
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-bold text-slate-900"
                    />
                    <p className="mt-1 text-[10.5px] text-slate-400">
                      When set to 0, product shows 'Out of Stock'.
                    </p>
                  </div>

                  <div className="flex flex-col justify-between rounded-xl border border-slate-200 p-4">
                    <div>
                      <span className="block text-xs font-bold text-slate-800">
                        Storefront Visibility
                      </span>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Control whether this item is publicly discoverable and purchasable.
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">
                        {isActive ? "Active on Storefront" : "Hidden (Draft)"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsActive(!isActive)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                          isActive ? "bg-[#00a884]" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            isActive ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Placements & Badges */}
            {activeTab === "placements" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Select which promotional sections, feeds, and banners this product is linked to.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Super Deal */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-red-300 hover:bg-red-50/30">
                    <input
                      type="checkbox"
                      checked={isSuperDeal}
                      onChange={(e) => setIsSuperDeal(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900">Super Deals Section</span>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Places product into the homepage Deals carousel and super deal banners.
                      </p>
                    </div>
                  </label>

                  {/* Homepage Featured */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-blue-300 hover:bg-blue-50/30">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900">Homepage Featured</span>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Shows in prime featured showcase below hero banners.
                      </p>
                    </div>
                  </label>

                  {/* Best Seller */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-amber-300 hover:bg-amber-50/30">
                    <input
                      type="checkbox"
                      checked={isBestseller}
                      onChange={(e) => setIsBestseller(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900">Bestseller Spotlight</span>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Highlights product with Best Seller status tag.
                      </p>
                    </div>
                  </label>

                  {/* New Arrival */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-emerald-300 hover:bg-emerald-50/30">
                    <input
                      type="checkbox"
                      checked={isNewArrival}
                      onChange={(e) => setIsNewArrival(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900">New Arrival</span>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Tagged as freshly imported catalog inventory.
                      </p>
                    </div>
                  </label>

                  {/* Top Pick */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-purple-300 hover:bg-purple-50/30">
                    <input
                      type="checkbox"
                      checked={isTopPick}
                      onChange={(e) => setIsTopPick(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900">Editor's Top Pick</span>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Curated recommendation in category sidebars.
                      </p>
                    </div>
                  </label>

                  {/* Clearance */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-rose-300 hover:bg-rose-50/30">
                    <input
                      type="checkbox"
                      checked={isClearance}
                      onChange={(e) => setIsClearance(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900">Clearance Section</span>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Marked down stock clearance deal.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Custom Promotional Badge (Pill on Card)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Accra Same-Day Dispatch, Free Screen Protector, Ghana Registered"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: Media & Image Gallery */}
            {activeTab === "media" && (
              <div className="space-y-5">
                {/* Primary Image with Upload & URL Support */}
                <ImageUploadInput
                  label="Primary Image"
                  value={image}
                  onChange={setImage}
                  placeholder="Paste image URL or click upload button..."
                  helperText="Recommended size: 800x800px square product photo. Supports file upload (PNG, JPG, WebP) or direct image URL."
                />

                {/* Quick Presets Picker - ONLY System Admin can see */}
                {isSystemAdmin && (
                  <div>
                    <span className="text-xs font-bold text-slate-700">
                      Quick Preset Assets (System Admin Only)
                    </span>
                    <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {IMAGE_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setImage(preset.url)}
                          className={`flex flex-col items-center rounded-xl border p-2 text-center transition ${
                            image === preset.url
                              ? "border-[#00a884] bg-[#00a884]/10"
                              : "border-slate-200 bg-slate-50 hover:bg-white"
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                          <span className="mt-1 text-[10px] font-bold text-slate-700 line-clamp-1">
                            {preset.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gallery Images Array with Multi-Upload and URL option */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold text-slate-700">
                        Additional Gallery Images ({images.length})
                      </label>
                      <p className="text-[11px] text-slate-400">
                        These appear in the product page thumbnail gallery. You can select multiple
                        image files at once or paste URLs.
                      </p>
                    </div>
                    {images.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Remove all additional gallery images?")) {
                            setImages([]);
                          }
                        }}
                        className="text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Multi-File Drag & Drop Area */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingGallery(true);
                    }}
                    onDragLeave={() => setIsDraggingGallery(false)}
                    onDrop={handleGalleryDrop}
                    className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition ${
                      isDraggingGallery
                        ? "border-emerald-500 bg-emerald-50/70"
                        : "border-slate-300 bg-slate-50/50 hover:border-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-2 shadow-xs">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      Drag & Drop Multiple Images Here
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm">
                      Select multiple images at once (PNG, JPG, WebP). Files are automatically
                      optimized for maximum speed.
                    </p>

                    <label className="mt-3 inline-flex items-center gap-2 cursor-pointer rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm">
                      <Upload className="h-3.5 w-3.5" />
                      <span>
                        {isUploadingGallery
                          ? uploadProgressText || "Uploading..."
                          : "Upload Multiple Images"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        disabled={isUploadingGallery}
                        onChange={handleGalleryFileUpload}
                      />
                    </label>
                  </div>

                  {/* Add URL input (supports multiple comma/newline separated URLs) */}
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      value={newGalleryUrl}
                      onChange={(e) => setNewGalleryUrl(e.target.value)}
                      placeholder="Or paste image URL(s) - separate multiples with commas"
                      className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddGalleryImage}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#00a884] px-4 py-2 text-xs font-bold text-white hover:bg-[#008f70] transition shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add URL
                    </button>
                  </div>

                  {/* Gallery Items Grid with Reorder, Set as Cover, and Delete */}
                  {images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {images.map((imgUrl, i) => (
                        <div
                          key={`${imgUrl}-${i}`}
                          className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xs"
                        >
                          <img
                            src={imgUrl}
                            alt={`Gallery item ${i + 1}`}
                            className="h-full w-full object-cover object-center transition duration-200 group-hover:scale-105"
                          />

                          {/* Index Badge */}
                          <span className="absolute left-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-extrabold text-white backdrop-blur-xs">
                            #{i + 1}
                          </span>

                          {/* Action Overlay */}
                          <div className="absolute inset-0 flex flex-col justify-between bg-black/40 p-1.5 opacity-0 transition group-hover:opacity-100">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleSetAsCover(i)}
                                title="Set as primary cover image"
                                aria-label="Set as primary cover image"
                                className="rounded-lg bg-amber-500/90 p-1.5 text-white hover:bg-amber-600 transition shadow-xs"
                              >
                                <Star className="h-3.5 w-3.5 fill-white" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(i)}
                                title="Remove image"
                                aria-label="Remove image"
                                className="rounded-lg bg-red-600/90 p-1.5 text-white hover:bg-red-700 transition shadow-xs"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* Reorder Buttons */}
                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                disabled={i === 0}
                                onClick={() => handleMoveGalleryImage(i, "left")}
                                title="Move left"
                                className="rounded-md bg-white/80 p-1 text-slate-800 hover:bg-white disabled:opacity-30 transition"
                              >
                                <ArrowLeft className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                disabled={i === images.length - 1}
                                onClick={() => handleMoveGalleryImage(i, "right")}
                                title="Move right"
                                className="rounded-md bg-white/80 p-1 text-slate-800 hover:bg-white disabled:opacity-30 transition"
                              >
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: Technical Specifications */}
            {activeTab === "specs" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Structured metadata displayed in the "Specifications & Verification" tab of the
                  product page.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">Brand Name</label>
                    <input
                      type="text"
                      value={specBrand}
                      onChange={(e) => setSpecBrand(e.target.value)}
                      placeholder="e.g. Apple, Samsung, Toyota, Sony, HP"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      Verified Seller
                    </label>
                    <input
                      type="text"
                      value={specSeller}
                      onChange={(e) => setSpecSeller(e.target.value)}
                      placeholder="e.g. IA Dewealth Official Store"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      Warranty Coverage
                    </label>
                    <input
                      type="text"
                      value={specWarranty}
                      onChange={(e) => setSpecWarranty(e.target.value)}
                      placeholder="e.g. 12 Months Official Warranty"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      Delivery Timeline
                    </label>
                    <input
                      type="text"
                      value={specDelivery}
                      onChange={(e) => setSpecDelivery(e.target.value)}
                      placeholder="e.g. Same-day Accra dispatch, 24-48h nationwide"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-slate-50/80 px-5 py-3.5 sm:px-6">
          <div>
            {!isNew && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to permanently delete "${title}"?`)) {
                    onDelete(product.id);
                  }
                }}
                className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Product
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#00a884] px-5 py-2 text-xs font-bold text-white shadow-sm shadow-[#00a884]/25 transition hover:bg-[#009676] disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>{isNew ? "Create Product" : "Save All Changes"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
