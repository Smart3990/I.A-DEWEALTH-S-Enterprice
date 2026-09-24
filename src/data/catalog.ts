/**
 * Single source of truth for the shop taxonomy + catalog products.
 * Categories are data-driven (flat list + parentId) so pages, menus,
 * breadcrumbs, banners and filters are all generated from this file.
 */
import bannerCars from "@/assets/banner-cars.jpg";
import bannerPhones from "@/assets/banner-phones.jpg";
import bannerComputers from "@/assets/banner-computers.jpg";
import bannerGadgets from "@/assets/banner-gadgets.jpg";
import bannerKitchen from "@/assets/banner-kitchen.jpg";
import bannerAccessories from "@/assets/banner-accessories.jpg";

import earbudsAnc from "@/assets/earbuds-anc.jpg";
import earbudsNeo from "@/assets/earbuds-neo.jpg";
import gan100 from "@/assets/gan-100w.jpg";
import gan140 from "@/assets/gan-140w-desktop.jpg";
import chargerUk from "@/assets/charger-uk-65w.jpg";
import cable from "@/assets/cable-kevlar.jpg";
import hub from "@/assets/usbc-hub.jpg";
import magsafe from "@/assets/magsafe-stand.jpg";
import laptopStand from "@/assets/laptop-stand.jpg";
import dock from "@/assets/dock-thunderbolt.jpg";
import airFryer from "@/assets/air-fryer.jpg";
import blender from "@/assets/blender.jpg";
import espresso from "@/assets/espresso.jpg";
import cooker from "@/assets/pressure-cooker.jpg";
import watch from "@/assets/smartwatch-titanium.jpg";
import tracker from "@/assets/fitness-tracker.jpg";
import speaker from "@/assets/speaker.jpg";
import headphones from "@/assets/headphones.jpg";
import soundbar from "@/assets/soundbar.jpg";
import carMount from "@/assets/car-mount.jpg";
import carSuv from "@/assets/car-suv.jpg";
import carSedan from "@/assets/car-sedan.jpg";
import carPickup from "@/assets/car-pickup.jpg";
import phone from "@/assets/p-smartphone.jpg";
import tablet from "@/assets/p-tablet.jpg";
import laptop from "@/assets/p-laptop.jpg";
import monitor from "@/assets/p-monitor.jpg";
import keyboard from "@/assets/p-keyboard.jpg";
import powerbank from "@/assets/p-powerbank.jpg";
import microwave from "@/assets/p-microwave.jpg";
import kettle from "@/assets/p-kettle.jpg";
import motorbike from "@/assets/p-motorbike.jpg";
import backpack from "@/assets/p-backpack.jpg";
import camera from "@/assets/p-camera.jpg";
import smarthome from "@/assets/p-smarthome.jpg";

// Accessories imagery
import sunglassesAsset from "@/assets/sunglasses.png.asset.json";
import bannerTravelAcc from "@/assets/banner-travel-accessories.jpg";
import bannerLifestyleAcc from "@/assets/banner-lifestyle-accessories.jpg";
import bannerOtherAcc from "@/assets/banner-other-accessories.jpg";
import acBeltWallet from "@/assets/ac-belt-wallet.jpg";
import acBackpack from "@/assets/ac-backpack.jpg";
import acTravelAdapter from "@/assets/ac-travel-adapter.jpg";
import acPackingCubes from "@/assets/ac-packing-cubes.jpg";
import acCableOrganiser from "@/assets/ac-cable-organiser.jpg";
import acWaterBottle from "@/assets/ac-water-bottle.jpg";
import acTechPouch from "@/assets/ac-tech-pouch.jpg";

export type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description: string;
  bannerImage: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerCTA?: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
};

const cat = (
  id: string,
  name: string,
  parentId: string | null,
  sortOrder: number,
  bannerTitle: string,
  bannerSubtitle: string,
  bannerImage: string,
  icon = "Tag",
  description = bannerSubtitle,
  bannerCTA = "Shop now",
): Category => ({
  id,
  name,
  slug: id,
  parentId,
  description,
  bannerImage,
  bannerTitle,
  bannerSubtitle,
  bannerCTA,
  icon,
  isActive: true,
  sortOrder,
});

