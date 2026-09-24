import { createFileRoute } from "@tanstack/react-router";
import { isLegacyOldProduct } from "@/data/products-store";

// Helper to normalize product row for client and admin consumers
function normalizeProductRow(row: Record<string, unknown>) {
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
        : 0;

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
    description: String(row.description || "").trim(),
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

// Convert base64 data URLs to permanent public cloud URLs (Cloudinary or Supabase Storage)
async function persistImageToCloud(dataOrUrl: string, prefix = "prod"): Promise<string> {
  if (!dataOrUrl || typeof dataOrUrl !== "string" || !dataOrUrl.startsWith("data:image/")) {
    return dataOrUrl;
  }

  // 1. Attempt Cloudinary if credentials are configured
  if (process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_URL) {
    try {
      const { uploadToCloudinary } = await import("@/lib/cloudinary.server");
      const res = await uploadToCloudinary({
        fileData: dataOrUrl,
        folder: "iadewealth/products",
      });
      if (res?.url) {
        return res.url;
      }
    } catch (e) {
      console.warn("[Products API] Cloudinary upload notice:", e);
    }
  }

  // 2. Authoritative Supabase Storage bucket 'products'
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const matches = dataOrUrl.match(/^data:([^;]+);base64,(.+)$/);
    const buffer = matches ? Buffer.from(matches[2], "base64") : Buffer.from(dataOrUrl, "base64");
    const mimeType = matches ? matches[1] : "image/jpeg";
    const ext = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : "jpg";
    const storagePath = `uploads/${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

    const { error: storageError } = await supabaseAdmin.storage
      .from("products")
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (!storageError) {
      const { data: pubData } = supabaseAdmin.storage.from("products").getPublicUrl(storagePath);
      if (pubData?.publicUrl) {
        return pubData.publicUrl;
      }
    }
  } catch (storageErr) {
    console.warn("[Products API] Supabase storage upload exception:", storageErr);
  }

  return dataOrUrl;
}

// Convert input payload to exact Supabase products database row
async function formatDbRow(
  body: Record<string, unknown>,
  validCategoryIds: Set<string>,
): Promise<Record<string, unknown>> {
  const id = String(body.id).trim();
  const title = String(body.title || body.name || "Untitled Product").trim();
  const slug = String(body.slug || id).trim();

  const rawCat = body.category_id || body.categoryId || body.category || null;
  const categoryId = rawCat ? String(rawCat).trim() : null;
  let validCatId: string | null = null;

  if (categoryId) {
    if (validCategoryIds.has(categoryId)) {
      validCatId = categoryId;
    } else {
      // Find case-insensitive or slug match
      const matched = Array.from(validCategoryIds).find(
        (c) => c.toLowerCase() === categoryId.toLowerCase(),
      );
      if (matched) {
        validCatId = matched;
      } else {
        // Auto-create category in Supabase categories table so foreign key constraint never fails
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const cleanSlug = categoryId
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-");
          const formattedName = categoryId
            .split(/[-_ ]+/)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

          const newCatId = cleanSlug || categoryId;
          const { error: catErr } = await supabaseAdmin.from("categories").upsert({
            id: newCatId,
            name: formattedName || categoryId,
            slug: newCatId,
            icon: "Tag",
            is_active: true,
            sort_order: 100,
          });

          if (!catErr) {
            validCatId = newCatId;
            validCategoryIds.add(newCatId);
          }
        } catch {
          validCatId = null;
        }
      }
    }
  }

  const price = Number(body.price) || 0;
  const originalPrice = Number(
    body.original_price ?? body.originalPrice ?? body.was_price ?? body.was ?? price,
  );
  const stock = typeof body.stock === "number" ? Math.max(0, body.stock) : 10;
  const badge = String(body.badge || body.tag || "").trim();
  const rating = typeof body.rating === "number" ? body.rating : 4.8;
  const reviewsCount =
    typeof body.reviews_count === "number"
      ? body.reviews_count
      : typeof body.reviews === "number"
        ? body.reviews
        : typeof body.reviewsCount === "number"
          ? body.reviewsCount
          : 0;

  let image = String(body.image || body.image_url || "").trim();
  const rawImages: string[] = Array.isArray(body.images)
    ? (body.images as unknown[]).map(String).filter(Boolean)
    : image
      ? [image]
      : [];

  // Convert any base64 images into permanent public cloud CDN URLs
  if (image.startsWith("data:image/")) {
    image = await persistImageToCloud(image, `${id}_primary`);
  }

  const processedImages: string[] = [];
  for (let idx = 0; idx < rawImages.length; idx++) {
    const img = rawImages[idx];
    if (img.startsWith("data:image/")) {
      const persisted = await persistImageToCloud(img, `${id}_gallery_${idx}`);
      processedImages.push(persisted);
    } else {
      processedImages.push(img);
    }
  }

  if (!image && processedImages.length > 0) {
    image = processedImages[0];
  }

  const shortDescription = String(
    body.short_description || body.shortDescription || body.spec || "",
  ).trim();
  const description = String(body.description || shortDescription || "").trim();

  const specs =
    typeof body.specifications === "object" && body.specifications !== null
      ? (body.specifications as Record<string, unknown>)
      : {};

  const brand = String(body.brand || specs.brand || "").trim();
  const seller = String(body.seller || specs.seller || "IA Dewealth Official Store").trim();
  const condition = String(body.condition || specs.condition || "Brand New").trim();
  const availability = String(
    body.availability || specs.availability || (stock > 0 ? "In Stock" : "Out of Stock"),
  ).trim();

  const isActive =
    body.is_active !== undefined
      ? Boolean(body.is_active)
      : body.isActive !== undefined
        ? Boolean(body.isActive)
        : true;
  const isFeatured = Boolean(body.is_featured || body.isFeatured || body.featured);
  const isSuperDeal = Boolean(
    body.is_super_deal || body.isSuperDeal || body.is_deal || body.isDeal || body.deal,
  );
  const isClearance = Boolean(body.is_clearance || body.isClearance || body.clearance);
  const isTopPick = Boolean(body.is_top_pick || body.isTopPick || body.topPick);
  const isNew = Boolean(
    body.is_new || body.isNew || body.newArrival || body.is_new_arrival || body.isNewArrival,
  );
  const isBestseller = Boolean(
    body.is_bestseller || body.isBestseller || body.bestSeller || body.is_best_seller,
  );

  return {
    id,
    title,
    slug,
    category_id: validCatId,
    price,
    original_price: originalPrice,
    badge: badge || null,
    rating,
    reviews_count: reviewsCount,
    image,
    images: processedImages.length > 0 ? processedImages : image ? [image] : [],
    is_active: isActive,
    is_featured: isFeatured,
    is_super_deal: isSuperDeal,
    is_clearance: isClearance,
    is_top_pick: isTopPick,
    is_new: isNew,
    is_bestseller: isBestseller,
    short_description: shortDescription,
    description,
    specifications: {
      ...specs,
      brand,
      seller,
      condition,
      availability,
    },
    stock,
    updated_at: new Date().toISOString(),
  };
}

export const Route = createFileRoute("/api/admin/products")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          // Allow unlimited products retrieval up to 10,000 items
          const { data, error } = await supabaseAdmin
            .from("products")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10000);

          if (error) {
            console.error("[API Products GET Error]:", error);
            return Response.json({ error: error.message, products: [] }, { status: 500 });
          }

          const normalized = (data || [])
            .filter((row: Record<string, unknown>) => {
              const rowId = String(row.id || "");
              const title = String(row.title || row.name || "");
              return !isLegacyOldProduct(rowId, title);
            })
            .map((row) => normalizeProductRow(row as Record<string, unknown>));
          return Response.json({ products: normalized, count: normalized.length });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("[API Products GET Exception]:", err);
          return Response.json({ error: msg, products: [] }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        try {
          const rawBody = await request.json();
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          // Determine if input is single product or bulk sync list
          const rawItems: Record<string, unknown>[] = Array.isArray(rawBody)
            ? rawBody
            : Array.isArray(rawBody?.products)
              ? rawBody.products
              : rawBody && typeof rawBody === "object" && rawBody.id
                ? [rawBody]
                : [];

          const items = rawItems.filter((item: Record<string, unknown>) => {
            const itemId = String(item?.id || "");
            const itemName = String(item?.name || item?.title || "");
            return !isLegacyOldProduct(itemId, itemName);
          });

          if (items.length === 0) {
            return Response.json(
              { error: "No valid product data provided. Product ID is required." },
              { status: 400 },
            );
          }

          // Fetch valid category IDs from Supabase to prevent foreign key errors
          const { data: catRows } = await supabaseAdmin.from("categories").select("id");
          const validCatIds = new Set((catRows || []).map((c) => String(c.id)));

          const formattedRows: Record<string, unknown>[] = [];
          for (const item of items) {
            if (!item || !item.id) continue;
            const row = await formatDbRow(item, validCatIds);
            formattedRows.push(row);
          }

          if (formattedRows.length === 0) {
            return Response.json({ error: "No products had valid IDs." }, { status: 400 });
          }

          // Upsert all products to Supabase PostgreSQL table
          const { data, error } = await supabaseAdmin
            .from("products")
            .upsert(formattedRows, { onConflict: "id" })
            .select();

          if (error) {
            console.error("[API Products UPSERT Error]:", error);
            return Response.json({ error: error.message }, { status: 500 });
          }

          const savedNormalized = (data || []).map((r) =>
            normalizeProductRow(r as Record<string, unknown>),
          );

          return Response.json({
            success: true,
            count: savedNormalized.length,
            product: savedNormalized[0] || null,
            products: savedNormalized,
            message: `Successfully saved and synchronized ${savedNormalized.length} product(s) to cloud database.`,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("[API Products UPSERT Exception]:", err);
          return Response.json({ error: msg }, { status: 500 });
        }
      },

      DELETE: async ({ request }) => {
        try {
          const url = new URL(request.url);
          let ids: string[] = [];

          const queryIds = url.searchParams.getAll("ids");
          if (queryIds.length > 0) {
            ids = queryIds
              .flatMap((x) => x.split(","))
              .map((x) => x.trim())
              .filter(Boolean);
          }

          const singleId = url.searchParams.get("id");
          if (singleId && !ids.includes(singleId)) {
            ids.push(singleId);
          }

          try {
            const body = await request.json();
            if (Array.isArray(body?.ids)) {
              body.ids.forEach((i: unknown) => {
                const s = String(i).trim();
                if (s && !ids.includes(s)) ids.push(s);
              });
            } else if (body?.id) {
              const s = String(body.id).trim();
              if (s && !ids.includes(s)) ids.push(s);
            }
          } catch {
            // ignore non-JSON body
          }

          if (ids.length === 0) {
            return Response.json(
              { error: "Product ID or IDs parameter is required" },
              { status: 400 },
            );
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          let deleteResult;
          if (ids.includes("all") || ids.includes("*") || url.searchParams.get("all") === "true") {
            // Delete all products permanently from database
            deleteResult = await supabaseAdmin
              .from("products")
              .delete()
              .neq("id", "__impossible_never_match__");
          } else if (ids.length === 1) {
            deleteResult = await supabaseAdmin.from("products").delete().eq("id", ids[0]);
          } else {
            deleteResult = await supabaseAdmin.from("products").delete().in("id", ids);
          }

          if (deleteResult.error) {
            console.error("[API Products DELETE Error]:", deleteResult.error);
            return Response.json({ error: deleteResult.error.message }, { status: 500 });
          }

          return Response.json({ success: true, deletedIds: ids, count: ids.length });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("[API Products DELETE Exception]:", err);
          return Response.json({ error: msg }, { status: 500 });
        }
      },
    },
  },
});
