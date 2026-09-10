import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";
import type { ReactNode } from "react";
import { productsInCategory, type Category } from "@/data/catalog";
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
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
      <div className="relative mx-auto max-w-container-max px-4 py-14 lg:px-6 lg:py-20">
        {eyebrow && (
          <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-accent">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-3 max-w-2xl font-sans text-3xl font-black leading-[1.08] tracking-tight text-white lg:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/85 lg:text-base">
          {subtitle}
        </p>
        {cta && ctaHref && (
          <a
            href={ctaHref}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-extrabold text-primary-foreground shadow-2xl transition hover:bg-primary-dark"
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
    <nav aria-label="Breadcrumb" className="border-b border-border bg-card">
      <ol className="mx-auto flex max-w-container-max flex-wrap items-center gap-1.5 px-4 py-3 text-xs lg:px-6">
        <li>
          <Link
            to="/"
            className="inline-flex items-center gap-1 font-semibold text-muted-foreground hover:text-primary"
          >
            <Home className="h-3.5 w-3.5" /> Home
          </Link>
        </li>
        {trail.map((item, i) => (
          <li key={`${item.name}-${i}`} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-border" />
            {item.categoryId && i < trail.length - 1 ? (
              <CategoryLink
                id={item.categoryId}
                className="font-semibold text-muted-foreground hover:text-primary"
              >
                {item.name}
              </CategoryLink>
            ) : (
              <span className="font-bold text-foreground">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function SubcategoryCards({ items }: { items: Category[] }) {
  if (!items.length) return null;
  return (
    <section className="mb-10">
      <h2 className="mb-4 font-sans text-xl font-black tracking-tight text-foreground lg:text-2xl">
        Shop by Category
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((item) => (
          <CategoryLink
            key={item.id}
            id={item.id}
            className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="aspect-[4/3] overflow-hidden bg-surface">
              <img
                src={productsInCategory(item.id)[0]?.image ?? item.bannerImage}
                alt={item.name}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-3">
              <p className="text-sm font-extrabold leading-snug text-foreground group-hover:text-primary">
                {item.name}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
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
    <main className="mx-auto max-w-container-max px-4 py-10 lg:px-6 lg:py-14">{children}</main>
  );
}
