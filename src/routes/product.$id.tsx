import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Heart,
  Star,
  Truck,
  Maximize2,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Minus,
  Plus,
  Loader2,
} from "lucide-react";
import {
  ancestorsOf,
  catalogProducts,
  discountOf,
  productsInCategory,
  type CatalogProduct,
} from "@/data/catalog";
import { getAllProducts, adminProductToCatalogProduct, EVENT_KEY } from "@/data/products-store";
import { useProducts } from "@/data/use-catalog";
import { storefrontQuery } from "@/data/storefront";
import { waLink } from "@/data/products";
import { cedi, useStore } from "@/components/store";
import { recordPageView } from "@/data/analytics-store";
import { Breadcrumbs, PageBody } from "@/components/catalog/CategoryShell";
import { CatalogProductCard } from "@/components/catalog/ProductCard";

const findProduct = (id: string): CatalogProduct | undefined => {
  const normId = (id || "").trim();
  try {
    const fromStore = getAllProducts().find(
      (p) =>
        p.id === normId ||
        p.slug === normId ||
        (p.id && p.id.toLowerCase() === normId.toLowerCase()) ||
        (p.slug && p.slug.toLowerCase() === normId.toLowerCase()),
    );
    if (fromStore) {
      return adminProductToCatalogProduct(fromStore);
    }
  } catch {
    // fallback
  }

  const fromCatalog = catalogProducts.find(
    (p) =>
      p.id === normId ||
      (p as unknown as { slug?: string }).slug === normId ||
      p.id.toLowerCase() === normId.toLowerCase(),
  );
  if (fromCatalog) return fromCatalog;
  return undefined;
};

export const Route = createFileRoute("/product/$id")({
  loader: async ({ params, context }) => {
    const rawId = (params.id || "").trim();

    // 1. Try resolving from storefront query cache (authoritative cross-device data)
    try {
      const storefront = await context.queryClient.ensureQueryData(storefrontQuery);
      const found = storefront?.products?.find(
        (p) =>
          p.id === rawId ||
          p.slug === rawId ||
          p.id.toLowerCase() === rawId.toLowerCase() ||
          (p.slug && p.slug.toLowerCase() === rawId.toLowerCase()),
      );
      if (found) {
        return { product: found, name: found.name, spec: found.spec };
      }
    } catch {
      // ignore
    }

    // 2. Direct database query fallback for instant cross-device resolution
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase
        .from("products")
        .select("*")
        .or(`id.eq.${rawId},slug.eq.${rawId}`)
        .maybeSingle();
      if (data) {
        const { mapProduct } = await import("@/data/storefront");
        const mapped = mapProduct(data);
        return { product: mapped, name: mapped.name, spec: mapped.spec };
      }
    } catch {
      // ignore
    }

    const fallback = findProduct(rawId);
    return {
      product: fallback,
      name: fallback?.name || "Product Details",
      spec: fallback?.spec || "",
    };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.name || "Product Details";
    const title = `${name} | IA DEWEALTH'S Enterprise`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `${name}. Authentic electronics, appliances & vehicles in Ghana with fast delivery.`,
        },
        { property: "og:title", content: title },
        { property: "og:description", content: `${name}. Fast Accra delivery & warranty backed.` },
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
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-xs my-12">
        <h1 className="text-2xl font-black text-foreground">Product Unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This item may have sold out or was recently updated in our inventory.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            to="/"
            className="rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground transition hover:opacity-90"
          >
            Explore All Products
          </Link>
          <Link
            to="/deals"
            className="rounded-full border border-border bg-background px-5 py-2.5 text-xs font-bold text-foreground transition hover:border-primary"
          >
            View Super Deals
          </Link>
        </div>
      </div>
    </PageBody>
  );
}

