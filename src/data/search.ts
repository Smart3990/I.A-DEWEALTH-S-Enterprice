import { byId, catalogProducts, type CatalogProduct } from "./catalog";

/** Keyword search across product name, spec, brand and category name. */
export function searchCatalog(query: string, limit = 8): CatalogProduct[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];

  const scored = catalogProducts
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
