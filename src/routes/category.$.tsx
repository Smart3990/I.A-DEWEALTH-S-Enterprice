import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import { catalogProducts, resolveCategoryPath, WHATSAPP_TEXT } from "@/data/catalog";
import { useCategories } from "@/data/category-store";
import {
  Breadcrumbs,
  CategoryBanner,
  PageBody,
  SubcategoryCards,
} from "@/components/catalog/CategoryShell";
import { ProductListing } from "@/components/catalog/ProductListing";

export const Route = createFileRoute("/category/$")({
  loader: ({ params }) => {
    const segments = (params._splat ?? "").split("/").filter(Boolean);
    if (!segments.length) throw notFound();
    const category = resolveCategoryPath(segments);
    return { segments, category };
  },
  head: ({ loaderData }) => {
    const category = loaderData?.category;
    if (!category) {
      return {
        meta: [
          { title: "Category | I.A Dewealth's Enterprise" },
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
  notFoundComponent: () => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-sans text-3xl font-black text-foreground">Category not found</h1>
      <Link
        to="/"
        className="rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground"
      >
        Back to the shop
      </Link>
    </div>
  ),
  errorComponent: () => (
    <div className="flex min-h-[60vh] items-center justify-center px-6 text-center text-sm text-muted-foreground">
      This category didn't load. Please refresh.
    </div>
  ),
});

function CategoryPage() {
  const { segments } = Route.useLoaderData();
  const { resolvePath, ancestorsOf, childrenOf, descendantIds } = useCategories();

  const category = resolvePath(segments);

  const products = useMemo(() => {
    if (!category) return [];
    const ids = new Set(descendantIds(category.id));
    return catalogProducts.filter((p) => ids.has(p.categoryId));
  }, [category, descendantIds]);

  if (!category) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-sans text-3xl font-black text-foreground">Category not found</h1>
        <Link
          to="/"
          className="rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground"
        >
          Back to the shop
        </Link>
      </div>
    );
  }

  const trail = ancestorsOf(category.id).map((c) => ({ name: c.name, categoryId: c.id }));
  const subcategories = childrenOf(category.id);

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
        <SubcategoryCards items={subcategories} />
        <h2 className="mb-5 font-sans text-2xl font-black tracking-tight text-foreground lg:text-3xl">
          {category.name}
        </h2>
        <ProductListing
          products={products}
          emptyNote={`No ${category.name} in stock right now. Message us on WhatsApp and we'll source it for you.`}
        />
      </PageBody>
    </div>
  );
}
