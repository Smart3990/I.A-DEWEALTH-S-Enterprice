import { createFileRoute } from "@tanstack/react-router";
import { searchCatalog } from "@/data/search";
import { useProducts } from "@/data/use-catalog";
import { Breadcrumbs, PageBody } from "@/components/catalog/CategoryShell";
import { ProductListing } from "@/components/catalog/ProductListing";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({ q: String(search["q"] ?? "") }),
  head: () => ({
    meta: [
      { title: "Search Products | I.A Dewealth's Enterprise" },
      {
        name: "description",
        content:
          "Search authentic phones, laptops, gadgets, kitchen appliances and vehicles in Ghana.",
      },
      { property: "og:title", content: "Search Products | I.A Dewealth's Enterprise" },
      {
        property: "og:description",
        content: "Find genuine tech at direct import prices with WhatsApp checkout.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const allProducts = useProducts();
  const results = searchCatalog(q, 100, allProducts);

  return (
    <div className="bg-surface">
      <Breadcrumbs trail={[{ name: q ? `Search: ${q}` : "Search" }]} />
      <PageBody>
        <h1 className="mb-2 font-sans text-2xl font-black tracking-tight text-foreground lg:text-3xl">
          {q ? `Results for "${q}"` : "Search our catalog"}
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {q
            ? `${results.length} product${results.length === 1 ? "" : "s"} matched.`
            : "Type a keyword in the search bar above."}
        </p>
        <ProductListing
          products={results}
          emptyNote="No product matched that keyword. Message us on WhatsApp and we'll source it for you."
        />
      </PageBody>
    </div>
  );
}
