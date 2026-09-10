import { catalogProducts, collectionBySlug } from "@/data/catalog";
import { Breadcrumbs, CategoryBanner, PageBody } from "./CategoryShell";
import { ProductListing } from "./ProductListing";

/** Shared renderer for the discover collections (deals, top picks, etc). */
export function CollectionPage({ slug }: { slug: string }) {
  const collection = collectionBySlug(slug);
  if (!collection) return null;
  const products = collection.select(catalogProducts);

  return (
    <div className="bg-surface">
      <CategoryBanner
        image={collection.bannerImage}
        eyebrow="Discover"
        title={collection.bannerTitle}
        subtitle={collection.bannerSubtitle}
      />
      <Breadcrumbs trail={[{ name: collection.name }]} />
      <PageBody>
        <ProductListing
          products={products}
          emptyNote="Nothing in this collection right now. Check back soon."
        />
      </PageBody>
    </div>
  );
}
