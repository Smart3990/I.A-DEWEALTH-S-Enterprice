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
  const chain: Category[] = [];
  let current = byId(id);
  while (current) {
    chain.unshift(current);
    current = current.parentId ? byId(current.parentId) : undefined;
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
  const out = [id];
  for (const child of childrenOf(id)) out.push(...descendantIds(child.id));
  return out;
}

/** Resolve a URL segment list back to a category, verifying the hierarchy. */
export function resolveCategoryPath(segments: string[]): Category | undefined {
  let parentId: string | null = null;
  let found: Category | undefined;
  for (const segment of segments) {
    found = activeCategories.find((c) => c.slug === segment && c.parentId === parentId);
    if (!found) return undefined;
    parentId = found.id;
  }
  return found;
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

type Seed = [
  id: string,
  name: string,
  categoryId: string,
  brand: string,
  price: number,
  was: number,
  rating: number,
  sold: number,
  image: string,
  spec: string,
  addedAt: string,
  extra?: Partial<CatalogProduct>,
];

const seeds: Seed[] = [
  // Phones & Tablets
  [
    "ph1",
    "Nova X9 Pro 5G 256GB Smartphone",
    "smartphones",
    "Nova",
    4290,
    4890,
    4.8,
    132,
    phone,
    '6.7" AMOLED 120Hz • 50MP OIS',
    "2026-08-02",
    { topPick: true },
  ],
  [
    "ph2",
    "Nova A5 Lite 128GB Smartphone",
    "smartphones",
    "Nova",
    1890,
    2250,
    4.6,
    208,
    phone,
    "5000mAh • 33W Fast Charge",
    "2026-07-11",
  ],
  [
    "ph3",
    "Kora Edge 512GB Flagship",
    "smartphones",
    "Kora",
    6450,
    7200,
    4.9,
    61,
    phone,
    "Snapdragon Elite • IP68",
    "2026-08-20",
  ],
  [
    "ph5",
    "Nova Tab 11 WiFi + LTE 128GB",
    "tablets",
    "Nova",
    2450,
    2900,
    4.7,
    88,
    tablet,
    '11" 90Hz • Stylus Ready',
    "2026-08-09",
    { topPick: true },
  ],
  [
    "ph6",
    'Kora Pad Mini 8.4" Tablet',
    "tablets",
    "Kora",
    1580,
    1890,
    4.5,
    74,
    tablet,
    '8.4" 2K • Kids Mode',
    "2026-06-28",
  ],
  [
    "ph7",
    "Armour Shockproof Clear Phone Case",
    "phone-cases",
    "Armour",
    85,
    130,
    4.6,
    512,
    phone,
    "2m Drop Tested • Anti-Yellow",
    "2026-07-30",
  ],
  [
    "ph8",
    "Armour 9H Tempered Glass (2-Pack)",
    "screen-protectors",
    "Armour",
    60,
    95,
    4.7,
    640,
    phone,
    "Oleophobic • Case Friendly",
    "2026-07-02",
  ],
  [
    "ph9",
    "Armour Privacy Screen Film",
    "screen-protectors",
    "Armour",
    95,
    140,
    4.4,
    187,
    phone,
    "28° Privacy Angle",
    "2026-06-05",
  ],
  [
    "ph10",
    "Voltaic 15W MagSafe Car Mount",
    "phone-accessories",
    "Voltaic",
    185,
    240,
    4.9,
    245,
    carMount,
    "N52 Magnets • 360° Ball Joint",
    "2026-08-15",
  ],
  [
    "ph11",
    "Voltaic 3-in-1 Foldable Wireless Stand",
    "phone-accessories",
    "Voltaic",
    490,
    590,
    4.9,
    142,
    magsafe,
    "Qi2 • Phone, Watch, Buds",
    "2026-08-22",
    { topPick: true },
  ],

  // Computers & Laptops
  [
    "cl1",
    "Meridian Air 14 Ultra 16GB/512GB Laptop",
    "laptops",
    "Meridian",
    9450,
    10800,
    4.8,
    46,
    laptop,
    '14" 2.8K • 18h Battery',
    "2026-08-25",
    { topPick: true },
  ],
  [
    "cl2",
    "Meridian Pro 16 Creator Laptop 32GB",
    "laptops",
    "Meridian",
    14900,
    16500,
    4.9,
    21,
    laptop,
    "RTX Graphics • 1TB NVMe",
    "2026-08-30",
  ],
  [
    "cl3",
    "Meridian Studio Mini Desktop PC",
    "desktop-computers",
    "Meridian",
    6800,
    7900,
    4.6,
    33,
    laptop,
    "Ryzen 7 • 16GB / 1TB",
    "2026-07-19",
  ],
  [
    "cl4",
    'Vista 34" UltraWide QHD Monitor',
    "monitors",
    "Vista",
    4300,
    5200,
    4.8,
    39,
    monitor,
    "165Hz • USB-C 90W",
    "2026-08-12",
  ],
  [
    "cl5",
    'Vista 27" 4K IPS Monitor',
    "monitors",
    "Vista",
    2950,
    3500,
    4.7,
    57,
    monitor,
    "99% sRGB • Height Adjust",
    "2026-06-21",
  ],
  [
    "cl6",
    "Clackr TKL Wireless Mechanical Keyboard",
    "keyboards-mice",
    "Clackr",
    690,
    850,
    4.8,
    96,
    keyboard,
    "Hot-Swap • Tri-Mode",
    "2026-07-27",
  ],
  [
    "cl7",
    "Clackr Silent Ergonomic Mouse",
    "keyboards-mice",
    "Clackr",
    240,
    320,
    4.5,
    143,
    keyboard,
    "Silent Clicks • 4000 DPI",
    "2026-05-30",
    { clearance: true },
  ],
  [
    "cl8",
    "Vault 2TB Portable NVMe SSD",
    "storage",
    "Vault",
    1450,
    1750,
    4.9,
    78,
    dock,
    "1050MB/s • Shock Resistant",
    "2026-08-06",
  ],
  [
    "cl9",
    "Vault 1TB Rugged External Drive",
    "storage",
    "Vault",
    780,
    950,
    4.6,
    112,
    dock,
    "IP54 • USB 3.2",
    "2026-06-16",
  ],
  [
    "cl10",
    "12-in-1 Triple Display Thunderbolt Dock",
    "computer-accessories",
    "Voltaic",
    680,
    850,
    4.9,
    41,
    dock,
    "Gigabit LAN • Dual DP + 4K HDMI",
    "2026-07-08",
  ],
  [
    "cl11",
    "Ergonomic Aluminium 360° Laptop Stand",
    "computer-accessories",
    "Voltaic",
    290,
    360,
    5.0,
    74,
    laptopStand,
    'CNC Milled • Fits up to 17"',
    "2026-06-02",
  ],
  [
    "cl12",
    "8-in-1 Dual 4K HDMI USB-C Hub",
    "computer-accessories",
    "Voltaic",
    380,
    460,
    4.9,
    118,
    hub,
    "100W PD Passthrough • Card Reader",
    "2026-08-18",
    { topPick: true },
  ],

  // Gadgets & Electronics
  [
    "ge1",
    "Voltaic 100W GaN Pro Multiport Charger",
    "chargers-adapters",
    "Voltaic",
    624,
    780,
    4.9,
    284,
    gan100,
    "3x USB-C + USB-A • Dual Laptop Power",
    "2026-08-28",
    { topPick: true },
  ],
  [
    "ge2",
    "Dual 65W GaN Pocket Travel Charger (UK)",
    "chargers-adapters",
    "Voltaic",
    420,
    520,
    4.8,
    195,
    chargerUk,
    "Foldable Ground Pin • Thermal Guard",
    "2026-07-22",
  ],
  [
    "ge3",
    "140W Digital Display Desktop GaN Brick",
    "chargers-adapters",
    "Voltaic",
    819,
    1050,
    4.8,
    67,
    gan140,
    "Live Watt Meter • Quad Ports",
    "2026-08-11",
  ],
  [
    "ge4",
    "240W Kevlar Braided Type-C Cable (2m)",
    "cables",
    "Voltaic",
    95,
    130,
    5.0,
    210,
    cable,
    "E-Marker Chip • 35,000+ Bends",
    "2026-07-05",
  ],
  [
    "ge5",
    "Braided Lightning to USB-C Cable (1m)",
    "cables",
    "Voltaic",
    75,
    110,
    4.7,
    268,
    cable,
    "MFi Grade • Fast Charge",
    "2026-05-25",
    { clearance: true },
  ],
  [
    "ge6",
    "Voltaic 27000mAh 100W Power Bank",
    "power-banks",
    "Voltaic",
    690,
    850,
    4.8,
    121,
    powerbank,
    "Digital Display • Laptop Ready",
    "2026-08-27",
    { topPick: true },
  ],
  [
    "ge7",
    "Voltaic 10000mAh Slim Magnetic Pack",
    "power-banks",
    "Voltaic",
    340,
    430,
    4.6,
    176,
    powerbank,
    "MagSafe Compatible • 20W",
    "2026-06-30",
  ],
  [
    "ge8",
    "Titanium Ultra Chrono GPS Sapphire Watch",
    "smartwatches",
    "Chrono",
    1189,
    1450,
    4.9,
    88,
    watch,
    "14-Day Battery • ECG & SpO2",
    "2026-08-24",
    { topPick: true },
  ],
  [
    "ge9",
    "Chrono Active 2 AMOLED Smartwatch",
    "smartwatches",
    "Chrono",
    720,
    890,
    4.6,
    134,
    watch,
    "Dual-Band GPS • 5ATM",
    "2026-07-15",
  ],
  [
    "ge10",
    "FitPro IPX8 Sports Fitness Tracker",
    "fitness-trackers",
    "FitPro",
    340,
    420,
    4.7,
    176,
    tracker,
    "Heart Rate • 100+ Modes",
    "2026-06-11",
  ],
  [
    "ge11",
    "FitPro Slim Sleep & Steps Band",
    "fitness-trackers",
    "FitPro",
    190,
    260,
    4.4,
    231,
    tracker,
    "10-Day Battery • Sleep Score",
    "2026-05-19",
    { clearance: true },
  ],
  [
    "ge12",
    "Woven Nylon Quick-Release Watch Strap",
    "watch-accessories",
    "Chrono",
    90,
    140,
    4.5,
    198,
    watch,
    "20/22mm • Sweat Resistant",
    "2026-06-08",
  ],
  [
    "ge13",
    "Apex Pro ANC Wireless Earbuds",
    "earbuds",
    "Apex",
    735,
    980,
    4.8,
    142,
    earbudsAnc,
    "45dB Hybrid ANC • 38h Case",
    "2026-08-29",
    { topPick: true },
  ],
  [
    "ge14",
    "Soundcore Neo Deep Bass IPX5 Earbuds",
    "earbuds",
    "Soundcore",
    550,
    640,
    4.7,
    96,
    earbudsNeo,
    "10mm Graphene • 28h Battery",
    "2026-07-25",
  ],
  [
    "ge15",
    "Apex Air Open-Ear Sport Earbuds",
    "earbuds",
    "Apex",
    430,
    560,
    4.5,
    84,
    earbudsNeo,
    "Ear-Hook Fit • IPX7",
    "2026-06-18",
  ],
  [
    "ge16",
    "Hi-Res Spatial Studio Over-Ear Headphones",
    "headphones",
    "Apex",
    850,
    1050,
    4.8,
    121,
    headphones,
    "LDAC Lossless • Memory Foam",
    "2026-08-04",
  ],
  [
    "ge17",
    "Studio Wired Monitoring Headphones",
    "headphones",
    "Apex",
    480,
    610,
    4.6,
    67,
    headphones,
    "40mm Drivers • Coiled Cable",
    "2026-05-28",
    { clearance: true },
  ],
  [
    "ge18",
    "Deep Bass Waterproof Bluetooth Speaker",
    "bluetooth-speakers",
    "Boomline",
    480,
    580,
    5.0,
    203,
    speaker,
    "IPX7 • 24h Play",
    "2026-08-16",
    { topPick: true },
  ],
  [
    "ge19",
    "Boomline Party Cube LED Speaker",
    "bluetooth-speakers",
    "Boomline",
    890,
    1100,
    4.7,
    58,
    speaker,
    "80W • RGB Light Show",
    "2026-07-12",
  ],
  [
    "ge20",
    "100W Cinematic 2.1ch Soundbar + Subwoofer",
    "soundbars",
    "Boomline",
    1100,
    1350,
    4.9,
    63,
    soundbar,
    "HDMI ARC • Optical • BT 5.3",
    "2026-08-01",
  ],
  [
    "ge21",
    "Boomline Compact TV Soundbar",
    "soundbars",
    "Boomline",
    620,
    790,
    4.5,
    47,
    soundbar,
    "60W • Wall Mountable",
    "2026-06-24",
  ],
  [
    "ge22",
    "Studio USB Condenser Microphone",
    "microphones",
    "Clearvox",
    520,
    660,
    4.7,
    72,
    headphones,
    "Cardioid • Zero-Latency Monitor",
    "2026-07-20",
  ],
  [
    "ge23",
    "Dual Wireless Lapel Microphone Kit",
    "microphones",
    "Clearvox",
    380,
    480,
    4.6,
    129,
    headphones,
    "Noise Cancelling • 8h Battery",
    "2026-08-08",
  ],
  [
    "ge24",
    "Smart Wi-Fi Plug & LED Bulb Bundle",
    "smart-home",
    "Homely",
    240,
    320,
    4.6,
    156,
    smarthome,
    "App & Voice Control",
    "2026-08-13",
  ],
  [
    "ge25",
    "Homely Smart Motion Sensor Set",
    "smart-home",
    "Homely",
    310,
    400,
    4.4,
    63,
    smarthome,
    "Instant Alerts • Battery Powered",
    "2026-06-14",
  ],
  [
    "ge26",
    "Guardian 2K Wi-Fi Security Camera",
    "cameras-security",
    "Guardian",
    560,
    720,
    4.8,
    108,
    camera,
    "Night Vision • Motion Tracking",
    "2026-08-21",
    { topPick: true },
  ],
  [
    "ge27",
    "Guardian Outdoor Solar Camera",
    "cameras-security",
    "Guardian",
    890,
    1090,
    4.7,
    44,
    camera,
    "Solar Panel • IP66",
    "2026-07-29",
  ],
  [
    "ge28",
    "Mini Digital Luggage & Parcel Scale",
    "other-electronics",
    "Homely",
    120,
    180,
    4.3,
    92,
    smarthome,
    "50kg Max • Backlit LCD",
    "2026-05-22",
    { clearance: true },
  ],

  // Kitchen
  [
    "kt1",
    "1800W High-Torque Ice-Crush Blender",
    "blenders",
    "ChefLine",
    650,
    790,
    5.0,
    98,
    blender,
    "6 Titanium Blades • 2L Jug",
    "2026-08-19",
    { topPick: true },
  ],
  [
    "kt2",
    "ChefLine Personal Smoothie Blender",
    "blenders",
    "ChefLine",
    280,
    380,
    4.5,
    164,
    blender,
    "600W • 2 Travel Bottles",
    "2026-06-26",
  ],
  [
    "kt3",
    "6.5L Digital Window Rapid Air Fryer",
    "air-fryers",
    "ChefLine",
    890,
    1150,
    4.8,
    132,
    airFryer,
    "360° Air • 8 Presets",
    "2026-08-23",
  ],
  [
    "kt4",
    "ChefLine 4L Compact Air Fryer",
    "air-fryers",
    "ChefLine",
    540,
    690,
    4.6,
    118,
    airFryer,
    "Dial Control • Non-Stick Basket",
    "2026-07-06",
  ],
  [
    "kt5",
    "25L Digital Grill Microwave Oven",
    "microwaves",
    "ChefLine",
    1450,
    1750,
    4.7,
    51,
    microwave,
    "Grill + Defrost • Child Lock",
    "2026-08-05",
  ],
  [
    "kt6",
    "20L Solo Microwave Oven",
    "microwaves",
    "ChefLine",
    890,
    1090,
    4.4,
    76,
    microwave,
    "6 Power Levels",
    "2026-06-09",
  ],
  [
    "kt7",
    "10-in-1 Electric Pressure Multi-Cooker 6L",
    "rice-cookers",
    "ChefLine",
    750,
    920,
    4.8,
    87,
    cooker,
    "Rice, Slow Cook & Sauté",
    "2026-07-17",
  ],
  [
    "kt8",
    "1.8L Non-Stick Digital Rice Cooker",
    "rice-cookers",
    "ChefLine",
    390,
    490,
    4.5,
    143,
    cooker,
    "Keep Warm • Steam Basket",
    "2026-06-01",
  ],
  [
    "kt9",
    "1.7L Stainless Steel Electric Kettle",
    "electric-kettles",
    "ChefLine",
    260,
    340,
    4.7,
    221,
    kettle,
    "Boil-Dry Protection • 2200W",
    "2026-08-10",
  ],
  [
    "kt10",
    "Temperature Control Gooseneck Kettle",
    "electric-kettles",
    "ChefLine",
    520,
    650,
    4.8,
    64,
    kettle,
    "5 Presets • Pour-Over Spout",
    "2026-07-24",
  ],
  [
    "kt11",
    "Smart 20-Bar Italian Pump Espresso Machine",
    "cookers",
    "ChefLine",
    1250,
    1500,
    4.9,
    54,
    espresso,
    "Crema Extraction • Milk Frother",
    "2026-08-26",
    { topPick: true },
  ],
  [
    "kt12",
    "Double Burner Infrared Table Cooker",
    "cookers",
    "ChefLine",
    680,
    850,
    4.4,
    71,
    cooker,
    "Glass Top • Timer",
    "2026-05-31",
    { clearance: true },
  ],

  // Accessories
  [
    "ac1",
    "Polarised Aviator Sunglasses",
    "fashion-accessories",
    "Kente Co.",
    180,
    260,
    4.6,
    174,
    sunglassesAsset.url,
    "UV400 • Metal Frame",
    "2026-07-14",
  ],
  [
    "ac2",
    "Woven Leather Belt & Wallet Set",
    "fashion-accessories",
    "Kente Co.",
    320,
    420,
    4.5,
    88,
    acBeltWallet,
    "Full Grain Leather",
    "2026-06-13",
  ],
  [
    "ac3",
    "Anti-Theft Water-Resistant Laptop Backpack",
    "travel-accessories",
    "Trekline",
    420,
    550,
    4.8,
    196,
    acBackpack,
    'Fits 16" • USB Pass-Through',
    "2026-08-17",
    { topPick: true },
  ],
  [
    "ac4",
    "Universal Travel Adapter with 3 USB Ports",
    "travel-accessories",
    "Trekline",
    210,
    290,
    4.7,
    233,
    acTravelAdapter,
    "150+ Countries • 20W PD",
    "2026-07-09",
  ],
  [
    "ac5",
    "Compression Packing Cube Set (6pc)",
    "travel-accessories",
    "Trekline",
    190,
    260,
    4.6,
    121,
    acPackingCubes,
    "Water-Resistant • Mesh Top",
    "2026-06-04",
  ],
  [
    "ac6",
    "Desk Cable Management Organiser Kit",
    "lifestyle-accessories",
    "Homely",
    130,
    190,
    4.4,
    148,
    acCableOrganiser,
    "Magnetic Clips • Sleeve",
    "2026-05-27",
    { clearance: true },
  ],
  [
    "ac7",
    "Insulated Stainless Steel Water Bottle",
    "lifestyle-accessories",
    "Homely",
    160,
    220,
    4.7,
    267,
    acWaterBottle,
    "24h Cold • 12h Hot",
    "2026-07-31",
  ],
  [
    "ac8",
    "Everyday Tech Pouch Organiser",
    "other-accessories",
    "Trekline",
    140,
    200,
    4.5,
    103,
    acTechPouch,
    "Elastic Loops • Zip Mesh",
    "2026-06-19",
  ],

  // Cars & Vehicles
  [
    "cv1",
    "Urban Comfort Compact SUV 1.5T (2024)",
    "suvs",
    "Urban Comfort",
    289000,
    305000,
    4.9,
    6,
    carSuv,
    "Brand New • Automatic • 0 km",
    "2026-08-14",
    { topPick: true },
  ],
  [
    "cv2",
    "Grand Tourer 7-Seat Luxury SUV (2023)",
    "suvs",
    "Grand Tourer",
    485000,
    510000,
    4.8,
    3,
    carSuv,
    "Home Used • 19,800 km • V6",
    "2026-07-21",
  ],
  [
    "cv3",
    "Executive Luxury Sedan 2.0 (2023)",
    "cars",
    "Executive",
    345000,
    365000,
    4.9,
    4,
    carSedan,
    "Foreign Used • 24,500 km",
    "2026-08-07",
  ],
  [
    "cv4",
    "Sportline Compact City Coupe (2021)",
    "cars",
    "Sportline",
    158000,
    172000,
    4.6,
    5,
    carSedan,
    "Home Used • 41,200 km",
    "2026-06-23",
  ],
  [
    "cv5",
    "Heavy-Duty 4x4 Double-Cab Pickup (2022)",
    "commercial-vehicles",
    "Heavy-Duty",
    412000,
    435000,
    4.8,
    2,
    carPickup,
    "Diesel 2.8L • 38,000 km",
    "2026-07-03",
  ],
  [
    "cv6",
    "Cargo Panel Delivery Van (2021)",
    "commercial-vehicles",
    "Heavy-Duty",
    298000,
    320000,
    4.5,
    2,
    carPickup,
    "Diesel • 62,000 km",
    "2026-06-07",
  ],
  [
    "cv7",
    "CityRider 150cc Commuter Motorbike",
    "motorbikes",
    "CityRider",
    18500,
    21000,
    4.7,
    34,
    motorbike,
    "Brand New • Fuel Injection",
    "2026-08-03",
  ],
  [
    "cv8",
    "CityRider Delivery Motorbike + Box",
    "motorbikes",
    "CityRider",
    21500,
    24000,
    4.6,
    27,
    motorbike,
    "Rear Cargo Box • Long Seat",
    "2026-07-13",
  ],
  [
    "cv9",
    "15W MagSafe Wireless Air Vent Car Mount",
    "car-accessories",
    "Voltaic",
    185,
    240,
    4.9,
    245,
    carMount,
    "N52 Magnets • 360° Ball Joint",
    "2026-08-15",
  ],
  [
    "cv10",
    "Dual-Port 45W Metal Car Charger",
    "car-accessories",
    "Voltaic",
    130,
    180,
    4.7,
    189,
    chargerUk,
    "PD + QC • LED Indicator",
    "2026-06-15",
  ],
];

const seedProducts: CatalogProduct[] = seeds.map(
  ([id, name, categoryId, brand, price, was, rating, sold, image, spec, addedAt, extra]) => ({
    id,
    name,
    categoryId,
    brand,
    price,
    was,
    rating,
    sold,
    image,
    spec,
    addedAt,
    reviews: Math.max(4, Math.round(sold * 0.42)),
    tag: price >= 100000 ? "Inspection & Registration Included" : "Accra Same-Day Dispatch",
    condition: "Brand New",
    availability: "In Stock",
    seller: "IA Dewealth Official Store",
    ...extra,
  }),
);

export let catalogProducts: CatalogProduct[] = seedProducts;

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

export const productsInCategory = (categoryId: string) => {
  const ids = new Set(descendantIds(categoryId));
  return catalogProducts.filter((p) => ids.has(p.categoryId));
};

export const discountOf = (p: CatalogProduct) => Math.round(((p.was - p.price) / p.was) * 100);

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
    select: (all) =>
      all
        .filter((p) => p.deal ?? discountOf(p) >= 20)
        .sort((a, b) => discountOf(b) - discountOf(a)),
  },
  {
    slug: "top-picks",
    name: "Top Picks",
    route: "/top-picks",
    bannerTitle: "Hand-Picked by Our Team",
    bannerSubtitle: "The products we recommend first, tested and trusted.",
    bannerImage: bannerComputers,
    icon: "Star",
    select: (all) => all.filter((p) => p.topPick),
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
      const flagged = all.filter((p) => p.newArrival);
      const list = flagged.length ? flagged : all;
      return [...list].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, 24);
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
  `https://wa.me/233240000000?text=${encodeURIComponent(message)}`;
