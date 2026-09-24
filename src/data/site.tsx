import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  defaultSettings,
  type Banner,
  type HomeSection,
  type NavItem,
  type SiteSettings,
} from "./storefront";

type SiteValue = {
  settings: SiteSettings;
  sections: HomeSection[];
  banners: Banner[];
  nav: NavItem[];
};

const fallback: SiteValue = { settings: defaultSettings, sections: [], banners: [], nav: [] };

const SiteContext = createContext<SiteValue>(fallback);

export function SiteProvider({ value, children }: { value: SiteValue; children: ReactNode }) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  return useContext(SiteContext);
}

/** WhatsApp deep link built from the number saved in admin settings. */
export function whatsappLink(number: string, message: string) {
  return `https://wa.me/${(number || "233555526233").replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

// ======================== Configurable Site & Delivery Hub Settings ========================

export interface SiteConfig {
  name: string;
  storeDescription: string;
  address: string;
  visitUsLocation: string;
  phone: string;
  email: string;
  whatsappNumber: string;
  workingHours: string;
  mapLocation: string;
  mapEmbedUrl: string;
  pickupInfo: string;
  deliveryAccraInfo: string;
  deliveryRegionsInfo: string;
}

const STORAGE_KEY = "ia_site_config";
const EVENT_KEY = "ia_site_config_updated";

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  name: "I.A Dewealth's Enterprise",
  storeDescription:
    "Your trusted shop for direct imported premium electronics, tech gadgets, automotive and home appliances in Ghana.",
  address: "Circle Tip Toe Lane, Opposite Vodafone Building, Accra, Ghana",
  visitUsLocation: "Tip Toe Lane, Central Accra Hub",
  phone: "+233 55 552 6233",
  email: "sales@iadewealth.com",
  whatsappNumber: "233555526233",
  workingHours: "Monday – Saturday: 8:30 AM – 7:30 PM (Sunday: Closed)",
  mapLocation: "Tip Toe Lane, Circle, Accra, Ghana",
  mapEmbedUrl:
    "https://maps.google.com/maps?q=Tip%20Toe%20Lane%2C%20Circle%2C%20Accra%2C%20Ghana&t=&z=14&ie=UTF8&iwloc=&output=embed",
  pickupInfo: "Pick-up Available Everyday",
  deliveryAccraInfo: "Same-Day Dispatch within 2-4 hours across Greater Accra",
  deliveryRegionsInfo: "24-Hour VIP / OA / STC Bus Waybill Dispatch to all regions",
};

export function getSiteConfig(): SiteConfig {
  if (typeof window === "undefined") return DEFAULT_SITE_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SITE_CONFIG));
      return DEFAULT_SITE_CONFIG;
    }
    const parsed = JSON.parse(raw);
    const config = { ...DEFAULT_SITE_CONFIG, ...parsed };
    if (
      config.pickupInfo === "Walk-in & Hub Pick-up Available Everyday" ||
      config.pickupInfo === "Walk-in & Pick-up Available"
    ) {
      config.pickupInfo = "Pick-up Available Everyday";
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch {
        // ignore
      }
    }
    return config;
  } catch (e) {
    console.error("Failed to read site config from storage:", e);
    return DEFAULT_SITE_CONFIG;
  }
}

export function saveSiteConfig(patch: Partial<SiteConfig>): SiteConfig {
  const current = getSiteConfig();
  const next: SiteConfig = { ...current, ...patch };
  try {
    // If mapLocation was updated but mapEmbedUrl wasn't explicitly changed, automatically generate a working embed URL
    if (patch.mapLocation && !patch.mapEmbedUrl) {
      next.mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
        patch.mapLocation,
      )}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT_KEY));
  } catch (e) {
    console.error("Failed to save site config to storage:", e);
  }
  return next;
}

export function useSiteConfig(): [SiteConfig, (patch: Partial<SiteConfig>) => void] {
  // Always initialize with DEFAULT_SITE_CONFIG to ensure server-rendered markup
  // and initial client hydration markup match 100%. Storage is loaded in useEffect.
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);

  useEffect(() => {
    // Safely hydrate from localStorage after client-side mount
    setConfig(getSiteConfig());

    const handleUpdate = () => {
      setConfig(getSiteConfig());
    };
    window.addEventListener(EVENT_KEY, handleUpdate);
    return () => window.removeEventListener(EVENT_KEY, handleUpdate);
  }, []);

  const update = (patch: Partial<SiteConfig>) => {
    const updated = saveSiteConfig(patch);
    setConfig(updated);
  };

  return [config, update];
}
