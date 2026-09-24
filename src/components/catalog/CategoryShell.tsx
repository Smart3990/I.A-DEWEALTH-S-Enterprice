import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";
import type { ReactNode } from "react";
import { productsInCategory, type Category, type CatalogProduct } from "@/data/catalog";
import { CategoryLink } from "./CategoryLink";

export function CategoryBanner({
  image,
  title,
  subtitle,
  eyebrow,
  cta,
  ctaHref,
}: {
  image: string;
  title: string;
  subtitle: string;
  eyebrow?: string | undefined;
  cta?: string | undefined;
  ctaHref?: string | undefined;
}) {
  return (
    <section className="relative overflow-hidden">
      <img src={image} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
      <div className="relative mx-auto max-w-container-max px-4 py-8 sm:py-14 lg:px-6 lg:py-20">
        {eyebrow && (
          <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.24em] text-accent">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 sm:mt-3 max-w-2xl font-sans text-2xl sm:text-3xl font-black leading-[1.12] tracking-tight text-white lg:text-5xl">
          {title}
        </h1>
        <p className="mt-2 sm:mt-3 max-w-xl text-xs sm:text-sm leading-relaxed text-white/90 lg:text-base">
          {subtitle}
        </p>
        {cta && ctaHref && (
          <a
            href={ctaHref}
            target="_blank"
            rel="noreferrer"
            className="mt-4 sm:mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 sm:px-7 py-2.5 sm:py-3.5 text-xs sm:text-sm font-extrabold text-primary-foreground shadow-2xl transition hover:bg-primary-dark"
          >
            {cta}
          </a>
        )}
      </div>
    </section>
  );
}

export function Breadcrumbs({ trail }: { trail: { name: string; categoryId?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="hidden sm:block border-b border-border bg-card">
      <ol className="mx-auto flex max-w-container-max flex-wrap items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-xs lg:px-6">
        <li>
          <Link
            to="/"
            className="inline-flex items-center gap-1 font-semibold text-muted-foreground hover:text-primary"
          >
            <Home className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Home
          </Link>
        </li>
        {trail.map((item, i) => (
          <li key={`${item.name}-${i}`} className="flex items-center gap-1 sm:gap-1.5">
            <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-border" />
            {item.categoryId && i < trail.length - 1 ? (
              <CategoryLink
                id={item.categoryId}
                className="font-semibold text-muted-foreground hover:text-primary"
              >
                {item.name}
              </CategoryLink>
            ) : (
              <span className="font-bold text-foreground truncate max-w-[150px] sm:max-w-none">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function SubcategoryCards({
  items,
  products,
}: {
  items: Category[];
  products?: CatalogProduct[];
}) {
  // Hide empty subcategories
  const visibleItems = items.filter((item) => productsInCategory(item.id, products).length > 0);
  if (!visibleItems.length) return null;
  return (
    <section className="mb-8 sm:mb-10">
      <h2 className="mb-3 sm:mb-4 font-sans text-lg sm:text-xl font-black tracking-tight text-foreground lg:text-2xl">
        Shop by Category
      </h2>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {visibleItems.map((item) => (
          <CategoryLink
            key={item.id}
            id={item.id}
            className="group overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-card shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="aspect-[4/3] overflow-hidden bg-surface">
              <img
                src={productsInCategory(item.id, products)[0]?.image ?? item.bannerImage}
                alt={item.name}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-2.5 sm:p-3">
              <p className="text-xs sm:text-sm font-extrabold leading-snug text-foreground group-hover:text-primary">
                {item.name}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[10px] sm:text-[11px] text-muted-foreground">
                {item.bannerSubtitle}
              </p>
            </div>
          </CategoryLink>
        ))}
      </div>
    </section>
  );
}

export function PageBody({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto max-w-container-max px-3 sm:px-4 py-6 sm:py-10 lg:px-6 lg:py-14">
      {children}
    </main>
  );
}
