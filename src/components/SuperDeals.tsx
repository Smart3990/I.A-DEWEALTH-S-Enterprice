import { Link } from "@tanstack/react-router";
import { cedi, useStore } from "./store";
import { useEffect, useMemo, useState } from "react";
import { discountOf } from "@/data/catalog";
import { useProducts } from "@/data/use-catalog";
import { useSite } from "@/data/site";

function Countdown() {
  const [left, setLeft] = useState(8 * 3600 + 29 * 60 + 41);
  useEffect(() => {
    const t = setInterval(() => setLeft((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="flex items-center gap-1 font-mono text-xs font-bold text-primary-foreground">
      <span className="rounded bg-nav px-2 py-0.5">{pad(Math.floor(left / 3600))}</span>:
      <span className="rounded bg-nav px-2 py-0.5">{pad(Math.floor((left % 3600) / 60))}</span>:
      <span className="rounded bg-nav px-2 py-0.5">{pad(left % 60)}</span>
    </div>
  );
}

export function SuperDeals() {
  const { addToCart } = useStore();
  const products = useProducts();
  const { sections } = useSite();
  const section = sections.find((s) => s.key === "deals");

  const deals = useMemo(
    () =>
      products
        .filter((p) => p.deal || discountOf(p) >= 20)
        .sort((a, b) => discountOf(b) - discountOf(a))
        .slice(0, section?.itemLimit || 5),
    [products, section?.itemLimit],
  );

  if (!deals.length) return null;

  return (
    <section id="super-deals" className="w-full border-b border-border bg-surface py-10">
      <div className="mx-auto max-w-container-max px-4 lg:px-6">
        <div className="rounded-2xl bg-gradient-to-r from-deal to-accent p-5 shadow-md md:p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3.5">
              <div className="flex shrink-0 items-center rounded-full bg-card px-3 py-1.5 text-[12px] font-extrabold uppercase tracking-wider text-deal shadow-sm">
                {section?.eyebrow || "SUPERDEALS"}
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl font-extrabold leading-tight tracking-tight text-primary-foreground md:text-2xl">
                  {section?.title || "Get Amazing SuperDeals Today"}
                </h2>
                <span className="text-xs font-medium text-primary-foreground/85">
                  {section?.subtitle || "Up to 50% Off • Limited Stock Across Ghana"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start rounded-xl bg-nav/25 px-3.5 py-1.5 backdrop-blur-sm md:self-auto">
              <span className="text-xs font-semibold text-primary-foreground">Ends in:</span>
              <Countdown />
            </div>
          </div>

          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {deals.map((d) => (
              <article
                key={d.id}
                className="group flex w-[82%] min-w-[250px] shrink-0 snap-start flex-col justify-between rounded-2xl bg-card p-4 shadow-sm sm:w-[48%] lg:w-[31%] xl:w-[calc((100%_-_4rem)/5)] xl:min-w-0"
              >
                <Link
                  to="/product/$id"
                  params={{ id: d.id }}
                  aria-label={`View ${d.name}`}
                  className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="relative mb-3.5 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-secondary p-3">
                    {discountOf(d) > 0 && (
                      <span className="absolute left-2.5 top-2.5 z-10 rounded bg-deal px-2 py-0.5 text-[11px] font-extrabold text-deal-foreground shadow-sm">
                        -{discountOf(d)}%
                      </span>
                    )}
                    <img
                      src={d.image}
                      alt={d.name}
                      width={768}
                      height={768}
                      loading="lazy"
                      className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                    />
                    <span className="absolute bottom-2.5 right-2.5 rounded border border-primary/25 bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary-dark">
                      Choice
                    </span>
                  </div>
                  <div>
                    <h3 className="mb-1.5 min-h-[2.5rem] text-sm font-bold leading-snug">
                      {d.name}
                    </h3>
                    <div className="mb-1 text-xs font-medium text-primary-dark">
                      {d.tag || d.spec}
                    </div>
                  </div>
                </Link>
                <div className="mt-4 flex w-full flex-col gap-2.5">
                  <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-lg font-extrabold leading-none text-deal">
                      {cedi(d.price)}
                    </span>
                    {d.was > d.price && (
                      <span className="whitespace-nowrap text-xs leading-none text-muted-foreground line-through">
                        {cedi(d.was)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => addToCart(d.id, d.name, d.price, d.image)}
                    className="shrink-0 whitespace-nowrap rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary-dark"
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
