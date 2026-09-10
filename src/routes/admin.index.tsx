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
import { categories, type Category } from "@/data/catalog";
import { getInquiries, fetchInquiriesFromServer } from "@/data/inquiries-store";
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
  const [products, setProducts] = useState(getAllProducts());
  const [inquiries, setInquiries] = useState(getInquiries());
  const [subcatParentFilter, setSubcatParentFilter] = useState<string>("all");
  const [activeWorkstreamHint, setActiveWorkstreamHint] = useState<string | null>(null);

  const reloadData = () => {
    setSite(getSiteConfig());
    setProducts(getAllProducts());
    setInquiries(getInquiries());
    fetchInquiriesFromServer()
      .then((fresh) => setInquiries(fresh))
      .catch(() => {});
  };

  useEffect(() => {
    reloadData();
    const handleStorage = () => reloadData();
    window.addEventListener("ia_products_updated", handleStorage);
    window.addEventListener("ia_inquiries_updated", handleStorage);
    window.addEventListener("ia_site_config_updated", handleStorage);
    window.addEventListener("ia_categories_updated", handleStorage);
    return () => {
      window.removeEventListener("ia_products_updated", handleStorage);
      window.removeEventListener("ia_inquiries_updated", handleStorage);
      window.removeEventListener("ia_site_config_updated", handleStorage);
      window.removeEventListener("ia_categories_updated", handleStorage);
    };
  }, []);

  // Category taxonomy maps
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), []);

  // 1. ROOT CATEGORIES ONLY (parentId is null)
  const rootCategories = useMemo(
    () => categories.filter((c) => c.parentId === null && c.isActive),
    [],
  );

  // 2. SUBCATEGORIES ONLY (parentId is not null)
  const subcategories = useMemo(
    () => categories.filter((c) => c.parentId !== null && c.isActive),
    [],
  );

  // Helper to resolve any subcategory or category ID to its Root Parent Category
  const getRootCategory = useCallback(
    (catId: string): Category | undefined => {
      let current = categoryMap.get(catId);
      while (current && current.parentId) {
        const parent = categoryMap.get(current.parentId);
        if (!parent) break;
        current = parent;
      }
      return current;
    },
    [categoryMap],
  );

  // -------------------------------------------------------------
  // PIE CHART DATA: STRICTLY PRIMARY ROOT CATEGORIES ONLY!
  // NO subcategories are plotted in this pie chart.
  // -------------------------------------------------------------
  const categoryPieData = useMemo(() => {
    const rootCounts: Record<string, { id: string; name: string; count: number; stock: number }> =
      {};

    rootCategories.forEach((rc) => {
      rootCounts[rc.id] = {
        id: rc.id,
        name: rc.name,
        count: 0,
        stock: 0,
      };
    });

    products.forEach((p) => {
      const root = getRootCategory(p.category);
      if (root && rootCounts[root.id]) {
        rootCounts[root.id].count += 1;
        rootCounts[root.id].stock += p.stock || 0;
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
  }, [products, rootCategories, getRootCategory]);

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
      if (subCounts[p.category]) {
        subCounts[p.category].count += 1;
        subCounts[p.category].stock += p.stock || 0;
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

      {/* 2. Top Metric Cards: Visitor Traffic & Catalog Status */}
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
              <span className="inline-flex items-center text-xs font-bold text-emerald-600">
                <TrendingUp className="mr-0.5 h-3.5 w-3.5" />+{analytics.percentChange}%
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Unique customer visits in Ghana during {durationLabels[duration].toLowerCase()}
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
              <span className="text-xs font-semibold text-slate-500">
                ~{(analytics.totalPageViews / (analytics.totalVisitors || 1)).toFixed(1)} / visit
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Avg session: {analytics.avgDuration} • Bounce rate: {analytics.bounceRate}
            </p>
          </div>
        </div>

        {/* KPI 3: Category Engagement */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-xs transition hover:shadow-md border-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Top Visited Category
            </span>
            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
              <FolderTree className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900 truncate">
                {analytics.topCategories[0]?.name || "Phones & Tablets"}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {analytics.topCategories[0]?.visits.toLocaleString()} visits (
              {analytics.topCategories[0]?.percentage}% of total category traffic)
            </p>
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

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Banners & Visual Merchandising */}
          <Link
            to="/admin/banners"
            className="group relative flex flex-col justify-between rounded-xl bg-slate-50/70 p-4 transition hover:bg-slate-100/90 hover:shadow-xs border-0"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-slate-200/80 p-2 text-slate-700 transition group-hover:bg-slate-300/80">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-slate-800 transition">
                Banners & Images
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Edit homepage hero banners and visual banners for{" "}
                <strong>all 48 categories & subcategories</strong> with live storefront preview.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-slate-700 group-hover:text-slate-900">
              <span>Edit Banners</span>
              <ChevronRight className="h-3 w-3" />
            </div>
          </Link>

          {/* Card 2: Products Catalog & Categorisation */}
          <Link
            to="/admin/products"
            className="group relative flex flex-col justify-between rounded-xl bg-slate-50/70 p-4 transition hover:bg-slate-100/90 hover:shadow-xs border-0"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-slate-200/80 p-2 text-slate-700 transition group-hover:bg-slate-300/80">
                  <Package className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-slate-800 transition">
                Products & Categories
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Organise and re-categorise products by department and subcategory, adjust inventory
                stock, and set promotional flags.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-slate-700 group-hover:text-slate-900">
              <span>Manage Products ({products.length})</span>
              <ChevronRight className="h-3 w-3" />
            </div>
          </Link>

          {/* Card 3: Categories & Hierarchy */}
          <Link
            to="/admin/categories"
            className="group relative flex flex-col justify-between rounded-xl bg-slate-50/70 p-4 transition hover:bg-slate-100/90 hover:shadow-xs border-0"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-slate-200/80 p-2 text-slate-700 transition group-hover:bg-slate-300/80">
                  <FolderTree className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-slate-800 transition">
                Categories & Taxonomy
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Configure primary departments, slugs, sort order, and parent-child taxonomy tree
                relationships.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-slate-700 group-hover:text-slate-900">
              <span>View Taxonomy</span>
              <ChevronRight className="h-3 w-3" />
            </div>
          </Link>

          {/* Card 4: Customer Inquiries */}
          <Link
            to="/admin/inquiries"
            className="group relative flex flex-col justify-between rounded-xl bg-slate-50/70 p-4 transition hover:bg-slate-100/90 hover:shadow-xs border-0"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-slate-200/80 p-2 text-slate-700 transition group-hover:bg-slate-300/80">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-slate-800 transition">
                Customer Inquiries
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Review WhatsApp order queries and product questions sent directly by customers
                browsing the shop.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-slate-700 group-hover:text-slate-900">
              <span>View Inquiries ({inquiries.length})</span>
              <ChevronRight className="h-3 w-3" />
            </div>
          </Link>
        </div>
      </div>

      {/* 5. Popular Pages, Products & Ghanaian Regional Traffic Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Top Visited Products */}
        <div className="rounded-2xl bg-white p-6 shadow-xs border-0 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                CUSTOMER INTEREST
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Top Visited Products ({durationLabels[duration]})
              </h3>
            </div>
            <Link
              to="/admin/products"
              className="text-xs font-bold text-[#00a884] hover:underline flex items-center gap-1"
            >
              <span>All Products</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {analytics.topProducts.map((p, idx) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-700">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{p.name}</h4>
                    <span className="text-[11px] text-slate-500">{p.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-black text-slate-900">
                    {p.visits.toLocaleString()} views
                  </span>
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 mt-1">
                    <div
                      className="h-full bg-[#00a884] rounded-full"
                      style={{ width: `${p.percentage * 3}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional & Referral Traffic in Ghana */}
        <div className="rounded-2xl bg-white p-6 shadow-xs border-0 lg:col-span-5 space-y-6">
          {/* Ghana Regions Breakdown */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">Visitor Locations in Ghana</h3>
              </div>
              <span className="text-[11px] font-bold text-slate-500">By Region</span>
            </div>

            <div className="mt-3 space-y-2.5">
              {analytics.regions.map((reg) => (
                <div key={reg.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 truncate max-w-[200px]">
                      {reg.name}
                    </span>
                    <span className="font-bold text-slate-900">
                      {reg.percentage}% ({reg.visits.toLocaleString()})
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-[#00a884] rounded-full"
                      style={{ width: `${reg.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Channels */}
          <div className="border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">Inflow Channels</h3>
              </div>
              <span className="text-[11px] font-bold text-slate-500">Channel Split</span>
            </div>

            <div className="mt-3 space-y-2.5">
              {analytics.trafficSources.map((ch) => (
                <div key={ch.source} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{ch.source}</span>
                    <span className="font-bold text-slate-900">{ch.percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-sky-500 rounded-full"
                      style={{ width: `${ch.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
