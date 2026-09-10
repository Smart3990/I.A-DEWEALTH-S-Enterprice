const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { createClient } = require("@supabase/supabase-js");

const sbUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!sbUrl || !sbKey) {
  console.error("Supabase URL or Key missing");
  process.exit(1);
}

const supabase = createClient(sbUrl, sbKey);
const cloudinaryMap = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../src/data/cloudinary-map.json"), "utf8"),
);

function getCloudinary(img) {
  if (!img) return "";
  if (img.startsWith("http")) return img;
  if (img.includes("sunglasses")) return cloudinaryMap["ac-sunglasses.jpg"] || "";
  const clean = img.replace(/^\.\//, "").replace(/-[A-Z0-9]{8}\.(jpg|png|jpeg)/, ".$1");
  return cloudinaryMap[clean] || "";
}

async function seed() {
  console.log("Bundling catalog with esbuild...");
  execSync(
    "npx esbuild src/data/catalog.ts --bundle --platform=node --format=cjs --loader:.jpg=file --loader:.png=file --loader:.json=json --outfile=/tmp/catalog.cjs",
  );

  const cat = require("/tmp/catalog.cjs");

  // 1. Categories
  console.log(`Processing ${cat.categories.length} categories...`);
  const categoryRows = cat.categories.map((c, idx) => ({
    id: c.id,
    name: c.name,
    slug: c.slug || c.id,
    parent_id: c.parentId || null,
    description: c.description || "",
    banner_image: getCloudinary(c.bannerImage),
    banner_title: c.bannerTitle || c.name,
    banner_subtitle: c.bannerSubtitle || "",
    banner_cta: c.bannerCTA || "Shop now",
    icon: c.icon || "Tag",
    is_active: c.isActive !== false,
    sort_order: c.sortOrder ?? (idx + 1) * 10,
  }));

  console.log("Upserting categories to Supabase...");
  const { error: catErr } = await supabase
    .from("categories")
    .upsert(categoryRows, { onConflict: "id" });
  if (catErr) {
    console.error("Categories error:", catErr.message);
  } else {
    console.log(`✅ Upserted ${categoryRows.length} categories with Cloudinary banner URLs!`);
  }

  // 2. Products
  console.log(`Processing ${cat.catalogProducts.length} products...`);
  const productRows = cat.catalogProducts.map((p) => {
    const mainImg = getCloudinary(p.image);
    const images =
      Array.isArray(p.images) && p.images.length > 0
        ? p.images.map(getCloudinary).filter(Boolean)
        : [mainImg].filter(Boolean);

    return {
      id: p.id,
      title: p.name,
      slug: p.id,
      category_id: p.categoryId || null,
      price: Number(p.price || 0),
      original_price: Number(p.was || p.price || 0),
      badge: p.tag || null,
      rating: Number(p.rating || 4.8),
      reviews_count: Number(p.reviews || 0),
      image: mainImg,
      images: images,
      is_active: true,
      is_featured: !!p.featured,
      is_super_deal: p.tag
        ? p.tag.toLowerCase().includes("deal") || p.tag.toLowerCase().includes("off")
        : false,
      is_clearance: !!p.clearance,
      is_top_pick: !!p.topPick,
      is_new: !!p.newArrival,
      is_bestseller: (p.sold || 0) > 50,
      short_description: p.spec || "",
      description: p.spec || "",
      specifications: {
        spec: p.spec || "",
        brand: p.brand || "",
        condition: p.condition || "Brand New",
        availability: p.availability || "In Stock",
        seller: p.seller || "I.A Dewealth Official Store",
      },
      stock: 25,
    };
  });

  console.log("Upserting products to Supabase...");
  const { error: prodErr } = await supabase
    .from("products")
    .upsert(productRows, { onConflict: "id" });
  if (prodErr) {
    console.error("Products error:", prodErr.message);
  } else {
    console.log(`✅ Upserted ${productRows.length} products with Cloudinary image URLs!`);
  }

  // 3. Banners
  console.log("Upserting homepage banners with Cloudinary URLs...");
  const bannerRows = [
    {
      title: "Direct-Import Tech & Appliances",
      subtitle: "Genuine gadgets, home appliances and vehicles delivered same-day in Accra.",
      badge: "Authentic Goods",
      cta_text: "Shop Now",
      cta_link: "/deals",
      image_url: cloudinaryMap["cars-hero.jpg"] || cloudinaryMap["banner-cars.jpg"] || "",
      position: "hero",
      sort_order: 1,
      is_active: true,
    },
    {
      title: "Flagship Smartphones & Accessories",
      subtitle: "Unboxed and verified with warranty. Direct dispatch to your doorstep.",
      badge: "New Arrivals",
      cta_text: "Explore Phones",
      cta_link: "/category/phones-tablets",
      image_url: cloudinaryMap["banner-phones.jpg"] || "",
      position: "hero",
      sort_order: 2,
      is_active: true,
    },
    {
      title: "Kitchen & Home Essentials",
      subtitle: "High-power air fryers, blenders, and smart cookers at wholesale prices.",
      badge: "Special Deals",
      cta_text: "View Appliances",
      cta_link: "/category/kitchen-appliances",
      image_url: cloudinaryMap["banner-kitchen.jpg"] || "",
      position: "hero",
      sort_order: 3,
      is_active: true,
    },
    {
      title: "Computers & Power Solutions",
      subtitle: "High-spec monitors, Thunderbolt docks and 140W GaN desktop chargers.",
      badge: "Pro Tech",
      cta_text: "Shop Computers",
      cta_link: "/category/computers-laptops",
      image_url: cloudinaryMap["banner-computers.jpg"] || "",
      position: "hero",
      sort_order: 4,
      is_active: true,
    },
  ];

  const { error: bannerErr } = await supabase
    .from("banners")
    .upsert(bannerRows, { onConflict: "title" });
  if (bannerErr) {
    console.error("Banners error:", bannerErr.message);
  } else {
    console.log(`✅ Upserted ${bannerRows.length} banners with Cloudinary URLs!`);
  }

  console.log("\n=== CLOUDINARY CATALOG SEEDING COMPLETED SUCCESSFULLY ===");
}

seed().catch((e) => {
  console.error("Seeding error:", e);
  process.exit(1);
});
