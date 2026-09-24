import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { defaultSettings, DEFAULT_SOCIAL_REDIRECT, type SiteSettings } from "./storefront";
import { getSiteConfig, saveSiteConfig } from "./site";

export interface UnifiedSettings extends SiteSettings {
  workingHours: string;
  // Also support snake_case mappings for form controls
  store_name?: string;
  store_description?: string;
  logo_url?: string;
  favicon_url?: string;
  whatsapp_number?: string;
  whatsapp_message?: string;
  working_hours?: string;
  x_url?: string;
  footer_description?: string;
  copyright_text?: string;
  favorites_enabled?: boolean;
  cart_enabled?: boolean;
  max_qty_per_product?: number;
  superdealsHours?: number;
  superdealsMinutes?: number;
  superdealsSeconds?: number;
  superdeals_hours?: number;
  superdeals_minutes?: number;
  superdeals_seconds?: number;
}

const STORAGE_KEY = "ia_site_settings";
const EVENT_KEY = "ia_site_settings_updated";
export const SUPERDEALS_EVENT_KEY = "ia_superdeals_timer_updated";

export const DEFAULT_UNIFIED_SETTINGS: UnifiedSettings = {
  ...defaultSettings,
  workingHours: "Monday – Saturday: 8:30 AM – 7:30 PM (Sunday: Closed)",
  phone: "+233 55 552 6233",
  email: "sales@iadewealth.com",
  address: "Circle Tip Toe Lane, Opposite Vodafone Building, Accra, Ghana",
  footerDescription:
    "Direct-import tech and appliances with same-day Accra delivery and WhatsApp checkout.",
  copyrightText: "I.A Dewealth's Enterprise. All rights reserved.",
  facebook: DEFAULT_SOCIAL_REDIRECT,
  instagram: DEFAULT_SOCIAL_REDIRECT,
  tiktok: DEFAULT_SOCIAL_REDIRECT,
  xUrl: DEFAULT_SOCIAL_REDIRECT,
  youtube: DEFAULT_SOCIAL_REDIRECT,
  superdealsHours: 8,
  superdealsMinutes: 29,
  superdealsSeconds: 33,
};