const seedCategories: Category[] = [
  // ---------- Phones & Tablets ----------
  cat(
    "phones-tablets",
    "Phones & Tablets",
    null,
    10,
    "Flagship Power in Your Pocket",
    "Smartphones, tablets and everything that protects them.",
    bannerPhones,
    "Smartphone",
  ),
  cat(
    "smartphones",
    "Smartphones",
    "phones-tablets",
    1,
    "Smartphones Built to Keep Up",
    "Sealed, unlocked and warranty-backed handsets.",
    bannerPhones,
    "Smartphone",
  ),
  cat(
    "tablets",
    "Tablets",
    "phones-tablets",
    3,
    "Work and Watch Anywhere",
    "Big-screen tablets for study, work and streaming.",
    bannerPhones,
    "Tablet",
  ),
  cat(
    "phone-cases",
    "Phone Cases",
    "phones-tablets",
    4,
    "Protection With Personality",
    "Shockproof and slim cases for every model.",
    bannerPhones,
    "Shield",
  ),
  cat(
    "screen-protectors",
    "Screen Protectors",
    "phones-tablets",
    5,
    "Keep Every Pixel Perfect",
    "Tempered glass and privacy films.",
    bannerPhones,
    "Shield",
  ),
  cat(
    "phone-accessories",
    "Phone Accessories",
    "phones-tablets",
    6,
    "Small Add-Ons, Big Difference",
    "Mounts, grips, lenses and selfie gear.",
    bannerPhones,
    "Puzzle",
  ),

  // ---------- Computers & Laptops ----------
  cat(
    "computers-laptops",
    "Computers & Laptops",
    null,
    20,
    "Workstations That Never Blink",
    "Laptops, desktops, monitors and the gear around them.",
    bannerComputers,
    "Laptop",
  ),
  cat(
    "laptops",
    "Laptops",
    "computers-laptops",
    1,
    "Laptops for Real Work",
    "Thin, fast and built for long days.",
    bannerComputers,
    "Laptop",
  ),
  cat(
    "desktop-computers",
    "Desktop Computers",
    "computers-laptops",
    2,
    "Desk Power, Unlimited",
    "All-in-ones and tower PCs for the office.",
    bannerComputers,
    "Monitor",
  ),
  cat(
    "monitors",
    "Monitors",
    "computers-laptops",
    3,
    "See More, Do More",
    "Ultrawide and 4K panels for focused work.",
    bannerComputers,
    "Monitor",
  ),
  cat(
    "keyboards-mice",
    "Keyboards & Mice",
    "computers-laptops",
    4,
    "Type Faster, Click Smarter",
    "Mechanical boards and silent mice.",
    bannerComputers,
    "Keyboard",
  ),
  cat(
    "storage",
    "Storage",
    "computers-laptops",
    5,
    "Never Run Out of Space",
    "Portable SSDs, drives and memory cards.",
    bannerComputers,
    "HardDrive",
  ),
  cat(
    "computer-accessories",
    "Computer Accessories",
    "computers-laptops",
    6,
    "Finish the Setup",
    "Docks, hubs, stands and cable management.",
    bannerComputers,
    "Puzzle",
  ),

  // ---------- Gadgets & Electronics ----------
  cat(
    "gadgets-electronics",
    "Gadgets & Electronics",
    null,
    30,
    "Everyday Tech, Direct Import Prices",
    "Charging, audio, wearables, smart home and security.",
    bannerGadgets,
    "Zap",
  ),
  cat(
    "chargers-adapters",
    "Chargers & Adapters",
    "gadgets-electronics",
    1,
    "Charge Everything, Faster",
    "GaN bricks and travel adapters made for Ghana voltage.",
    bannerGadgets,
    "Zap",
  ),
  cat(
    "cables",
    "Cables",
    "gadgets-electronics",
    2,
    "Cables That Outlive the Phone",
    "Braided, e-marked, full-speed cables.",
    bannerGadgets,
    "Cable",
  ),
  cat(
    "power-banks",
    "Power Banks",
    "gadgets-electronics",
    3,
    "Power Through the Outage",
    "High-capacity packs with fast recharge.",
    bannerGadgets,
    "BatteryCharging",
  ),

  cat(
    "smartwatches-wearables",
    "Smartwatches & Wearables",
    "gadgets-electronics",
    4,
    "Your Health on Your Wrist",
    "Smartwatches, trackers and straps.",
    bannerGadgets,
    "Watch",
  ),
  cat(
    "smartwatches",
    "Smartwatches",
    "smartwatches-wearables",
    1,
    "Smartwatches Worth Wearing",
    "AMOLED screens, GPS and multi-day battery.",
    bannerGadgets,
    "Watch",
  ),
  cat(
    "fitness-trackers",
    "Fitness Trackers",
    "smartwatches-wearables",
    2,
    "Train With Real Numbers",
    "Heart rate, sleep and workout tracking.",
    bannerGadgets,
    "Activity",
  ),
  cat(
    "watch-accessories",
    "Watch Accessories",
    "smartwatches-wearables",
    3,
    "Change the Look, Keep the Watch",
    "Straps, cases and chargers.",
    bannerGadgets,
    "Puzzle",
  ),

  cat(
    "audio-sound",
    "Audio & Sound",
    "gadgets-electronics",
    5,
    "Immersive Audio for Every Moment",
    "Explore earbuds, headphones, speakers and more.",
    bannerGadgets,
    "Headphones",
  ),
  cat(
    "earbuds",
    "Earbuds",
    "audio-sound",
    1,
    "Discover Your Perfect Wireless Sound",
    "True wireless earbuds with real noise cancelling.",
    bannerGadgets,
    "Headphones",
  ),
  cat(
    "headphones",
    "Headphones",
    "audio-sound",
    2,
    "Studio Sound, All Day Comfort",
    "Over-ear cans for music and calls.",
    bannerGadgets,
    "Headphones",
  ),
  cat(
    "bluetooth-speakers",
    "Bluetooth Speakers",
    "audio-sound",
    3,
    "Take the Party Outside",
    "Waterproof speakers with deep bass.",
    bannerGadgets,
    "Speaker",
  ),
  cat(
    "soundbars",
    "Soundbars",
    "audio-sound",
    4,
    "Cinema Sound at Home",
    "Soundbars and subwoofers for the living room.",
    bannerGadgets,
    "Speaker",
  ),
  cat(
    "microphones",
    "Microphones",
    "audio-sound",
    5,
    "Be Heard Clearly",
    "USB and lapel mics for creators.",
    bannerGadgets,
    "Mic",
  ),

  cat(
    "smart-home",
    "Smart Home",
    "gadgets-electronics",
    6,
    "A Home That Responds",
    "Smart plugs, bulbs and sensors.",
    bannerGadgets,
    "House",
  ),
  cat(
    "cameras-security",
    "Cameras & Security",
    "gadgets-electronics",
    7,
    "Watch Over What Matters",
    "Wifi cameras, doorbells and alarms.",
    bannerGadgets,
    "Camera",
  ),
  cat(
    "other-electronics",
    "Other Electronics",
    "gadgets-electronics",
    8,
    "Everything Else Electronic",
    "Handy tech that defies categories.",
    bannerGadgets,
    "CircuitBoard",
  ),

  // ---------- Kitchen Appliances ----------
  cat(
    "kitchen-appliances",
    "Kitchen Appliances",
    null,
    40,
    "Cook Like the Pros",
    "Air fryers, blenders, cookers and more.",
    bannerKitchen,
    "CookingPot",
  ),
  cat(
    "blenders",
    "Blenders",
    "kitchen-appliances",
    1,
    "Blend Anything, Effortlessly",
    "High-torque motors and unbreakable jugs.",
    bannerKitchen,
    "CookingPot",
  ),
  cat(
    "air-fryers",
    "Air Fryers",
    "kitchen-appliances",
    2,
    "Crispy Without the Oil",
    "Digital air fryers with preset menus.",
    bannerKitchen,
    "CookingPot",
  ),
  cat(
    "microwaves",
    "Microwaves",
    "kitchen-appliances",
    3,
    "Fast Meals, Even Heat",
    "Solo, grill and convection microwaves.",
    bannerKitchen,
    "Microwave",
  ),
  cat(
    "rice-cookers",
    "Rice Cookers",
    "kitchen-appliances",
    4,
    "Perfect Rice, Every Time",
    "Multi-cookers that steam, cook and keep warm.",
    bannerKitchen,
    "CookingPot",
  ),
  cat(
    "electric-kettles",
    "Electric Kettles",
    "kitchen-appliances",
    5,
    "Boiling in Minutes",
    "Fast, quiet stainless steel kettles.",
    bannerKitchen,
    "CupSoda",
  ),
  cat(
    "cookers",
    "Cookers",
    "kitchen-appliances",
    6,
    "The Heart of the Kitchen",
    "Pressure cookers and coffee machines.",
    bannerKitchen,
    "Flame",
  ),

  // ---------- Accessories ----------
  cat(
    "accessories",
    "Accessories",
    null,
    50,
    "The Finishing Touches",
    "Fashion, travel and lifestyle accessories.",
    bannerAccessories,
    "Puzzle",
  ),
  cat(
    "fashion-accessories",
    "Fashion Accessories",
    "accessories",
    1,
    "Style That Travels",
    "Sunglasses, straps and everyday carry.",
    sunglassesAsset.url,
    "Glasses",
  ),
  cat(
    "travel-accessories",
    "Travel Accessories",
    "accessories",
    2,
    "Pack Smarter",
    "Backpacks, organisers and adapters.",
    bannerTravelAcc,
    "Luggage",
  ),
  cat(
    "lifestyle-accessories",
    "Lifestyle Accessories",
    "accessories",
    3,
    "Small Upgrades, Daily Wins",
    "Desk, home and car add-ons.",
    bannerLifestyleAcc,
    "Sparkles",
  ),
  cat(
    "other-accessories",
    "Other Accessories",
    "accessories",
    4,
    "Odds, Ends and Essentials",
    "Everything else worth keeping handy.",
    bannerOtherAcc,
    "Puzzle",
  ),

  // ---------- Cars & Vehicles (last in the row) ----------
  cat(
    "cars-vehicles",
    "Cars & Vehicles",
    null,
    60,
    "Drive Away Confident",
    "Inspected cars, SUVs, bikes and vehicle gear.",
    bannerCars,
    "Car",
  ),
  cat(
    "cars",
    "Cars",
    "cars-vehicles",
    1,
    "Sedans, Coupes and City Cars",
    "Cleared, registered and ready to drive.",
    bannerCars,
    "Car",
  ),
  cat(
    "suvs",
    "SUVs",
    "cars-vehicles",
    2,
    "Built for Every Road",
    "High-riding comfort with real ground clearance.",
    bannerCars,
    "Car",
  ),
  cat(
    "motorbikes",
    "Motorbikes",
    "cars-vehicles",
    3,
    "Beat the Traffic",
    "Commuter bikes with low running costs.",
    bannerCars,
    "Bike",
  ),
  cat(
    "commercial-vehicles",
    "Commercial Vehicles",
    "cars-vehicles",
    4,
    "Move Your Business",
    "Pickups and work vehicles that earn their keep.",
    bannerCars,
    "Truck",
  ),
  cat(
    "car-accessories",
    "Car Accessories",
    "cars-vehicles",
    5,
    "Upgrade the Cabin",
    "Mounts, chargers and in-car audio.",
    bannerCars,
    "Puzzle",
  ),
];

