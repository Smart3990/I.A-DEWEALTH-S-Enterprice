import { Facebook, Instagram, MessageCircle, Music2, Youtube } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCategories } from "@/data/category-store";
import { useSite, whatsappLink } from "@/data/site";
import { CategoryLink } from "@/components/catalog/CategoryLink";
import { FooterMap } from "./FooterMap";
import brandLogo from "@/assets/ia-dewealth-logo.png";

export function SiteFooter() {
  const { roots } = useCategories();
  const { settings } = useSite();
  const wa = whatsappLink(settings.whatsappNumber, settings.whatsappMessage);

  const socials = [
    { label: "Facebook", href: settings.facebook, icon: Facebook },
    { label: "Instagram", href: settings.instagram, icon: Instagram },
    { label: "TikTok", href: settings.tiktok, icon: Music2 },
    { label: "YouTube", href: settings.youtube, icon: Youtube },
    { label: "WhatsApp", href: wa, icon: MessageCircle },
  ].filter((s) => s.href);

  return (
    <footer className="w-full bg-nav py-12 text-nav-foreground/70">
      <div className="mx-auto max-w-container-max px-4 lg:px-6">
        <div className="grid gap-10 border-t border-nav-foreground/10 pt-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.5fr]">
          <div>
            <div className="flex items-center gap-3 font-sans text-lg font-extrabold text-nav-foreground">
              <img
                src={settings.logoUrl || brandLogo}
                alt=""
                className="h-14 w-14 shrink-0 object-contain brightness-0 invert"
              />
              <span>
                I.A DEWEALTH<span className="text-primary">'S</span>
                <br />
                Be Timeless
              </span>
            </div>
            <p className="mt-3 max-w-md font-body text-sm leading-relaxed">
              {settings.footerDescription}
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
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-nav-foreground">
              Customer support
            </h3>
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block font-body text-sm font-bold text-nav-foreground transition hover:text-primary"
            >
              {settings.phone}
            </a>
            {settings.email && <p className="mt-1 font-body text-sm">{settings.email}</p>}
            <p className="mt-1 font-body text-sm">
              Monday–Saturday
              <br />
              8:30 AM–7:00 PM
            </p>
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
          <div className="overflow-hidden border border-nav-foreground/15">
            <FooterMap />
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-primary">
                  Our location
                </div>
                <div className="mt-0.5 text-sm font-semibold text-nav-foreground">
                  {settings.address}
                </div>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-primary hover:underline"
              >
                Open map
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-nav-foreground/10 pt-6">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center font-body text-xs">
            <span>
              © {new Date().getFullYear()} {settings.copyrightText}
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
            <span aria-hidden="true" className="hidden h-3 w-px bg-nav-foreground/25 sm:block" />
            <Link to="/" className="transition hover:text-primary">
              Home
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
