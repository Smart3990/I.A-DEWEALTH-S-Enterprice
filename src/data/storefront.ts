import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  type CatalogProduct,
  type Category,
  categories as bundledCategories,
  catalogProducts as bundledProducts,
} from "./catalog";
import { getAllProducts, isLegacyOldProduct } from "./products-store";

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
  superdealsHours?: number;
  superdealsMinutes?: number;
  superdealsSeconds?: number;
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

export const DEFAULT_SOCIAL_REDIRECT = "https://iadewealthsenterprice.netlify.app/";

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
  facebook: DEFAULT_SOCIAL_REDIRECT,
  instagram: DEFAULT_SOCIAL_REDIRECT,
  tiktok: DEFAULT_SOCIAL_REDIRECT,
  xUrl: DEFAULT_SOCIAL_REDIRECT,
  youtube: DEFAULT_SOCIAL_REDIRECT,
  footerDescription:
    "Direct-import tech and appliances with same-day Accra delivery and WhatsApp checkout.",
  copyrightText: "I.A Dewealth's Enterprise. All rights reserved.",
  favoritesEnabled: true,
  cartEnabled: true,
  maxQtyPerProduct: 20,
  superdealsHours: 8,
  superdealsMinutes: 29,
  superdealsSeconds: 33,
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
    image: row.image || row.image_url || (Array.isArray(row.images) && row.images[0]) || "",
    images:
      Array.isArray(row.images) && row.images.length > 0
        ? row.images
        : row.image || row.image_url
          ? [row.image || row.image_url]
          : [],
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
    addedAt: row.added_at || row.updated_at || row.created_at || new Date().toISOString(),
    topPick: Boolean(row.is_top_pick ?? false),
    clearance: Boolean(row.is_clearance ?? false),
    featured: Boolean(row.is_featured ?? false),
    newArrival: Boolean(row.is_new_arrival ?? row.is_new ?? false),
    bestSeller: Boolean(row.is_best_seller ?? row.is_bestseller ?? false),
    deal: Boolean(row.is_deal ?? row.is_super_deal ?? false),
    description: row.description ?? "",
    sku: row.sku ?? "",
    stock: row.stock ?? 0,
  };
}

export function mapSettings(row: any, extendedConfig?: Record<string, any>): SiteSettings {
  if (!row && !extendedConfig) return defaultSettings;
  const ext = extendedConfig || {};
  return {
    storeName: row?.store_name || defaultSettings.storeName,
    storeDescription:
      ext.storeDescription || row?.store_description || defaultSettings.storeDescription,
    logoUrl: ext.logoUrl || row?.logo_url || "",
    faviconUrl: ext.faviconUrl || row?.favicon_url || "",
    whatsappNumber: row?.whatsapp_number || defaultSettings.whatsappNumber,
    whatsappMessage: ext.whatsappMessage || defaultSettings.whatsappMessage,
    phone: row?.contact_phone || row?.phone || defaultSettings.phone,
    email: row?.contact_email || row?.email || defaultSettings.email,
    address: row?.address || defaultSettings.address,
    facebook: row?.facebook_url || row?.facebook || "",
    instagram: row?.instagram_url || row?.instagram || "",
    tiktok: row?.tiktok_url || row?.tiktok || "",
    xUrl: row?.x_url || row?.xUrl || "",
    youtube: row?.youtube_url || row?.youtube || "",
    footerDescription: row?.footer_description || defaultSettings.footerDescription,
    copyrightText: row?.copyright_text || defaultSettings.copyrightText,
    favoritesEnabled: row?.favorites_enabled ?? true,
    cartEnabled: row?.cart_enabled ?? true,
    maxQtyPerProduct: ext.maxQtyPerProduct ?? row?.max_qty_per_product ?? 20,
    superdealsHours:
      ext.superdealsHours !== undefined
        ? Number(ext.superdealsHours)
        : ext.superdeals_hours !== undefined
          ? Number(ext.superdeals_hours)
          : defaultSettings.superdealsHours,
    superdealsMinutes:
      ext.superdealsMinutes !== undefined
        ? Number(ext.superdealsMinutes)
        : ext.superdeals_minutes !== undefined
          ? Number(ext.superdeals_minutes)
          : defaultSettings.superdealsMinutes,
    superdealsSeconds:
      ext.superdealsSeconds !== undefined
        ? Number(ext.superdealsSeconds)
        : ext.superdeals_seconds !== undefined
          ? Number(ext.superdeals_seconds)
          : defaultSettings.superdealsSeconds,
  };
}