/**
 * Live catalog state. Seeded from the static data above and replaced at
 * runtime by whatever the admin has saved in the database.
 */
export let categories: Category[] = seedCategories;
export let activeCategories: Category[] = seedCategories.filter((c) => c.isActive);
export let rootCategories: Category[] = [];

export const byId = (id: string) => categories.find((c) => c.id === id);

export const childrenOf = (id: string | null) =>
  activeCategories.filter((c) => c.parentId === id).sort((a, b) => a.sortOrder - b.sortOrder);

export function ancestorsOf(id: string): Category[] {
  if (!id) return [];
  const chain: Category[] = [];
  const visited = new Set<string>();
  let current = byId(id);
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    chain.unshift(current);
    current =
      current.parentId && current.parentId !== current.id ? byId(current.parentId) : undefined;
  }
  return chain;
}

/** Full URL path for a category, e.g. /category/gadgets-electronics/audio-sound/earbuds */
export function categoryPath(id: string) {
  return `/category/${ancestorsOf(id)
    .map((c) => c.slug)
    .join("/")}`;
}

export function descendantIds(id: string): string[] {
  if (!id) return [];
  const out = [id];
  const visited = new Set<string>([id]);
  const queue = [id];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    for (const child of childrenOf(curr)) {
      if (child.id && !visited.has(child.id)) {
        visited.add(child.id);
        out.push(child.id);
        queue.push(child.id);
      }
    }
  }
  return out;
}

