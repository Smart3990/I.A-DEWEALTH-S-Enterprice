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
    productId: "ge13",
    name: "Apex Pro ANC Wireless Earbuds",
    short: "Apex Pro ANC Wireless Earbuds",
    image: earbudsAnc,
    price: 735,
    was: 980,
    discount: 25,
    note: "In Accra Delivery",
  },
  {
    id: "d2",
    productId: "ge1",
    name: "Voltaic 100W GaN 3-Port Charger",
    short: "Voltaic 100W GaN 3-Port Charger",
    image: gan100,
    price: 624,
    was: 780,
    discount: 20,
    note: "In Stock Accra",
  },
  {
    id: "d3",
    productId: "ge8",
    name: "Titanium Ultra GPS Chrono Watch",
    short: "Titanium Ultra GPS Chrono Watch",
    image: watch,
    price: 1189,
    was: 1450,
    discount: 18,
    note: "In Accra Delivery",
  },
  {
    id: "d4",
    productId: "ge3",
    name: "140W Quad GaN Pro Desktop Hub",
    short: "140W Quad GaN Pro Desktop Hub",
    image: gan140,
    price: 819,
    was: 1050,
    discount: 22,
    note: "In Stock Accra",
  },
  {
    id: "d5",
    productId: "ge4",
    name: "240W Kevlar Braided Type-C Cable",
    short: "240W Kevlar Braided Type-C Cable",
    image: cable,
    price: 97,
    was: 150,
    discount: 35,
    note: "Fast Dispatch",
  },
  {
    id: "d6",
    productId: "ge2",
    name: "Dual 65W GaN Travel Charger",
    short: "Dual 65W GaN Travel Charger",
    image: chargerUk,
    price: 420,
    was: 560,
    discount: 25,
    note: "In Stock Accra",
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
        id: "p1",
        name: "Soundcore Neo Deep Bass IPX5 Custom EQ Earbuds",
        image: earbudsNeo,
        price: 550,
        was: 640,
        rating: 4.7,
        sold: 96,
        tag: "Accra Same-Day Dispatch",
        spec: "10mm Graphene Drivers • 28h Battery",
      },
      {
        id: "p2",
        name: "8-in-1 Dual 4K HDMI USB-C Hub with 100W Power Delivery",
        image: hub,
        price: 380,
        was: 460,
        rating: 4.9,
        sold: 118,
        tag: "MacBook Pro M-Series Ready • Fast Dispatch",
        spec: "Space Gray Aluminum • Card Reader",
      },
      {
        id: "p3",
        name: "240W Ultra-Durable Kevlar Braided Type-C Fast Cable (2m)",
        image: cable,
        price: 95,
        was: 130,
        rating: 5.0,
        sold: 210,
        tag: "1-Year Ghana Warranty • Same-Day Dispatch",
        spec: "E-Marker Chip • 35,000+ Bends",
      },
      {
        id: "p4",
        name: "Dual 65W GaN Pocket Travel Wall Charger (UK 3-Pin)",
        image: chargerUk,
        price: 420,
        was: 520,
        rating: 5.0,
        sold: 114,
        tag: "Accra Same-Day Dispatch",
        spec: "Power Delivery 3.0 • Safe Ground Pin",
      },
    ],
  },
  {
    id: "gadgets-chargers",
    eyebrow: "Fast GaN Technology",
    title: "Gadgets & Fast Chargers",
    link: "View All Chargers",
    products: [
      {
        id: "g1",
        name: "Voltaic 100W GaN Pro Multiport Ultra Fast Charger",
        image: gan100,
        price: 624,
        was: 780,
        rating: 4.9,
        sold: 284,
        tag: "Accra Same-Day Dispatch",
        spec: "3x USB-C + USB-A • Dual Laptop Power",
      },
      {
        id: "g2",
        name: "Dual 65W GaN Pocket Travel Charger (UK 3-Pin)",
        image: chargerUk,
        price: 420,
        was: 520,
        rating: 4.8,
        sold: 195,
        tag: "1-Year Ghana Warranty",
        spec: "Foldable Ground Pin • Thermal Guard Pro",
      },
      {
        id: "g3",
        name: "MagSafe 3-in-1 Foldable Magnetic Wireless Charging Stand",
        image: magsafe,
        price: 490,
        was: 590,
        rating: 4.9,
        sold: 142,
        tag: "Accra Same-Day Dispatch",
        spec: "iPhone, Apple Watch & AirPods Qi2 Ready",
      },
      {
        id: "g4",
        name: "140W Digital Wattage Display Desktop GaN Charging Brick",
        image: gan140,
        price: 819,
        was: 1050,
        rating: 4.8,
        sold: 67,
        tag: "1-Year Ghana Warranty",
        spec: "Real-Time LCD Watts Meter • Quad Fast Ports",
      },
    ],
  },
  {
    id: "phones-laptops-hubs",
    eyebrow: "Workstation Ready",
    title: "Phones, Laptops & Hubs",
    link: "View All Hubs",
    products: [
      {
        id: "l1",
        name: "8-in-1 Dual 4K HDMI USB-C Hub (100W PD Passthrough)",
        image: hub,
        price: 380,
        was: 460,
        rating: 4.9,
        sold: 118,
        tag: "Accra Same-Day Dispatch",
        spec: "M3 / M2 / M1 MacBook & Windows Certified",
      },
      {
        id: "l2",
        name: "Ergonomic Aluminum 360° Rotating Laptop Stand",
        image: laptopStand,
        price: 290,
        was: 360,
        rating: 5.0,
        sold: 74,
        tag: "Accra Same-Day Dispatch",
        spec: 'CNC Milled Heat Dissipation • Fits up to 17"',
      },
      {
        id: "l3",
        name: "240W Ultra Kevlar Braided Type-C Fast Cable (2m)",
        image: cable,
        price: 95,
        was: 130,
        rating: 4.8,
        sold: 210,
        tag: "1-Year Ghana Warranty",
        spec: "480Mbps Sync • 5A E-Marker Smart Chip",
      },
      {
        id: "l4",
        name: "12-in-1 Triple Display Thunderbolt Docking Station",
        image: dock,
        price: 680,
        was: 850,
        rating: 4.9,
        sold: 41,
        tag: "1-Year Ghana Warranty",
        spec: "Gigabit Ethernet • Dual DisplayPort + 4K HDMI",
      },
    ],
  },
  {
    id: "kitchen-appliances",
    eyebrow: "Home & Living",
    title: "Kitchen Appliances",
    link: "View All Appliances",
    products: [
      {
        id: "k1",
        name: "6.5L Digital Visible Window Rapid Air Fryer",
        image: airFryer,
        price: 890,
        was: 1150,
        rating: 4.8,
        sold: 132,
        tag: "Accra Same-Day Dispatch",
        spec: "360° Air Circulation • 8 Touch Presets",
      },
      {
        id: "k2",
        name: "1800W High-Torque Commercial Ice-Crush Blender",
        image: blender,
        price: 650,
        was: 790,
        rating: 5.0,
        sold: 98,
        tag: "1-Year Ghana Warranty",
        spec: "6 Japanese Titanium Blades • 2L Unbreakable Jug",
      },
      {
        id: "k3",
        name: "Smart 20-Bar Italian Pump Compact Espresso Machine",
        image: espresso,
        price: 1250,
        was: 1500,
        rating: 4.9,
        sold: 54,
        tag: "Accra Same-Day Dispatch",
        spec: "High-Pressure Crema Extraction • Milk Frother",
      },
      {
        id: "k4",
        name: "10-in-1 Electric Pressure Multi-Cooker (6L)",
        image: cooker,
        price: 750,
        was: 920,
        rating: 4.8,
        sold: 87,
        tag: "1-Year Ghana Warranty",
        spec: "Slow Cook, Sauté & Rice Functions • Safety Lock",
      },
    ],
  },
  {
    id: "smartwatches-earbuds",
    eyebrow: "Wear & Listen",
    title: "Smartwatches & Earbuds",
    link: "View All Wearables",
    products: [
      {
        id: "w1",
        name: "Titanium Ultra Chrono GPS 2025 Sapphire AMOLED",
        image: watch,
        price: 1189,
        was: 1450,
        rating: 4.9,
        sold: 88,
        tag: "Accra Same-Day Dispatch",
        spec: "14-Day Battery • ECG & SpO2 • 50m Waterproof",
      },
      {
        id: "w2",
        name: "Apex Pro ANC Wireless Earbuds (Spatial Audio)",
        image: earbudsAnc,
        price: 735,
        was: 980,
        rating: 4.8,
        sold: 142,
        tag: "1-Year Ghana Warranty",
        spec: "45dB Hybrid ANC • 38h Battery Case",
      },
      {
        id: "w3",
        name: "FitPro IPX8 Waterproof Sports Fitness Tracker",
        image: tracker,
        price: 340,
        was: 420,
        rating: 4.7,
        sold: 176,
        tag: "Accra Same-Day Dispatch",
        spec: "Heart Rate Monitor • 100+ Workout Modes",
      },
      {
        id: "w4",
        name: "Soundcore Neo Deep Bass IPX5 Custom EQ Earbuds",
        image: earbudsNeo,
        price: 550,
        was: 640,
        rating: 4.7,
        sold: 96,
        tag: "Accra Same-Day Dispatch",
        spec: "10mm Graphene Drivers • 28h Battery",
      },
    ],
  },
  {
    id: "audio-sound-accessories",
    eyebrow: "Bigger Sound",
    title: "Audio, Sound & Accessories",
    link: "View All Audio",
    products: [
      {
        id: "a1",
        name: "Deep Bass Portable Waterproof Bluetooth Speaker",
        image: speaker,
        price: 480,
        was: 580,
        rating: 5.0,
        sold: 203,
        tag: "Accra Same-Day Dispatch",
        spec: "IPX7 Waterproof • Dual Passive Radiators • 24h Play",
      },
      {
        id: "a2",
        name: "Hi-Res Spatial Studio Over-Ear Wireless Headphones",
        image: headphones,
        price: 850,
        was: 1050,
        rating: 4.8,
        sold: 121,
        tag: "1-Year Ghana Warranty",
        spec: "Lossless LDAC Codec • Memory Foam Earcups",
      },
      {
        id: "a3",
        name: "100W Cinematic 2.1ch Soundbar with Subwoofer",
        image: soundbar,
        price: 1100,
        was: 1350,
        rating: 4.9,
        sold: 63,
        tag: "Accra Same-Day Dispatch",
        spec: "Optical, HDMI ARC & Bluetooth 5.3 Ready",
      },
      {
        id: "a4",
        name: "15W MagSafe Fast Wireless Air Vent Car Mount",
        image: carMount,
        price: 185,
        was: 240,
        rating: 4.9,
        sold: 245,
        tag: "Accra Same-Day Dispatch",
        spec: "Ultra-Strong N52 Magnets • 360° Ball Joint",
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
    title: "Keep it fresh, Cool, and",
    accent: "Always in Style!",
    body: "Premium factory-calibrated ANC Earbuds and GaN III multiport fast chargers bringing efficiency and unmatched acoustic precision to Ghana.",
    cta: "Explore Catalog",
    image: earbudsCut,
    alt: "Apex Pro ANC Wireless Earbuds",
    note: "In Stock Accra",
  },
  {
    id: 1,
    title: "GaN Fast Charging",
    accent: "Engineered Redefined.",
    body: "Power your MacBook Pro, iPhone, and Galaxy simultaneously with GaN III thermal protection calibrated for Ghana voltage stability.",
    cta: "Discover GaN Power",
    image: gan100Cut,
    alt: "Voltaic 100W GaN Fast Charger",
    note: "From GHC 420 • In Stock Accra",
  },
  {
    id: 2,
    title: "Precision on Your Wrist,",
    accent: "14-Day Battery Power.",
    body: "Dual-band GPS, AMOLED retina display, IP68 water resistance, and rugged titanium case built for demanding everyday routines.",
    cta: "View Smartwatches",
    image: watchCut,
    alt: "Titanium Ultra Chrono Smartwatch",
    note: "In Stock Accra",
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
