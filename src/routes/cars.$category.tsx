import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Cog,
  Fuel,
  Gauge,
  MapPin,
  MessageCircle,
  Palette,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { carCategories, carsInCategory, waCarLink, WHATSAPP, type Car } from "@/data/products";

export const Route = createFileRoute("/cars/$category")({
  loader: ({ params }) => {
    const category = carCategories.find((c) => c.slug === params.category);
    if (!category) throw notFound();
    return { category, list: carsInCategory(category.slug) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Category unavailable | IA DEWEALTH'S Auto" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.category.label} in Ghana | IA DEWEALTH'S Auto`;
    const description = loaderData.category.blurb;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <h1 className="font-sans text-3xl font-black text-foreground">Category not found</h1>
      <Link
        to="/cars"
        className="rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground"
      >
        Back to all cars
      </Link>
    </div>
  ),
});

const conditionStyles: Record<Car["condition"], string> = {
  "Brand New": "bg-primary text-primary-foreground",
  "Foreign Used": "bg-accent text-accent-foreground",
  "Home Used": "bg-nav text-nav-foreground",
};

function Field({ icon: Icon, label, value }: { icon: typeof Fuel; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="block truncate text-xs font-bold text-foreground">{value}</span>
      </span>
    </div>
  );
}

function ShowcaseCard({ car }: { car: Car }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative overflow-hidden bg-surface">
        <img
          src={car.image}
          alt={`${car.brand} ${car.model}`}
          loading="lazy"
          width={1024}
          height={768}
          className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide shadow-lg ${conditionStyles[car.condition]}`}
        >
          {car.condition}
        </span>
        {car.featured && (
          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
            <BadgeCheck className="h-3.5 w-3.5 text-accent" /> Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              {car.brand}
            </p>
            <h3 className="mt-0.5 font-sans text-lg font-extrabold leading-snug text-foreground">
              {car.model}
            </h3>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-foreground">
            <Calendar className="h-3.5 w-3.5" /> {car.year}
          </span>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-2">
          <Field icon={Sparkles} label="Car Brand" value={car.brand} />
          <Field icon={BadgeCheck} label="New or Used" value={car.condition} />
          <Field icon={Fuel} label="Fuel / Engine" value={car.fuel} />
          <Field icon={Cog} label="Transmission" value={car.transmission} />
          <Field icon={Gauge} label="Mileage" value={car.mileage} />
          <Field icon={Palette} label="Colour" value={car.color} />
        </dl>

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-border pt-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Cash Price
            </p>
            <p className="font-sans text-2xl font-black tracking-tight text-foreground">
              GHC {car.price.toLocaleString()}
            </p>
          </div>
          <a
            href={waCarLink(car)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-primary px-3 py-3 text-xs font-extrabold text-primary-foreground shadow-lg transition hover:bg-primary-dark sm:text-sm"
          >
            Connect with us
          </a>
        </div>
      </div>
    </article>
  );
}

function CategoryPage() {
  const { category, list } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      {/* Banner */}
      <section className="relative overflow-hidden">
        <img
          src={category.image}
          alt={category.label}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-90`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

        <div className="relative mx-auto max-w-container-max px-4 py-20 lg:px-6 lg:py-28">
          <Link
            to="/cars"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur transition hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" /> All Car Categories
          </Link>

          <div className="mt-6 max-w-2xl">
            <p
              className={`text-[11px] font-extrabold uppercase tracking-[0.3em] ${category.accent}`}
            >
              {category.tagline}
            </p>
            <h1 className="mt-3 font-sans text-4xl font-black leading-[1.05] tracking-tight text-white lg:text-6xl">
              {category.label}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/85 lg:text-base">
              {category.blurb}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hello IA DEWEALTH, I'm interested in your ${category.label}. Please share what's available.`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-extrabold text-primary-foreground shadow-2xl transition hover:bg-primary-dark"
              >
                <MessageCircle className="h-5 w-5" /> Contact Us
              </a>
              <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                <ShieldCheck className="h-4 w-4" /> Fully Inspected
                <span className="text-white/40">•</span>
                <MapPin className="h-4 w-4" /> Accra Showroom
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category switcher */}
      <nav className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-container-max gap-2 overflow-x-auto px-4 py-3 lg:px-6">
          {carCategories.map((c) => (
            <Link
              key={c.slug}
              to="/cars/$category"
              params={{ category: c.slug }}
              activeProps={{ className: "bg-primary text-primary-foreground border-primary" }}
              className="whitespace-nowrap rounded-full border border-border px-4 py-2 text-xs font-bold text-foreground transition hover:border-primary hover:text-primary"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-container-max px-4 py-12 lg:px-6 lg:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-sans text-3xl font-black tracking-tight text-foreground lg:text-4xl">
            Available {category.label}
          </h2>
          <p className="text-sm text-muted-foreground">
            {list.length} vehicle{list.length === 1 ? "" : "s"}, with prices negotiable on
            inspection
          </p>
        </div>

        {list.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((car) => (
              <ShowcaseCard key={car.id} car={car} />
            ))}
          </div>
        ) : (
          <p className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            No vehicles in this category right now. Message us and we'll source one for you.
          </p>
        )}

        <div
          className={`mt-14 overflow-hidden rounded-3xl bg-gradient-to-r ${category.gradient} p-8 text-center lg:p-12`}
        >
          <h3 className="font-sans text-2xl font-black text-white lg:text-3xl">
            Want to see one of these in person?
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/85">
            Send us a message and our auto team will arrange an inspection or source your exact
            spec.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hello IA DEWEALTH, I'd like to book a viewing for your ${category.label}.`)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-extrabold text-nav shadow-2xl transition hover:bg-white/90"
          >
            <MessageCircle className="h-5 w-5" /> Contact Us on WhatsApp
          </a>
        </div>
      </main>
    </div>
  );
}
