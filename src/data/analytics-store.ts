/**
 * Visitor analytics store for I.A Dewealth's Enterprise.
 * Tracks store traffic, page views, category interest, and popular products
 * by filter duration (Today, Last 7 Days, Last 30 Days, All Time).
 */
import { useEffect, useRef, useState } from "react";

export type DurationFilter = "today" | "7d" | "30d" | "all";

export interface PageVisit {
  path: string;
  title: string;
  timestamp: number;
  visitorId?: string;
  category?: string;
  productId?: string;
}

export interface AnalyticsTimelinePoint {
  label: string;
  visitors: number;
  pageviews: number;
}

export interface CategoryTrafficItem {
  id: string;
  name: string;
  path: string;
  visits: number;
  percentage: number;
  color: string;
}

export interface ProductTrafficItem {
  id: string;
  name: string;
  category: string;
  visits: number;
  percentage: number;
}

export interface AnalyticsSummary {
  duration: DurationFilter;
  totalVisitors: number;
  totalPageViews: number;
  avgDuration: string;
  bounceRate: string;
  percentChange: number; // e.g. +14.8%
  activeNow: number;
  timeline: AnalyticsTimelinePoint[];
  topCategories: CategoryTrafficItem[];
  topProducts: ProductTrafficItem[];
  topPages: { path: string; title: string; visits: number }[];
  regions: { name: string; percentage: number; visits: number }[];
  devices: { device: string; percentage: number; visits: number }[];
  trafficSources: { source: string; percentage: number; visits: number }[];
}

const STORAGE_KEY = "ia_store_visits_log_v1";
const EVENT_KEY = "ia_analytics_updated";

// Helper to get or init visitor ID
function getVisitorId(): string {
  if (typeof window === "undefined") return "server";
  let vid = sessionStorage.getItem("ia_visitor_session_id");
  if (!vid) {
    vid = "v_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);
    sessionStorage.setItem("ia_visitor_session_id", vid);
  }
  return vid;
}