export function getUnifiedSettings(): UnifiedSettings {
  if (typeof window === "undefined") return DEFAULT_UNIFIED_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const siteConfig = getSiteConfig();

    if (!raw) {
      const merged: UnifiedSettings = {
        ...DEFAULT_UNIFIED_SETTINGS,
        phone: siteConfig.phone || DEFAULT_UNIFIED_SETTINGS.phone,
        email: siteConfig.email || DEFAULT_UNIFIED_SETTINGS.email,
        address: siteConfig.address || DEFAULT_UNIFIED_SETTINGS.address,
        workingHours: siteConfig.workingHours || DEFAULT_UNIFIED_SETTINGS.workingHours,
        whatsappNumber: siteConfig.whatsappNumber || DEFAULT_UNIFIED_SETTINGS.whatsappNumber,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }

    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_UNIFIED_SETTINGS,
      ...parsed,
      facebook: parsed.facebook || DEFAULT_SOCIAL_REDIRECT,
      instagram: parsed.instagram || DEFAULT_SOCIAL_REDIRECT,
      tiktok: parsed.tiktok || DEFAULT_SOCIAL_REDIRECT,
      xUrl: parsed.xUrl || parsed.x_url || DEFAULT_SOCIAL_REDIRECT,
      x_url: parsed.x_url || parsed.xUrl || DEFAULT_SOCIAL_REDIRECT,
      youtube: parsed.youtube || DEFAULT_SOCIAL_REDIRECT,
      phone: parsed.phone || siteConfig.phone || DEFAULT_UNIFIED_SETTINGS.phone,
      email: parsed.email || siteConfig.email || DEFAULT_UNIFIED_SETTINGS.email,
      address: parsed.address || siteConfig.address || DEFAULT_UNIFIED_SETTINGS.address,
      workingHours:
        parsed.workingHours ||
        parsed.working_hours ||
        siteConfig.workingHours ||
        DEFAULT_UNIFIED_SETTINGS.workingHours,
      whatsappNumber:
        parsed.whatsappNumber ||
        parsed.whatsapp_number ||
        siteConfig.whatsappNumber ||
        DEFAULT_UNIFIED_SETTINGS.whatsappNumber,
      superdealsHours:
        parsed.superdealsHours !== undefined
          ? Number(parsed.superdealsHours)
          : parsed.superdeals_hours !== undefined
            ? Number(parsed.superdeals_hours)
            : DEFAULT_UNIFIED_SETTINGS.superdealsHours,
      superdealsMinutes:
        parsed.superdealsMinutes !== undefined
          ? Number(parsed.superdealsMinutes)
          : parsed.superdeals_minutes !== undefined
            ? Number(parsed.superdeals_minutes)
            : DEFAULT_UNIFIED_SETTINGS.superdealsMinutes,
      superdealsSeconds:
        parsed.superdealsSeconds !== undefined
          ? Number(parsed.superdealsSeconds)
          : parsed.superdeals_seconds !== undefined
            ? Number(parsed.superdeals_seconds)
            : DEFAULT_UNIFIED_SETTINGS.superdealsSeconds,
    };
  } catch {
    return DEFAULT_UNIFIED_SETTINGS;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function saveUnifiedSettings(data: Record<string, any>): UnifiedSettings {
  const current = getUnifiedSettings();

  // Normalize both snake_case and camelCase
  const next: UnifiedSettings = {
    ...current,
    storeName: data.store_name ?? data.storeName ?? current.storeName,
    storeDescription: data.store_description ?? data.storeDescription ?? current.storeDescription,
    logoUrl: data.logo_url ?? data.logoUrl ?? current.logoUrl,
    faviconUrl: data.favicon_url ?? data.faviconUrl ?? current.faviconUrl,
    whatsappNumber: data.whatsapp_number ?? data.whatsappNumber ?? current.whatsappNumber,
    whatsappMessage: data.whatsapp_message ?? data.whatsappMessage ?? current.whatsappMessage,
    phone: data.phone ?? current.phone,
    email: data.email ?? current.email,
    address: data.address ?? current.address,
    workingHours: data.working_hours ?? data.workingHours ?? current.workingHours,
    facebook: data.facebook ?? current.facebook,
    instagram: data.instagram ?? current.instagram,
    tiktok: data.tiktok ?? current.tiktok,
    xUrl: data.x_url ?? data.xUrl ?? current.xUrl,
    youtube: data.youtube ?? current.youtube,
    footerDescription:
      data.footer_description ?? data.footerDescription ?? current.footerDescription,
    copyrightText: data.copyright_text ?? data.copyrightText ?? current.copyrightText,
    favoritesEnabled: data.favorites_enabled ?? data.favoritesEnabled ?? current.favoritesEnabled,
    cartEnabled: data.cart_enabled ?? data.cartEnabled ?? current.cartEnabled,
    maxQtyPerProduct: data.max_qty_per_product ?? data.maxQtyPerProduct ?? current.maxQtyPerProduct,
    superdealsHours:
      data.superdealsHours !== undefined
        ? Number(data.superdealsHours)
        : data.superdeals_hours !== undefined
          ? Number(data.superdeals_hours)
          : current.superdealsHours,
    superdealsMinutes:
      data.superdealsMinutes !== undefined
        ? Number(data.superdealsMinutes)
        : data.superdeals_minutes !== undefined
          ? Number(data.superdeals_minutes)
          : current.superdealsMinutes,
    superdealsSeconds:
      data.superdealsSeconds !== undefined
        ? Number(data.superdealsSeconds)
        : data.superdeals_seconds !== undefined
          ? Number(data.superdeals_seconds)
          : current.superdealsSeconds,
  };

  // Keep mirrored snake_case fields for admin forms
  next.store_name = next.storeName;
  next.store_description = next.storeDescription;
  next.logo_url = next.logoUrl;
  next.favicon_url = next.faviconUrl;
  next.whatsapp_number = next.whatsappNumber;
  next.whatsapp_message = next.whatsappMessage;
  next.working_hours = next.workingHours;
  next.x_url = next.xUrl;
  next.footer_description = next.footerDescription;
  next.copyright_text = next.copyrightText;
  next.favorites_enabled = next.favoritesEnabled;
  next.cart_enabled = next.cartEnabled;
  next.max_qty_per_product = next.maxQtyPerProduct;
  next.superdeals_hours = next.superdealsHours;
  next.superdeals_minutes = next.superdealsMinutes;
  next.superdeals_seconds = next.superdealsSeconds;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT_KEY));

    // Also synchronize to delivery hub siteConfig
    saveSiteConfig({
      name: next.storeName,
      phone: next.phone,
      email: next.email,
      address: next.address,
      whatsappNumber: next.whatsappNumber,
      workingHours: next.workingHours,
    });
  } catch (e) {
    console.error("Failed to save unified site settings:", e);
  }

  // Attempt Supabase upsert non-blockingly
  try {
    const supabasePayload = {
      id: "default",
      store_name: next.storeName,
      store_description: next.storeDescription,
      logo_url: next.logoUrl,
      favicon_url: next.faviconUrl,
      whatsapp_number: next.whatsappNumber,
      whatsapp_message: next.whatsappMessage,
      phone: next.phone,
      email: next.email,
      address: next.address,
      facebook: next.facebook,
      instagram: next.instagram,
      tiktok: next.tiktok,
      x_url: next.xUrl,
      youtube: next.youtube,
      footer_description: next.footerDescription,
      copyright_text: next.copyrightText,
      favorites_enabled: next.favoritesEnabled,
      cart_enabled: next.cartEnabled,
      max_qty_per_product: next.maxQtyPerProduct,
    };
    if (typeof window !== "undefined") {
      fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supabasePayload),
      }).catch(() => {});
    }

    supabase
      .from("site_settings")
      .upsert(supabasePayload)
      .then(({ error }) => {
        if (error) console.warn("Supabase site_settings upsert error (local store active):", error);
      })
      .catch((e) => console.warn("Supabase sync caught:", e));
  } catch {
    // ignore
  }

  return next;
}

