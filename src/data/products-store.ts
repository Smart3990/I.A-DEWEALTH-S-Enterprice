import { catalogProducts, type CatalogProduct } from "./catalog";

export interface AdminProduct extends CatalogProduct {
  category: string;
  stock: number;
}

const STORAGE_KEY = "ia_admin_products";
const EVENT_KEY = "ia_products_updated";

function getDefaultProducts(): AdminProduct[] {
  return catalogProducts.map((p, idx) => ({
    ...p,
    category: p.categoryId,
    stock: p.stock ?? (idx % 7 === 0 ? 3 : idx % 5 === 0 ? 6 : 18 + (idx % 25)),
  }));
}

export function getAllProducts(): AdminProduct[] {
  if (typeof window === "undefined") return getDefaultProducts();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaults = getDefaultProducts();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getDefaultProducts();
  } catch (e) {
    console.error("Failed to load products from storage:", e);
    return getDefaultProducts();
  }
}

export function saveProducts(products: AdminProduct[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event(EVENT_KEY));
  } catch (e) {
    console.error("Failed to save products to storage:", e);
  }
}

export function updateProductStock(id: string, newStock: number): void {
  const current = getAllProducts();
  const updated = current.map((p) => (p.id === id ? { ...p, stock: Math.max(0, newStock) } : p));
  saveProducts(updated);
}

export function updateProductCategory(id: string, newCategoryId: string): void {
  const current = getAllProducts();
  const updated = current.map((p) =>
    p.id === id ? { ...p, category: newCategoryId, categoryId: newCategoryId } : p,
  );
  saveProducts(updated);
}

export function deleteProduct(id: string): void {
  const current = getAllProducts();
  const updated = current.filter((p) => p.id !== id);
  saveProducts(updated);
}