// Read raw visits log from storage
function getRawVisits(): PageVisit[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Record a page visit when customer browses the store.
 */
export function recordPageView(
  path: string,
  title?: string,
  category?: string,
  productId?: string,
) {
  if (typeof window === "undefined") return;
  // Ignore admin pages from public visitor metrics
  if (path.startsWith("/admin")) return;

  const newVisit: PageVisit = {
    path,
    title: title || path,
    timestamp: Date.now(),
    visitorId: getVisitorId(),
    category,
    productId,
  };

  try {
    const visits = getRawVisits();
    // Keep last 1500 live visit events
    const updated = [newVisit, ...visits].slice(0, 1500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(EVENT_KEY));
  } catch (e) {
    console.error("Failed to record page visit:", e);
  }
}

/**
 * Computes aggregated visitor metrics based on the selected duration filter.
 */
export function getAnalyticsData(duration: DurationFilter): AnalyticsSummary {
  const rawVisits = getRawVisits();
  const now = Date.now();

  // Cutoff threshold based on duration
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const cutoff =
    duration === "today"
      ? startOfToday.getTime()
      : duration === "7d"
        ? now - 7 * 86400 * 1000
        : duration === "30d"
          ? now - 30 * 86400 * 1000
          : 0;

  const filteredVisits = rawVisits.filter((v) => v.timestamp >= cutoff);
  const livePageViews = filteredVisits.length;
  const liveUniqueVisitors = new Set(filteredVisits.map((v) => v.visitorId || v.path)).size;

  // Active in last 15 minutes
  const activeCutoff = now - 15 * 60 * 1000;
  const activeNowCount = new Set(
    rawVisits.filter((v) => v.timestamp >= activeCutoff).map((v) => v.visitorId || v.path),
  ).size;

  const totalPageViews = livePageViews;
  const totalVisitors = liveUniqueVisitors;
  const activeNow = activeNowCount;

  // Calculate real percent change comparing current period with previous equivalent period
  const previousCutoff = cutoff > 0 ? cutoff - (now - cutoff) : 0;
  const previousVisits =
    cutoff > 0
      ? rawVisits.filter((v) => v.timestamp >= previousCutoff && v.timestamp < cutoff).length
      : 0;
  const percentChange =
    previousVisits > 0
      ? Math.round(((livePageViews - previousVisits) / previousVisits) * 100)
      : livePageViews > 0
        ? 100
        : 0;

  // Calculate real bounce rate (visitors with only 1 page view / total visitors)
  const visitorPageCounts: Record<string, number> = {};
  filteredVisits.forEach((v) => {
    const key = v.visitorId || v.path;
    visitorPageCounts[key] = (visitorPageCounts[key] || 0) + 1;
  });
  const singlePageVisitors = Object.values(visitorPageCounts).filter((c) => c === 1).length;
  const bounceRate =
    totalVisitors > 0 ? `${Math.round((singlePageVisitors / totalVisitors) * 100)}%` : "0%";

  // Calculate real average duration from multi-page sessions
  const visitorSessions: Record<string, { min: number; max: number }> = {};
  filteredVisits.forEach((v) => {
    const key = v.visitorId || "anon";
    if (!visitorSessions[key]) {
      visitorSessions[key] = { min: v.timestamp, max: v.timestamp };
    } else {
      visitorSessions[key].min = Math.min(visitorSessions[key].min, v.timestamp);
      visitorSessions[key].max = Math.max(visitorSessions[key].max, v.timestamp);
    }
  });
  const multiSessions = Object.values(visitorSessions).filter((s) => s.max > s.min);
  let avgDuration = "0m 00s";
  if (multiSessions.length > 0) {
    const avgSec = Math.round(
      multiSessions.reduce((sum, s) => sum + (s.max - s.min) / 1000, 0) / multiSessions.length,
    );
    const mins = Math.floor(avgSec / 60);
    const secs = avgSec % 60;
    avgDuration = `${mins}m ${secs.toString().padStart(2, "0")}s`;
  } else if (totalPageViews > 0) {
    avgDuration = "0m 45s";
  }

  // Timeline points based on STRICTLY real timestamp buckets (NO mock minimums)
  let timeline: AnalyticsTimelinePoint[] = [];

  if (duration === "today") {
    const hours = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];
    timeline = hours.map((label, idx) => {
      const slotHour = 8 + idx * 2;
      const visitsInSlot = filteredVisits.filter((v) => {
        const h = new Date(v.timestamp).getHours();
        return h >= slotHour && h < slotHour + 2;
      });
      const uniqueInSlot = new Set(visitsInSlot.map((v) => v.visitorId || v.path)).size;
      return {
        label,
        visitors: uniqueInSlot,
        pageviews: visitsInSlot.length,
      };
    });
  } else if (duration === "7d") {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    timeline = days.map((label, dayIdx) => {
      const visitsOnDay = filteredVisits.filter((v) => {
        const d = new Date(v.timestamp).getDay();
        const adjusted = d === 0 ? 6 : d - 1;
        return adjusted === dayIdx;
      });
      const uniqueOnDay = new Set(visitsOnDay.map((v) => v.visitorId || v.path)).size;
      return {
        label,
        visitors: uniqueOnDay,
        pageviews: visitsOnDay.length,
      };
    });
  } else if (duration === "30d") {
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
    timeline = weeks.map((label, wIdx) => {
      const wStart = now - (4 - wIdx) * 7 * 86400 * 1000;
      const wEnd = wStart + 7 * 86400 * 1000;
      const visitsInWeek = filteredVisits.filter(
        (v) => v.timestamp >= wStart && v.timestamp < wEnd,
      );
      const uniqueInWeek = new Set(visitsInWeek.map((v) => v.visitorId || v.path)).size;
      return {
        label,
        visitors: uniqueInWeek,
        pageviews: visitsInWeek.length,
      };
    });
  } else {
    // All time
    const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
    timeline = months.map((label, mIdx) => {
      const visitsInMonth = filteredVisits.filter(
        (v) => new Date(v.timestamp).getMonth() === mIdx + 3,
      );
      const uniqueInMonth = new Set(visitsInMonth.map((v) => v.visitorId || v.path)).size;
      return {
        label,
        visitors: uniqueInMonth,
        pageviews: visitsInMonth.length,
      };
    });
  }

  // Real Top Categories
  const categoryMap: Record<string, number> = {};
  filteredVisits.forEach((v) => {
    if (v.category) {
      categoryMap[v.category] = (categoryMap[v.category] || 0) + 1;
    } else if (v.path.startsWith("/category/")) {
      const catSlug = v.path.replace("/category/", "").split("/")[0];
      categoryMap[catSlug] = (categoryMap[catSlug] || 0) + 1;
    }
  });

  const topCategories: CategoryTrafficItem[] = Object.entries(categoryMap)
    .map(([catId, visits]) => {
      const formattedName = catId
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      return {
        id: catId,
        name: formattedName,
        path: `/category/${catId}`,
        visits,
        percentage:
          totalPageViews > 0 ? Math.min(Math.round((visits / totalPageViews) * 100), 100) : 0,
        color: "#0284c7",
      };
    })
    .sort((a, b) => b.visits - a.visits);

  // Real Top Products
  const productCountMap: Record<string, { name: string; category: string; count: number }> = {};
  filteredVisits.forEach((v) => {
    if (v.productId) {
      if (!productCountMap[v.productId]) {
        productCountMap[v.productId] = {
          name: v.title || "Product",
          category: v.category || "Catalog",
          count: 0,
        };
      }
      productCountMap[v.productId].count += 1;
    }
  });

  const topProducts: ProductTrafficItem[] = Object.entries(productCountMap)
    .map(([id, item]) => ({
      id,
      name: item.name,
      category: item.category,
      visits: item.count,
      percentage:
        totalVisitors > 0 ? Math.min(Math.round((item.count / totalVisitors) * 100), 100) : 0,
    }))
    .sort((a, b) => b.visits - a.visits);

  // Real Top pages
  const pageMap: Record<string, { title: string; count: number }> = {};
  filteredVisits.forEach((v) => {
    if (!pageMap[v.path]) {
      pageMap[v.path] = { title: v.title || v.path, count: 0 };
    }
    pageMap[v.path].count += 1;
  });

  const topPages = Object.entries(pageMap)
    .map(([p, item]) => ({
      path: p,
      title: item.title,
      visits: item.count,
    }))
    .sort((a, b) => b.visits - a.visits);

  return {
    duration,
    totalVisitors,
    totalPageViews,
    avgDuration,
    bounceRate,
    percentChange,
    activeNow,
    timeline,
    topCategories,
    topProducts,
    topPages,
    regions: [],
    devices: [],
    trafficSources: [],
  };
}

/**
 * React hook for live visitor analytics by duration filter.
 */
export function useStoreAnalytics(duration: DurationFilter = "7d"): AnalyticsSummary {
  const [data, setData] = useState<AnalyticsSummary>(() => getAnalyticsData(duration));
  const prevDurationRef = useRef(duration);

  useEffect(() => {
    if (prevDurationRef.current !== duration) {
      prevDurationRef.current = duration;
      setData(getAnalyticsData(duration));
    }
    const handleUpdate = () => {
      setData(getAnalyticsData(duration));
    };
    window.addEventListener(EVENT_KEY, handleUpdate);
    return () => window.removeEventListener(EVENT_KEY, handleUpdate);
  }, [duration]);

  return data;
}
