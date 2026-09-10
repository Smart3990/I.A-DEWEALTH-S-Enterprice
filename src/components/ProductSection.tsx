import { ChevronRight, Heart, Star } from "lucide-react";
import type { Product, Section } from "@/data/products";
import { cedi, useStore } from "./store";

function ProductCard({ product }: { product: Product }) {
  const { addToCart, favorites, toggleFavorite } = useStore();
  const liked = favorites.includes(product.id);

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md">
      <button
        aria-label="Toggle favorite"
        onClick={() => toggleFavorite(product.id)}
        className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-transform hover:scale-110 active:scale-90"
      >
        <Heart
          className={`h-4 w-4 transition ${liked ? "fill-deal text-deal" : "text-border"}`}
          strokeWidth={2}
        />
      </button>
      <div>
        <div className="mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-secondary p-4">
          <img
            src={product.image}
            alt={product.name}
            width={768}
            height={768}
            loading="lazy"
            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
          />
        </div>
        <div className="mb-1 flex items-center gap-1 text-xs font-bold">
          <Star className="h-4 w-4 fill-accent text-accent" />
          <span>{product.rating.toFixed(1)}</span>
          <span className="ml-1 font-normal text-muted-foreground">
            ({Math.max(4, Math.round(product.sold * 0.42))} reviews)
          </span>
        </div>
        <h3 className="line-clamp-2x mb-1 text-sm font-bold leading-snug transition group-hover:text-primary">
          {product.name}
        </h3>
        <div className="mb-1 text-xs font-medium text-primary-dark">{product.tag}</div>
        <p className="font-body text-xs text-muted-foreground">{product.spec}</p>
      </div>
      <div className="mt-2 border-t border-border/70 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-baseline gap-2">
            <span className="text-xl font-extrabold">{cedi(product.price)}</span>
            <span className="ml-2 text-xs text-muted-foreground line-through">
              {cedi(product.was)}
            </span>
          </div>
          <button
            onClick={() => addToCart(product.id, product.name, product.price, product.image)}
            className="shrink-0 whitespace-nowrap rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition hover:bg-primary-dark sm:text-sm"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductSection({ section, alt = false }: { section: Section; alt?: boolean }) {
  return (
    <section
      id={section.id}
      className={`w-full border-t border-border py-12 ${alt ? "bg-surface" : "bg-card"}`}
    >
      <div className="mx-auto max-w-container-max px-4 lg:px-6">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-border pb-3 sm:flex-row sm:items-end">
          <div>
            <div className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">
              {section.eyebrow}
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight lg:text-3xl">{section.title}</h2>
          </div>
          {section.link && (
            <a
              href={`#${section.id}`}
              className="flex items-center gap-1 text-sm font-bold text-primary transition hover:text-primary-dark"
            >
              {section.link} <ChevronRight className="h-4 w-4" />
            </a>
          )}
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {section.products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
