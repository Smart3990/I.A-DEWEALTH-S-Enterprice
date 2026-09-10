import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  type CatalogProduct,
  type Category,
  categories as bundledCategories,
  catalogProducts as bundledProducts,
} from "./catalog";

export type SiteSettings = {
  storeName: string;
  storeDescription: string;
  logoUrl: string;
  faviconUrl: string;
  whatsappNumber: string;
  whatsappMessage: string;
  phone: string;
  email: string;
  address: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  xUrl: string;
  youtube: string;
  footerDescription: string;
  copyrightText: string;
  favoritesEnabled: boolean;
  cartEnabled: boolean;
  maxQtyPerProduct: number;
};

export type HomeSection = {
  id: string;
  key: string;
  title: string;
  subtitle: string;
  eyebrow: string;
  itemLimit: number;
  sortOrder: number;
  isActive: boolean;
};

export type Banner = {
  id: string;
  placement: string;
  image: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  sortOrder: number;
  isActive: boolean;
};

export type NavItem = {
  id: string;
  label: string;
  path: string;
  sortOrder: number;
  isActive: boolean;
};

export type Storefront = {
  categories: Category[];
  products: CatalogProduct[];
  sections: HomeSection[];
  banners: Banner[];
  nav: NavItem[];
  settings: SiteSettings;
};

export const defaultSettings: SiteSettings = {
  storeName: "I.A Dewealth's Enterprise",
  storeDescription: "",
  logoUrl: "",
  faviconUrl: "",
  whatsappNumber: "233555526233",
  whatsappMessage: "Hello I.A Dewealth, I would like to order the following products:",
  phone: "+233 55 552 6233",
  email: "sales@iadewealth.com",
  address: "Accra, Ghana",
  facebook: "",
  instagram: "",
  tiktok: "",
  xUrl: "",
  youtube: "",
  footerDescription:
    "Direct-import tech and appliances with same-day Accra delivery and WhatsApp checkout.",
  copyrightText: "I.A Dewealth's Enterprise. All rights reserved.",
  favoritesEnabled: true,
  cartEnabled: true,
  maxQtyPerProduct: 20,
};

/* eslint-disable @typescript-eslint/no-explicit-any */

export function mapCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug || row.id,
    parentId: row.parent_id ?? null,
    description: row.description ?? "",
    bannerImage: row.banner_image ?? "",
    bannerTitle: row.banner_title ?? row.name,
    bannerSubtitle: row.banner_subtitle ?? "",
    bannerCTA: row.banner_cta ?? "Shop now",
    icon: row.icon ?? "Tag",
    isActive: row.is_active ?? true,
    sortOrder: row.sort_order ?? 0,
  };
}

export function mapProduct(row: any): CatalogProduct {
  return {
    id: row.id,
    name: row.name || row.title || "",
    image: row.image || row.image_url || "",
    images: (row.images ?? []) as string[],
    price: Number(row.price ?? 0),
    was: Number(row.was_price ?? row.original_price ?? row.price ?? 0),
    rating: Number(row.rating ?? 4.8),
    reviews: row.reviews ?? row.reviews_count ?? 0,
    sold: row.sold ?? 0,
    tag: row.tag ?? row.badge ?? "",
    spec: row.spec ?? row.short_description ?? "",
    categoryId: row.category_id ?? "",
    brand: row.brand ?? "",
    condition: (row.condition ??
      row.specifications?.condition ??
      "Brand New") as CatalogProduct["condition"],
    availability: (row.in_stock === false || row.stock === 0
      ? "Out of Stock"
      : (row.availability ??
        row.specifications?.availability ??
        "In Stock")) as CatalogProduct["availability"],
    seller: row.seller ?? "",
    addedAt: row.added_at ?? "",
    topPick: row.is_top_pick ?? false,
    clearance: row.is_clearance ?? false,
    featured: row.is_featured ?? false,
    newArrival: row.is_new_arrival ?? row.is_new ?? false,
    bestSeller: row.is_best_seller ?? row.is_bestseller ?? false,
    deal: row.is_deal ?? row.is_super_deal ?? false,
    description: row.description ?? "",
    sku: row.sku ?? "",
    stock: row.stock ?? 0,
  };
}

