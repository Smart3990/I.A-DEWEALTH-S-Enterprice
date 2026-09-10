import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Cog,
  Fuel,
  MapPin,
  MessageCircle,
  Palette,
  ShieldCheck,
  Gauge,
  Car as CarIcon,
} from "lucide-react";
import {
  cars,
  carCategories,
  carsInCategory,
  waCarLink,
  WHATSAPP,
  type Car,
} from "@/data/products";
import carsHero from "@/assets/cars-hero.jpg";

export const Route = createFileRoute("/cars/")({
  head: () => ({
    meta: [
      { title: "Cars & Vehicles | IA DEWEALTH'S Enterprise" },
      {
        name: "description",
        content:
          "Browse brand new, foreign used and home used cars in Ghana. SUVs, sedans, pickups and EVs, inspected, registered and cleared. Contact us on WhatsApp.",
      },
      { property: "og:title", content: "Cars & Vehicles | IA DEWEALTH'S Enterprise" },
      {
        property: "og:description",
        content:
          "Premium cars in Accra: SUVs, sedans, pickups and EVs. Message us on WhatsApp to buy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CarsPage,
});

const conditionStyles: Record<Car["condition"], string> = {
  "Brand New": "bg-primary text-primary-foreground",
  "Foreign Used": "bg-accent text-accent-foreground",
  "Home Used": "bg-nav text-nav-foreground",
};

function SpecChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Fuel;
  label: string;
  value: string;
}) {
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

function CarCard({ car }: { car: Car }) {
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
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
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

        <div className="mt-4 grid grid-cols-2 gap-2">
          <SpecChip icon={Fuel} label="Fuel / Engine" value={car.fuel} />
          <SpecChip icon={Cog} label="Transmission" value={car.transmission} />
          <SpecChip icon={Gauge} label="Mileage" value={car.mileage} />
          <SpecChip icon={Palette} label="Colour" value={car.color} />
        </div>

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

function CarsPage() {
  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      {/* Hero banner */}
      <section className="relative overflow-hidden bg-nav">
        <img
          src={carsHero}
          alt="Premium cars in the IA DEWEALTH showroom"
          width={1920}
          height={1024}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-nav via-nav/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-nav via-transparent to-nav/40" />

        <div className="relative mx-auto flex max-w-container-max flex-col gap-6 px-4 py-20 lg:px-6 lg:py-28">
          <Link
            to="/"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur transition hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.2em] text-accent-foreground">
              <CarIcon className="h-4 w-4" /> IA Dewealth Auto Gallery
            </p>
            <h1 className="mt-4 font-sans text-4xl font-black leading-[1.05] tracking-tight text-white lg:text-6xl">
              Drive Home
              <span className="block bg-gradient-to-r from-primary-soft via-primary to-accent bg-clip-text text-transparent">
                Exceptional.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 lg:text-base">
              Hand-picked SUVs, sedans, pickups and EVs: brand new, foreign used and home used.
              Every vehicle is inspected, registered and cleared, ready for same-week delivery
              anywhere in Ghana.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hello IA DEWEALTH, I'd like to enquire about your cars.")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-extrabold text-primary-foreground shadow-2xl transition hover:bg-primary-dark"
              >
                <MessageCircle className="h-5 w-5" /> Chat With Our Auto Team
              </a>
              <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                <ShieldCheck className="h-4 w-4 text-accent" /> Fully Inspected
                <span className="text-white/40">•</span>
                <MapPin className="h-4 w-4 text-accent" /> Accra Showroom
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-container-max grid-cols-2 gap-4 px-4 py-6 text-center sm:grid-cols-4 lg:px-6">
          {[
            ["40+", "Cars Sold This Year"],
            ["100%", "Inspected & Verified"],
            ["7 Days", "Avg. Delivery Time"],
            ["1 Year", "Warranty Available"],
          ].map(([num, label]) => (
            <div key={label}>
              <p className="font-sans text-2xl font-black text-primary lg:text-3xl">{num}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-container-max px-4 pt-12 lg:px-6 lg:pt-16">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
            Browse By Category
          </p>
          <h2 className="mt-1 font-sans text-3xl font-black tracking-tight text-foreground lg:text-4xl">
            Car Categories
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Pick a category to open a dedicated showcase with full specs and direct WhatsApp
            enquiry.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {carCategories.map((cat) => {
            const count = carsInCategory(cat.slug).length;
            return (
              <Link
                key={cat.slug}
                to="/cars/$category"
                params={{ category: cat.slug }}
                className="group relative overflow-hidden rounded-3xl border border-border shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <img
                  src={cat.image}
                  alt={cat.label}
                  loading="lazy"
                  className="h-56 w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-80 mix-blend-multiply`}
                />
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <p
                    className={`text-[11px] font-extrabold uppercase tracking-[0.25em] ${cat.accent}`}
                  >
                    {cat.tagline}
                  </p>
                  <h3 className="mt-1 font-sans text-2xl font-black text-white">{cat.label}</h3>
                  <p className="mt-1 text-xs font-semibold text-white/75">
                    {count} vehicle{count === 1 ? "" : "s"} available
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Car grid */}

      <main className="mx-auto max-w-container-max px-4 py-12 lg:px-6 lg:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
              Current Stock
            </p>
            <h2 className="mt-1 font-sans text-3xl font-black tracking-tight text-foreground lg:text-4xl">
              Available Vehicles
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {cars.length} vehicles in stock, with prices negotiable on inspection
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 overflow-hidden rounded-3xl bg-gradient-to-r from-nav via-primary-dark to-primary p-8 text-center lg:p-12">
          <h3 className="font-sans text-2xl font-black text-white lg:text-3xl">
            Don't see your dream car? We source on request.
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/80">
            Tell us the brand, model and budget. Our import team will find it, clear it and deliver
            it to your door.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hello IA DEWEALTH, I'd like you to source a car for me.")}`}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-extrabold text-accent-foreground shadow-2xl transition hover:bg-accent-dark"
          >
            <MessageCircle className="h-5 w-5" /> Request a Car on WhatsApp
          </a>
        </div>
      </main>
    </div>
  );
}
