import { useState, useEffect } from "react";
import { WHATSAPP } from "./products";

export interface NewsItem {
  id: string;
  text: string;
  link?: string;
  badge?: string;
  active: boolean;
}

export interface NewsTickerConfig {
  enabled: boolean;
  items: NewsItem[];
  tierBadge: {
    enabled: boolean;
    text: string;
  };
  supportLink: {
    enabled: boolean;
    text: string;
    url: string;
  };
  backgroundColor: string;
  textColor: string;
  speedSeconds: number;
  pauseOnHover: boolean;
}

export const DEFAULT_NEWS_ITEMS: NewsItem[] = [
  {
    id: "news-1",
    text: "⚡ Same-Day Accra Delivery & VIP Courier Nationwide",
    active: true,
  },
  {
    id: "news-2",
    text: "🛡️ 100% Genuine Tech Guarantee: Zero Counterfeit",
    active: true,
  },
  {
    id: "news-3",
    text: "💳 Pay on Inspection / MoMo & Telecel Accepted",
    active: true,
  },
  {
    id: "news-4",
    text: "⚡ Direct Import Prices",
    active: true,
  },
  {
    id: "news-5",
    text: "📦 Zero Signup / Instant WhatsApp Checkout",
    active: true,
  },
];

export const DEFAULT_NEWS_TICKER_CONFIG: NewsTickerConfig = {
  enabled: true,
  items: DEFAULT_NEWS_ITEMS,
  tierBadge: {
    enabled: true,
    text: "Certified Tier-1 Importer",
  },
  supportLink: {
    enabled: true,
    text: "Direct WhatsApp Support",
    url: `https://wa.me/${WHATSAPP}`,
  },
  backgroundColor: "#00a884",
  textColor: "#ffffff",
  speedSeconds: 30,
  pauseOnHover: true,
};

export const STORAGE_KEY = "ia_news_ticker_config";
const EVENT_KEY = "ia_news_ticker_updated";

export function normalizeNewsTickerConfig(parsed: unknown): NewsTickerConfig {
  if (!parsed || typeof parsed !== "object") {
    return DEFAULT_NEWS_TICKER_CONFIG;
  }

  const p = parsed as Partial<NewsTickerConfig> & {
    speed?: number;
    tierBadge?: Partial<NewsTickerConfig["tierBadge"]>;
    supportLink?: Partial<NewsTickerConfig["supportLink"]>;
  };

  const tierBadge = p.tierBadge || {};
  const supportLink = p.supportLink || {};

  return {
    ...DEFAULT_NEWS_TICKER_CONFIG,
    ...p,
    enabled: typeof p.enabled === "boolean" ? p.enabled : DEFAULT_NEWS_TICKER_CONFIG.enabled,
    speedSeconds:
      typeof p.speedSeconds === "number"
        ? p.speedSeconds
        : typeof p.speed === "number"
          ? p.speed
          : DEFAULT_NEWS_TICKER_CONFIG.speedSeconds,
    pauseOnHover:
      typeof p.pauseOnHover === "boolean"
        ? p.pauseOnHover
        : DEFAULT_NEWS_TICKER_CONFIG.pauseOnHover,
    backgroundColor: p.backgroundColor || DEFAULT_NEWS_TICKER_CONFIG.backgroundColor,
    textColor: p.textColor || DEFAULT_NEWS_TICKER_CONFIG.textColor,
    tierBadge: {
      enabled:
        typeof tierBadge.enabled === "boolean"
          ? tierBadge.enabled
          : DEFAULT_NEWS_TICKER_CONFIG.tierBadge.enabled,
      text:
        typeof tierBadge.text === "string"
          ? tierBadge.text
          : DEFAULT_NEWS_TICKER_CONFIG.tierBadge.text,
    },
    supportLink: {
      enabled:
        typeof supportLink.enabled === "boolean"
          ? supportLink.enabled
          : DEFAULT_NEWS_TICKER_CONFIG.supportLink.enabled,
      text:
        typeof supportLink.text === "string"
          ? supportLink.text
          : DEFAULT_NEWS_TICKER_CONFIG.supportLink.text,
      url:
        typeof supportLink.url === "string"
          ? supportLink.url
          : DEFAULT_NEWS_TICKER_CONFIG.supportLink.url,
    },
    items:
      Array.isArray(p.items) && p.items.length > 0
        ? p.items.map((item, idx) => ({
            id: item.id || `news-${idx}`,
            text: item.text || "",
            link: item.link,
            badge: item.badge,
            active: item.active !== false,
          }))
        : DEFAULT_NEWS_ITEMS,
  };
}

export function getNewsTickerConfig(): NewsTickerConfig {
  if (typeof window === "undefined") return DEFAULT_NEWS_TICKER_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NEWS_TICKER_CONFIG));
      return DEFAULT_NEWS_TICKER_CONFIG;
    }
    const parsed = JSON.parse(raw);
    const normalized = normalizeNewsTickerConfig(parsed);
    return normalized;
  } catch {
    return DEFAULT_NEWS_TICKER_CONFIG;
  }
}

export function saveNewsTickerConfig(next: NewsTickerConfig): NewsTickerConfig {
  const normalized = normalizeNewsTickerConfig(next);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new Event(EVENT_KEY));

    if (typeof window !== "undefined") {
      fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalized),
      }).catch(() => {});
    }
  } catch (err) {
    console.error("Failed to save news ticker config:", err);
  }
  return normalized;
}

export function resetNewsTickerToDefaults(): NewsTickerConfig {
  return saveNewsTickerConfig(DEFAULT_NEWS_TICKER_CONFIG);
}

export function useNewsTicker(): [NewsTickerConfig, (next: NewsTickerConfig) => void] {
  // Always initialize with defaults to guarantee SSR and client hydration consistency
  const [config, setConfig] = useState<NewsTickerConfig>(DEFAULT_NEWS_TICKER_CONFIG);

  useEffect(() => {
    // Safely hydrate from localStorage on client mount
    setConfig(getNewsTickerConfig());

    // Also fetch authoritative news ticker config from database
    if (typeof window !== "undefined") {
      fetch("/api/admin/news")
        .then((r) => r.json())
        .then((res) => {
          if (res && res.config) {
            const normalized = normalizeNewsTickerConfig(res.config);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
            setConfig(normalized);
          }
        })
        .catch(() => {});
    }

    const handler = () => {
      setConfig(getNewsTickerConfig());
    };

    window.addEventListener(EVENT_KEY, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT_KEY, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const update = (next: NewsTickerConfig) => {
    const normalized = saveNewsTickerConfig(next);
    setConfig(normalized);
  };

  return [config, update];
}
