import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Heart, Star, Truck } from "lucide-react";
import { ancestorsOf, catalogProducts, discountOf, productsInCategory } from "@/data/catalog";
import { waLink } from "@/data/products";
import { cedi, useStore } from "@/components/store";
import { recordPageView } from "@/data/analytics-store";
import { Breadcrumbs, PageBody } from "@/components/catalog/CategoryShell";
import { CatalogProductCard } from "@/components/catalog/ProductCard";

const findProduct = (id: string) => catalogProducts.find((p) => p.id === id);

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = findProduct(params.id);
    if (!product) throw notFound();
    return { name: product.name, spec: product.spec };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Product unavailable | IA DEWEALTH'S Enterprise" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.name} | IA DEWEALTH'S Enterprise`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `${loaderData.name}: ${loaderData.spec}. Buy in Ghana with fast Accra delivery.`,
        },
        { property: "og:title", content: title },
        { property: "og:description", content: `${loaderData.name}: ${loaderData.spec}.` },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductDetail,
  notFoundComponent: ProductMissing,
});

function ProductMissing() {
  return (
    <PageBody>
      <h1 className="text-2xl font-black">Product not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This item may have been removed.{" "}
        <Link to="/" className="font-bold text-primary">
          Back to the store
        </Link>
      </p>
    </PageBody>
  );
}

function ProductDetail() {
  const { id } = Route.useParams();
  const product = findProduct(id);
  const { addToCart, favorites, toggleFavorite } = useStore();
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
    if (product) {
      recordPageView(`/product/${product.id}`, product.name, product.categoryId, product.id);
    }
  }, [id, product]);

  if (!product) return <ProductMissing />;

  const gallery = product.images && product.images.length > 1 ? product.images : null;
  const trail = ancestorsOf(product.categoryId).map((c) => ({ name: c.name, categoryId: c.id }));
  const discount = discountOf(product);
  const liked = favorites.includes(product.id);
  const isVehicle = ancestorsOf(product.categoryId).some((c) => c.id === "cars-vehicles");
  const related = productsInCategory(product.categoryId)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="bg-surface">
      <Breadcrumbs trail={[...trail, { name: product.name }]} />
      <PageBody>
        <div className="grid gap-8 lg:grid-cols-2 lg:grid-rows-[auto_auto]">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-border bg-card p-8">
            <img
              src={gallery ? (gallery[active] ?? product.image) : product.image}
              alt={product.name}
              width={768}
              height={768}
              className="h-full w-full object-contain"
            />
            {discount > 0 && (
              <span className="absolute left-4 top-4 rounded-full bg-deal px-3 py-1 text-xs font-extrabold text-white">
                -{discount}%
              </span>
            )}
          </div>

          <div className="lg:col-start-1 lg:row-start-2 lg:-mt-4">
            {gallery && (
              <div className="flex flex-wrap gap-3">
                {gallery.slice(0, 5).map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    aria-label={`View image ${i + 1} of ${product.name}`}
                    aria-current={i === active}
                    onClick={() => setActive(i)}
                    className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border bg-card p-1.5 transition ${
                      i === active
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    <img src={src} alt="" loading="lazy" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              {product.brand}
            </p>
            <h1 className="mt-1 font-sans text-2xl font-black leading-tight tracking-tight lg:text-4xl">
              {product.name}
            </h1>

            <div className="mt-3 flex items-center gap-1 text-sm font-bold">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="ml-1 font-normal text-muted-foreground">
                ({product.reviews} reviews)
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-black">{cedi(product.price)}</span>
              {product.was > product.price && (
                <span className="text-sm text-muted-foreground line-through">
                  {cedi(product.was)}
                </span>
              )}
            </div>

            <p className="mt-4 font-body text-sm leading-relaxed text-muted-foreground">
              {product.name} from {product.brand}: {product.spec}. Sourced and quality-checked in
              Ghana, listed under {trail[trail.length - 1]?.name ?? "our catalogue"}.
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-border bg-card p-3">
                <dt className="font-semibold uppercase tracking-wider text-muted-foreground">
                  Brand
                </dt>
                <dd className="mt-0.5 font-bold text-foreground">{product.brand}</dd>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <dt className="font-semibold uppercase tracking-wider text-muted-foreground">
                  Category
                </dt>
                <dd className="mt-0.5 font-bold text-foreground">
                  {trail[trail.length - 1]?.name ?? "Not available"}
                </dd>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <dt className="font-semibold uppercase tracking-wider text-muted-foreground">
                  Condition
                </dt>
                <dd className="mt-0.5 font-bold text-foreground">{product.condition}</dd>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <dt className="font-semibold uppercase tracking-wider text-muted-foreground">
                  Availability
                </dt>
                <dd className="mt-0.5 font-bold text-foreground">{product.availability}</dd>
              </div>
            </dl>

            <div className="mt-6 rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-black tracking-tight">Key specifications</h2>
              <ul className="mt-2 space-y-1.5 font-body text-sm text-muted-foreground">
                {product.spec.split("•").map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{line.trim()}</span>
                  </li>
                ))}
                {discount > 0 && (
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      Save {discount}% ({cedi(product.was - product.price)} off)
                    </span>
                  </li>
                )}
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {isVehicle ? (
                <a
                  href={waLink(product.name, product.price)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-primary px-6 py-3.5 text-sm font-extrabold text-primary-foreground shadow-lg transition hover:bg-primary-dark"
                >
                  Connect with us
                </a>
              ) : (
                <button
                  onClick={() => addToCart(product.id, product.name, product.price, product.image)}
                  className="rounded-xl bg-primary px-6 py-3.5 text-sm font-extrabold text-primary-foreground shadow-lg transition hover:bg-primary-dark"
                >
                  Add to Cart
                </button>
              )}
              <button
                onClick={() => toggleFavorite(product.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3.5 text-sm font-bold transition hover:border-primary"
              >
                <Heart className={`h-4 w-4 ${liked ? "fill-deal text-deal" : "text-border"}`} />
                {liked ? "Saved" : "Save"}
              </button>
            </div>

            {!isVehicle && (
              <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-primary" /> Delivery within 2–3 business days in
                  Accra • 3–5 days nationwide
                </span>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-4 font-sans text-xl font-black tracking-tight lg:text-2xl">
              You may also like
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {related.map((p) => (
                <CatalogProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </PageBody>
    </div>
  );
}