/** Resolve a URL segment list back to a category, verifying the hierarchy or matching by slug/id. */
export function resolveCategoryPath(segments: string[]): Category | undefined {
  if (!segments || !segments.length) return undefined;

  // 1. Try strict ancestor hierarchy walk first
  let parentId: string | null = null;
  let found: Category | undefined;
  let strictMatchSucceeded = true;

  for (const segment of segments) {
    found = activeCategories.find(
      (c) => (c.slug === segment || c.id === segment) && c.parentId === parentId,
    );
    if (!found) {
      strictMatchSucceeded = false;
      break;
    }
    parentId = found.id;
  }

  if (strictMatchSucceeded && found) {
    return found;
  }

  // 2. Fallback: match by the last segment against slug or id
  const lastSegment = segments[segments.length - 1];
  const directMatch = activeCategories.find((c) => c.slug === lastSegment || c.id === lastSegment);
  if (directMatch) return directMatch;

  // 3. Fallback: case-insensitive or name-based slug
  const normalized = lastSegment.toLowerCase().trim();
  return (
    activeCategories.find(
      (c) =>
        c.slug.toLowerCase() === normalized ||
        c.id.toLowerCase() === normalized ||
        c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === normalized,
    ) ||
    categories.find((c) => c.slug.toLowerCase() === normalized || c.id.toLowerCase() === normalized)
  );
}

