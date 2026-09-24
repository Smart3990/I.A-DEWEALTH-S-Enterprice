import { useMemo, useState } from "react";
import { useProducts } from "@/data/use-catalog";
import { CatalogProductCard } from "@/components/catalog/ProductCard";

const PAGE_SIZE = 24;

export function HomeAllProducts() {
  const products = useProducts();
  // Deterministic shuffle so every category's products are mixed together.
  const mixed = useMemo(
    () =>
      products
        .map((p, i) => ({ p, k: ((i + 1) * 2654435761) % 100003 }))
        .sort((a, b) => a.k - b.k)
        .map(({ p }) => p),
    [products],
  );

  const [visible, setVisible] = useState(PAGE_SIZE);

  return (
    <section id="shop-all" className="w-full border-t border-border bg-card py-5 sm:py-10">
      <div className="mx-auto max-w-container-max px-3 sm:px-4 lg:px-6">
        <div className="mb-4 sm:mb-6 flex items-center justify-between gap-2 border-b border-border/80 pb-3">
          <div>
            <h2 className="text-base sm:text-2xl font-black tracking-tight text-foreground">
              All Products
            </h2>
            <p className="hidden sm:block mt-0.5 font-body text-xs sm:text-sm text-muted-foreground">
              Explore our carefully selected products across our complete marketplace.
            </p>
          </div>
        </div>

        {/* 2-column grid on mobile showing all products; progressive on desktop */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {mixed.map((p, index) => (
            <div key={p.id} className={index >= visible ? "block sm:hidden" : "block"}>
              <CatalogProductCard product={p} />
            </div>
          ))}
        </div>

        {/* Desktop load more button if products exceed visible count */}
        {visible < mixed.length && (
          <div className="mt-6 sm:mt-8 hidden sm:flex justify-center">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="rounded-full bg-primary px-6 sm:px-8 py-2.5 sm:py-3.5 text-xs sm:text-sm font-black text-primary-foreground shadow-md transition hover:bg-primary-dark active:scale-95 cursor-pointer"
            >
              Load more products ({mixed.length - visible} remaining)
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
