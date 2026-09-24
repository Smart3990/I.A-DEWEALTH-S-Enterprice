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
import carEv from "@/assets/car-ev.jpg";
import carLuxsuv from "@/assets/car-luxsuv.jpg";
import carCoupe from "@/assets/car-coupe.jpg";
import earbudsCut from "@/assets/earbuds-transparent.png";
import gan100Cut from "@/assets/gan-100w-transparent.png";
import watchCut from "@/assets/smartwatch-transparent.png";

/** Store WhatsApp number. Replaced at runtime by the number saved in admin settings. */
export let WHATSAPP = "233555526233";

export function setWhatsappNumber(number: string) {
  const digits = (number ?? "").replace(/\D/g, "");
  if (digits) WHATSAPP = digits;
}

export function waLink(name: string, price: number) {
  const text = `Hello IA DEWEALTH, I want to order ${name} (GHC ${price.toLocaleString()})`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}

export type Product = {
  id: string;
  name: string;
  image: string;
  price: number;
  was: number;
  rating: number;
  sold: number;
  tag: string;
  spec: string;
};

export type Deal = {
  id: string;
  productId: string;
  name: string;
  short: string;
  image: string;
  price: number;
  was: number;
  discount: number;
  note: string;
};

export const deals: Deal[] = [
  {
    id: "d1",
    productId: "prod-ai-glasses",
    name: "Ai GLASSES",
    short: "Ai GLASSES",
    image:
      "https://res.cloudinary.com/i90i25pj/image/upload/v1790178066/iadewealth/products/prod-ai-glasses_primary_1790178066192.jpg",
    price: 500,
    was: 700,
    discount: 29,
    note: "In Stock Accra",
  },
  {
    id: "d2",
    productId: "prod-galaxy-buds-2-pro",
    name: "Original Galaxy buds 2 Pro",
    short: "Original Galaxy buds 2 Pro",
    image:
      "https://res.cloudinary.com/i90i25pj/image/upload/v1790178068/iadewealth/products/prod-galaxy-buds-2-pro_primary_1790178068165.jpg",
    price: 300,
    was: 400,
    discount: 25,
    note: "Accra Same-Day Dispatch",
  },
  {
    id: "d3",
    productId: "prod-mini-electric-iron",
    name: "Mini Electric Iron",
    short: "Mini Electric Iron",
    image:
      "https://res.cloudinary.com/i90i25pj/image/upload/v1790178062/iadewealth/products/prod-mini-electric-iron_primary_1790178061905.jpg",
    price: 150,
    was: 200,
    discount: 25,
    note: "In Stock Accra",
  },
  {
    id: "d4",
    productId: "prod-original-kettle",
    name: "ORIGINAL KETTLE",
    short: "ORIGINAL KETTLE",
    image:
      "https://res.cloudinary.com/i90i25pj/image/upload/v1790178060/iadewealth/products/prod-original-kettle_primary_1790178059496.jpg",
    price: 160,
    was: 200,
    discount: 20,
    note: "1-Year Warranty",
  },
  {
    id: "d5",
    productId: "prod-q16-cyxg",
    name: "ORIGINAL Q16 CYXG",
    short: "ORIGINAL Q16 CYXG",
    image:
      "https://res.cloudinary.com/i90i25pj/image/upload/v1790178064/iadewealth/products/prod-q16-cyxg_primary_1790178064333.jpg",
    price: 250,
    was: 300,
    discount: 17,
    note: "In Stock Accra",
  },
  {
    id: "d6",
    productId: "prod-nokia-150-4g",
    name: "ORIGINAL NOKIA 150 4G",
    short: "ORIGINAL NOKIA 150 4G",
    image:
      "https://res.cloudinary.com/i90i25pj/image/upload/v1790178070/iadewealth/products/prod-nokia-150-4g_primary_1790178069962.jpg",
    price: 300,
    was: 350,
    discount: 14,
    note: "Accra Same-Day Dispatch",
  },
];

export type Section = {
  id: string;
  eyebrow: string;
  title: string;
  link?: string;
  products: Product[];
};

