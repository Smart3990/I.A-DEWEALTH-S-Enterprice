import { useState, useEffect, useMemo, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  Eye,
  TrendingUp,
  Package,
  FolderTree,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Clock,
  Compass,
  ArrowUpRight,
  Sliders,
  ExternalLink,
  MapPin,
  Smartphone,
  Globe,
  Layers,
  ChevronRight,
  Boxes,
  HelpCircle,
  Star,
  Flame,
  Save,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { getSiteConfig } from "@/data/site";
import { getAllProducts } from "@/data/products-store";
import { type Category } from "@/data/catalog";
import { getCustomCategories } from "@/data/category-store";
import { useCurrentSiteSettings, saveSuperDealsDuration } from "@/data/site-settings-store";
import { getInquiries, fetchInquiriesFromServer, markInquiryAsRead } from "@/data/inquiries-store";
import {
  getPendingReviews,
  approveReview,
  rejectReview,
  fetchReviewsFromServer,
  type ReviewItem,
} from "@/data/reviews-store";
import { useStoreAnalytics, type DurationFilter } from "@/data/analytics-store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const PIE_COLORS = [
  "#059669", // Emerald
  "#0284c7", // Sky Blue
  "#6366f1", // Indigo
  "#d97706", // Amber
  "#8b5cf6", // Purple
  "#0d9488", // Teal
  "#e11d48", // Rose
  "#475569", // Slate
];

