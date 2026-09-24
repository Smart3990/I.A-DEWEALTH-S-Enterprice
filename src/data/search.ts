import { byId, catalogProducts, type CatalogProduct } from "./catalog";
import { getAllProducts } from "./products-store";

/** Keyword search across product name, spec, brand and category name. */
export function searchCatalog(
  query: string,
  limit = 8,
  customPool?: CatalogProduct[],
): CatalogProduct[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];

  let combined: CatalogProduct[] = [];
  if (customPool && customPool.length > 0) {
    combined = customPool;
  } else {
    // Combine static catalog products with dynamically added store products
    const fromCatalog = catalogProducts;
    const fromStore = getAllProducts().map((p) => ({
      id: p.id,
      name: p.title || p.name || "",
      price: Number(p.price),
      was: Number(p.originalPrice || p.was || p.price),
      rating: Number(p.rating || 4.8),
      reviews: Number(p.reviewsCount || p.reviews || 10),
      sold: Number(p.sold || 5),
      tag: p.badge || p.tag || "",
      image: p.image || p.image_url || (Array.isArray(p.images) ? p.images[0] : "") || "",
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : p.image ? [p.image] : [],
      spec: p.shortDescription || p.spec || "",
      addedAt: p.addedAt || new Date().toISOString(),
      condition: (p.condition || "Brand New") as CatalogProduct["condition"],
      availability: (p.availability || "In Stock") as CatalogProduct["availability"],
      seller: p.seller || "IA Dewealth Official Store",
      categoryId: p.category || p.categoryId || "mobile-phones",
      brand: p.brand || "",
      description: p.description || "",
      sku: p.id,
      stock: p.stock || 10,
    }));

    const map = new Map<string, CatalogProduct>();
    fromCatalog.forEach((p) => map.set(p.id, p));
    fromStore.forEach((p) => map.set(p.id, p as CatalogProduct));
    combined = Array.from(map.values());
  }

  const scored = combined
    .map((p) => {
      const category = byId(p.categoryId)?.name ?? "";
      const haystack = `${p.name} ${p.brand} ${p.spec} ${p.tag} ${category}`.toLowerCase();
      // Match at word starts so "gan" doesn't match "organiser".
      const matched = terms.every((t) =>
        new RegExp(`(^|[^a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(haystack),
      );

      if (!matched) return null;
      const startsWith = p.name.toLowerCase().startsWith(terms[0]!) ? 2 : 0;
      const inName = terms.every((t) => p.name.toLowerCase().includes(t)) ? 1 : 0;
      return { p, score: startsWith + inName };
    })
    .filter((x): x is { p: CatalogProduct; score: number } => x !== null)
    .sort((a, b) => b.score - a.score || b.p.sold - a.p.sold);

  return scored.slice(0, limit).map((x) => x.p);
}