export const sections: Section[] = [
  {
    id: "top-picks",
    eyebrow: "Authentic Gear",
    title: "Top Popular",
    products: [
      {
        id: "prod-galaxy-buds-2-pro",
        name: "Original Galaxy buds 2 Pro",
        image:
          "https://res.cloudinary.com/i90i25pj/image/upload/v1790178068/iadewealth/products/prod-galaxy-buds-2-pro_primary_1790178068165.jpg",
        price: 300,
        was: 400,
        rating: 5.0,
        sold: 32,
        tag: "-25%",
        spec: "Intelligent ANC • 24-bit Hi-Fi Audio",
      },
      {
        id: "prod-nokia-150-4g",
        name: "ORIGINAL NOKIA 150 4G",
        image:
          "https://res.cloudinary.com/i90i25pj/image/upload/v1790178070/iadewealth/products/prod-nokia-150-4g_primary_1790178069962.jpg",
        price: 300,
        was: 350,
        rating: 4.9,
        sold: 24,
        tag: "-14%",
        spec: "Long-lasting Battery • 4G VoLTE",
      },
      {
        id: "prod-q16-cyxg",
        name: "ORIGINAL Q16 CYXG",
        image:
          "https://res.cloudinary.com/i90i25pj/image/upload/v1790178064/iadewealth/products/prod-q16-cyxg_primary_1790178064333.jpg",
        price: 250,
        was: 300,
        rating: 4.8,
        sold: 18,
        tag: "-17%",
        spec: "Bluetooth Calling • Sports Tracking",
      },
      {
        id: "prod-original-kettle",
        name: "ORIGINAL KETTLE",
        image:
          "https://res.cloudinary.com/i90i25pj/image/upload/v1790178060/iadewealth/products/prod-original-kettle_primary_1790178059496.jpg",
        price: 160,
        was: 200,
        rating: 4.8,
        sold: 36,
        tag: "-20%",
        spec: "2.0L Fast-Boiling Food-Grade Stainless Steel",
      },
    ],
  },
  {
    id: "gadgets-chargers",
    eyebrow: "Wear & Listen",
    title: "Gadgets & Wearables",
    link: "View All Wearables",
    products: [
      {
        id: "prod-galaxy-buds-2-pro",
        name: "Original Galaxy buds 2 Pro",
        image:
          "https://res.cloudinary.com/i90i25pj/image/upload/v1790178068/iadewealth/products/prod-galaxy-buds-2-pro_primary_1790178068165.jpg",
        price: 300,
        was: 400,
        rating: 5.0,
        sold: 32,
        tag: "-25%",
        spec: "Intelligent ANC • 24-bit Hi-Fi Audio",
      },
      {
        id: "prod-q16-cyxg",
        name: "ORIGINAL Q16 CYXG",
        image:
          "https://res.cloudinary.com/i90i25pj/image/upload/v1790178064/iadewealth/products/prod-q16-cyxg_primary_1790178064333.jpg",
        price: 250,
        was: 300,
        rating: 4.8,
        sold: 18,
        tag: "-17%",
        spec: "Bluetooth Calling • Sports Tracking",
      },
      {
        id: "prod-ai-glasses",
        name: "Ai GLASSES",
        image:
          "https://res.cloudinary.com/i90i25pj/image/upload/v1790178066/iadewealth/products/prod-ai-glasses_primary_1790178066192.jpg",
        price: 500,
        was: 700,
        rating: 4.9,
        sold: 15,
        tag: "-29%",
        spec: "Smart Audio Glasses • UV400 Polarized",
      },
    ],
  },
  {
    id: "kitchen-appliances",
    eyebrow: "Home & Living",
    title: "Kitchen & Home",
    link: "View All Appliances",
    products: [
      {
        id: "prod-original-kettle",
        name: "ORIGINAL KETTLE",
        image:
          "https://res.cloudinary.com/i90i25pj/image/upload/v1790178060/iadewealth/products/prod-original-kettle_primary_1790178059496.jpg",
        price: 160,
        was: 200,
        rating: 4.8,
        sold: 36,
        tag: "-20%",
        spec: "2.0L Fast-Boiling Stainless Steel",
      },
      {
        id: "prod-mini-electric-iron",
        name: "Mini Electric Iron",
        image:
          "https://res.cloudinary.com/i90i25pj/image/upload/v1790178062/iadewealth/products/prod-mini-electric-iron_primary_1790178061905.jpg",
        price: 150,
        was: 200,
        rating: 4.7,
        sold: 28,
        tag: "-25%",
        spec: "Portable Foldable Garment Steamer",
      },
    ],
  },
];

