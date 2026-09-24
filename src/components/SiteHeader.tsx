import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, BadgeCheck } from "lucide-react";
import { useStore } from "./store";
import { MiniCart } from "./MiniCart";
import { WHATSAPP } from "@/data/products";
import { ShopMenu } from "./catalog/ShopMenu";
import { HeaderSearch } from "./HeaderSearch";
import { useNewsTicker, type NewsTickerConfig } from "@/data/news-ticker-store";
import brandLogo from "@/assets/ia-dewealth-logo.png";
import locationMark from "@/assets/location-mark.png";

function TickerRow({ config, hidden = false }: { config: NewsTickerConfig; hidden?: boolean }) {
  const activeItems = (config?.items || []).filter((item) => item?.active);
  const tierBadgeEnabled = Boolean(config?.tierBadge?.enabled);
  const supportLinkEnabled = Boolean(config?.supportLink?.enabled);

  return (
    <div aria-hidden={hidden} className="flex items-center gap-6">
      <span className="inline-flex items-center gap-3">
        {activeItems.map((item, i) => (
          <span key={item.id || i} className="inline-flex items-center gap-3">
            {item.link ? (
              <a
                href={item.link}
                className="hover:underline transition"
                target={item.link.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
              >
                {item.text}
              </a>
            ) : (
              <span>{item.text}</span>
            )}
            {(i < activeItems.length - 1 || tierBadgeEnabled || supportLinkEnabled) && (
              <span className="opacity-70">•</span>
            )}
          </span>
        ))}
      </span>

      {tierBadgeEnabled && (
        <>
          <span className="flex items-center gap-1 font-semibold">
            <BadgeCheck className="h-4 w-4" /> {config?.tierBadge?.text}
          </span>
          {supportLinkEnabled && <span className="opacity-70">•</span>}
        </>
      )}

      {supportLinkEnabled && (
        <a
          className="font-bold hover:underline transition"
          href={config?.supportLink?.url || `https://wa.me/${WHATSAPP}`}
          target="_blank"
          rel="noreferrer"
        >
          {config?.supportLink?.text}
        </a>
      )}
      <span className="opacity-70">★</span>
    </div>
  );
}

export function SiteHeader() {
  const { count, favorites } = useStore();
  const [newsConfig] = useNewsTicker();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // In mobile view only, hide this top header (news ticker, brand logo, search bar) on Cart, Saved (Favorites), All Categories, and Product Detail pages
  const hideOnMobile =
    pathname === "/cart" ||
    pathname.startsWith("/cart/") ||
    pathname === "/favorites" ||
    pathname.startsWith("/favorites/") ||
    pathname === "/categories" ||
    pathname.startsWith("/categories/") ||
    pathname === "/product" ||
    pathname.startsWith("/product/");

  const isVisible = Boolean(
    newsConfig?.enabled &&
    (newsConfig?.items?.some((i) => i?.active) ||
      newsConfig?.tierBadge?.enabled ||
      newsConfig?.supportLink?.enabled),
  );

  return (
    <>
      {isVisible && (
        <div
          suppressHydrationWarning
          style={{
            backgroundColor: newsConfig?.backgroundColor || "#00a884",
            color: newsConfig?.textColor || "#ffffff",
          }}
          className={`${hideOnMobile ? "hidden sm:block" : ""} relative z-50 px-4 py-2 text-xs font-semibold ${
            newsConfig?.pauseOnHover
              ? "hover:[&_.animate-marquee]:[animation-play-state:paused]"
              : ""
          }`}
        >
          <div className="marquee-wrapper w-full cursor-default select-none overflow-hidden">
            <div
              className="animate-marquee items-center gap-6 whitespace-nowrap text-[12px]"
              style={{
                animationDuration: `${newsConfig?.speedSeconds || 30}s`,
              }}
            >
              <TickerRow config={newsConfig} />
              <TickerRow config={newsConfig} hidden />
            </div>
          </div>
        </div>
      )}

      <header
        className={`${hideOnMobile ? "hidden sm:block" : ""} sticky top-0 z-40 bg-card shadow-[0_2px_10px_rgba(0,0,0,0.06)]`}
      >
        <div className="border-b border-border/70">
          <div className="mx-auto max-w-container-max px-3 py-2.5 sm:py-0 sm:h-20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 lg:gap-6 lg:px-6">
            {/* Top row on mobile, left on desktop */}
            <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-5">
              <Link
                to="/"
                className="flex items-center gap-2 leading-none"
                aria-label="I.A Dewealth's Enterprise home"
              >
                <img
                  src={brandLogo}
                  alt=""
                  className="h-9 w-9 sm:h-11 sm:w-11 shrink-0 object-contain"
                />
                <span className="flex flex-col">
                  <span className="font-sans text-base sm:text-lg font-extrabold tracking-tight text-foreground lg:text-xl">
                    I.A DEWEALTH<span className="text-primary">'S</span>
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
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

              {/* Mobile top-right icons */}
              <div className="flex items-center gap-1 sm:hidden">
                <Link
                  to="/favorites"
                  aria-label="Favorites"
                  className="relative p-2 transition hover:opacity-80"
                >
                  <Heart className="h-5 w-5" strokeWidth={2} />
                  <span className="absolute 0 top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-foreground">
                    {favorites.length}
                  </span>
                </Link>
                <MiniCart count={count} />
              </div>
            </div>

            {/* Search bar: full width on mobile, centered on desktop */}
            <div className="w-full sm:max-w-2xl sm:flex-1">
              <HeaderSearch />
            </div>

            {/* Desktop right icons */}
            <div className="hidden sm:flex shrink-0 items-center gap-3 lg:gap-5">
              <Link
                to="/favorites"
                aria-label="Favorites"
                className="relative p-2 transition hover:opacity-80"
              >
                <Heart className="h-6 w-6 lg:h-7 lg:w-7" strokeWidth={1.75} />
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
