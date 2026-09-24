import { useMemo, useState } from "react";
import { useProducts } from "@/data/use-catalog";
import { CatalogProductCard } from "@/components/catalog/ProductCard";

const PAGE_SIZE = 24;

export function HomeAllProducts() {
  const products = useProducts();
  // Order newest added products first so newly arrived items are immediately visible
  const orderedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const timeB = new Date(b.addedAt || 0).getTime() || 0;
      const timeA = new Date(a.addedAt || 0).getTime() || 0;
      if (timeB !== timeA) return timeB - timeA;
      return (b.id || "").localeCompare(a.id || "");
    });
  }, [products]);

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
          {orderedProducts.map((p, index) => (
            <div key={p.id} className={index >= visible ? "block sm:hidden" : "block"}>
              <CatalogProductCard product={p} />
            </div>
          ))}
        </div>

        {/* Desktop only load more button */}
        {visible < orderedProducts.length && (
          <div className="mt-6 sm:mt-8 hidden sm:flex justify-center">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="rounded-full bg-primary px-6 sm:px-8 py-2.5 sm:py-3.5 text-xs sm:text-sm font-black text-primary-foreground shadow-md transition hover:bg-primary-dark active:scale-95"
            >
              Load more products
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