export type Car = {
  id: string;
  brand: string;
  model: string;
  year: number;
  condition: "Brand New" | "Foreign Used" | "Home Used";
  bodyType: string;
  fuel: string;
  transmission: string;
  mileage: string;
  color: string;
  price: number;
  image: string;
  featured?: boolean;
};

export const cars: Car[] = [
  {
    id: "car1",
    brand: "Urban Comfort",
    model: "Compact SUV, Fully Loaded",
    year: 2024,
    condition: "Brand New",
    bodyType: "SUV",
    fuel: "Petrol • 1.5L Turbo",
    transmission: "Automatic",
    mileage: "0 km",
    color: "Pearl White",
    price: 289000,
    image: carSuv,
    featured: true,
  },
  {
    id: "car2",
    brand: "Executive",
    model: "Luxury Sedan, Leather Interior",
    year: 2023,
    condition: "Foreign Used",
    bodyType: "Sedan",
    fuel: "Petrol • 2.0L",
    transmission: "Automatic",
    mileage: "24,500 km",
    color: "Midnight Black",
    price: 345000,
    image: carSedan,
    featured: true,
  },
  {
    id: "car3",
    brand: "Heavy-Duty",
    model: "4x4 Double-Cab Pickup",
    year: 2022,
    condition: "Foreign Used",
    bodyType: "Pickup",
    fuel: "Diesel • 2.8L",
    transmission: "Manual",
    mileage: "38,000 km",
    color: "Gunmetal Grey",
    price: 412000,
    image: carPickup,
  },
  {
    id: "car4",
    brand: "Volt City",
    model: "Electric Hatchback + Home Charger",
    year: 2024,
    condition: "Brand New",
    bodyType: "Hatchback",
    fuel: "Electric • 410km Range",
    transmission: "Automatic",
    mileage: "0 km",
    color: "Arctic Silver",
    price: 268000,
    image: carEv,
  },
  {
    id: "car5",
    brand: "Grand Tourer",
    model: "Full-Size Luxury SUV, 7 Seats",
    year: 2023,
    condition: "Home Used",
    bodyType: "SUV",
    fuel: "Petrol • 3.5L V6",
    transmission: "Automatic",
    mileage: "19,800 km",
    color: "Obsidian Black",
    price: 485000,
    image: carLuxsuv,
    featured: true,
  },
  {
    id: "car6",
    brand: "Sportline",
    model: "Compact City Coupe",
    year: 2021,
    condition: "Home Used",
    bodyType: "Coupe",
    fuel: "Petrol • 1.2L",
    transmission: "Automatic",
    mileage: "41,200 km",
    color: "Racing Red",
    price: 158000,
    image: carCoupe,
  },
];

export function waCarLink(car: Car) {
  const text = `Hello IA DEWEALTH, I'm interested in the ${car.brand} ${car.model} (${car.year}, ${car.condition}) listed at GHC ${car.price.toLocaleString()}. Please share more details.`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}

