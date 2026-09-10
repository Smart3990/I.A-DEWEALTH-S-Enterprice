import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { WHATSAPP } from "@/data/products";
import { useCategories } from "@/data/category-store";
import { CategoryLink } from "@/components/catalog/CategoryLink";

export function Hero() {
  const { roots } = useCategories();
  const [active, setActive] = useState(0);

  const slides = roots.map((c) => ({
    id: c.id,
    name: c.name,
    title: c.bannerTitle,
    body: c.bannerSubtitle,
    image: c.bannerImage,
    cta: c.bannerCTA ?? "Shop now",
  }));

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setActive((a) => (a + 1) % slides.length), 3000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (!slides.length) return null;
  const current = Math.min(active, slides.length - 1);

  return (
    <section className="relative min-h-[440px] w-full overflow-hidden border-b border-border md:min-h-[490px]">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 flex h-full w-full items-center transition-opacity duration-700 ${
            i === current ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />

          <div className="relative mx-auto grid w-full max-w-container-max grid-cols-1 items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-6 lg:py-20">
            <div className="z-20 flex flex-col items-start gap-4 lg:col-span-7">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-accent">
                {slide.name}
              </span>
              <h1 className="text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[46px]">
                {slide.title}
              </h1>
              <p className="max-w-lg font-body text-sm leading-relaxed text-white/85 sm:text-base">
                {slide.body}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <CategoryLink
                  id={slide.id}
                  className="inline-flex items-center justify-center rounded-full bg-accent px-8 py-3.5 text-sm font-bold text-accent-foreground shadow-md transition hover:-translate-y-0.5 hover:shadow-lg md:text-base"
                >
                  {slide.cta}
                </CategoryLink>
                <a
                  href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                    `Hello IA DEWEALTH, I want to order from ${slide.name}`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25"
                >
                  <MessageCircle className="h-4 w-4" /> Order WhatsApp
                </a>
              </div>
            </div>
            <div aria-hidden className="lg:col-span-5" />
          </div>
        </div>
      ))}

      <button
        aria-label="Previous slide"
        onClick={() => setActive((a) => (a - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-foreground shadow-md backdrop-blur-sm transition hover:bg-white"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        aria-label="Next slide"
        onClick={() => setActive((a) => (a + 1) % slides.length)}
        className="absolute right-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-foreground shadow-md backdrop-blur-sm transition hover:bg-white"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            aria-label={`Slide ${i + 1}: ${s.name}`}
            onClick={() => setActive(i)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === current ? "w-7 bg-accent" : "w-2.5 bg-white/70 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
