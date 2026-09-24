import { ChevronRight, Heart, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Product, Section } from "@/data/products";
import { cedi, useStore } from "./store";

function ProductCard({ product }: { product: Product }) {
  const { addToCart, favorites, toggleFavorite } = useStore();
  const liked = favorites.includes(product.id);
  const discount =
    product.was > product.price
      ? Math.round(((product.was - product.price) / product.was) * 100)
      : 0;

  return (
    <div className="group relative flex flex-col justify-between rounded-xl sm:rounded-2xl border border-border bg-card p-2 sm:p-3 md:p-4 shadow-xs transition hover:shadow-md">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        aria-label={product.name}
        className="absolute inset-0 z-10 rounded-xl sm:rounded-2xl"
      />

      <button
        type="button"
        aria-label="Toggle favorite"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(product.id);
        }}
        className="absolute right-2 top-2 sm:right-2.5 sm:top-2.5 z-20 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg md:rounded-full bg-black/40 md:bg-white/90 md:text-slate-600 md:border md:border-border/60 text-white backdrop-blur-xs shadow-xs transition-transform hover:scale-110 active:scale-90"
      >
        <Heart
          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition ${
            liked ? "fill-red-500 text-red-500" : "text-white md:text-slate-500 hover:text-red-500"
          }`}
          strokeWidth={2}
        />
      </button>

      <div>
        <div className="relative mb-1.5 sm:mb-2.5 md:mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-lg sm:rounded-xl bg-secondary">
          <img
            src={product.image}
            alt={product.name}
            width={768}
            height={768}
            loading="lazy"
            className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
          />
          {discount > 0 && (
            <span className="absolute left-1.5 top-1.5 sm:left-2 sm:top-2 z-10 rounded bg-deal px-1.5 py-0.5 text-[9px] sm:text-[11px] font-black uppercase text-deal-foreground shadow-xs">
              {discount}% OFF
            </span>
          )}
        </div>
        <div className="mb-0.5 sm:mb-1 flex items-center gap-1 text-[10px] sm:text-xs font-bold">
          <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-accent text-accent shrink-0" />
          <span>{product.rating.toFixed(1)}</span>
          <span className="ml-0.5 font-normal text-muted-foreground text-[9px] sm:text-[11px]">
            ({Math.max(4, Math.round(product.sold * 0.42))})
          </span>
        </div>
        <h3 className="line-clamp-2 min-h-[1.85rem] sm:min-h-[2.5rem] mb-0.5 sm:mb-1 text-xs sm:text-sm font-bold leading-snug text-foreground transition group-hover:text-primary">
          {product.name}
        </h3>
        {product.tag && (
          <div className="mb-0.5 text-[9px] sm:text-xs font-medium text-primary-dark truncate">
            {product.tag}
          </div>
        )}
        <p className="font-body text-[10px] sm:text-xs text-muted-foreground truncate">
          {product.spec}
        </p>
      </div>

      <div className="mt-1.5 sm:mt-3 border-t border-border/70 pt-1.5 sm:pt-2.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1.5 sm:gap-2">
          <div className="flex min-w-0 flex-wrap items-baseline gap-1 sm:gap-1.5">
            <span className="text-xs sm:text-sm md:text-base font-extrabold text-foreground">
              {cedi(product.price)}
            </span>
            {product.was > product.price && (
              <span className="text-[9px] sm:text-xs text-muted-foreground line-through">
                {cedi(product.was)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product.id, product.name, product.price, product.image);
            }}
            className="relative z-20 flex w-full md:w-auto shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-primary px-2.5 py-1.5 md:py-2 text-center text-[10px] sm:text-xs font-bold text-primary-foreground shadow-2xs transition hover:bg-primary-dark active:scale-95"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductSection({ section, alt = false }: { section: Section; alt?: boolean }) {
  const targetRoute =
    section.id === "super-deals" || section.id === "deals"
      ? "/deals"
      : section.id === "new-arrivals"
        ? "/new-arrivals"
        : "/deals";

  return (
    <section
      id={section.id}
      className={`w-full border-t border-border py-5 sm:py-10 ${alt ? "bg-surface" : "bg-card"}`}
    >
      <div className="mx-auto max-w-container-max px-3 sm:px-4 lg:px-6">
        <div className="mb-4 sm:mb-6 flex flex-col items-start justify-between gap-2 sm:gap-4 border-b border-border pb-3 sm:flex-row sm:items-end">
          <div>
            <div className="mb-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary">
              {section.eyebrow}
            </div>
            <h2 className="text-lg sm:text-2xl font-black tracking-tight text-foreground lg:text-3xl">
              {section.title}
            </h2>
          </div>
          {section.link && (
            <Link
              to={targetRoute}
              className="flex items-center gap-1 text-xs sm:text-sm font-bold text-primary transition hover:text-primary-dark"
            >
              {section.link} <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {section.products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
