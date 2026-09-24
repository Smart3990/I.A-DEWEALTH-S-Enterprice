import { catalogProducts, type CatalogProduct, applyCatalogSnapshot } from "./catalog";

export interface AdminProduct extends CatalogProduct {
  category: string;
  stock: number;
  title?: string;
  originalPrice?: number;
  badge?: string;
  shortDescription?: string;
  isDeal?: boolean;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isNew?: boolean;
  inStock?: boolean;
  reviewsCount?: number;
  image_url?: string;
  slug?: string;
  specifications?: Record<string, unknown>;
  updatedAt?: string;
  updated_at?: string;
}

export const STORAGE_KEY = "ia_admin_products";
export const DELETED_PRODUCTS_KEY = "ia_deleted_product_ids";
export const EVENT_KEY = "ia_products_updated";

const LEGACY_OLD_PRODUCT_IDS = new Set([
  "ge1",
  "ge2",
  "ge3",
  "ge4",
  "ge5",
  "ge6",
  "ge7",
  "ge8",
  "ge9",
  "ge10",
  "ge11",
  "ge12",
  "ge13",
  "ge14",
  "p1",
  "p2",
  "p3",
  "p4",
  "p5",
  "p6",
  "p7",
  "p8",
  "p9",
  "p10",
  "p11",
  "p12",
  "g1",
  "g2",
  "g3",
  "g4",
  "l1",
  "l2",
  "l3",
  "l4",
  "k1",
  "k2",
  "k3",
  "k4",
  "w1",
  "w2",
  "w3",
  "w4",
  "a1",
  "a2",
  "a3",
  "a4",
  "ka1",
  "ka2",
  "ka3",
  "ka4",
  "ac1",
  "ac2",
  "c-suv-glc",
  "c-sed-camry",
  "c-pick-ranger",
  "c-ev-tesla",
  "c-lux-macan",
  "c-coupe-bmw",
  "car1",
  "car2",
  "car3",
  "car4",
  "car5",
  "car6",
  "d1",
  "d2",
  "d3",
  "d4",
  "d5",
  "d6",
]);

/**
 * Identifies legacy dummy/seed products so they are excluded.
 * Only matches the exact fixed set of legacy seed fixtures.
 * Any new product created by the admin will NEVER be matched.
 */
export function isLegacyOldProduct(id?: string, _name?: string): boolean {
  if (!id) return false;
  return LEGACY_OLD_PRODUCT_IDS.has(id.trim());
}

export function getDeletedProductIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DELETED_PRODUCTS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function markProductDeleted(id: string): void {
  if (typeof window === "undefined" || !id) return;
  try {
    const set = getDeletedProductIds();
    set.add(id);
    localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error("Failed to persist deleted product id:", e);
  }
}

export function unmarkProductDeleted(id: string): void {
  if (typeof window === "undefined" || !id) return;
  try {
    const set = getDeletedProductIds();
    set.delete(id);
    localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error("Failed to unmark deleted product id:", e);
  }
}

export function adminProductToCatalogProduct(p: AdminProduct): CatalogProduct {
  const img = p.image || p.image_url || (Array.isArray(p.images) && p.images[0]) || "";
  const numPrice = Number(p.price) || 0;
  const wasPrice = Number(p.originalPrice ?? p.was ?? numPrice);
  const stockVal = typeof p.stock === "number" ? p.stock : 10;
  return {
    id: p.id,
    name: p.title || p.name || "Product",
    image: img,
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : img ? [img] : [],
    price: numPrice,
    was: wasPrice,
    rating: Number(p.rating || 4.8),
    reviews: Number(p.reviewsCount ?? p.reviews ?? 10),
    sold: Number(p.sold || 0),
    tag: p.badge || p.tag || "",
    spec: p.shortDescription || p.spec || "",
    categoryId: p.categoryId || p.category || "mobile-phones",
    brand: p.brand || (p.specifications?.brand as string) || "",
    condition: (p.condition || "Brand New") as CatalogProduct["condition"],
    availability: (stockVal > 0 ? "In Stock" : "Out of Stock") as CatalogProduct["availability"],
    seller: p.seller || "IA Dewealth Official Store",
    addedAt: p.addedAt || p.updatedAt || p.updated_at || new Date().toISOString(),
    topPick: Boolean(p.topPick),
    clearance: Boolean(p.clearance),
    featured: Boolean(p.isFeatured ?? p.featured),
    newArrival: Boolean(p.isNew ?? p.newArrival),
    bestSeller: Boolean(p.isBestseller ?? p.bestSeller),
    deal: Boolean(p.isDeal ?? p.deal),
    description: p.description || "",
    sku: p.id,
    stock: stockVal,
  };
}

function getDefaultProducts(): AdminProduct[] {
  return [];
}