export function useCurrentSiteSettings(): [UnifiedSettings, (data: Record<string, any>) => void] {
  // Always initialize with DEFAULT_UNIFIED_SETTINGS to ensure server-rendered markup
  // and initial client hydration markup match 100%. Storage is loaded in useEffect.
  const [settings, setSettings] = useState<UnifiedSettings>(DEFAULT_UNIFIED_SETTINGS);

  useEffect(() => {
    // Safely hydrate from localStorage after client-side mount
    setSettings(getUnifiedSettings());

    // Also fetch server settings to ensure latest across all devices
    if (typeof window !== "undefined") {
      fetch("/api/admin/settings")
        .then((r) => r.json())
        .then((res) => {
          if (res && res.settings) {
            const s = res.settings;
            const ext = res.hubConfig || {};
            const current = getUnifiedSettings();
            const serverUnified: UnifiedSettings = {
              ...current,
              storeName: s.store_name || current.storeName,
              storeDescription:
                ext.storeDescription || s.store_description || current.storeDescription,
              logoUrl: ext.logoUrl || s.logo_url || current.logoUrl,
              faviconUrl: ext.faviconUrl || s.favicon_url || current.faviconUrl,
              whatsappNumber: s.whatsapp_number || current.whatsappNumber,
              whatsappMessage: ext.whatsappMessage || s.whatsapp_message || current.whatsappMessage,
              phone: s.contact_phone || s.phone || current.phone,
              email: s.contact_email || s.email || current.email,
              address: s.address || current.address,
              workingHours: ext.workingHours || current.workingHours,
              facebook: s.facebook_url || s.facebook || current.facebook || DEFAULT_SOCIAL_REDIRECT,
              instagram:
                s.instagram_url || s.instagram || current.instagram || DEFAULT_SOCIAL_REDIRECT,
              tiktok: s.tiktok_url || s.tiktok || current.tiktok || DEFAULT_SOCIAL_REDIRECT,
              xUrl: s.x_url || s.xUrl || current.xUrl || DEFAULT_SOCIAL_REDIRECT,
              x_url: s.x_url || s.xUrl || current.xUrl || DEFAULT_SOCIAL_REDIRECT,
              youtube: s.youtube_url || s.youtube || current.youtube || DEFAULT_SOCIAL_REDIRECT,
              footerDescription: s.footer_description || current.footerDescription,
              copyrightText: s.copyright_text || current.copyrightText,
              favoritesEnabled: s.favorites_enabled ?? current.favoritesEnabled,
              cartEnabled: s.cart_enabled ?? current.cartEnabled,
              maxQtyPerProduct:
                ext.maxQtyPerProduct ?? s.max_qty_per_product ?? current.maxQtyPerProduct,
              superdealsHours:
                ext.superdealsHours !== undefined
                  ? Number(ext.superdealsHours)
                  : ext.superdeals_hours !== undefined
                    ? Number(ext.superdeals_hours)
                    : current.superdealsHours,
              superdealsMinutes:
                ext.superdealsMinutes !== undefined
                  ? Number(ext.superdealsMinutes)
                  : ext.superdeals_minutes !== undefined
                    ? Number(ext.superdeals_minutes)
                    : current.superdealsMinutes,
              superdealsSeconds:
                ext.superdealsSeconds !== undefined
                  ? Number(ext.superdealsSeconds)
                  : ext.superdeals_seconds !== undefined
                    ? Number(ext.superdeals_seconds)
                    : current.superdealsSeconds,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(serverUnified));
            setSettings(serverUnified);
          }
        })
        .catch(() => {});
    }

    const handler = () => {
      setSettings(getUnifiedSettings());
    };
    window.addEventListener(EVENT_KEY, handler);
    window.addEventListener(SUPERDEALS_EVENT_KEY, handler);
    return () => {
      window.removeEventListener(EVENT_KEY, handler);
      window.removeEventListener(SUPERDEALS_EVENT_KEY, handler);
    };
  }, []);

  const update = (data: Record<string, any>) => {
    const saved = saveUnifiedSettings(data);
    setSettings(saved);
  };

  return [settings, update];
}

export async function saveSuperDealsDuration(hours: number, minutes: number, seconds: number) {
  const h = Math.max(0, Math.min(99, Math.floor(hours || 0)));
  const m = Math.max(0, Math.min(59, Math.floor(minutes || 0)));
  const s = Math.max(0, Math.min(59, Math.floor(seconds || 0)));

  saveUnifiedSettings({
    superdealsHours: h,
    superdealsMinutes: m,
    superdealsSeconds: s,
    superdeals_hours: h,
    superdeals_minutes: m,
    superdeals_seconds: s,
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(SUPERDEALS_EVENT_KEY, {
        detail: { hours: h, minutes: m, seconds: s },
      }),
    );

    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          superdeals_hours: h,
          superdeals_minutes: m,
          superdeals_seconds: s,
          superdealsHours: h,
          superdealsMinutes: m,
          superdealsSeconds: s,
        }),
      });
    } catch (err) {
      console.warn("SuperDeals timer server sync notice:", err);
    }
  }
}
