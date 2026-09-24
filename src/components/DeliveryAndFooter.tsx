import { useMemo } from "react";
import { Facebook, Instagram, MessageCircle, Music2, Youtube, Twitter, Clock } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useCategories } from "@/data/category-store";
import { useSite, whatsappLink } from "@/data/site";
import { useCurrentSiteSettings } from "@/data/site-settings-store";
import { defaultSettings, DEFAULT_SOCIAL_REDIRECT } from "@/data/storefront";
import { CategoryLink } from "@/components/catalog/CategoryLink";
import { FooterMap } from "./FooterMap";
import brandLogo from "@/assets/ia-dewealth-logo.png";

export function SiteFooter() {
  const { roots } = useCategories();
  const [settings] = useCurrentSiteSettings();
  const { settings: siteSettings } = useSite();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHomePage = pathname === "/" || pathname === "";

  const activeSettings = useMemo(() => {
    return {
      ...defaultSettings,
      ...siteSettings,
      ...settings,
      email: settings.email || siteSettings.email || "sales@iadewealth.com",
      phone: settings.phone || siteSettings.phone || "+233 24 111 8229",
      address:
        settings.address ||
        siteSettings.address ||
        "Circle Tip Toe Lane, Opposite Vodafone Building, Accra, Ghana",
      facebook: settings.facebook || siteSettings.facebook || DEFAULT_SOCIAL_REDIRECT,
      instagram: settings.instagram || siteSettings.instagram || DEFAULT_SOCIAL_REDIRECT,
      tiktok: settings.tiktok || siteSettings.tiktok || DEFAULT_SOCIAL_REDIRECT,
      xUrl: settings.xUrl || settings.x_url || siteSettings.xUrl || DEFAULT_SOCIAL_REDIRECT,
      youtube: settings.youtube || siteSettings.youtube || DEFAULT_SOCIAL_REDIRECT,
      footerDescription:
        settings.footerDescription ||
        siteSettings.footerDescription ||
        defaultSettings.footerDescription,
      copyrightText:
        settings.copyrightText || siteSettings.copyrightText || defaultSettings.copyrightText,
    };
  }, [settings, siteSettings]);

  const wa = whatsappLink(activeSettings.whatsappNumber, activeSettings.whatsappMessage);

  const socials = [
    {
      label: "Facebook",
      href: activeSettings.facebook || DEFAULT_SOCIAL_REDIRECT,
      icon: Facebook,
    },
    {
      label: "Instagram",
      href: activeSettings.instagram || DEFAULT_SOCIAL_REDIRECT,
      icon: Instagram,
    },
    {
      label: "TikTok",
      href: activeSettings.tiktok || DEFAULT_SOCIAL_REDIRECT,
      icon: Music2,
    },
    {
      label: "X (Twitter)",
      href: activeSettings.xUrl || DEFAULT_SOCIAL_REDIRECT,
      icon: Twitter,
    },
    {
      label: "YouTube",
      href: activeSettings.youtube || DEFAULT_SOCIAL_REDIRECT,
      icon: Youtube,
    },
    { label: "WhatsApp", href: wa, icon: MessageCircle },
  ].filter((s) => s.href);

  // Parse working hours string to format lines nicely
  const workingHoursLines = (activeSettings.workingHours || "Monday–Saturday\n8:30 AM–7:00 PM")
    .split(/\n|(?=\s*\()/g)
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <footer
      suppressHydrationWarning
      className={`w-full bg-nav py-8 sm:py-12 text-nav-foreground/70 ${isHomePage ? "block" : "hidden sm:block"}`}
    >
      <div className="mx-auto max-w-container-max px-4 lg:px-6">
        {/* MOBILE VIEW: Only show social media, work hours, the map, and powered by */}
        <div className="block sm:hidden space-y-6">
          {/* The Map */}
          <div
            suppressHydrationWarning
            className="overflow-hidden rounded-2xl border border-nav-foreground/15 bg-nav-foreground/5"
          >
            <FooterMap query={activeSettings.address} />
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Our location
                </div>
                <div
                  suppressHydrationWarning
                  className="mt-0.5 text-xs font-semibold text-nav-foreground line-clamp-2"
                >
                  {activeSettings.address}
                </div>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeSettings.address)}`}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded-lg bg-primary/20 px-2.5 py-1 text-xs font-bold text-primary hover:underline"
              >
                Open map
              </a>
            </div>
          </div>

          {/* Work Hours */}
          <div
            suppressHydrationWarning
            className="rounded-2xl border border-nav-foreground/10 bg-nav-foreground/5 p-4 text-center"
          >
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-nav-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>Working Hours</span>
            </div>
            <div className="mt-2 space-y-1 font-body text-xs text-nav-foreground/90">
              {workingHoursLines.map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          </div>

          {/* Social Media */}
          {socials.length > 0 && (
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-nav-foreground/70 mb-3">
                Social Media
              </span>
              <div className="flex flex-wrap justify-center gap-3" aria-label="Social media links">
                {socials.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    title={label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-nav-foreground/15 bg-nav-foreground/5 text-nav-foreground/90 transition hover:border-primary hover:bg-primary hover:text-primary-foreground shadow-2xs"
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Powered by Kiyuhub & Copyright */}
          <div className="pt-4 border-t border-nav-foreground/10 text-center font-body text-xs space-y-1">
            <div>
              Powered by{" "}
              <a
                href="https://kiyuhub.netlify.app/"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#22C55E" }}
                className="font-bold hover:underline"
              >
                Kiyuhub
              </a>
            </div>
            <p className="text-[11px] text-nav-foreground/60">
              © {new Date().getFullYear()} {activeSettings.copyrightText}
            </p>
          </div>
        </div>

        {/* DESKTOP & TABLET VIEW: Full enterprise footer with all columns */}
        <div className="hidden sm:block">
          <div className="grid gap-10 border-t border-nav-foreground/10 pt-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.5fr]">
            <div>
              <div className="flex items-center gap-3 font-sans text-lg font-extrabold text-nav-foreground">
                <img
                  src={activeSettings.logoUrl || brandLogo}
                  alt=""
                  className="h-14 w-14 shrink-0 object-contain brightness-0 invert"
                />
                <span>
                  I.A DEWEALTH<span className="text-primary">'S</span>
                  <br />
                  Be Timeless
                </span>
              </div>
              <p
                suppressHydrationWarning
                className="mt-3 max-w-md font-body text-sm leading-relaxed"
              >
                {activeSettings.footerDescription}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-nav-foreground">
                All categories
              </h3>
              <ul className="mt-3 space-y-2 font-body text-sm">
                {roots.map((category) => (
                  <li key={category.id}>
                    <CategoryLink id={category.id} className="transition hover:text-primary">
                      {category.name}
                    </CategoryLink>
                  </li>
                ))}
              </ul>
            </div>
            <div suppressHydrationWarning>
              <h3 className="text-xs font-bold uppercase tracking-wider text-nav-foreground">
                Customer support
              </h3>
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                suppressHydrationWarning
                className="mt-3 inline-block font-body text-sm font-bold text-nav-foreground transition hover:text-primary"
              >
                {activeSettings.phone}
              </a>
              {activeSettings.email && (
                <p suppressHydrationWarning className="mt-1 font-body text-sm">
                  {activeSettings.email}
                </p>
              )}
              <div suppressHydrationWarning className="mt-1 font-body text-sm space-y-0.5">
                {workingHoursLines.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
              {socials.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2.5" aria-label="Social media links">
                  {socials.map(({ label, href, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      title={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-nav-foreground/15 bg-nav-foreground/5 text-nav-foreground/80 transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary hover:text-primary-foreground hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div
              suppressHydrationWarning
              className="overflow-hidden border border-nav-foreground/15"
            >
              <FooterMap query={activeSettings.address} />
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-primary">
                    Our location
                  </div>
                  <div
                    suppressHydrationWarning
                    className="mt-0.5 text-sm font-semibold text-nav-foreground"
                  >
                    {activeSettings.address}
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeSettings.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Open map
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-nav-foreground/10 pt-6">
            <div
              suppressHydrationWarning
              className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center font-body text-xs"
            >
              <span>
                © {new Date().getFullYear()} {activeSettings.copyrightText}
              </span>
              <span aria-hidden="true" className="hidden h-3 w-px bg-nav-foreground/25 sm:block" />
              <span>
                Powered by{" "}
                <a
                  href="https://kiyuhub.netlify.app/"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#22C55E" }}
                  className="font-bold hover:underline"
                >
                  Kiyuhub
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
