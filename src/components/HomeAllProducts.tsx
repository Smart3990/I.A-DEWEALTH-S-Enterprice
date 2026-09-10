import { useMemo, useState } from "react";
import { catalogProducts } from "@/data/catalog";
import { CatalogProductCard } from "@/components/catalog/ProductCard";

const PAGE_SIZE = 12;

export function HomeAllProducts() {
  // Deterministic shuffle so every category's products are mixed together.
  const mixed = useMemo(
    () =>
      catalogProducts
        .map((p, i) => ({ p, k: ((i + 1) * 2654435761) % 100003 }))
        .sort((a, b) => a.k - b.k)
        .map(({ p }) => p),
    [],
  );

  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = mixed.slice(0, visible);

  return (
    <section id="shop-all" className="w-full border-t border-border bg-card py-12">
      <div className="mx-auto max-w-container-max px-4 lg:px-6">
        <div className="mb-8 border-b border-border pb-3">
          <div className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">
            Shop everything
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight lg:text-3xl">All Products</h2>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            Explore {mixed.length} carefully selected products across our complete marketplace
            catalogue.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((p) => (
            <CatalogProductCard key={p.id} product={p} />
          ))}
        </div>

        {visible < mixed.length && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-extrabold text-primary-foreground shadow-lg transition hover:bg-primary-dark"
            >
              Load more ({mixed.length - visible} left)
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
