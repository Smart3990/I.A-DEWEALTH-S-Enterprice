import { createFileRoute } from "@tanstack/react-router";
import { isLegacyOldProduct } from "@/data/products-store";
import initialProductsData from "@/data/products-catalog.json";

function normalizeRow(row: Record<string, unknown>) {
  const rowId = String(row.id || "");
  const title = String(row.title || row.name || "Untitled Product");
  const rawImages = Array.isArray(row.images) ? (row.images as string[]).filter(Boolean) : [];
  const rawImage = String(row.image || row.image_url || (rawImages[0] ?? ""));
  const images = rawImages.length > 0 ? rawImages : rawImage ? [rawImage] : [];
  const specs =
    typeof row.specifications === "object" && row.specifications !== null
      ? (row.specifications as Record<string, unknown>)
      : {};

  const price = Number(row.price) || 0;
  const originalPrice = Number(row.original_price ?? row.was_price ?? price);
  const stock = typeof row.stock === "number" ? Math.max(0, row.stock) : 10;
  const inStock = stock > 0;
  const badge = String(row.badge || row.tag || "").trim();
  const shortDesc = String(row.short_description || row.spec || specs.spec || "").trim();
  const brand = String(specs.brand || row.brand || "").trim();
  const seller = String(specs.seller || row.seller || "IA Dewealth Official Store").trim();
  const condition = String(specs.condition || row.condition || "Brand New").trim();
  const availability = String(specs.availability || (inStock ? "In Stock" : "Out of Stock")).trim();
  const reviewsCount =
    typeof row.reviews_count === "number"
      ? row.reviews_count
      : typeof row.reviews === "number"
        ? row.reviews
        : 12;

  const isDeal = Boolean(row.is_super_deal || row.is_deal);
  const isNew = Boolean(row.is_new || row.is_new_arrival);
  const isBestseller = Boolean(row.is_bestseller || row.is_best_seller);

  return {
    ...row,
    id: rowId,
    title,
    name: title,
    slug: String(row.slug || rowId),
    category_id: row.category_id ? String(row.category_id) : null,
    category: row.category_id ? String(row.category_id) : "",
    categoryId: row.category_id ? String(row.category_id) : "",
    price,
    original_price: originalPrice,
    originalPrice,
    was_price: originalPrice,
    was: originalPrice,
    stock,
    in_stock: inStock,
    inStock,
    badge,
    tag: badge,
    rating: typeof row.rating === "number" ? row.rating : 4.8,
    reviews_count: reviewsCount,
    reviews: reviewsCount,
    reviewsCount,
    image: rawImage,
    image_url: rawImage,
    images,
    short_description: shortDesc,
    shortDescription: shortDesc,
    spec: shortDesc,
    description: String(row.description || shortDesc).trim(),
    specifications: {
      ...specs,
      brand,
      seller,
      condition,
      availability,
    },
    brand,
    seller,
    condition,
    availability,
    is_active: row.is_active !== undefined ? Boolean(row.is_active) : true,
    isActive: row.is_active !== undefined ? Boolean(row.is_active) : true,
    is_featured: Boolean(row.is_featured),
    isFeatured: Boolean(row.is_featured),
    is_super_deal: isDeal,
    is_deal: isDeal,
    isDeal,
    is_clearance: Boolean(row.is_clearance),
    isClearance: Boolean(row.is_clearance),
    topPick: Boolean(row.is_top_pick),
    is_top_pick: Boolean(row.is_top_pick),
    is_new: isNew,
    is_new_arrival: isNew,
    isNew,
    is_bestseller: isBestseller,
    is_best_seller: isBestseller,
    isBestseller,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
  };
}

export const Route = createFileRoute("/api/products")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin
            .from("products")
            .select("*")
            .neq("is_active", false)
            .order("created_at", { ascending: false })
            .limit(10000);

          if (error || !data || data.length === 0) {
            return Response.json({
              products: initialProductsData,
              count: initialProductsData.length,
              source: "fallback",
            });
          }

          const normalized = data
            .filter((row: Record<string, unknown>) => {
              const rowId = String(row.id || "");
              const title = String(row.title || row.name || "");
              return !isLegacyOldProduct(rowId, title);
            })
            .map((row) => normalizeRow(row as Record<string, unknown>));

          return Response.json(
            { products: normalized, count: normalized.length, source: "database" },
            {
              headers: {
                "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
              },
            },
          );
        } catch (err: unknown) {
          console.warn("[Public API /api/products exception]:", err);
          return Response.json({
            products: initialProductsData,
            count: initialProductsData.length,
            source: "catalog_fallback",
          });
        }
      },
    },
  },
});