// ============================ Products ============================

export type CatalogProduct = {
  id: string;
  name: string;
  image: string;
  images?: string[];
  price: number;
  was: number;
  rating: number;
  reviews: number;
  sold: number;
  tag: string;
  spec: string;
  categoryId: string;
  brand: string;
  condition: "Brand New" | "Refurbished" | "Open Box";
  availability: "In Stock" | "Pre-Order" | "Out of Stock";
  seller: string;
  addedAt: string;
  topPick?: boolean;
  clearance?: boolean;
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  deal?: boolean;
  description?: string;
  sku?: string;
  stock?: number;
};

export const initialCatalogProducts: CatalogProduct[] = [
  {
    id: "prod-nokia-150-4g",
    name: "ORIGINAL NOKIA 150 4G",
    image:
      "https://res.cloudinary.com/i90i25pj/image/upload/v1790178070/iadewealth/products/prod-nokia-150-4g_primary_1790178069962.jpg",
    images: [
      "https://res.cloudinary.com/i90i25pj/image/upload/v1790178070/iadewealth/products/prod-nokia-150-4g_primary_1790178069962.jpg",
      "https://res.cloudinary.com/i90i25pj/image/upload/v1790178070/iadewealth/products/prod-nokia-150-4g_gallery_0_1790178070693.jpg",
    ],
    price: 300,
    was: 350,
    rating: 4.9,
    reviews: 24,
    sold: 24,
    tag: "-14%",
    spec: "Long-lasting battery, 4G VoLTE, FM radio, built-in camera, and rugged build.",
    categoryId: "smartphones",
    brand: "Nokia",
    condition: "Brand New",
    availability: "In Stock",
    seller: "IA Dewealth Official Store",
    addedAt: "2026-09-23T15:41:11.426Z",
    featured: true,
    topPick: true,
    newArrival: true,
    bestSeller: true,
    deal: true,
    description:
      "Original Nokia 150 4G direct import. Superior battery endurance, crystal clear calls with VoLTE, durable polycarbonate chassis.",
    sku: "prod-nokia-150-4g",
    stock: 25,
  },
  {
    id: "prod-q16-cyxg",
    name: "ORIGINAL Q16 CYXG",
    image:
      "https://res.cloudinary.com/i90i25pj/image/upload/v1790178064/iadewealth/products/prod-q16-cyxg_primary_1790178064333.jpg",
    images: [
      "https://res.cloudinary.com/i90i25pj/image/upload/v1790178064/iadewealth/products/prod-q16-cyxg_primary_1790178064333.jpg",
      "https://res.cloudinary.com/i90i25pj/image/upload/v1790178065/iadewealth/products/prod-q16-cyxg_gallery_0_1790178065070.jpg",
    ],
    price: 250,
    was: 300,
    rating: 4.8,
    reviews: 18,
    sold: 18,
    tag: "-17%",
    spec: "HD Full-Touch Display, Bluetooth Calling, Sports Tracking & Real-Time Health Sensors.",
    categoryId: "smartwatches",
    brand: "CYXG",
    condition: "Brand New",
    availability: "In Stock",
    seller: "IA Dewealth Official Store",
    addedAt: "2026-09-23T15:41:06.135Z",
    featured: true,
    topPick: true,
    newArrival: true,
    bestSeller: true,
    deal: true,
    description:
      "Original Q16 CYXG Smartwatch featuring seamless Bluetooth call handling, multi-sport activity tracking, optical heart rate and SpO2 monitoring.",
    sku: "prod-q16-cyxg",
    stock: 20,
  },
  {
    id: "prod-galaxy-buds-2-pro",
    name: "Original Galaxy buds 2 Pro",
    image:
      "https://res.cloudinary.com/i90i25pj/image/upload/v1790178068/iadewealth/products/prod-galaxy-buds-2-pro_primary_1790178068165.jpg",
    images: [
      "https://res.cloudinary.com/i90i25pj/image/upload/v1790178068/iadewealth/products/prod-galaxy-buds-2-pro_primary_1790178068165.jpg",
      "https://res.cloudinary.com/i90i25pj/image/upload/v1790178069/iadewealth/products/prod-galaxy-buds-2-pro_gallery_0_1790178069158.jpg",
    ],
    price: 300,
    was: 400,
    rating: 5.0,
    reviews: 32,
    sold: 32,
    tag: "-25%",
    spec: "Intelligent Active Noise Cancellation, 24-bit Hi-Fi audio, 360 Audio with Head Tracking.",
    categoryId: "earbuds",
    brand: "Samsung",
    condition: "Brand New",
    availability: "In Stock",
    seller: "IA Dewealth Official Store",
    addedAt: "2026-09-23T15:41:09.910Z",
    featured: true,
    topPick: true,
    newArrival: true,
    bestSeller: true,
    deal: true,
    description:
      "Premium Galaxy Buds 2 Pro. Studio-grade sound with 2-way woofer + tweeter, ergonomic aerodynamic fit, water resistant IPX7.",
    sku: "prod-galaxy-buds-2-pro",
    stock: 30,
  },
  {
    id: "prod-ai-glasses",
    name: "Ai GLASSES",
    image:
      "https://res.cloudinary.com/i90i25pj/image/upload/v1790178066/iadewealth/products/prod-ai-glasses_primary_1790178066192.jpg",
    images: [
      "https://res.cloudinary.com/i90i25pj/image/upload/v1790178066/iadewealth/products/prod-ai-glasses_primary_1790178066192.jpg",
      "https://res.cloudinary.com/i90i25pj/image/upload/v1790178067/iadewealth/products/prod-ai-glasses_gallery_0_1790178067069.jpg",
    ],
    price: 500,
    was: 700,
    rating: 4.9,
    reviews: 15,
    sold: 15,
    tag: "-29%",
    spec: "Smart Audio Glasses with polarized UV400 lenses, hands-free calling and open-ear audio.",
    categoryId: "fashion-accessories",
    brand: "IA Dewealth Tech",
    condition: "Brand New",
    availability: "In Stock",
    seller: "IA Dewealth Official Store",
    addedAt: "2026-09-23T15:41:08.095Z",
    featured: true,
    topPick: true,
    newArrival: true,
    bestSeller: false,
    deal: true,
    description:
      "Next-gen Smart AI Audio Glasses. Directional speaker acoustic system, voice assistant integration, lightweight durable frame.",
    sku: "prod-ai-glasses",
    stock: 15,
  },
  {
    id: "prod-mini-electric-iron",
    name: "Mini Electric Iron",
    image:
      "https://res.cloudinary.com/i90i25pj/image/upload/v1790178062/iadewealth/products/prod-mini-electric-iron_primary_1790178061905.jpg",
    images: [
      "https://res.cloudinary.com/i90i25pj/image/upload/v1790178062/iadewealth/products/prod-mini-electric-iron_primary_1790178061905.jpg",
      "https://res.cloudinary.com/i90i25pj/image/upload/v1790178063/iadewealth/products/prod-mini-electric-iron_gallery_0_1790178063480.jpg",
    ],
    price: 150,
    was: 200,
    rating: 4.7,
    reviews: 28,
    sold: 28,
    tag: "-25%",
    spec: "Portable Foldable Garment Steamer & Mini Electric Dry Iron for Travel and Home.",
    categoryId: "kitchen-appliances",
    brand: "IA Dewealth Home",
    condition: "Brand New",
    availability: "In Stock",
    seller: "IA Dewealth Official Store",
    addedAt: "2026-09-23T15:41:04.279Z",
    featured: true,
    topPick: true,
    newArrival: true,
    bestSeller: true,
    deal: true,
    description:
      "Compact, ultra-lightweight travel mini electric iron. Non-stick ceramic soleplate, rapid 30-second preheat, ideal for delicate fabrics and daily use.",
    sku: "prod-mini-electric-iron",
    stock: 40,
  },
  {
    id: "prod-original-kettle",
    name: "ORIGINAL KETTLE",
    image:
      "https://res.cloudinary.com/i90i25pj/image/upload/v1790178060/iadewealth/products/prod-original-kettle_primary_1790178059496.jpg",
    images: [
      "https://res.cloudinary.com/i90i25pj/image/upload/v1790178060/iadewealth/products/prod-original-kettle_primary_1790178059496.jpg",
      "https://res.cloudinary.com/i90i25pj/image/upload/v1790178060/iadewealth/products/prod-original-kettle_gallery_0_1790178060558.jpg",
    ],
    price: 160,
    was: 200,
    rating: 4.8,
    reviews: 36,
    sold: 36,
    tag: "-20%",
    spec: "2.0L Fast-Boiling Food-Grade Stainless Steel Cordless Electric Kettle.",
    categoryId: "electric-kettles",
    brand: "IA Dewealth Home",
    condition: "Brand New",
    availability: "In Stock",
    seller: "IA Dewealth Official Store",
    addedAt: "2026-09-23T15:41:01.776Z",
    featured: true,
    topPick: true,
    newArrival: true,
    bestSeller: true,
    deal: true,
    description:
      "Premium Food-Grade Stainless Steel Electric Kettle. 1500W rapid boil technology, automatic shut-off and boil-dry protection.",
    sku: "prod-original-kettle",
    stock: 35,
  },
];

