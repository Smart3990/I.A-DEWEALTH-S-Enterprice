import { Link } from "@tanstack/react-router";
import { Heart, BadgeCheck } from "lucide-react";
import { useStore } from "./store";
import { MiniCart } from "./MiniCart";
import { WHATSAPP } from "@/data/products";
import { ShopMenu } from "./catalog/ShopMenu";
import { HeaderSearch } from "./HeaderSearch";
import brandLogo from "@/assets/ia-dewealth-logo.png";
import locationMark from "@/assets/location-mark.png";

const ticker = [
  "⚡ Same-Day Accra Delivery & VIP Courier Nationwide",
  "🛡️ 100% Genuine Tech Guarantee: Zero Counterfeit",
  "💳 Pay on Inspection / MoMo & Telecel Accepted",
  "⚡ Direct Import Prices",
  "📦 Zero Signup / Instant WhatsApp Checkout",
];

function TickerRow({ hidden = false }: { hidden?: boolean }) {
  return (
    <div aria-hidden={hidden} className="flex items-center gap-6">
      <span className="inline-flex items-center gap-3">
        {ticker.map((t, i) => (
          <span key={t} className="inline-flex items-center gap-3">
            <span>{t}</span>
            {i < ticker.length - 1 && <span className="text-primary-soft">•</span>}
          </span>
        ))}
      </span>
      <span className="flex items-center gap-1 font-semibold">
        <BadgeCheck className="h-4 w-4" /> Certified Tier-1 Importer
      </span>
      <a
        className="font-bold text-primary-soft hover:underline"
        href={`https://wa.me/${WHATSAPP}`}
        target="_blank"
        rel="noreferrer"
      >
        Direct WhatsApp Support
      </a>
      <span className="text-primary-soft">★</span>
    </div>
  );
}

export function SiteHeader() {
  const { count, favorites } = useStore();

  return (
    <>
      <div className="relative z-50 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
        <div className="marquee-wrapper w-full cursor-default select-none overflow-hidden">
          <div className="animate-marquee items-center gap-6 whitespace-nowrap text-[12px]">
            <TickerRow />
            <TickerRow hidden />
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-card shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
        <div className="border-b border-border/70">
          <div className="mx-auto flex h-20 max-w-container-max items-center justify-between gap-3 px-4 lg:gap-6 lg:px-6">
            <div className="flex shrink-0 items-center gap-5">
              <Link
                to="/"
                className="flex items-center gap-2.5 leading-none"
                aria-label="I.A Dewealth's Enterprise home"
              >
                <img src={brandLogo} alt="" className="h-11 w-11 shrink-0 object-contain" />
                <span className="flex flex-col">
                  <span className="font-sans text-lg font-extrabold tracking-tight text-foreground lg:text-xl">
                    I.A DEWEALTH<span className="text-primary">'S</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                    Be Timeless
                  </span>
                </span>
              </Link>
              <Link
                to="/delivery"
                aria-label="Nationwide delivery, shop location and contacts"
                className="hidden items-center gap-2 border-l border-border pl-3 transition hover:opacity-80 xl:flex"
              >
                <img src={locationMark} alt="" className="h-8 w-8 shrink-0 object-contain" />
                <div className="text-left text-xs leading-tight">
                  <span className="block font-normal text-muted-foreground">Nationwide</span>
                  <span className="block font-bold text-primary-dark">Delivery</span>
                </div>
              </Link>
            </div>

            <div className="max-w-2xl flex-1">
              <HeaderSearch />
            </div>

            <div className="flex shrink-0 items-center gap-3 lg:gap-5">
              <Link
                to="/favorites"
                aria-label="Favorites"
                className="relative p-2 transition hover:opacity-80"
              >
                <Heart className="h-7 w-7" strokeWidth={1.75} />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-foreground">
                  {favorites.length}
                </span>
              </Link>
              <MiniCart count={count} />
            </div>
          </div>
        </div>

        <ShopMenu />
      </header>
    </>
  );
}
