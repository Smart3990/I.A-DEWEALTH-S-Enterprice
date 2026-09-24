/**
 * Presets and image assets for the Admin Banners & Visual Merchandising Manager.
 */
import bannerCars from "@/assets/banner-cars.jpg";
import bannerPhones from "@/assets/banner-phones.jpg";
import bannerComputers from "@/assets/banner-computers.jpg";
import bannerGadgets from "@/assets/banner-gadgets.jpg";
import bannerKitchen from "@/assets/banner-kitchen.jpg";
import bannerAccessories from "@/assets/banner-accessories.jpg";
import bannerTravelAcc from "@/assets/banner-travel-accessories.jpg";
import bannerLifestyleAcc from "@/assets/banner-lifestyle-accessories.jpg";
import bannerOtherAcc from "@/assets/banner-other-accessories.jpg";
import carsHero from "@/assets/cars-hero.jpg";

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

export interface PresetBannerAsset {
  id: string;
  name: string;
  category: "Department Hero" | "Gadgets & Tech" | "Kitchen & Home" | "Vehicles" | "Accessories";
  url: string;
}

export const PRESET_BANNER_ASSETS: PresetBannerAsset[] = [
  // Department Heroes
  { id: "b_phones", name: "Phones & Tablets Hero", category: "Department Hero", url: bannerPhones },
  {
    id: "b_kitchen",
    name: "Kitchen Appliances Hero",
    category: "Department Hero",
    url: bannerKitchen,
  },
  {
    id: "b_gadgets",
    name: "Gadgets & Electronics Hero",
    category: "Department Hero",
    url: bannerGadgets,
  },
  { id: "b_cars", name: "Cars & Vehicles Hero", category: "Department Hero", url: bannerCars },
  { id: "b_cars_hero", name: "Cars Modern Showroom", category: "Department Hero", url: carsHero },
  {
    id: "b_computers",
    name: "Computers & Laptops Hero",
    category: "Department Hero",
    url: bannerComputers,
  },
  {
    id: "b_accessories",
    name: "Accessories Hero",
    category: "Department Hero",
    url: bannerAccessories,
  },
  {
    id: "b_travel",
    name: "Travel Accessories Hero",
    category: "Department Hero",
    url: bannerTravelAcc,
  },
  {
    id: "b_lifestyle",
    name: "Lifestyle Accessories Hero",
    category: "Department Hero",
    url: bannerLifestyleAcc,
  },
  {
    id: "b_other",
    name: "Other Accessories Hero",
    category: "Department Hero",
    url: bannerOtherAcc,
  },

  // Gadgets & Tech
  { id: "g_phone", name: "Flagship Smartphone", category: "Gadgets & Tech", url: phone },
  { id: "g_tablet", name: "Tablet & Stylus", category: "Gadgets & Tech", url: tablet },
  { id: "g_laptop", name: "Pro Ultrabook Laptop", category: "Gadgets & Tech", url: laptop },
  { id: "g_monitor", name: "Curved 4K Monitor", category: "Gadgets & Tech", url: monitor },
  { id: "g_keyboard", name: "Mechanical Keyboard", category: "Gadgets & Tech", url: keyboard },
  { id: "g_gan100", name: "GaN 100W Fast Charger", category: "Gadgets & Tech", url: gan100 },
  { id: "g_gan140", name: "GaN 140W Desktop Station", category: "Gadgets & Tech", url: gan140 },
  { id: "g_powerbank", name: "27000mAh Power Bank", category: "Gadgets & Tech", url: powerbank },
  { id: "g_magsafe", name: "MagSafe Wireless Stand", category: "Gadgets & Tech", url: magsafe },
  {
    id: "g_earbuds_anc",
    name: "True Wireless ANC Earbuds",
    category: "Gadgets & Tech",
    url: earbudsAnc,
  },
  {
    id: "g_earbuds_neo",
    name: "Clear Sound Neo Earbuds",
    category: "Gadgets & Tech",
    url: earbudsNeo,
  },
  {
    id: "g_headphones",
    name: "Studio Over-Ear Headphones",
    category: "Gadgets & Tech",
    url: headphones,
  },
  {
    id: "g_speaker",
    name: "Waterproof Bluetooth Speaker",
    category: "Gadgets & Tech",
    url: speaker,
  },
  { id: "g_soundbar", name: "Home Theater Soundbar", category: "Gadgets & Tech", url: soundbar },
  { id: "g_watch", name: "Titanium Smartwatch", category: "Gadgets & Tech", url: watch },
  { id: "g_tracker", name: "Fitness Activity Tracker", category: "Gadgets & Tech", url: tracker },
  {
    id: "g_smarthome",
    name: "Smart Home Hub & Sensors",
    category: "Gadgets & Tech",
    url: smarthome,
  },
  { id: "g_camera", name: "Security & Action Camera", category: "Gadgets & Tech", url: camera },
  { id: "g_cable", name: "Kevlar Braided Fast Cable", category: "Gadgets & Tech", url: cable },
  { id: "g_hub", name: "Multi-Port USB-C Hub", category: "Gadgets & Tech", url: hub },

  // Kitchen & Home
  {
    id: "k_airfryer",
    name: "Digital Dual-Basket Air Fryer",
    category: "Kitchen & Home",
    url: airFryer,
  },
  {
    id: "k_blender",
    name: "Commercial High-Power Blender",
    category: "Kitchen & Home",
    url: blender,
  },
  { id: "k_espresso", name: "Barista Espresso Machine", category: "Kitchen & Home", url: espresso },
  {
    id: "k_microwave",
    name: "Digital Smart Microwave",
    category: "Kitchen & Home",
    url: microwave,
  },
  { id: "k_kettle", name: "Electric Rapid Kettle", category: "Kitchen & Home", url: kettle },
  { id: "k_cooker", name: "Electric Pressure Cooker", category: "Kitchen & Home", url: cooker },

  // Vehicles
  { id: "v_suv", name: "Modern Luxury SUV", category: "Vehicles", url: carSuv },
  { id: "v_sedan", name: "Executive Sedan", category: "Vehicles", url: carSedan },
  { id: "v_pickup", name: "Heavy-Duty Pickup Truck", category: "Vehicles", url: carPickup },
  { id: "v_motorbike", name: "Commercial Motorbike", category: "Vehicles", url: motorbike },
  { id: "v_mount", name: "Fast Magnetic Car Mount", category: "Vehicles", url: carMount },

  // Accessories
  {
    id: "a_backpack",
    name: "Water-Resistant Tech Backpack",
    category: "Accessories",
    url: backpack,
  },
  {
    id: "a_laptop_stand",
    name: "Ergonomic Aluminum Laptop Stand",
    category: "Accessories",
    url: laptopStand,
  },
];
