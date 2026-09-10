import { Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";
import { ancestorsOf, discountOf, type CatalogProduct } from "@/data/catalog";
import { waLink } from "@/data/products";
import { cedi, useStore } from "@/components/store";

export function CatalogProductCard({ product }: { product: CatalogProduct }) {
  const { addToCart, favorites, toggleFavorite } = useStore();
  const liked = favorites.includes(product.id);
  const discount = discountOf(product);
  const isVehicle = ancestorsOf(product.categoryId).some(
    (category) => category.id === "cars-vehicles",
  );

  return (
    <article className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        aria-label={product.name}
        className="absolute inset-0 z-10 rounded-2xl"
      />

      <button
        aria-label={
          liked ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`
        }
        onClick={() => toggleFavorite(product.id)}
        className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-transform hover:scale-110 active:scale-90"
      >
        <Heart
          className={`h-4 w-4 transition ${liked ? "fill-deal text-deal" : "text-border"}`}
          strokeWidth={2}
        />
      </button>

      <div>
        <div className="relative mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-secondary p-4">
          <img
            src={product.image}
            alt={product.name}
            width={768}
            height={768}
            loading="lazy"
            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
          />
          {discount > 0 && (
            <span className="absolute left-2 top-2 rounded-full bg-deal px-2 py-0.5 text-[11px] font-extrabold text-white">
              -{discount}%
            </span>
          )}
        </div>

        <div className="mb-1 flex items-center gap-1 text-xs font-bold">
          <Star className="h-4 w-4 fill-accent text-accent" />
          <span>{product.rating.toFixed(1)}</span>
          <span className="ml-1 font-normal text-muted-foreground">
            ({product.reviews} reviews)
          </span>
        </div>

        <h3 className="mb-1 text-sm font-bold leading-snug transition group-hover:text-primary">
          {product.name}
        </h3>
        <p className="font-body text-xs text-muted-foreground">{product.spec}</p>
      </div>

      <div className="mt-3 border-t border-border/70 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-2">
            <span className="text-xl font-extrabold">{cedi(product.price)}</span>
            {product.was > product.price && (
              <span className="ml-2 text-xs text-muted-foreground line-through">
                {cedi(product.was)}
              </span>
            )}
          </div>
          {isVehicle ? (
            <a
              href={waLink(product.name, product.price)}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="relative z-20 flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-primary px-3 py-2 text-center text-xs font-medium text-primary-foreground transition hover:bg-primary-dark sm:text-sm"
            >
              Connect with us
            </a>
          ) : (
            <button
              onClick={() => addToCart(product.id, product.name, product.price, product.image)}
              className="relative z-20 shrink-0 whitespace-nowrap rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition hover:bg-primary-dark sm:text-sm"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
