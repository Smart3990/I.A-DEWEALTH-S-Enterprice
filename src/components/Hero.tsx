import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MessageCircle, ArrowRight } from "lucide-react";
import { useCategories } from "@/data/category-store";
import { CategoryLink } from "@/components/catalog/CategoryLink";
import { WHATSAPP } from "@/data/products";

export function Hero() {
  const { roots } = useCategories();
  const [active, setActive] = useState(0);

  const slides = roots.map((c) => ({
    id: c.id,
    name: c.name,
    title: c.bannerTitle || c.name,
    body: c.bannerSubtitle || c.description,
    image: c.bannerImage,
    cta: c.bannerCTA ?? `Shop ${c.name}`,
  }));

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setActive((a) => (a + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, [slides.length]);

  if (!slides.length) return null;
  const current = Math.min(active, slides.length - 1);
  const curSlide = slides[current];

  return (
    <>
      {/* ============================================================ */}
      {/* MOBILE VIEW (< md): Compact card banner as requested          */}
      {/* ============================================================ */}
      <section className="block md:hidden w-full bg-card pt-3 pb-2">
        <div className="px-3">
          <div className="relative overflow-hidden rounded-2xl shadow-sm min-h-[175px] sm:min-h-[220px] flex items-center bg-slate-900">
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
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/25" />

                <div className="relative z-20 flex flex-col items-start justify-center h-full w-full px-4 py-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-accent mb-0.5">
                    {slide.name}
                  </span>
                  <h1 className="text-base sm:text-xl font-black leading-tight text-white max-w-xs">
                    {slide.title}
                  </h1>
                  <p className="mt-1 text-[11px] text-white/90 line-clamp-2 max-w-[240px]">
                    {slide.body}
                  </p>

                  <div className="mt-2.5">
                    <CategoryLink
                      id={slide.id}
                      className="inline-flex items-center justify-center rounded-xl bg-white px-3.5 py-1.5 text-xs font-bold text-slate-900 shadow-md transition hover:bg-slate-100 active:scale-95 text-center"
                    >
                      {slide.cta}
                    </CategoryLink>
                  </div>
                </div>
              </div>
            ))}

            {/* Top-right slide counter pill */}
            <div className="absolute top-2.5 right-2.5 z-30 rounded-full bg-black/50 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
              {current + 1}/{slides.length}
            </div>

            {/* Compact arrow controls */}
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => setActive((a) => (a - 1 + slides.length) % slides.length)}
              className="absolute left-2 top-1/2 z-30 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/75 text-foreground shadow-sm backdrop-blur-xs transition hover:bg-white active:scale-90"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => setActive((a) => (a + 1) % slides.length)}
              className="absolute right-2 top-1/2 z-30 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/75 text-foreground shadow-sm backdrop-blur-xs transition hover:bg-white active:scale-90"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* DESKTOP & LARGE SCREEN (>= md): Original Full Desktop Hero   */}
      {/* ============================================================ */}
      <section className="hidden md:block relative w-full overflow-hidden border-b border-border bg-slate-950 text-white min-h-[460px] lg:min-h-[500px]">
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
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            {/* Rich multi-stop gradient overlay for readable typography */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/30" />

            <div className="relative z-20 mx-auto flex h-full w-full max-w-container-max flex-col justify-center px-6 lg:px-8 py-16">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-accent mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                {slide.name}
              </span>

              <h1 className="text-3xl lg:text-5xl font-black leading-tight text-white max-w-2xl drop-shadow-sm">
                {slide.title}
              </h1>

              <p className="mt-3 text-sm lg:text-base text-white/85 max-w-xl line-clamp-3 leading-relaxed">
                {slide.body}
              </p>

              {/* Dual CTAs on desktop */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <CategoryLink
                  id={slide.id}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-dark px-6 py-3.5 text-sm font-black text-primary-foreground shadow-lg transition active:scale-95"
                >
                  <span>{slide.cta}</span>
                  <ArrowRight className="h-4 w-4" />
                </CategoryLink>

                <a
                  href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                    `Hello I.A Dewealth's Enterprise, I am inquiring about ${curSlide.title}`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 backdrop-blur-md px-5 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition active:scale-95"
                >
                  <MessageCircle className="h-4 w-4 text-[#25D366]" />
                  <span>Order via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        ))}

        {/* Desktop navigation chevron buttons */}
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => setActive((a) => (a - 1 + slides.length) % slides.length)}
          className="absolute left-6 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/40 active:scale-95"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => setActive((a) => (a + 1) % slides.length)}
          className="absolute right-6 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/40 active:scale-95"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Desktop slide indicator dots */}
        <div className="absolute bottom-5 left-0 right-0 z-30 flex items-center justify-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => setActive(idx)}
              className={`h-2 transition-all duration-300 rounded-full ${
                idx === current ? "w-8 bg-white" : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </section>
    </>
  );
}