export let catalogProducts: CatalogProduct[] = [...initialCatalogProducts];

function recompute() {
  activeCategories = categories.filter((c) => c.isActive);
  rootCategories = childrenOf(null);
}

/** Swap the whole storefront catalog for data saved by the admin. */
export function applyCatalogSnapshot(nextCategories: Category[], nextProducts: CatalogProduct[]) {
  if (nextCategories.length) categories = nextCategories;
  catalogProducts = nextProducts;
  recompute();
}

recompute();

export const productsInCategory = (categoryId: string, customProducts?: CatalogProduct[]) => {
  const ids = new Set(descendantIds(categoryId));
  const pool = customProducts ?? catalogProducts;
  return pool.filter((p) => ids.has(p.categoryId));
};

export const isCategoryEmpty = (categoryId: string, customProducts?: CatalogProduct[]): boolean => {
  return productsInCategory(categoryId, customProducts).length === 0;
};

export const nonEmptyChildrenOf = (
  id: string | null,
  customProducts?: CatalogProduct[],
): Category[] => {
  return childrenOf(id).filter((c) => !isCategoryEmpty(c.id, customProducts));
};

export const discountOf = (p: CatalogProduct) => {
  if (
    !p ||
    typeof p.was !== "number" ||
    typeof p.price !== "number" ||
    p.was <= p.price ||
    p.was <= 0
  )
    return 0;
  const val = Math.round(((p.was - p.price) / p.was) * 100);
  return isNaN(val) || val < 0 ? 0 : val;
};

