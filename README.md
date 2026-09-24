# I.A DEWEALTH'S ENTERPRISE

A modern, high-performance omnichannel e-commerce marketplace and inventory platform built for authentic consumer technology, electronics, premium home appliances, and vehicle sales in Ghana.

Engineered with React, TypeScript, TanStack Start, Tailwind CSS, and Supabase for blistering speed, real-time database synchronization, and seamless mobile-first customer experiences.

---

## 🌟 Key Features

### 🛍️ Storefront & Customer Experience
- **Instant WhatsApp Checkout**: Customers can add items to their cart, select quantities, and instantly dispatch a structured, human-readable order summary directly to customer service on WhatsApp (`+233 53 148 7639`).
- **Unified 17+ Product Catalog**: Fast, responsive grid displaying electronics, computing gear, lifestyle accessories, kitchen appliances, and smart home gadgets with instant client-side fallback and Supabase cloud sync.
- **SuperDeals Daily Flash Engine**: Configurable countdown timer with real-time synchronized deals, animated price drops, and percentage discount badges.
- **Curated Discover Collections**: Dedicated storefront hubs for Super Deals, Trending Picks, New Arrivals, Best Sellers, and Clearance items.
- **Vehicle Showroom (`/cars`)**: Dedicated automotive department with detailed vehicle specifications (engine, transmission, fuel type, mileage, condition), inquiry booking forms, and showroom inspection guides.
- **Progressive Web App (PWA)**: Full offline browsing support, service worker asset caching, and an installable desktop/mobile home screen application.
- **Interactive Delivery & Location Guide**: Real-time Accra same-day dispatch guides, nationwide courier tracking notes, and interactive branch location maps.
- **Verified Customer Reviews**: Star rating system, customer feedback submission, and verified buyer testimonials.

### ⚙️ Administration & Inventory Management (`/admin`)
- **Executive KPI Dashboard**: Live metrics for total catalog volume, active inventory count, low-stock warnings, inquiry queues, and store traffic trends.
- **Comprehensive Product Manager**: Full CRUD operations for products, SKU generation, tag assignment, pricing, discount percentages, stock indicators, and multi-image uploads (via Cloudinary CDN or Supabase Storage).
- **Taxonomy & Category Editor**: Department tree management (Phones, Computers, Gadgets, Kitchen, Travel, Lifestyle, Automotive), custom banners, and promotional headings.
- **Flash Sale Control Center**: Adjust hours, minutes, and seconds for the daily promotional countdown timer with instant broadcast to all storefront visitors.
- **Customer Inquiry & Order Triage**: Centralized customer request log with direct WhatsApp and phone call actions.
- **Review Moderation Workflow**: Admin approval pipeline for customer product reviews before public listing.
- **Storefront Analytics**: Pageview tracking, popular product views, and category demand curves across 24h, 7d, 30d, and all-time intervals.
- **Role-Based Access Control**: Tiered permissions for Super Admins and Staff members with audit-friendly operation logs.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19, TypeScript |
| **Routing & SSR** | TanStack React Router, TanStack Start |
| **Styling & Design System** | Tailwind CSS v4, Lucide Icons, Radix UI Primitives |
| **State & Data Fetching** | TanStack React Query (v5), React Context API |
| **Database & Authentication** | Supabase (PostgreSQL, Row-Level Security, Realtime, Storage) |
| **Media Delivery** | Cloudinary Image CDN & Supabase Object Storage |
| **Build & Runtime Engine** | Vite, Nitro Server Engine |
| **Offline & PWA** | Web App Manifest, Service Worker Caching, Workbox |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or higher recommended)
- npm or pnpm

### Installation

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd ia-dewealth-enterprise
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the project root:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Google Maps (Optional, for location embed)
   VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key

   # Cloudinary Media (Optional, for admin uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. Launch the development server:
   ```sh
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build & Deployment

### Build Command
Compile the application bundle and SSR server:
```sh
npm run build
```

The production output is generated into the `dist/` directory.

### Running in Production
```sh
npm start
```

### Netlify Deployment
1. Connect the git repository to Netlify.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set required environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, etc.) in Netlify Site Settings.

---

## 📁 Project Directory Structure

```
├── public/                     # Static assets, PWA manifest, service worker, brand images
├── src/
│   ├── assets/                 # High-resolution product images, banners, and photography
│   ├── components/
│   │   ├── admin/              # Admin dashboard cards, product modals, image uploaders
│   │   ├── catalog/            # Product cards, category shells, listing grids, shop menus
│   │   ├── pwa/                # Offline banner, PWA install prompt and modal
│   │   ├── ui/                 # Accessible Radix primitives and styled UI components
│   │   ├── DeliveryAndFooter.tsx # Service guarantees, delivery hub, and site footer
│   │   ├── FooterMap.tsx       # Branch map location component
│   │   ├── Hero.tsx            # Department banner slider & promotional highlights
│   │   ├── HomeAllProducts.tsx # Instant-rendering complete marketplace catalog grid
│   │   ├── SuperDeals.tsx      # Flash sale carousel and daily countdown timer
│   │   └── SiteHeader.tsx      # Search bar, category drawer, cart modal, and navigation
│   ├── data/
│   │   ├── catalog.ts          # Comprehensive product catalog data and fallback snapshot
│   │   ├── products-store.ts   # Product state management and live Supabase synchronization
│   │   ├── storefront.ts       # Unified storefront query and data fetching engine
│   │   └── site-settings-store.ts # Flash sale timer settings and store configurations
│   ├── integrations/
│   │   └── supabase/           # Supabase client instances, types, and schema helpers
│   ├── routes/                 # File-based TanStack routes and server API handlers
│   ├── client.tsx              # Browser hydration entry point
│   ├── server.ts               # Nitro SSR server entry point
│   └── styles.css              # Global styles and Tailwind CSS v4 design tokens
├── package.json                # Project dependencies and operational scripts
└── vite.config.ts              # Vite and TanStack Start build configuration
```

---

## 📄 License & Attribution

All rights reserved © I.A Dewealth's Enterprise.
Accra, Ghana.