export async function fetchStorefront(): Promise<Storefront> {
  try {
    const [catsRes, prodsRes, sectionsRes, bannersRes, navRes, settingsRes] =
      await Promise.allSettled([
        supabase.from("categories").select("*").neq("is_active", false).order("sort_order"),
        supabase
          .from("products")
          .select("*")
          .neq("is_active", false)
          .order("created_at", { ascending: false })
          .limit(10000),
        supabase.from("homepage_sections").select("*").order("sort_order"),
        supabase.from("banners").select("*").neq("is_active", false).order("sort_order"),
        supabase.from("nav_items").select("*").order("sort_order"),
        supabase
          .from("site_settings")
          .select("*")
          .or("id.eq.primary,id.eq.default")
          .limit(1)
          .maybeSingle(),
      ]);

    const cats = catsRes.status === "fulfilled" ? catsRes.value : { data: null };
    const prods = prodsRes.status === "fulfilled" ? prodsRes.value : { data: null };
    const sections = sectionsRes.status === "fulfilled" ? sectionsRes.value : { data: null };
    const banners = bannersRes.status === "fulfilled" ? bannersRes.value : { data: null };
    const nav = navRes.status === "fulfilled" ? navRes.value : { data: null };
    const settings = settingsRes.status === "fulfilled" ? settingsRes.value : { data: null };

    let rawProdRows = (prods.data ?? []) as Record<string, unknown>[];

    // On server during SSR, use supabaseAdmin service-role client if direct query returned no products
    if (rawProdRows.length === 0 && typeof window === "undefined") {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const adminRes = await supabaseAdmin
          .from("products")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10000);
        if (adminRes.data && adminRes.data.length > 0) {
          rawProdRows = adminRes.data as Record<string, unknown>[];
        }
      } catch (err) {
        console.warn("[Storefront SSR] supabaseAdmin product query fallback failed:", err);
      }
    }

    // In client browser, fall back to fast /api/products endpoint if needed
    if (rawProdRows.length === 0 && typeof window !== "undefined") {
      try {
        const apiRes = await fetch("/api/products");
        if (apiRes.ok) {
          const apiJson = await apiRes.json();
          if (Array.isArray(apiJson.products) && apiJson.products.length > 0) {
            rawProdRows = apiJson.products;
          }
        }
      } catch (e) {
        console.warn("[Storefront] Public API product fallback bypassed:", e);
      }
    }

    const mappedCats = (cats.data ?? []).map(mapCategory);
    const mappedProds = rawProdRows.map(mapProduct);

    // Build authoritative product catalog:
    // SUPABASE DATABASE (authoritative truth across all devices) -> Local admin drafts -> Bundled catalogue (only if DB is empty)
    const prodsMap = new Map<string, CatalogProduct>();

    if (mappedProds.length > 0) {
      // 1. Supabase database products are the source of truth across all devices
      mappedProds.forEach((dbProd) => {
        if (!isLegacyOldProduct(dbProd.id, dbProd.name)) {
          prodsMap.set(dbProd.id, dbProd);
        }
      });

      // 2. Layer any local drafts that haven't been deleted and are not legacy
      const localProds = getAllProducts();
      localProds.forEach((lp) => {
        if (!prodsMap.has(lp.id) && !isLegacyOldProduct(lp.id, lp.name || lp.title)) {
          const img = lp.image || lp.image_url || (Array.isArray(lp.images) && lp.images[0]) || "";
          prodsMap.set(lp.id, {
            id: lp.id,
            name: lp.name || lp.title || "Product",
            image: img,
            images: Array.isArray(lp.images) && lp.images.length ? lp.images : img ? [img] : [],
            price: Number(lp.price) || 0,
            was: Number(lp.was ?? lp.originalPrice ?? lp.price),
            rating: Number(lp.rating) || 4.8,
            reviews: Number(lp.reviews ?? lp.reviewsCount) || 12,
            sold: lp.sold || 0,
            tag: lp.tag || lp.badge || "",
            spec: lp.spec || lp.shortDescription || "",
            categoryId: lp.categoryId || lp.category || "mobile-phones",
            brand: lp.brand || (lp.specifications?.brand as string) || "",
            condition: lp.condition || "Brand New",
            availability: (lp.stock ?? 10) > 0 ? "In Stock" : "Out of Stock",
            seller: lp.seller || "IA Dewealth Official Store",
            addedAt: lp.addedAt || lp.updatedAt || new Date().toISOString(),
            topPick: !!lp.topPick,
            clearance: !!lp.clearance,
            featured: !!(lp.featured || lp.isFeatured),
            newArrival: !!(lp.newArrival || lp.isNew),
            bestSeller: !!(lp.bestSeller || lp.isBestseller),
            deal: !!(lp.deal || lp.isDeal),
            description: lp.description || "",
            sku: lp.sku || lp.id,
            stock: lp.stock ?? 10,
          });
        }
      });
    } else {
      // Only seed base products if Supabase database has zero products
      bundledProducts.forEach((bp) => {
        if (!isLegacyOldProduct(bp.id, bp.name)) {
          prodsMap.set(bp.id, bp);
        }
      });

      const localProds = getAllProducts();
      localProds.forEach((lp) => {
        const existing = prodsMap.get(lp.id);
        const img =
          lp.image ||
          lp.image_url ||
          (Array.isArray(lp.images) && lp.images[0]) ||
          existing?.image ||
          "";
        prodsMap.set(lp.id, {
          id: lp.id,
          name: lp.name || lp.title || existing?.name || "Product",
          image: img,
          images:
            Array.isArray(lp.images) && lp.images.length
              ? lp.images
              : existing?.images && existing.images.length
                ? existing.images
                : img
                  ? [img]
                  : [],
          price: Number(lp.price) || existing?.price || 0,
          was: Number(lp.was ?? lp.originalPrice ?? existing?.was ?? lp.price),
          rating: Number(lp.rating) || 4.8,
          reviews: Number(lp.reviews ?? lp.reviewsCount) || 12,
          sold: lp.sold || 0,
          tag: lp.tag || lp.badge || existing?.tag || "",
          spec: lp.spec || lp.shortDescription || existing?.spec || "",
          categoryId: lp.categoryId || lp.category || existing?.categoryId || "mobile-phones",
          brand: lp.brand || (lp.specifications?.brand as string) || existing?.brand || "",
          condition: lp.condition || existing?.condition || "Brand New",
          availability: (lp.stock ?? 10) > 0 ? "In Stock" : "Out of Stock",
          seller: lp.seller || existing?.seller || "IA Dewealth Official Store",
          addedAt: lp.addedAt || lp.updatedAt || existing?.addedAt || new Date().toISOString(),
          topPick: !!lp.topPick,
          clearance: !!lp.clearance,
          featured: !!(lp.featured || lp.isFeatured),
          newArrival: !!(lp.newArrival || lp.isNew),
          bestSeller: !!(lp.bestSeller || lp.isBestseller),
          deal: !!(lp.deal || lp.isDeal),
          description: lp.description || existing?.description || "",
          sku: lp.sku || lp.id,
          stock: lp.stock ?? 10,
        });
      });
    }

    // Auto-sync any locally authored products that have not yet reached the cloud database
    if (typeof window !== "undefined" && localProds.length > 0) {
      const dbIdSet = new Set(mappedProds.map((p) => String(p.id)));
      const unsynced = localProds.filter((p) => !dbIdSet.has(String(p.id)));
      if (unsynced.length > 0) {
        // Fire non-blocking bulk sync in the background
        fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products: unsynced }),
        }).catch((e) => console.warn("[Storefront auto-sync warning]", e));
      }
    }

    // Extract extended site config if saved in system banners
    let siteConfigExt: Record<string, any> = {};
    const rawBanners = banners.data ?? [];
    const configBanner = rawBanners.find(
      (b: any) =>
        b.id === "ia_site_config_banner" ||
        b.id === "00000000-0000-0000-0000-000000000002" ||
        b.position === "site_config" ||
        b.title === "site_config",
    );
    if (configBanner?.subtitle) {
      try {
        siteConfigExt = JSON.parse(configBanner.subtitle);
      } catch {
        // ignore
      }
    }

    // Filter out internal system config banners so they never render as visual marketing banners
    const marketingBanners = rawBanners
      .filter(
        (r: any) =>
          r.position !== "site_config" &&
          r.title !== "site_config" &&
          r.id !== "ia_site_config_banner" &&
          r.id !== "00000000-0000-0000-0000-000000000002" &&
          r.position !== "news_ticker" &&
          r.position !== "news_ticker_config" &&
          r.title !== "news_ticker_config" &&
          r.id !== "ia_news_ticker_banner" &&
          r.id !== "00000000-0000-0000-0000-000000000003",
      )
      .map((r: any) => ({
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
      }));

    const finalSettings = mapSettings(settings.data, siteConfigExt);

    // Sync settings and delivery hub info into local storage for seamless cross-component access
    if (typeof window !== "undefined") {
      try {
        const storedRaw = localStorage.getItem("ia_site_settings");
        const currentStored = storedRaw ? JSON.parse(storedRaw) : {};
        localStorage.setItem(
          "ia_site_settings",
          JSON.stringify({
            ...currentStored,
            ...finalSettings,
            workingHours:
              siteConfigExt.workingHours ||
              currentStored.workingHours ||
              "Monday – Saturday: 8:30 AM – 7:30 PM (Sunday: Closed)",
          }),
        );
      } catch {
        // ignore
      }
    }

    return {
      categories: mappedCats.length ? mappedCats : bundledCategories,
      products: Array.from(prodsMap.values()),
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
      banners: marketingBanners,
      nav: (nav.data ?? []).map((r: any) => ({
        id: r.id,
        label: r.label,
        path: r.path ?? r.href ?? "/",
        sortOrder: r.sort_order ?? 0,
        isActive: r.is_active ?? true,
      })),
      settings: finalSettings,
    };
  } catch (err) {
    console.warn("[Storefront] Error loading storefront from database, using local fallback:", err);
    return {
      categories: bundledCategories,
      products: getCombinedCatalogProducts(bundledProducts),
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
  initialData: () => ({
    categories: bundledCategories,
    products: bundledProducts,
    sections: [],
    banners: [],
    nav: [],
    settings: defaultSettings,
  }),
  staleTime: 30_000,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
});