// ======================= Discover collections =======================

export type Collection = {
  slug: string;
  name: string;
  route: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerImage: string;
  icon: string;
  select: (all: CatalogProduct[]) => CatalogProduct[];
};

export const collections: Collection[] = [
  {
    slug: "deals",
    name: "Super Deals",
    route: "/deals",
    bannerTitle: "Super Deals, Live Right Now",
    bannerSubtitle: "The steepest discounts across the whole store, while stock lasts.",
    bannerImage: bannerGadgets,
    icon: "Flame",
    select: (all) => {
      // Prioritize explicit deals first, ordered by newest addedAt so new products replace older ones
      const explicitDeals = all
        .filter((p) => Boolean(p.deal))
        .sort((a, b) => {
          const timeB = new Date(b.addedAt || 0).getTime() || 0;
          const timeA = new Date(a.addedAt || 0).getTime() || 0;
          if (timeB !== timeA) return timeB - timeA;
          return discountOf(b) - discountOf(a);
        });
      // Fallback high discounts
      const discountDeals = all
        .filter((p) => !p.deal && discountOf(p) >= 20)
        .sort((a, b) => {
          const timeB = new Date(b.addedAt || 0).getTime() || 0;
          const timeA = new Date(a.addedAt || 0).getTime() || 0;
          if (timeB !== timeA) return timeB - timeA;
          return discountOf(b) - discountOf(a);
        });
      return [...explicitDeals, ...discountDeals];
    },
  },
  {
    slug: "top-picks",
    name: "Top Picks",
    route: "/top-picks",
    bannerTitle: "Hand-Picked by Our Team",
    bannerSubtitle: "The products we recommend first, tested and trusted.",
    bannerImage: bannerComputers,
    icon: "Star",
    select: (all) => {
      const picks = all.filter((p) => p.topPick || p.featured);
      const list = picks.length ? picks : all;
      return [...list].sort((a, b) => {
        const timeB = new Date(b.addedAt || 0).getTime() || 0;
        const timeA = new Date(a.addedAt || 0).getTime() || 0;
        return timeB - timeA;
      });
    },
  },
  {
    slug: "new-arrivals",
    name: "New Arrivals",
    route: "/new-arrivals",
    bannerTitle: "Fresh Off the Shipment",
    bannerSubtitle: "The newest stock to land in Accra.",
    bannerImage: bannerPhones,
    icon: "Sparkles",
    select: (all) => {
      // Newly added products appear first, sorted by newest arrival date
      return [...all].sort((a, b) => {
        const timeB = new Date(b.addedAt || 0).getTime() || 0;
        const timeA = new Date(a.addedAt || 0).getTime() || 0;
        if (timeB !== timeA) return timeB - timeA;
        const flagB = b.newArrival ? 1 : 0;
        const flagA = a.newArrival ? 1 : 0;
        if (flagB !== flagA) return flagB - flagA;
        return (b.id || "").localeCompare(a.id || "");
      });
    },
  },
  {
    slug: "best-sellers",
    name: "Best Sellers",
    route: "/best-sellers",
    bannerTitle: "What Ghana Is Buying",
    bannerSubtitle: "Ranked by units sold across every category.",
    bannerImage: bannerKitchen,
    icon: "Trophy",
    select: (all) => {
      const flagged = all.filter((p) => p.bestSeller);
      const list = flagged.length ? flagged : all;
      return [...list].sort((a, b) => b.sold - a.sold).slice(0, 24);
    },
  },
  {
    slug: "clearance",
    name: "Clearance",
    route: "/clearance",
    bannerTitle: "Final Stock Clearance",
    bannerSubtitle: "Last units, lowest prices. No restock once they're gone.",
    bannerImage: bannerAccessories,
    icon: "Percent",
    select: (all) => all.filter((p) => p.clearance),
  },
];

export const collectionBySlug = (slug: string) => collections.find((c) => c.slug === slug);

/** WhatsApp deep link with a prefilled message. */
export const WHATSAPP_TEXT = (message: string) =>
  `https://wa.me/233241118229?text=${encodeURIComponent(message)}`;