function ProductDetail() {
  const { id } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const allProducts = useProducts();

  const productFromPool = useMemo(() => {
    const norm = (id || "").trim().toLowerCase();
    return allProducts.find(
      (p) => p.id.toLowerCase() === norm || (p.slug && p.slug.toLowerCase() === norm),
    );
  }, [allProducts, id]);

  const [asyncProduct, setAsyncProduct] = useState<CatalogProduct | undefined>(
    () => loaderData?.product || productFromPool || findProduct(id),
  );
  const [isCheckingDb, setIsCheckingDb] = useState(
    () => !loaderData?.product && !productFromPool && !findProduct(id),
  );

  const product = productFromPool || asyncProduct || loaderData?.product;

  const { addToCart, favorites, toggleFavorite } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [active, setActive] = useState(0);
  const [imageFit, setImageFit] = useState<"cover" | "contain">("cover");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    const syncProduct = () => {
      const existing = findProduct(id);
      if (existing) {
        setAsyncProduct(existing);
      }
    };

    syncProduct();
    window.addEventListener(EVENT_KEY, syncProduct);
    return () => window.removeEventListener(EVENT_KEY, syncProduct);
  }, [id]);

  useEffect(() => {
    if (product) {
      setIsCheckingDb(false);
      return;
    }

    let isMounted = true;
    setIsCheckingDb(true);

    import("@/integrations/supabase/client")
      .then(({ supabase }) =>
        supabase.from("products").select("*").or(`id.eq.${id},slug.eq.${id}`).maybeSingle(),
      )
      .then(({ data }) => {
        if (!isMounted) return;
        if (data) {
          import("@/data/storefront").then(({ mapProduct }) => {
            if (isMounted) setAsyncProduct(mapProduct(data));
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsCheckingDb(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, product]);

  useEffect(() => {
    setActive(0);
    if (product) {
      recordPageView(`/product/${product.id}`, product.name, product.categoryId, product.id);
    }
  }, [id, product]);

  if (isCheckingDb && !product) {
    return (
      <PageBody>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading product details...</p>
        </div>
      </PageBody>
    );
  }

  if (!product) return <ProductMissing />;

  const rawImages = [
    product.image,
    ...(Array.isArray(product.images) ? product.images : []),
  ].filter(Boolean);
  const allImages = Array.from(new Set(rawImages));
  // Hide the second image content from product detail page as requested
  const filteredImages = allImages.filter((_, idx) => idx !== 1);
  const gallery = filteredImages.length > 1 ? filteredImages : null;
  const currentImage = gallery
    ? (gallery[active] ?? filteredImages[0] ?? product.image)
    : (filteredImages[0] ?? product.image);

  const trail = ancestorsOf(product.categoryId).map((c) => ({ name: c.name, categoryId: c.id }));
  const discount = discountOf(product);
  const liked = favorites.includes(product.id);
  const isVehicle = ancestorsOf(product.categoryId).some((c) => c.id === "cars-vehicles");
  const related = productsInCategory(product.categoryId)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="bg-surface">
      {/* Mobile-only sleek header bar since site top header is hidden on mobile product page */}
      <div className="sm:hidden sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/95 backdrop-blur-md px-3.5 py-2.5 shadow-2xs">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              window.history.back();
            } else {
              window.location.href = "/";
            }
          }}
          className="inline-flex items-center gap-1 text-xs font-bold text-foreground hover:text-primary transition"
          aria-label="Back"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <span className="text-xs font-extrabold text-foreground truncate max-w-[170px]">
          {product.brand}
        </span>
        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          className="p-1 text-foreground hover:text-primary transition"
          aria-label={liked ? "Remove from saved" : "Save to favorites"}
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-deal text-deal" : "text-muted-foreground"}`} />
        </button>
      </div>

      <Breadcrumbs trail={[...trail, { name: product.name }]} />
      <PageBody>
        <div className="grid gap-8 lg:grid-cols-2 lg:grid-rows-[auto_auto]">
          <div className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border border-border bg-card shadow-xs">
            <img
              src={currentImage}
              alt={product.name}
              width={768}
              height={768}
              className={`h-full w-full cursor-pointer transition-all duration-300 ${
                imageFit === "cover" ? "object-cover object-center" : "object-contain p-4"
              }`}
              onClick={() => setIsLightboxOpen(true)}
            />
            {discount > 0 && (
              <span className="absolute left-4 top-4 z-10 rounded-full bg-deal px-3 py-1 text-xs font-extrabold text-white shadow-xs">
                -{discount}%
              </span>
            )}

            {/* Quick interactive controls: Fit toggle & Fullscreen preview */}
            <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5 opacity-90 transition group-hover:opacity-100">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setImageFit((prev) => (prev === "cover" ? "contain" : "cover"));
                }}
                aria-label={imageFit === "cover" ? "Show whole image" : "Fill card completely"}
                title={imageFit === "cover" ? "Show whole image" : "Fill card completely"}
                className="flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-bold text-foreground backdrop-blur-md border border-border/80 shadow-xs hover:bg-background transition"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span>{imageFit === "cover" ? "Fill Card" : "Fit Whole"}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
                aria-label="View full screen"
                title="View full screen"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground backdrop-blur-md border border-border/80 shadow-xs hover:bg-background transition"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-start-1 lg:row-start-2 lg:-mt-4">
            {gallery && (
              <div className="flex flex-wrap gap-2.5">
                {gallery.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    aria-label={`View image ${i + 1} of ${product.name}`}
                    aria-current={i === active}
                    onClick={() => setActive(i)}
                    className={`group relative flex h-18 w-18 sm:h-20 sm:w-20 items-center justify-center overflow-hidden rounded-2xl border transition duration-200 ${
                      i === active
                        ? "border-primary ring-2 ring-primary/40 shadow-sm scale-105"
                        : "border-border hover:border-primary/60 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={src}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover object-center transition duration-200 group-hover:scale-105"
                    />
                    <span className="absolute bottom-1 right-1 rounded-sm bg-black/60 px-1 text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
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

            {/* Quantity selector counter for both desktop & mobile */}
            {!isVehicle && (
              <div className="mt-5 flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Quantity:
                </span>
                <div className="flex items-center rounded-xl border border-border bg-card shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="flex h-10 w-10 items-center justify-center rounded-l-xl text-foreground hover:bg-muted/80 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={product.stock || 99}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 1) {
                        setQuantity(val);
                      } else if (e.target.value === "") {
                        setQuantity(1);
                      }
                    }}
                    className="h-10 w-12 border-0 bg-transparent text-center text-sm font-bold text-foreground focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase quantity"
                    className="flex h-10 w-10 items-center justify-center rounded-r-xl text-foreground hover:bg-muted/80 transition"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {product.stock ? (
                  <span className="text-xs text-muted-foreground">({product.stock} available)</span>
                ) : null}
              </div>
            )}

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
                  onClick={() =>
                    addToCart(product.id, product.name, product.price, product.image, quantity)
                  }
                  className="rounded-xl bg-primary px-6 py-3.5 text-sm font-extrabold text-primary-foreground shadow-lg transition hover:bg-primary-dark"
                >
                  Add to Cart {quantity > 1 ? `(${quantity})` : ""}
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
          <section className="mt-10 sm:mt-14">
            <h2 className="mb-4 font-sans text-lg sm:text-xl font-black tracking-tight lg:text-2xl">
              You may also like
            </h2>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {related.map((p) => (
                <CatalogProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </PageBody>

      {/* Fullscreen High-Resolution Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md transition-opacity"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close image preview"
            className="absolute right-5 top-5 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition backdrop-blur-md"
          >
            <X className="h-6 w-6" />
          </button>

          {gallery && gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActive((prev) => (prev > 0 ? prev - 1 : gallery.length - 1));
                }}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 transition backdrop-blur-md"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActive((prev) => (prev < gallery.length - 1 ? prev + 1 : 0));
                }}
                aria-label="Next image"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 transition backdrop-blur-md"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}

          <div
            className="relative flex max-h-[90vh] max-w-5xl flex-col items-center justify-center overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImage}
              alt={product.name}
              className="max-h-[85vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />
            {gallery && gallery.length > 1 && (
              <div className="mt-3 rounded-full bg-black/60 px-4 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/10">
                {active + 1} of {gallery.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