export function mapSettings(row: any): SiteSettings {
  if (!row) return defaultSettings;
  return {
    storeName: row.store_name || defaultSettings.storeName,
    storeDescription: row.store_description ?? "",
    logoUrl: row.logo_url ?? "",
    faviconUrl: row.favicon_url ?? "",
    whatsappNumber: row.whatsapp_number || defaultSettings.whatsappNumber,
    whatsappMessage: row.whatsapp_message || defaultSettings.whatsappMessage,
    phone: row.phone ?? "",
    email: row.email ?? "",
    address: row.address ?? "",
    facebook: row.facebook ?? "",
    instagram: row.instagram ?? "",
    tiktok: row.tiktok ?? "",
    xUrl: row.x_url ?? "",
    youtube: row.youtube ?? "",
    footerDescription: row.footer_description ?? defaultSettings.footerDescription,
    copyrightText: row.copyright_text ?? defaultSettings.copyrightText,
    favoritesEnabled: row.favorites_enabled ?? true,
    cartEnabled: row.cart_enabled ?? true,
    maxQtyPerProduct: row.max_qty_per_product ?? 20,
  };
}

export async function fetchStorefront(): Promise<Storefront> {
  try {
    const [cats, prods, sections, banners, nav, settings] = await Promise.all([
      supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("products").select("*").eq("is_active", true).order("title"),
      supabase.from("homepage_sections").select("*").order("sort_order"),
      supabase.from("banners").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("nav_items").select("*").order("sort_order"),
      supabase.from("site_settings").select("*").eq("id", "default").maybeSingle(),
    ]);

    const mappedCats = (cats.data ?? []).map(mapCategory);
    const mappedProds = (prods.data ?? []).map(mapProduct);

    return {
      categories: mappedCats.length ? mappedCats : bundledCategories,
      products: mappedProds.length ? mappedProds : bundledProducts,
      sections: (sections.data ?? []).map((r: any) => ({
        id: r.id,
        key: r.key ?? r.id,
        title: r.title ?? "",
        subtitle: r.subtitle ?? "",
        eyebrow: r.eyebrow ?? "",
        itemLimit: r.item_limit ?? 8,
        sortOrder: r.sort_order ?? 0,
        isActive: r.is_active ?? true,
      })),
      banners: (banners.data ?? []).map((r: any) => ({
        id: r.id,
        placement: r.placement ?? r.position ?? "homepage",
        image: r.image ?? r.image_url ?? "",
        eyebrow: r.eyebrow ?? r.badge ?? "",
        title: r.title ?? "",
        subtitle: r.subtitle ?? "",
        buttonText: r.button_text ?? r.cta_text ?? "",
        buttonLink: r.button_link ?? r.cta_link ?? "",
        sortOrder: r.sort_order ?? 0,
        isActive: r.is_active ?? true,
      })),
      nav: (nav.data ?? []).map((r: any) => ({
        id: r.id,
        label: r.label,
        path: r.path ?? r.href ?? "/",
        sortOrder: r.sort_order ?? 0,
        isActive: r.is_active ?? true,
      })),
      settings: mapSettings(settings.data),
    };
  } catch (err) {
    console.warn("[Storefront] Error loading storefront from database, using local fallback:", err);
    return {
      categories: bundledCategories,
      products: bundledProducts,
      sections: [],
      banners: [],
      nav: [],
      settings: defaultSettings,
    };
  }
}

export const storefrontQuery = queryOptions({
  queryKey: ["storefront"],
  queryFn: fetchStorefront,
  staleTime: 30_000,
});
