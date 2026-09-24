import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { resolveCategoryPath, WHATSAPP_TEXT, type CatalogProduct } from "@/data/catalog";
import { useCategories } from "@/data/category-store";
import { useProducts } from "@/data/use-catalog";
import {
  Breadcrumbs,
  CategoryBanner,
  PageBody,
  SubcategoryCards,
} from "@/components/catalog/CategoryShell";
import { ProductListing } from "@/components/catalog/ProductListing";
import { ArrowLeft, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/category/$")({
  loader: ({ params }) => {
    const segments = (params._splat ?? "").split("/").filter(Boolean);
    const category = resolveCategoryPath(segments);
    return { segments, category };
  },
  head: ({ loaderData }) => {
    const category = loaderData?.category;
    if (!category) {
      return {
        meta: [
          { title: "Browse Categories | I.A Dewealth's Enterprise" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${category.name} in Ghana | I.A Dewealth's Enterprise`;
    const description = category.bannerSubtitle;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/category/${loaderData.segments.join("/")}` }],
    };
  },
  component: CategoryPage,
  notFoundComponent: CategoryNotFoundFallback,
  errorComponent: () => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center text-sm text-muted-foreground">
      <p>This category page is temporarily unavailable.</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Return to Shop
      </Link>
    </div>
  ),
});

function CategoryNotFoundFallback() {
  const { roots } = useCategories();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <ShoppingBag className="h-8 w-8" />
      </div>
      <div>
        <h1 className="font-sans text-2xl font-black text-foreground sm:text-3xl">
          Category Not Found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          The category you are looking for may have been updated. Explore our main departments
          below:
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
        {roots.map((cat) => (
          <Link
            key={cat.id}
            to="/category/$"
            params={{ _splat: cat.slug }}
            className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-foreground transition hover:border-primary hover:text-primary"
          >
            {cat.name}
          </Link>
        ))}
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-extrabold text-primary-foreground transition hover:opacity-90"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Storefront
      </Link>
    </div>
  );
}

function CategoryPage() {
  const { segments } = Route.useLoaderData();
  const { resolvePath, ancestorsOf, childrenOf, descendantIds, roots } = useCategories();

  const category = resolvePath(segments) || roots[0];
  const allProducts = useProducts();

  const products = useMemo(() => {
    if (!category) return [];
    const ids = new Set(descendantIds(category.id));
    return allProducts.filter((p) => ids.has(p.categoryId));
  }, [category, descendantIds, allProducts]);

  // Hide empty subcategories
  const subcategories = useMemo(() => {
    if (!category) return [];
    return childrenOf(category.id).filter((sub) => {
      const ids = new Set(descendantIds(sub.id));
      return allProducts.some((p) => ids.has(p.categoryId));
    });
  }, [category, childrenOf, descendantIds, allProducts]);

  if (!category) {
    return <CategoryNotFoundFallback />;
  }

  const trail = ancestorsOf(category.id).map((c) => ({ name: c.name, categoryId: c.id }));

  return (
    <div className="bg-surface">
      <CategoryBanner
        image={category.bannerImage}
        eyebrow={trail.length > 1 ? trail[trail.length - 2]?.name : "Shop"}
        title={category.bannerTitle}
        subtitle={category.bannerSubtitle}
        cta={category.bannerCTA}
        ctaHref={WHATSAPP_TEXT(`Hello IA DEWEALTH, I'm interested in your ${category.name}.`)}
      />
      <Breadcrumbs trail={trail} />
      <PageBody>
        <SubcategoryCards items={subcategories} products={allProducts} />
        <h2 className="mb-5 font-sans text-2xl font-black tracking-tight text-foreground lg:text-3xl">
          {category.name}
        </h2>
        <ProductListing
          products={products}
          emptyNote={`No ${category.name} currently in stock. Message us on WhatsApp and we'll source it for you immediately.`}
        />
      </PageBody>
    </div>
  );
}