export function getAllProducts(): AdminProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const deleted = getDeletedProductIds();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    const list: AdminProduct[] = Array.isArray(parsed) ? parsed : [];
    const sanitized = list.filter(
      (p) => !deleted.has(p.id) && !isLegacyOldProduct(p.id, p.title || p.name),
    );
    // Persist sanitized collection so stale old products are permanently purged from browser
    if (sanitized.length !== list.length) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
      } catch {
        // ignore
      }
    }
    return sanitized;
  } catch (e) {
    console.error("Failed to load products from storage:", e);
    return [];
  }
}

/** Merges base catalog products with any local admin products (cloud Supabase products take precedence) */
export function getCombinedCatalogProducts(
  base: CatalogProduct[] = catalogProducts,
): CatalogProduct[] {
  const deleted = getDeletedProductIds();
  const map = new Map<string, CatalogProduct>();

  // 1. Add authoritative base products (from Supabase cloud or modern catalog snapshot)
  base.forEach((p) => {
    if (!deleted.has(p.id) && !isLegacyOldProduct(p.id, p.name)) {
      map.set(p.id, p);
    }
  });

  // 2. Layer any client-side created products that are not old legacy items and not already in cloud
  if (typeof window !== "undefined") {
    try {
      const local = getAllProducts();
      local.forEach((lp) => {
        if (!deleted.has(lp.id) && !isLegacyOldProduct(lp.id, lp.title || lp.name)) {
          if (!map.has(lp.id)) {
            map.set(lp.id, adminProductToCatalogProduct(lp));
          }
        }
      });
    } catch {
      // fallback
    }
  }

  return Array.from(map.values()).filter(
    (p) => !deleted.has(p.id) && !isLegacyOldProduct(p.id, p.name),
  );
}

export function saveProducts(products: AdminProduct[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    try {
      applyCatalogSnapshot([], getCombinedCatalogProducts());
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event(EVENT_KEY));
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: { products } }));
  } catch (e) {
    console.error("Failed to save products to storage:", e);
  }
}

export function updateProductStock(id: string, newStock: number): void {
  const current = getAllProducts();
  const validStock = Math.max(0, newStock);
  const updated = current.map((p) =>
    p.id === id ? { ...p, stock: validStock, inStock: validStock > 0 } : p,
  );
  saveProducts(updated);

  if (typeof window !== "undefined") {
    fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, stock: validStock, in_stock: validStock > 0 }),
    }).catch(() => {});
  }
}

export function updateProductCategory(id: string, newCategoryId: string): void {
  const current = getAllProducts();
  const updated = current.map((p) =>
    p.id === id ? { ...p, category: newCategoryId, categoryId: newCategoryId } : p,
  );
  saveProducts(updated);

  if (typeof window !== "undefined") {
    fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, category_id: newCategoryId }),
    }).catch(() => {});
  }
}

export function deleteProduct(id: string): void {
  deleteMultipleProducts([id]);
}

export function deleteMultipleProducts(ids: string[]): void {
  if (!ids || ids.length === 0) return;
  ids.forEach((id) => markProductDeleted(id));

  const toRemove = new Set(ids);
  const current = getAllProducts();
  const updated = current.filter((p) => !toRemove.has(p.id));
  saveProducts(updated);

  if (typeof window !== "undefined") {
    fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    }).catch(() => {});
  }
}

