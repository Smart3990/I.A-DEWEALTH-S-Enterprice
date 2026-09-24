import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Grid } from "lucide-react";
import { useCategories } from "@/data/category-store";
import { CategoryLink } from "@/components/catalog/CategoryLink";
import { productsInCategory } from "@/data/catalog";
import { useProducts } from "@/data/use-catalog";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "All Categories & Departments | I.A Dewealth's Enterprise" },
      {
        name: "description",
        content:
          "Browse all departments and product categories available at I.A Dewealth's Enterprise in Ghana.",
      },
      { property: "og:title", content: "All Categories | I.A Dewealth's Enterprise" },
      {
        property: "og:description",
        content:
          "Browse all departments and product categories available at I.A Dewealth's Enterprise in Ghana.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CategoriesIndexPage,
});

function CategoriesIndexPage() {
  const { roots, childrenOf, descendantIds } = useCategories();
  const allProducts = useProducts();

  return (
    <div className="bg-surface min-h-[70vh] pb-16">
      <div className="border-b border-border bg-card py-6 sm:py-10">
        <div className="mx-auto max-w-container-max px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Grid className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground">
                All Categories
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Browse every department and specialty collection in our marketplace.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-container-max px-3 sm:px-4 lg:px-6 py-6 sm:py-10 space-y-8">
        {roots.map((root) => {
          // Hide empty subcategories
          const subcategories = childrenOf(root.id).filter((sub) => {
            const ids = new Set(descendantIds(sub.id));
            return allProducts.some((p) => ids.has(p.categoryId));
          });
          const rootProducts = productsInCategory(root.id, allProducts);

          return (
            <div
              key={root.id}
              className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs overflow-hidden"
            >
              {/* Actual Category Product Banner */}
              <CategoryLink
                id={root.id}
                className="group relative block w-full h-32 sm:h-44 md:h-52 rounded-xl overflow-hidden mb-5 border border-border shadow-2xs"
              >
                <img
                  src={root.bannerImage}
                  alt={root.name}
                  className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent flex flex-col justify-end p-4 sm:p-6">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary">
                    Featured Department
                  </span>
                  <div className="flex items-center justify-between gap-4 mt-0.5">
                    <div>
                      <h2 className="text-lg sm:text-2xl font-black text-white group-hover:text-primary transition">
                        {root.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-white/80 line-clamp-1">
                        {root.bannerSubtitle || `${rootProducts.length} items available`}
                      </p>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-white bg-white/20 backdrop-blur-xs px-3 py-1.5 rounded-full group-hover:bg-primary transition">
                      <span>Explore {root.name}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </CategoryLink>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3 mb-4">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-foreground">
                  Subcategories & Collections
                </span>
                <CategoryLink
                  id={root.id}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline self-start sm:self-auto"
                >
                  <span>
                    View all {root.name} products ({rootProducts.length})
                  </span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </CategoryLink>
              </div>

              {subcategories.length > 0 ? (
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {subcategories.map((sub) => {
                    const subProducts = productsInCategory(sub.id, allProducts);
                    const img = subProducts[0]?.image || sub.bannerImage || root.bannerImage;

                    return (
                      <CategoryLink
                        key={sub.id}
                        id={sub.id}
                        className="group flex flex-col rounded-xl border border-border/70 bg-surface/50 p-2 sm:p-3 transition hover:border-primary/50 hover:bg-card hover:shadow-sm"
                      >
                        <div className="aspect-[4/3] rounded-lg overflow-hidden bg-secondary mb-2 border border-border/40">
                          <img
                            src={img}
                            alt={sub.name}
                            loading="lazy"
                            className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
                          />
                        </div>
                        <span className="text-xs font-bold text-foreground group-hover:text-primary transition line-clamp-1">
                          {sub.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {subProducts.length} item{subProducts.length === 1 ? "" : "s"}
                        </span>
                      </CategoryLink>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground italic">
                  No subcategories listed.{" "}
                  <CategoryLink
                    id={root.id}
                    className="text-primary font-bold not-italic hover:underline"
                  >
                    View products
                  </CategoryLink>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
