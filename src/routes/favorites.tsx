import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { catalogProducts } from "@/data/catalog";
import { useStore } from "@/components/store";
import { PageBody } from "@/components/catalog/CategoryShell";
import { CatalogProductCard } from "@/components/catalog/ProductCard";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "My Favorites | I.A Dewealth's Enterprise" },
      {
        name: "description",
        content: "Every product you saved for later at I.A Dewealth's Enterprise marketplace.",
      },
      { property: "og:title", content: "My Favorites | I.A Dewealth's Enterprise" },
      {
        property: "og:description",
        content: "Every product you saved for later at I.A Dewealth's Enterprise marketplace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { favorites } = useStore();
  const items = catalogProducts.filter((p) => favorites.includes(p.id));

  return (
    <div className="bg-surface">
      <PageBody>
        <h1 className="font-sans text-2xl font-black tracking-tight lg:text-3xl">My Favorites</h1>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          {items.length > 0
            ? `${items.length} saved ${items.length === 1 ? "product" : "products"}. Tap the heart again to remove one.`
            : "Products you save will appear here."}
        </p>

        {items.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-16 text-center">
            <Heart className="h-10 w-10 text-border" strokeWidth={1.75} />
            <h2 className="mt-4 text-lg font-extrabold tracking-tight">No favorites yet</h2>
            <p className="mt-1 max-w-sm font-body text-sm text-muted-foreground">
              Tap the heart on any product to save it here for later.
            </p>
            <Link
              to="/"
              className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary-dark"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((p) => (
              <CatalogProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </PageBody>
    </div>
  );
}
