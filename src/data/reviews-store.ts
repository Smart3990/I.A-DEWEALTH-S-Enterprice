/**
 * Reviews & Ratings Store for I.A Dewealth's Enterprise.
 * Manages customer reviews with an admin approval workflow.
 * New reviews are stored with status = "pending" and only
 * display on the homepage once an admin approves them.
 *
 * The database (via /api/reviews) is the source of truth. localStorage only caches the
 * last server response so the page can render before the request returns.
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { adminFetch, readApiError } from "@/lib/admin-fetch";

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface ReviewItem {
  id: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  product?: string;
  status: ReviewStatus;
  helpfulCount: number;
  initials: string;
  createdAt: string;
}

// v3: earlier versions cached hard-coded sample reviews; a new key drops them.
const CACHE_KEY = "ia_dewealth_reviews_v3";
const EVENT_KEY = "ia_reviews_updated";

export function getAllReviews(): ReviewItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function cacheReviews(reviews: ReviewItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(reviews));
  } catch {
    // storage full or blocked; the next fetch repopulates it
  }
  window.dispatchEvent(new Event(EVENT_KEY));
}

/**
 * Loads reviews from the server. Signed-in administrators receive every status;
 * everyone else receives approved reviews only.
 */
export async function fetchReviewsFromServer(): Promise<ReviewItem[]> {
  try {
    const res = await adminFetch("/api/reviews");
    if (!res.ok) return getAllReviews();
    const data = await res.json();
    if (Array.isArray(data?.reviews)) {
      cacheReviews(data.reviews);
      return data.reviews;
    }
  } catch (err) {
    console.warn("Could not fetch reviews from server, using cached copy:", err);
  }
  return getAllReviews();
}

export function getApprovedReviews(): ReviewItem[] {
  return getAllReviews().filter((r) => r.status === "approved");
}

export function getPendingReviews(): ReviewItem[] {
  return getAllReviews().filter((r) => r.status === "pending");
}

/** Sends a customer review for moderation. Throws with a readable message if it was not saved. */
export async function submitReviewForApproval(data: {
  name: string;
  location: string;
  rating: number;
  title: string;
  comment: string;
  product?: string;
}): Promise<ReviewItem> {
  let res: Response;
  try {
    res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    throw new Error("Could not reach the server. Please check your connection and try again.");
  }
  if (!res.ok) throw new Error(await readApiError(res));
  const body = (await res.json()) as { review: ReviewItem };
  return body.review;
}

/** Applies a change locally right away, then confirms it with the server or rolls back. */
async function moderate(
  url: string,
  init: RequestInit,
  optimistic: (reviews: ReviewItem[]) => ReviewItem[],
  failMessage: string,
) {
  cacheReviews(optimistic(getAllReviews()));
  try {
    const res = await adminFetch(url, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
    if (!res.ok) throw new Error(await readApiError(res));
  } catch (err) {
    toast.error(`${failMessage}: ${err instanceof Error ? err.message : String(err)}`);
    await fetchReviewsFromServer();
  }
}

export function approveReview(id: string) {
  return moderate(
    "/api/reviews",
    { method: "PATCH", body: JSON.stringify({ id, status: "approved" }) },
    (list) => list.map((r) => (r.id === id ? { ...r, status: "approved" } : r)),
    "Could not approve the review",
  );
}

export function rejectReview(id: string) {
  return moderate(
    "/api/reviews",
    { method: "PATCH", body: JSON.stringify({ id, status: "rejected" }) },
    (list) => list.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)),
    "Could not reject the review",
  );
}

export function deleteReview(id: string) {
  return moderate(
    `/api/reviews?id=${encodeURIComponent(id)}`,
    { method: "DELETE" },
    (list) => list.filter((r) => r.id !== id),
    "Could not delete the review",
  );
}

export function deleteAllReviews() {
  return moderate(
    "/api/reviews?id=all",
    { method: "DELETE" },
    () => [],
    "Could not delete all reviews",
  );
}

export function useApprovedReviews(): ReviewItem[] {
  // Start empty so server-rendered markup and the first client render match;
  // the cache and the server response fill it in after mount.
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  useEffect(() => {
    setReviews(getApprovedReviews());
    fetchReviewsFromServer().then((fresh) =>
      setReviews(fresh.filter((r) => r.status === "approved")),
    );

    const handleUpdate = () => setReviews(getApprovedReviews());
    window.addEventListener(EVENT_KEY, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(EVENT_KEY, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return reviews;
}

export function useAllReviews(): {
  all: ReviewItem[];
  pending: ReviewItem[];
  approved: ReviewItem[];
  rejected: ReviewItem[];
  approve: (id: string) => void;
  reject: (id: string) => void;
  remove: (id: string) => void;
  removeAll: () => void;
  refresh: () => Promise<void>;
} {
  const [reviews, setReviews] = useState<ReviewItem[]>(() => getAllReviews());

  const refresh = async () => {
    setReviews(await fetchReviewsFromServer());
  };

  useEffect(() => {
    refresh();

    const handleUpdate = () => setReviews(getAllReviews());
    window.addEventListener(EVENT_KEY, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    // Poll every 8s for live submissions from customers
    const interval = setInterval(refresh, 8000);

    return () => {
      window.removeEventListener(EVENT_KEY, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      clearInterval(interval);
    };
  }, []);

  return {
    all: reviews,
    pending: reviews.filter((r) => r.status === "pending"),
    approved: reviews.filter((r) => r.status === "approved"),
    rejected: reviews.filter((r) => r.status === "rejected"),
    approve: (id) => void approveReview(id),
    reject: (id) => void rejectReview(id),
    remove: (id) => void deleteReview(id),
    removeAll: () => void deleteAllReviews(),
    refresh,
  };
}
