import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cedi, useStore } from "./store";
import { useEffect, useMemo, useRef, useState } from "react";
import { discountOf } from "@/data/catalog";
import { useProducts } from "@/data/use-catalog";
import { useSite } from "@/data/site";
import { useCurrentSiteSettings } from "@/data/site-settings-store";

function Countdown() {
  const [settings] = useCurrentSiteSettings();

  const totalConfiguredSeconds = useMemo(() => {
    const h = settings.superdealsHours !== undefined ? Number(settings.superdealsHours) : 8;
    const m = settings.superdealsMinutes !== undefined ? Number(settings.superdealsMinutes) : 29;
    const s = settings.superdealsSeconds !== undefined ? Number(settings.superdealsSeconds) : 33;
    return Math.max(1, h * 3600 + m * 60 + s);
  }, [settings.superdealsHours, settings.superdealsMinutes, settings.superdealsSeconds]);

  // On page restart (fresh load), resets to the admin set time
  const [left, setLeft] = useState(totalConfiguredSeconds);

  useEffect(() => {
    setLeft(totalConfiguredSeconds);
  }, [totalConfiguredSeconds]);

  useEffect(() => {
    const t = setInterval(() => setLeft((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div
      suppressHydrationWarning
      className="flex items-center gap-1 font-mono text-[10px] sm:text-xs font-bold text-primary-foreground"
    >
      <span suppressHydrationWarning className="rounded bg-nav px-1 sm:px-1.5 py-0.5">
        {pad(Math.floor(left / 3600))}
      </span>
      :
      <span suppressHydrationWarning className="rounded bg-nav px-1 sm:px-1.5 py-0.5">
        {pad(Math.floor((left % 3600) / 60))}
      </span>
      :
      <span suppressHydrationWarning className="rounded bg-nav px-1 sm:px-1.5 py-0.5">
        {pad(left % 60)}
      </span>
    </div>
  );
}

export function SuperDeals() {
  const { addToCart } = useStore();
  const products = useProducts();
  const { sections } = useSite();
  const section = sections.find((s) => s.key === "deals");
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollDeals = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const distance = dir === "left" ? -480 : 480;
    scrollRef.current.scrollBy({ left: distance, behavior: "smooth" });
  };

  const deals = useMemo(() => {
    // 1. Explicitly designated deals
    const explicitDeals = products
      .filter((p) => Boolean(p.deal))
      .sort((a, b) => {
        const timeB = new Date(b.addedAt || 0).getTime() || 0;
        const timeA = new Date(a.addedAt || 0).getTime() || 0;
        if (timeB !== timeA) return timeB - timeA;
        return discountOf(b) - discountOf(a);
      });

    // 2. High-discount fallback products
    const fallbackDeals = products
      .filter((p) => !p.deal && discountOf(p) >= 20)
      .sort((a, b) => {
        const timeB = new Date(b.addedAt || 0).getTime() || 0;
        const timeA = new Date(a.addedAt || 0).getTime() || 0;
        if (timeB !== timeA) return timeB - timeA;
        return discountOf(b) - discountOf(a);
      });

    const combined = [...explicitDeals, ...fallbackDeals];
    const limit = Math.max(section?.itemLimit || 12, 12);
    return combined.slice(0, limit);
  }, [products, section?.itemLimit]);

  if (!deals.length) return null;

  return (
    <section
      id="super-deals"
      className="w-full border-b border-border bg-surface py-3 sm:py-6 lg:py-8"
    >
      <div className="mx-auto max-w-container-max px-3 sm:px-4 lg:px-6">
        <div className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-deal to-accent p-2.5 sm:p-5 md:p-6 shadow-md">
          {/* Header row */}
          <div className="mb-2.5 sm:mb-4 flex flex-col justify-between gap-2 sm:gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2 sm:gap-3.5">
              <div className="flex shrink-0 items-center rounded-full bg-card px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider text-deal shadow-xs">
                {section?.eyebrow || "SUPERDEALS"}
              </div>
              <div className="flex flex-col">
                <h2 className="text-xs sm:text-lg md:text-xl font-black leading-tight tracking-tight text-primary-foreground">
                  {section?.title || "Get Amazing SuperDeals Today"}
                </h2>
                <span className="text-[9px] sm:text-xs font-medium text-primary-foreground/90">
                  {section?.subtitle || "Up to 50% Off • Limited Stock Across Ghana"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
              <div className="flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl bg-nav/30 px-2 sm:px-3 py-0.5 sm:py-1 backdrop-blur-xs">
                <span className="text-[9px] sm:text-xs font-semibold text-primary-foreground">
                  Ends:
                </span>
                <Countdown />
              </div>

              {/* Desktop single-row scroll controls */}
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollDeals("left")}
                  aria-label="Scroll deals left"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 hover:bg-white/35 text-white transition active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollDeals("right")}
                  aria-label="Scroll deals right"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 hover:bg-white/35 text-white transition active:scale-95 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <Link
                to="/deals"
                className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-primary-foreground underline-offset-4 hover:underline"
              >
                <span>View all</span>
                <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </Link>
            </div>
          </div>

          {/* Single row on ALL viewports: much smaller on mobile, smooth scroll on desktop */}
          <div
            ref={scrollRef}
            className="flex snap-x snap-mandatory gap-2 sm:gap-3 lg:gap-4 overflow-x-auto pb-1.5 sm:pb-2.5 scrollbar-none scroll-smooth"
          >
            {deals.map((d) => (
              <article
                key={d.id}
                className="group w-[104px] min-w-[104px] sm:w-[155px] sm:min-w-[155px] md:w-[185px] md:min-w-[185px] lg:w-[205px] lg:min-w-[205px] shrink-0 snap-start flex flex-col justify-between rounded-lg sm:rounded-xl md:rounded-2xl bg-card p-1.5 sm:p-2.5 md:p-3.5 shadow-xs transition hover:shadow-md"
              >
                <Link
                  to="/product/$id"
                  params={{ id: d.id }}
                  aria-label={`View ${d.name}`}
                  className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="relative mb-1 sm:mb-2 md:mb-2.5 flex aspect-square items-center justify-center overflow-hidden rounded-md sm:rounded-lg md:rounded-xl bg-secondary">
                    {discountOf(d) > 0 && (
                      <span className="absolute left-1 top-1 sm:left-1.5 sm:top-1.5 z-10 rounded bg-deal px-1 py-0.2 sm:px-1.5 sm:py-0.5 text-[8px] sm:text-[10px] font-extrabold text-deal-foreground shadow-xs">
                        -{discountOf(d)}%
                      </span>
                    )}
                    <img
                      src={d.image}
                      alt={d.name}
                      width={768}
                      height={768}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                      className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
                    />
                    <span className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 rounded border border-primary/25 bg-primary-soft px-1 py-0.2 text-[7px] sm:text-[9px] font-bold text-primary-dark">
                      Choice
                    </span>
                  </div>
                  <div>
                    <h3 className="mb-0.5 line-clamp-2 min-h-[1.4rem] sm:min-h-[2.1rem] md:min-h-[2.4rem] text-[10px] sm:text-xs md:text-sm font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
                      {d.name}
                    </h3>
                    <div className="text-[8px] sm:text-[11px] font-medium text-primary-dark truncate">
                      {d.tag || d.spec}
                    </div>
                  </div>
                </Link>

                <div className="mt-1 sm:mt-2.5 flex w-full flex-col gap-1 sm:gap-1.5">
                  <div className="flex min-w-0 flex-wrap items-baseline gap-x-1">
                    <span className="text-[11px] sm:text-sm md:text-base font-extrabold leading-none text-deal">
                      {cedi(d.price)}
                    </span>
                    {d.was > d.price && (
                      <span className="whitespace-nowrap text-[8px] sm:text-xs leading-none text-muted-foreground line-through">
                        {cedi(d.was)}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart(d.id, d.name, d.price, d.image);
                    }}
                    className="w-full shrink-0 whitespace-nowrap rounded sm:rounded-lg bg-primary py-1 sm:py-1.5 text-[9px] sm:text-xs font-bold text-primary-foreground shadow-2xs transition hover:bg-primary-dark active:scale-95 cursor-pointer"
                  >
                    Add to Cart
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