export function upsertProduct(product: Partial<AdminProduct> & { id: string }): AdminProduct[] {
  const targetId = (product.id || "").trim();
  if (targetId) {
    unmarkProductDeleted(targetId);
  }
  const current = getAllProducts();
  const index = current.findIndex(
    (p) => p.id === targetId || (p.id && p.id.toLowerCase() === targetId.toLowerCase()),
  );
  let updated: AdminProduct[];

  const titleVal = product.name || product.title || "Product";
  const imageVal = product.image || product.image_url || "";
  const priceVal = Number(product.price) || 0;
  const wasVal = Number(product.originalPrice ?? product.was ?? priceVal);
  const catVal = product.categoryId || product.category || "mobile-phones";
  const stockVal = Number(product.stock ?? 10);
  const specVal = product.spec || product.shortDescription || "";
  const tagVal = product.tag || product.badge || "Accra Same-Day Dispatch";
  const now = new Date().toISOString();

  if (index >= 0) {
    const existing = current[index];
    const merged: AdminProduct = {
      ...existing,
      ...product,
      id: targetId || existing.id,
      name: titleVal,
      title: titleVal,
      price: priceVal,
      was: wasVal,
      originalPrice: wasVal,
      categoryId: catVal,
      category: catVal,
      stock: stockVal,
      inStock: stockVal > 0,
      image: imageVal || existing.image,
      image_url: imageVal || existing.image,
      images: product.images && product.images.length > 0 ? product.images : existing.images || [],
      spec: specVal || existing.spec,
      shortDescription: specVal || existing.shortDescription || existing.spec,
      description:
        product.description !== undefined ? product.description : existing.description || "",
      specifications: product.specifications || existing.specifications || {},
      slug: product.slug || existing.slug || targetId,
      tag: tagVal || existing.tag,
      badge: tagVal || existing.badge || existing.tag,
      rating: Number(product.rating ?? existing.rating ?? 4.8),
      reviews: Number(product.reviews ?? product.reviewsCount ?? existing.reviews ?? 12),
      reviewsCount: Number(product.reviewsCount ?? product.reviews ?? existing.reviewsCount ?? 12),
      deal: product.deal ?? product.isDeal ?? existing.deal,
      isDeal: product.deal ?? product.isDeal ?? existing.isDeal,
      featured: product.featured ?? product.isFeatured ?? existing.featured,
      isFeatured: product.featured ?? product.isFeatured ?? existing.isFeatured,
      bestSeller: product.bestSeller ?? product.isBestseller ?? existing.bestSeller,
      isBestseller: product.bestSeller ?? product.isBestseller ?? existing.isBestseller,
      newArrival: product.newArrival ?? product.isNew ?? existing.newArrival,
      isNew: product.newArrival ?? product.isNew ?? existing.isNew,
      condition: product.condition || existing.condition || "Brand New",
      availability: stockVal > 0 ? "In Stock" : "Out of Stock",
      seller: product.seller || existing.seller || "IA Dewealth Official Store",
      addedAt:
        Boolean(product.deal || product.isDeal || product.newArrival || product.isNew) &&
        !existing.deal &&
        !existing.isDeal &&
        !existing.newArrival &&
        !existing.isNew
          ? now
          : product.addedAt || existing.addedAt || now,
      updatedAt: now,
      updated_at: now,
    };
    updated = [merged, ...current.filter((_, i) => i !== index)];
  } else {
    const newProduct: AdminProduct = {
      id: targetId,
      name: titleVal,
      title: titleVal,
      price: priceVal,
      was: wasVal,
      originalPrice: wasVal,
      categoryId: catVal,
      category: catVal,
      image: imageVal,
      image_url: imageVal,
      images: product.images || [],
      rating: Number(product.rating) || 4.8,
      reviewsCount: Number(product.reviewsCount ?? product.reviews) || 12,
      reviews: Number(product.reviews ?? product.reviewsCount) || 12,
      sold: product.sold || 0,
      tag: tagVal,
      badge: tagVal,
      spec: specVal,
      shortDescription: specVal,
      slug: product.slug || targetId,
      description: product.description || "",
      specifications: product.specifications || {},
      stock: stockVal,
      inStock: stockVal > 0,
      deal: product.deal ?? product.isDeal ?? false,
      isDeal: product.deal ?? product.isDeal ?? false,
      featured: product.featured ?? product.isFeatured ?? true,
      isFeatured: product.featured ?? product.isFeatured ?? true,
      bestSeller: product.bestSeller ?? product.isBestseller ?? false,
      isBestseller: product.bestSeller ?? product.isBestseller ?? false,
      newArrival: product.newArrival ?? product.isNew ?? true,
      isNew: product.newArrival ?? product.isNew ?? true,
      condition: (product.condition as "Brand New" | "Fairly Used" | "Refurbished") || "Brand New",
      availability: stockVal > 0 ? "In Stock" : "Out of Stock",
      seller: product.seller || "IA Dewealth Official Store",
      addedAt: product.addedAt || now,
      updatedAt: now,
      updated_at: now,
    };
    updated = [newProduct, ...current];
  }

  saveProducts(updated);
  return updated;
}

/**
 * Permanently clears all products from the catalog.
 * CRITICAL: Leaves all category banners, hero banners, and site configs completely UNTOUCHED.
 */
export function clearAllProductsPermanently(): void {
  if (typeof window === "undefined") return;
  try {
    // 1. Collect all known product IDs from bundled catalogue + local stores
    const allIds = new Set<string>();
    catalogProducts.forEach((p) => allIds.add(p.id));
    getAllProducts().forEach((p) => allIds.add(p.id));

    // 2. Mark all products as permanently deleted
    const deleted = getDeletedProductIds();
    allIds.forEach((id) => deleted.add(id));
    localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(Array.from(deleted)));

    // 3. Clear local admin products store
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));

    // 4. Clear catalog products in-memory snapshot while strictly preserving all categories
    try {
      applyCatalogSnapshot([], []);
    } catch {
      // ignore
    }

    // 5. Broadcast update event so all UI hooks reflect empty products immediately
    window.dispatchEvent(new Event(EVENT_KEY));
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: { products: [] } }));

    // 6. Dispatch API deletion request in background
    fetch("/api/admin/products?id=all", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "all", all: true }),
    }).catch(() => {});
  } catch (e) {
    console.error("Failed to clear all products permanently:", e);
  }
}