export function AdminDashboard() {
  const [duration, setDuration] = useState<DurationFilter>("7d");
  const analytics = useStoreAnalytics(duration);

  const [site, setSite] = useState(getSiteConfig());
  const [allCategories, setAllCategories] = useState<Category[]>(() => getCustomCategories());
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const [products, setProducts] = useState<any[]>(() => getAllProducts());
  const [inquiries, setInquiries] = useState(getInquiries());
  const [pendingReviews, setPendingReviews] = useState<ReviewItem[]>(() => getPendingReviews());
  const [pendingReviewsCount, setPendingReviewsCount] = useState(() => getPendingReviews().length);
  const [subcatParentFilter, setSubcatParentFilter] = useState<string>("all");
  const [activeWorkstreamHint, setActiveWorkstreamHint] = useState<string | null>(null);

  // SuperDeals countdown control state
  const [settings] = useCurrentSiteSettings();
  const [sdHours, setSdHours] = useState<number>(settings.superdealsHours ?? 8);
  const [sdMinutes, setSdMinutes] = useState<number>(settings.superdealsMinutes ?? 29);
  const [sdSeconds, setSdSeconds] = useState<number>(settings.superdealsSeconds ?? 33);
  const [isSavingTimer, setIsSavingTimer] = useState(false);

  useEffect(() => {
    if (settings.superdealsHours !== undefined) setSdHours(settings.superdealsHours);
    if (settings.superdealsMinutes !== undefined) setSdMinutes(settings.superdealsMinutes);
    if (settings.superdealsSeconds !== undefined) setSdSeconds(settings.superdealsSeconds);
  }, [settings.superdealsHours, settings.superdealsMinutes, settings.superdealsSeconds]);

  useEffect(() => {
    let isMounted = true;
    setSite(getSiteConfig());
    setAllCategories(getCustomCategories());
    setProducts(getAllProducts());
    setInquiries(getInquiries());
    const initialPending = getPendingReviews();
    setPendingReviews(initialPending);
    setPendingReviewsCount(initialPending.length);

    // Fetch live products from backend/Supabase
    const loadLiveProducts = () => {
      fetch("/api/admin/products")
        .then((r) => r.json())
        .then((res) => {
          if (isMounted && res && Array.isArray(res.products) && res.products.length > 0) {
            setProducts(res.products);
          }
        })
        .catch(() => {});
    };
    loadLiveProducts();

    fetchInquiriesFromServer()
      .then((fresh) => {
        if (isMounted) setInquiries(fresh);
      })
      .catch(() => {});

    fetchReviewsFromServer()
      .then((fresh) => {
        if (isMounted) {
          const p = fresh.filter((r) => r.status === "pending");
          setPendingReviews(p);
          setPendingReviewsCount(p.length);
        }
      })
      .catch(() => {});

    // Poll every 8 seconds for real-time customer submissions and live catalog
    const pollInterval = setInterval(() => {
      loadLiveProducts();
      fetchInquiriesFromServer()
        .then((fresh) => {
          if (isMounted) setInquiries(fresh);
        })
        .catch(() => {});

      fetchReviewsFromServer()
        .then((fresh) => {
          if (isMounted) {
            const p = fresh.filter((r) => r.status === "pending");
            setPendingReviews(p);
            setPendingReviewsCount(p.length);
          }
        })
        .catch(() => {});
    }, 8000);

    const handleStorage = () => {
      if (!isMounted) return;
      setSite(getSiteConfig());
      setAllCategories(getCustomCategories());
      setProducts(getAllProducts());
      setInquiries(getInquiries());
      const p = getPendingReviews();
      setPendingReviews(p);
      setPendingReviewsCount(p.length);
      loadLiveProducts();
    };

    window.addEventListener("ia_products_updated", handleStorage);
    window.addEventListener("ia_inquiries_updated", handleStorage);
    window.addEventListener("ia_site_config_updated", handleStorage);
    window.addEventListener("ia_categories_updated", handleStorage);
    window.addEventListener("ia_reviews_updated", handleStorage);
    window.addEventListener("storage", handleStorage);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      window.removeEventListener("ia_products_updated", handleStorage);
      window.removeEventListener("ia_inquiries_updated", handleStorage);
      window.removeEventListener("ia_site_config_updated", handleStorage);
      window.removeEventListener("ia_categories_updated", handleStorage);
      window.removeEventListener("ia_reviews_updated", handleStorage);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleApproveReview = (id: string, name: string) => {
    approveReview(id);
    const updated = getPendingReviews();
    setPendingReviews(updated);
    setPendingReviewsCount(updated.length);
    toast.success(`Review from ${name} approved and published to store!`);
  };

  const handleRejectReview = (id: string) => {
    rejectReview(id);
    const updated = getPendingReviews();
    setPendingReviews(updated);
    setPendingReviewsCount(updated.length);
    toast.info("Review rejected.");
  };

  const handleSaveTimer = async () => {
    setIsSavingTimer(true);
    try {
      await saveSuperDealsDuration(sdHours, sdMinutes, sdSeconds);
      toast.success(
        `SuperDeals timer saved! Storefront resets to ${String(sdHours).padStart(2, "0")}:${String(sdMinutes).padStart(2, "0")}:${String(sdSeconds).padStart(2, "0")} on page restart.`,
      );
    } catch {
      toast.error("Failed to save SuperDeals timer.");
    } finally {
      setIsSavingTimer(false);
    }
  };

  // Category taxonomy maps
  const categoryMap = useMemo(
    () => new Map(allCategories.map((c) => [c.id.toLowerCase(), c])),
    [allCategories],
  );

  // 1. ROOT CATEGORIES ONLY (parentId is null)
  const rootCategories = useMemo(
    () => allCategories.filter((c) => c.parentId === null && c.isActive),
    [allCategories],
  );

  // 2. SUBCATEGORIES ONLY (parentId is not null)
  const subcategories = useMemo(
    () => allCategories.filter((c) => c.parentId !== null && c.isActive),
    [allCategories],
  );

  // Helper to resolve ANY category, subcategory, or product to its Root Primary Category
  const getRootCategory = useCallback(
    (catIdOrSlug?: string | null, productTitle?: string): { id: string; name: string } => {
      const ROOT_DEPARTMENTS: Record<string, { id: string; name: string }> = {
        "phones-tablets": { id: "phones-tablets", name: "Phones & Tablets" },
        "computers-laptops": { id: "computers-laptops", name: "Computers & Laptops" },
        "gadgets-electronics": { id: "gadgets-electronics", name: "Gadgets & Electronics" },
        "home-kitchen": { id: "home-kitchen", name: "Home & Kitchen" },
        "cars-vehicles": { id: "cars-vehicles", name: "Cars & Vehicles" },
        "accessories-lifestyle": { id: "accessories-lifestyle", name: "Accessories & Lifestyle" },
      };

      const raw = (catIdOrSlug || "").trim().toLowerCase();
      if (ROOT_DEPARTMENTS[raw]) return ROOT_DEPARTMENTS[raw];

      // 1. Walk up parentId hierarchy in categoryMap
      let current = categoryMap.get(raw);
      let depth = 0;
      while (current && current.parentId && depth < 8) {
        if (ROOT_DEPARTMENTS[current.id.toLowerCase()]) {
          return ROOT_DEPARTMENTS[current.id.toLowerCase()];
        }
        const parent = categoryMap.get(current.parentId.toLowerCase());
        if (!parent) break;
        current = parent;
        depth++;
      }
      if (current && ROOT_DEPARTMENTS[current.id.toLowerCase()]) {
        return ROOT_DEPARTMENTS[current.id.toLowerCase()];
      }

      // 2. Automated detection based on category name & product title
      const combined = `${raw} ${productTitle || ""}`.toLowerCase();

      if (
        combined.includes("car") ||
        combined.includes("vehicle") ||
        combined.includes("suv") ||
        combined.includes("sedan") ||
        combined.includes("elantra") ||
        combined.includes("pickup") ||
        combined.includes("truck") ||
        combined.includes("hyundai") ||
        combined.includes("toyota") ||
        combined.includes("honda") ||
        combined.includes("benz") ||
        combined.includes("motor")
      ) {
        return ROOT_DEPARTMENTS["cars-vehicles"];
      }

      if (
        combined.includes("phone") ||
        combined.includes("tablet") ||
        combined.includes("smartphone") ||
        combined.includes("iphone") ||
        combined.includes("samsung") ||
        combined.includes("handset") ||
        combined.includes("screen-protector") ||
        combined.includes("case")
      ) {
        return ROOT_DEPARTMENTS["phones-tablets"];
      }

      if (
        combined.includes("laptop") ||
        combined.includes("computer") ||
        combined.includes("desktop") ||
        combined.includes("macbook") ||
        combined.includes("pc") ||
        combined.includes("monitor") ||
        combined.includes("keyboard") ||
        combined.includes("ssd") ||
        combined.includes("drive")
      ) {
        return ROOT_DEPARTMENTS["computers-laptops"];
      }

      if (
        combined.includes("kitchen") ||
        combined.includes("cooker") ||
        combined.includes("kettle") ||
        combined.includes("iron") ||
        combined.includes("blender") ||
        combined.includes("microwave") ||
        combined.includes("appliance") ||
        combined.includes("air-fryer") ||
        combined.includes("fridge") ||
        combined.includes("home")
      ) {
        return ROOT_DEPARTMENTS["home-kitchen"];
      }

      if (
        combined.includes("bag") ||
        combined.includes("backpack") ||
        combined.includes("wallet") ||
        combined.includes("sunglass") ||
        combined.includes("eyewear") ||
        combined.includes("lifestyle") ||
        combined.includes("travel")
      ) {
        return ROOT_DEPARTMENTS["accessories-lifestyle"];
      }

      return ROOT_DEPARTMENTS["gadgets-electronics"];
    },
    [categoryMap],
  );

  // -------------------------------------------------------------
  // PIE CHART DATA: STRICTLY PRIMARY ROOT CATEGORIES ONLY!
  // NO subcategories are plotted in this pie chart.
  // -------------------------------------------------------------
  const categoryPieData = useMemo(() => {
    const rootCounts: Record<string, { id: string; name: string; count: number; stock: number }> = {
      "phones-tablets": { id: "phones-tablets", name: "Phones & Tablets", count: 0, stock: 0 },
      "computers-laptops": {
        id: "computers-laptops",
        name: "Computers & Laptops",
        count: 0,
        stock: 0,
      },
      "gadgets-electronics": {
        id: "gadgets-electronics",
        name: "Gadgets & Electronics",
        count: 0,
        stock: 0,
      },
      "home-kitchen": { id: "home-kitchen", name: "Home & Kitchen", count: 0, stock: 0 },
      "cars-vehicles": { id: "cars-vehicles", name: "Cars & Vehicles", count: 0, stock: 0 },
      "accessories-lifestyle": {
        id: "accessories-lifestyle",
        name: "Accessories & Lifestyle",
        count: 0,
        stock: 0,
      },
    };

    products.forEach((p) => {
      const catKey = p.categoryId || p.category_id || p.category || "";
      const root = getRootCategory(catKey, p.title || p.name);
      if (root && rootCounts[root.id]) {
        rootCounts[root.id].count += 1;
        rootCounts[root.id].stock += Number(p.stock) || 0;
      }
    });

    const totalProds = products.length || 1;

    return Object.values(rootCounts)
      .filter((rc) => rc.count > 0)
      .map((rc, idx) => ({
        ...rc,
        percentage: Number(((rc.count / totalProds) * 100).toFixed(1)),
        color: PIE_COLORS[idx % PIE_COLORS.length],
      }));
  }, [products, getRootCategory]);

  // -------------------------------------------------------------
  // BAR CHART DATA: STRICTLY SUBCATEGORIES ONLY!
  // NO products and NO primary parent categories are plotted.
  // -------------------------------------------------------------
  const allSubcategoriesData = useMemo(() => {
    const subCounts: Record<
      string,
      {
        id: string;
        name: string;
        parentName: string;
        parentId: string;
        count: number;
        stock: number;
      }
    > = {};

    subcategories.forEach((sub) => {
      const root = getRootCategory(sub.id);
      subCounts[sub.id] = {
        id: sub.id,
        name: sub.name,
        parentName: root ? root.name : "Other",
        parentId: root ? root.id : "other",
        count: 0,
        stock: 0,
      };
    });

    products.forEach((p) => {
      const catKey = p.categoryId || p.category_id || p.category || "";
      if (subCounts[catKey]) {
        subCounts[catKey].count += 1;
        subCounts[catKey].stock += Number(p.stock) || 0;
      }
    });

    return Object.values(subCounts);
  }, [products, subcategories, getRootCategory]);

  // Filtered subcategories for the Bar Chart
  const filteredSubcategoriesData = useMemo(() => {
    let list = allSubcategoriesData;
    if (subcatParentFilter !== "all") {
      list = list.filter((item) => item.parentId === subcatParentFilter);
    }
    return list.sort((a, b) => b.count - a.count).slice(0, 14);
  }, [allSubcategoriesData, subcatParentFilter]);

  const totalCatalogStock = useMemo(
    () => products.reduce((acc, p) => acc + (p.stock || 0), 0),
    [products],
  );

  const durationLabels: Record<DurationFilter, string> = {
    today: "Today",
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    all: "All Time",
  };

  return (
    <div className="space-y-8">
      {/* 1. Header & Live Status Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#00a884]">
              I.A Dewealth's Admin Dashboard
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Store Overview & Analytics
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Monitor real-time customer visits by filter duration, manage banners for all categories
            & subcategories, and organise your product catalog.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Duration Filter Switcher */}
          <div className="flex items-center rounded-xl bg-white p-1 shadow-xs border-0">
            {(["today", "7d", "30d", "all"] as DurationFilter[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  duration === d
                    ? "bg-[#00a884] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {durationLabels[d]}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              reloadData();
              toast.success("Metrics & inventory refreshed");
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition border-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards: Visitor Traffic & Catalog Status (Real Data Only) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Total Visited (Visitors) */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-xs transition hover:shadow-md border-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Visited ({durationLabels[duration]})
            </span>
            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-slate-900">
                {analytics.totalVisitors.toLocaleString()}
              </span>
              {analytics.totalVisitors > 0 && analytics.percentChange !== 0 && (
                <span className="inline-flex items-center text-xs font-bold text-emerald-600">
                  <TrendingUp className="mr-0.5 h-3.5 w-3.5" />
                  {analytics.percentChange > 0
                    ? `+${analytics.percentChange}%`
                    : `${analytics.percentChange}%`}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {analytics.totalVisitors > 0
                ? `Unique customer visits recorded during ${durationLabels[duration].toLowerCase()}`
                : `Real storefront visitor tracker • 0 simulated sessions`}
            </p>
          </div>
        </div>

        {/* KPI 2: Total Pageviews */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-xs transition hover:shadow-md border-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Pageviews
            </span>
            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
              <Eye className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-slate-900">
                {analytics.totalPageViews.toLocaleString()}
              </span>
              {analytics.totalVisitors > 0 ? (
                <span className="text-xs font-semibold text-slate-500">
                  ~{(analytics.totalPageViews / (analytics.totalVisitors || 1)).toFixed(1)} / visit
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate-400">0 / visit</span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {analytics.totalPageViews > 0
                ? `Avg session: ${analytics.avgDuration} • Bounce rate: ${analytics.bounceRate}`
                : "Live pageview counter • Real traffic updates automatically"}
            </p>
          </div>
        </div>

        {/* KPI 3: Category Engagement / Leading Department */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-xs transition hover:shadow-md border-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {(analytics?.topCategories?.[0]?.visits ?? 0) > 0
                ? "Top Visited Category"
                : "Top Catalog Department"}
            </span>
            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
              <FolderTree className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            {(analytics?.topCategories?.[0]?.visits ?? 0) > 0 ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black tracking-tight text-slate-900 truncate">
                    {analytics.topCategories[0].name}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {analytics.topCategories[0].visits.toLocaleString()} visits (
                  {analytics.topCategories[0].percentage}% of total category traffic)
                </p>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black tracking-tight text-slate-900 truncate">
                    {categoryPieData[0]?.name || "Gadgets & Electronics"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Leading department: {categoryPieData[0]?.count || 0} items (
                  {categoryPieData[0]?.percentage || 0}% of catalog)
                </p>
              </>
            )}
          </div>
        </div>

        {/* KPI 4: Catalog & Categorised Products */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-xs transition hover:shadow-md border-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Catalog Capacity
            </span>
            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-slate-900">
                {products.length}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                in {subcategories.length} subcategories
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {totalCatalogStock.toLocaleString()} total units in stock • 100% categorized
            </p>
          </div>
        </div>
      </div>

      {/* SuperDeals Flash Countdown Control Card */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white p-5 sm:p-6 border border-amber-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-full">
                <Flame className="h-3.5 w-3.5" />
                SUPERDEALS TIMER CONTROL
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Live countdown duration controller
              </span>
            </div>
            <h3 className="text-lg font-black tracking-tight text-slate-900">
              Configure SuperDeals Countdown Duration
            </h3>
            <p className="text-xs text-slate-600 max-w-2xl">
              The storefront countdown resets to this configured duration whenever a customer opens
              or refreshes the page.
            </p>
          </div>

          {/* Live Banner Preview */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl px-4 py-2.5 text-white shadow-xs shrink-0">
            <div className="text-right">
              <div className="text-[10px] uppercase font-black tracking-wide text-orange-100">
                Storefront Preview
              </div>
              <div className="text-xs font-bold text-white">Ends:</div>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs font-black">
              <span className="rounded bg-slate-900/80 px-2 py-1 shadow-inner">
                {String(sdHours).padStart(2, "0")}
              </span>
              :
              <span className="rounded bg-slate-900/80 px-2 py-1 shadow-inner">
                {String(sdMinutes).padStart(2, "0")}
              </span>
              :
              <span className="rounded bg-slate-900/80 px-2 py-1 shadow-inner">
                {String(sdSeconds).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-amber-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Inputs */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-bold text-slate-700">Hours:</label>
              <input
                type="number"
                min={0}
                max={99}
                value={sdHours}
                onChange={(e) => setSdHours(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-16 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-center text-sm font-black text-slate-800 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-bold text-slate-700">Mins:</label>
              <input
                type="number"
                min={0}
                max={59}
                value={sdMinutes}
                onChange={(e) =>
                  setSdMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))
                }
                className="w-16 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-center text-sm font-black text-slate-800 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-bold text-slate-700">Secs:</label>
              <input
                type="number"
                min={0}
                max={59}
                value={sdSeconds}
                onChange={(e) =>
                  setSdSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))
                }
                className="w-16 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-center text-sm font-black text-slate-800 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Presets */}
            <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setSdHours(8);
                  setSdMinutes(29);
                  setSdSeconds(33);
                }}
                className="rounded-md bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-orange-50 hover:text-orange-700 transition"
              >
                8h 29m 33s (Original)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSdHours(12);
                  setSdMinutes(0);
                  setSdSeconds(0);
                }}
                className="rounded-md bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-orange-50 hover:text-orange-700 transition"
              >
                12 Hours
              </button>
              <button
                type="button"
                onClick={() => {
                  setSdHours(24);
                  setSdMinutes(0);
                  setSdSeconds(0);
                }}
                className="rounded-md bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-orange-50 hover:text-orange-700 transition"
              >
                24 Hours
              </button>
              <button
                type="button"
                onClick={() => {
                  setSdHours(4);
                  setSdMinutes(0);
                  setSdSeconds(0);
                }}
                className="rounded-md bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-orange-50 hover:text-orange-700 transition"
              >
                4 Hours
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="button"
            disabled={isSavingTimer}
            onClick={handleSaveTimer}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 active:scale-95 disabled:opacity-50 transition cursor-pointer"
          >
            <Save className="h-4 w-4" />
            {isSavingTimer ? "Saving Timer..." : "Save Countdown Timer"}
          </button>
        </div>
      </div>

      {/* 3. VISUAL ANALYTICS SUITE: All 3 Analytics Charts in a Single Row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Card 1: Interactive Visitor Traffic Trends Chart (Area Chart) */}
        <div className="rounded-2xl bg-white p-6 shadow-xs border-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#00a884]">
                  TRAFFIC ANALYTICS
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  {durationLabels[duration]}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#00a884]" />
                  <span className="font-semibold text-slate-700">Visitors</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  <span className="font-semibold text-slate-700">Views</span>
                </div>
              </div>
            </div>
            <h2 className="mt-2 text-base font-bold text-slate-900">Store Visitors & Pageviews</h2>
            <p className="text-xs text-slate-500">
              Customer inflow into IA Dewealth's Ghana storefront.
            </p>

            <div className="mt-4 h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.timeline}>
                  <defs>
                    <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00a884" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#00a884" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="pageviewGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} width={34} />
                  <RechartsTooltip
                    formatter={(value: number, name: string) => [
                      value.toLocaleString(),
                      name === "visitors" ? "Visitors" : "Pageviews",
                    ]}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pageviews"
                    stroke="#0284c7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#pageviewGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke="#00a884"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#visitorGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
            <span className="font-bold text-slate-800">
              {analytics.totalVisitors.toLocaleString()}{" "}
              <span className="font-normal text-slate-500">visitors</span>
            </span>
            <span className="font-bold text-slate-800">
              {analytics.totalPageViews.toLocaleString()}{" "}
              <span className="font-normal text-slate-500">pageviews</span>
            </span>
          </div>
        </div>

        {/* Card 2: PIE CHART: Primary Categories ONLY */}
        <div className="rounded-2xl bg-white p-6 shadow-xs border-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  ROOT DEPARTMENTS
                </span>
                <h3 className="mt-1 text-base font-bold text-slate-900">Primary Categories</h3>
                <p className="text-xs text-slate-500">
                  Distribution across {rootCategories.length} departments.
                </p>
              </div>
            </div>

            <div className="mt-3 h-[190px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={76}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="name"
                  >
                    {categoryPieData.map((entry) => (
                      <Cell key={`cell-${entry.id}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(
                      value: number,
                      name: string,
                      item: { payload?: { percentage?: number } },
                    ) => [`${value} products (${item.payload?.percentage ?? 0}%)`, name]}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={30}
                    iconType="circle"
                    iconSize={7}
                    formatter={(val) => (
                      <span className="text-[11px] font-semibold text-slate-700">{val}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Breakdown List */}
          <div className="mt-2 max-h-[120px] overflow-y-auto space-y-1.5 border-t border-slate-100 pt-2.5 pr-1">
            {categoryPieData.map((rc) => (
              <div key={rc.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: rc.color }}
                  />
                  <span className="font-bold text-slate-800 truncate">{rc.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-bold text-slate-900">{rc.count}</span>
                  <span className="w-9 text-right font-bold text-emerald-600">
                    {rc.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: BAR CHART: Subcategories ONLY */}
        <div className="rounded-2xl bg-white p-6 shadow-xs border-0 flex flex-col justify-between">
          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  SUBCATEGORIES
                </span>
                <h3 className="mt-1 text-base font-bold text-slate-900">Subcategories Volume</h3>
                <p className="text-xs text-slate-500">Top subcategories product volume.</p>
              </div>

              {/* Department Filter for Subcategories Bar Chart */}
              <div className="flex items-center gap-1.5">
                <select
                  value={subcatParentFilter}
                  onChange={(e) => setSubcatParentFilter(e.target.value)}
                  className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700 focus:outline-none border-0"
                >
                  <option value="all">All Depts</option>
                  {rootCategories.map((rc) => (
                    <option key={rc.id} value={rc.id}>
                      {rc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredSubcategoriesData.slice(0, 7)}
                  layout="vertical"
                  margin={{ top: 5, right: 15, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" fontSize={10} stroke="#64748b" tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    fontSize={10}
                    stroke="#334155"
                    tickLine={false}
                    width={95}
                  />
                  <RechartsTooltip
                    formatter={(
                      val: number,
                      name: string,
                      item: { payload?: { stock?: number; parentName?: string } },
                    ) => [
                      `${val} items (${item.payload?.stock ?? 0} in stock)`,
                      item.payload?.parentName || "Catalog",
                    ]}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="#0284c7" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span>{subcategories.length} subcategories</span>
            <Link
              to="/admin/products"
              className="font-bold text-[#00a884] hover:underline flex items-center gap-1"
            >
              <span>Manage all</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Visual Workspace Quick Links: "Know exactly what you are editing" */}
      <div className="rounded-2xl bg-white p-6 shadow-xs border-0">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              OPERATIONS & CONTENT
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Direct Editing & Catalog Command Centers
            </h2>
            <p className="text-xs text-slate-500">
              Select what you want to edit: manage banners for all categories and subcategories, or
              categorise your products.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {products.length} Products • {subcategories.length} Subcategories • 48 Banners
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {/* Card: News & Top Announcement Bar */}
          <Link
            to="/admin/news"
            className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-xs"
          >
            <div>
              <div className="flex items-center justify-end">
                <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-700" />
              </div>
              <h3 className="mt-1 text-sm font-bold text-slate-900 transition group-hover:text-slate-700">
                News & Top Bar
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Set and edit the top scrolling announcement news, tier-1 importer badge, and
                WhatsApp support.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-slate-700 group-hover:text-slate-900">
              <span>Edit News</span>
              <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-slate-700" />
            </div>
          </Link>

          {/* Card 1: Banners & Visual Merchandising (Neutral, No Colors) */}
          <Link
            to="/admin/banners"
            className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-xs"
          >
            <div>
              <div className="flex items-center justify-end">
                <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-700" />
              </div>
              <h3 className="mt-1 text-sm font-bold text-slate-900 transition group-hover:text-slate-700">
                Banners & Images
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Edit homepage hero banners and visual banners for{" "}
                <strong className="text-slate-700 font-semibold">
                  all 48 categories & subcategories
                </strong>{" "}
                with live storefront preview.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-slate-700 group-hover:text-slate-900">
              <span>Edit Banners</span>
              <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-slate-700" />
            </div>
          </Link>

          {/* Card 2: Products Catalog & Categorisation (Neutral, No Colors) */}
          <Link
            to="/admin/products"
            className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-xs"
          >
            <div>
              <div className="flex items-center justify-end">
                <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-700" />
              </div>
              <h3 className="mt-1 text-sm font-bold text-slate-900 transition group-hover:text-slate-700">
                Products & Categories
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Organise and re-categorise products by department and subcategory, adjust inventory
                stock, and set promotional flags.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-slate-700 group-hover:text-slate-900">
              <span>Manage Products ({products.length})</span>
              <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-slate-700" />
            </div>
          </Link>

          {/* Card 3: Categories & Hierarchy (Neutral, No Colors) */}
          <Link
            to="/admin/categories"
            className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-xs"
          >
            <div>
              <div className="flex items-center justify-end">
                <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-700" />
              </div>
              <h3 className="mt-1 text-sm font-bold text-slate-900 transition group-hover:text-slate-700">
                Categories & Taxonomy
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Configure primary departments, slugs, sort order, and parent-child taxonomy tree
                relationships.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-slate-700 group-hover:text-slate-900">
              <span>View Taxonomy</span>
              <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-slate-700" />
            </div>
          </Link>

          {/* Card 4: Customer Inquiries (Neutral, No Colors) */}
          <Link
            to="/admin/inquiries"
            className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-xs"
          >
            <div>
              <div className="flex items-center justify-end">
                <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-700" />
              </div>
              <h3 className="mt-1 text-sm font-bold text-slate-900 transition group-hover:text-slate-700">
                Customer Inquiries
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Review WhatsApp order queries and product questions sent directly by customers
                browsing the shop.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-slate-700 group-hover:text-slate-900">
              <span>View Inquiries ({inquiries.length})</span>
              <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-slate-700" />
            </div>
          </Link>

          {/* Card 5: Customer Reviews & Moderation (Neutral, No Colors) */}
          <Link
            to="/admin/reviews"
            className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-xs"
          >
            <div>
              <div className="flex items-center justify-end">
                <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-700" />
              </div>
              <div className="mt-1 flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 transition group-hover:text-slate-700">
                  Reviews & Ratings
                </h3>
                {pendingReviewsCount > 0 && (
                  <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                    {pendingReviewsCount} pending
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Approve or moderate customer ratings before they appear on the homepage.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-slate-700 group-hover:text-slate-900">
              <span>Moderate ({pendingReviewsCount} pending)</span>
              <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-slate-700" />
            </div>
          </Link>
        </div>

        {/* Real-time Customer Reviews Awaiting Approval Section */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">
                Customer Reviews Awaiting Approval ({pendingReviews.length})
              </h3>
            </div>
            <Link
              to="/admin/reviews"
              className="text-xs font-bold text-[#00a884] hover:underline flex items-center gap-1"
            >
              <span>Manage All Reviews</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {pendingReviews.length === 0 ? (
            <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-xs text-slate-500 flex items-center justify-between">
              <span>
                All customer reviews have been moderated. Newly shared reviews will appear here for
                one-click approval.
              </span>
              <Link
                to="/admin/reviews"
                className="font-semibold text-slate-700 hover:text-slate-900 underline"
              >
                Browse all reviews
              </Link>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {pendingReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="rounded-xl border border-amber-200/80 bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{rev.name}</span>
                      <span className="text-[11px] text-slate-400">({rev.location})</span>
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <span key={i} className="text-xs">
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-amber-600">Pending Approval</span>
                    </div>
                    {rev.product && (
                      <p className="text-[11px] font-semibold text-slate-700">
                        Purchased: {rev.product}
                      </p>
                    )}
                    <p className="text-xs font-bold text-slate-800">{rev.title}</p>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      &quot;{rev.comment}&quot;
                    </p>
                    <span className="block text-[10px] text-slate-400 mt-1">
                      Submitted: {rev.date || "Recently"}
                    </span>
                  </div>

                  <div className="flex sm:flex-col items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleApproveReview(rev.id, rev.name)}
                      className="w-full sm:w-32 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                    >
                      Approve & Publish
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRejectReview(rev.id)}
                      className="w-full sm:w-32 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real-time Customer Inquiries Feed on Dashboard (Clickable Rows) */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#00a884]" />
              <h3 className="text-sm font-bold text-slate-900">
                Customer Inquiries & Messages ({inquiries.length})
              </h3>
            </div>
            <Link
              to="/admin/inquiries"
              className="text-xs font-bold text-[#00a884] hover:underline flex items-center gap-1"
            >
              <span>Manage All Inquiries</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {inquiries.length === 0 ? (
            <div className="mt-4 rounded-xl bg-slate-50/70 p-6 text-center text-xs text-slate-500">
              No customer inquiries submitted yet. Messages sent via the Contact page or Delivery
              form will appear here in real time.
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {inquiries.slice(0, 4).map((inq) => {
                const isNew = inq.status === "new";

                return (
                  <Link
                    key={inq.id}
                    to="/admin/inquiries"
                    search={{ id: inq.id }}
                    onClick={() => markInquiryAsRead(inq.id)}
                    className="group flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between text-xs transition cursor-pointer hover:border-slate-300 hover:shadow-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 group-hover:text-slate-950">
                          {inq.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          ({inq.phone || inq.email || "Contact"})
                        </span>
                        {/* Only new unopened messages will have the tags - no background, no dot, only colored text */}
                        {isNew && !inq.isRead && (
                          <span className="text-[11px] font-bold text-emerald-600">New</span>
                        )}
                      </div>
                      <p className="mt-0.5 font-semibold text-slate-800 truncate">{inq.subject}</p>
                      <p className="text-slate-500 line-clamp-1">{inq.message}</p>
                    </div>
                    <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3">
                      <span className="text-[11px] font-medium text-slate-400">
                        {new Date(inq.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00a884] group-hover:underline">
                        <span>View</span>
                        <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