export const heroSlides = [
  {
    id: 0,
    title: "Original Galaxy Buds 2 Pro",
    accent: "Studio Sound in Accra.",
    body: "Intelligent ANC with 24-bit Hi-Fi studio acoustics, 360 Audio with head tracking, and IPX7 water resistance.",
    cta: "Shop Galaxy Buds",
    image: earbudsCut,
    alt: "Original Galaxy buds 2 Pro",
    note: "GHC 300 • In Stock Accra",
  },
  {
    id: 1,
    title: "Smart AI Audio Glasses",
    accent: "Next-Gen Tech.",
    body: "Hands-free Bluetooth calling, directional acoustic speakers, and polarized UV400 lenses in a stylish lightweight frame.",
    cta: "Explore AI Glasses",
    image: gan100Cut,
    alt: "Ai GLASSES",
    note: "GHC 500 • In Stock Accra",
  },
  {
    id: 2,
    title: "Original Q16 CYXG",
    accent: "Precision on Your Wrist.",
    body: "HD full-touch retina display, seamless Bluetooth calling, multi-sport activity tracking, and real-time health metrics.",
    cta: "View Smartwatch",
    image: watchCut,
    alt: "ORIGINAL Q16 CYXG",
    note: "GHC 250 • In Stock Accra",
  },
];

export type CarCategory = {
  slug: string;
  label: string;
  tagline: string;
  blurb: string;
  gradient: string;
  accent: string;
  image: string;
  bodyTypes: string[];
};

export const carCategories: CarCategory[] = [
  {
    slug: "suv",
    label: "SUVs & 4x4",
    tagline: "Command every road",
    blurb:
      "High-riding comfort, space for the whole family and the muscle for Ghana's toughest routes.",
    gradient: "from-[#0b1f3a] via-[#123a63] to-[#1e6f9f]",
    accent: "text-sky-300",
    image: carSuv,
    bodyTypes: ["SUV"],
  },
  {
    slug: "sedan",
    label: "Executive Sedans",
    tagline: "Quiet, refined, boardroom-ready",
    blurb:
      "Leather interiors, smooth automatics and low running costs for the daily executive commute.",
    gradient: "from-[#12100e] via-[#2b1d16] to-[#a37231]",
    accent: "text-amber-300",
    image: carSedan,
    bodyTypes: ["Sedan"],
  },
  {
    slug: "pickup",
    label: "Pickups & Work Trucks",
    tagline: "Built to haul, built to last",
    blurb: "Double-cab 4x4 workhorses with diesel torque for sites, farms and long-haul business.",
    gradient: "from-[#1c1917] via-[#3f2d15] to-[#7c4a03]",
    accent: "text-orange-300",
    image: carPickup,
    bodyTypes: ["Pickup"],
  },
  {
    slug: "electric",
    label: "Electric & Hybrid",
    tagline: "Zero fuel queues",
    blurb: "Long-range EVs delivered with a home charger: silent, clean and cheap to run.",
    gradient: "from-[#052e2b] via-[#0b6b5f] to-[#22c8a4]",
    accent: "text-emerald-300",
    image: carEv,
    bodyTypes: ["Hatchback"],
  },
  {
    slug: "luxury",
    label: "Luxury & Grand Tourers",
    tagline: "Arrive differently",
    blurb: "Seven-seat flagships and premium badges finished to showroom standard.",
    gradient: "from-[#1a0b2e] via-[#3b1259] to-[#8b5cf6]",
    accent: "text-violet-300",
    image: carLuxsuv,
    bodyTypes: ["SUV", "Sedan"],
  },
  {
    slug: "coupe",
    label: "Coupes & City Cars",
    tagline: "Small footprint, big character",
    blurb: "Nippy, fuel-sipping city runners perfect for Accra traffic and first-time owners.",
    gradient: "from-[#2b0510] via-[#7f1029] to-[#ef4444]",
    accent: "text-rose-300",
    image: carCoupe,
    bodyTypes: ["Coupe", "Hatchback"],
  },
];

export function carsInCategory(slug: string) {
  const cat = carCategories.find((c) => c.slug === slug);
  if (!cat) return [];
  if (slug === "luxury") return cars.filter((c) => c.price >= 340000);
  if (slug === "electric") return cars.filter((c) => c.fuel.toLowerCase().includes("electric"));
  if (slug === "coupe")
    return cars.filter(
      (c) =>
        c.bodyType === "Coupe" ||
        (c.bodyType === "Hatchback" && !c.fuel.toLowerCase().includes("electric")),
    );
  return cars.filter((c) => cat.bodyTypes.includes(c.bodyType));
}
