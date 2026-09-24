/**
 * Reviews & Ratings Store for I.A Dewealth's Enterprise.
 * Manages customer reviews with an admin approval workflow.
 * New reviews are stored with status = "pending" and only
 * display on the homepage once an admin approves them.
 */
import { useEffect, useState } from "react";

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

const STORAGE_KEY = "ia_dewealth_reviews_v2";
const DELETED_KEY = "ia_dewealth_deleted_review_ids_v1";
const EVENT_KEY = "ia_reviews_updated";

function getDeletedReviewIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function addDeletedReviewId(id: string) {
  if (typeof window === "undefined") return;
  try {
    const set = getDeletedReviewIds();
    set.add(id);
    localStorage.setItem(DELETED_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error("Failed to persist deleted review ID:", e);
  }
}

export const INITIAL_APPROVED_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    name: "Kwabena Mensah",
    location: "East Legon, Accra",
    rating: 5,
    date: "2 days ago",
    title: "Super fast delivery & 100% original product",
    comment:
      "Ordered the 65W GaN fast charger at 11:00 AM and it was delivered to my office in East Legon by 2:15 PM. Inspected the packaging and tested it before paying the dispatch rider with MoMo. Legit shop!",
    product: "Baseus 65W GaN Fast Charger",
    status: "approved",
    helpfulCount: 28,
    initials: "KM",
    createdAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
  },
  {
    id: "rev-2",
    name: "Akosua Serwaa",
    location: "Kumasi, Ashanti Region",
    rating: 5,
    date: "5 days ago",
    title: "Smooth delivery to Kumasi via VIP bus",
    comment:
      "I was skeptical ordering electronics from Accra to Kumasi, but the WhatsApp team was so reassuring. They sent photos of my package and waybill. Received it the next morning in perfect sealed condition.",
    product: "Apple AirPods Pro 2 (USB-C)",
    status: "approved",
    helpfulCount: 19,
    initials: "AS",
    createdAt: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
  },
  {
    id: "rev-3",
    name: "Emmanuel Owusu",
    location: "Airport Residential, Accra",
    rating: 5,
    date: "1 week ago",
    title: "Best prices for authentic gadgets in Ghana",
    comment:
      "I’ve bought gadgets in Accra for years, but I.A Dewealth stands out for fair pricing and genuine stock. Sound quality on this Anker speaker is incredible, no distortion at high volumes.",
    product: "Anker Soundcore Motion+ Bluetooth Speaker",
    status: "approved",
    helpfulCount: 34,
    initials: "EO",
    createdAt: new Date(Date.now() - 7 * 86400 * 1000).toISOString(),
  },
  {
    id: "rev-4",
    name: "Naa Korkor Mensah",
    location: "Spintex Road, Accra",
    rating: 5,
    date: "1 week ago",
    title: "Seamless WhatsApp checkout and helpful support",
    comment:
      "The WhatsApp ordering is straightforward. Just clicked checkout, sent my delivery location on Spintex, and received my smartwatch the same afternoon. Battery life is amazing.",
    product: "Oraimo Watch 4 Plus Smartwatch",
    status: "approved",
    helpfulCount: 15,
    initials: "NK",
    createdAt: new Date(Date.now() - 8 * 86400 * 1000).toISOString(),
  },
  {
    id: "rev-5",
    name: "Dennis Boateng",
    location: "Takoradi, Western Region",
    rating: 5,
    date: "2 weeks ago",
    title: "Honest customer service, parcel arrived intact",
    comment:
      "Their customer care is 10/10. Answered all my technical questions before I committed. Delivered safely to Takoradi parcel office. Will buy again for my family.",
    product: "Xiaomi Mi TV Box S 4K (2nd Gen)",
    status: "approved",
    helpfulCount: 22,
    initials: "DB",
    createdAt: new Date(Date.now() - 14 * 86400 * 1000).toISOString(),
  },
  {
    id: "rev-6",
    name: "Priscilla Addo",
    location: "Tema Community 1",
    rating: 5,
    date: "2 weeks ago",
    title: "Very polite rider and original quality cable",
    comment:
      "Got the 100W braided charging cables. Charges my MacBook at full speed without heating up. Dispatch rider called before arriving and was very polite.",
    product: "Baseus 100W USB-C PD Cable (2m)",
    status: "approved",
    helpfulCount: 12,
    initials: "PA",
    createdAt: new Date(Date.now() - 15 * 86400 * 1000).toISOString(),
  },
];

export function getAllReviews(): ReviewItem[] {
  const deletedIds = getDeletedReviewIds();
  if (typeof window === "undefined") {
    return INITIAL_APPROVED_REVIEWS.filter((r) => !deletedIds.has(r.id));
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const filteredInit = INITIAL_APPROVED_REVIEWS.filter((r) => !deletedIds.has(r.id));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredInit));
      return filteredInit;
    }
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : INITIAL_APPROVED_REVIEWS;
    return list.filter((r) => !deletedIds.has(r.id));
  } catch {
    return INITIAL_APPROVED_REVIEWS.filter((r) => !deletedIds.has(r.id));
  }
}

export async function fetchReviewsFromServer(): Promise<ReviewItem[]> {
  const deletedIds = getDeletedReviewIds();
  try {
    const res = await fetch("/api/reviews");
    if (!res.ok) return getAllReviews();
    const data = await res.json();
    if (Array.isArray(data?.reviews)) {
      const serverList: ReviewItem[] = data.reviews.filter(
        (r: ReviewItem) => !deletedIds.has(r.id),
      );
      const localList = getAllReviews();
      const serverIds = new Set(serverList.map((r) => r.id));
      const localOnly = localList.filter((r) => !serverIds.has(r.id) && !deletedIds.has(r.id));
      const merged = [...serverList, ...localOnly];

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(new Event(EVENT_KEY));
      } catch (e) {
        console.error("Failed to cache reviews:", e);
      }
      return merged;
    }
  } catch (err) {
    console.warn("Could not fetch reviews from server, using local store:", err);
  }
  return getAllReviews();
}

export function getApprovedReviews(): ReviewItem[] {
  return getAllReviews().filter((r) => r.status === "approved");
}

export function getPendingReviews(): ReviewItem[] {
  return getAllReviews().filter((r) => r.status === "pending");
}

export function saveReviews(reviews: ReviewItem[]) {
  if (typeof window === "undefined") return;
  const deletedIds = getDeletedReviewIds();
  const filtered = reviews.filter((r) => !deletedIds.has(r.id));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event(EVENT_KEY));
  } catch (e) {
    console.error("Failed to save reviews:", e);
  }
}

export function submitReviewForApproval(data: {
  name: string;
  location: string;
  rating: number;
  title: string;
  comment: string;
  product?: string;
}): ReviewItem {
  const initials = data.name
    .trim()
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const newReview: ReviewItem = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: data.name.trim(),
    location: data.location.trim() || "Accra, Ghana",
    rating: data.rating,
    date: "Just now",
    title: data.title.trim() || "Great experience with I.A Dewealth",
    comment: data.comment.trim(),
    product: data.product?.trim() || "Purchased Gadget",
    status: "pending", // Waiting for admin approval!
    helpfulCount: 0,
    initials: initials || "CU",
    createdAt: new Date().toISOString(),
  };

  const current = getAllReviews();
  saveReviews([newReview, ...current]);

  // Sync with API server in background
  fetch("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: newReview.name,
      location: newReview.location,
      rating: newReview.rating,
      title: newReview.title,
      comment: newReview.comment,
      product: newReview.product,
    }),
  }).catch((err) => console.warn("Notice: Review saved locally, server sync error:", err));

  return newReview;
}

export function approveReview(id: string) {
  const reviews = getAllReviews().map((r) =>
    r.id === id ? { ...r, status: "approved" as ReviewStatus } : r,
  );
  saveReviews(reviews);

  fetch("/api/reviews", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status: "approved" }),
  }).catch((err) => console.warn("Notice: Review status saved locally:", err));
}

export function rejectReview(id: string) {
  const reviews = getAllReviews().map((r) =>
    r.id === id ? { ...r, status: "rejected" as ReviewStatus } : r,
  );
  saveReviews(reviews);

  fetch("/api/reviews", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status: "rejected" }),
  }).catch((err) => console.warn("Notice: Review status saved locally:", err));
}

export function deleteReview(id: string) {
  // 1. Mark ID permanently as deleted
  addDeletedReviewId(id);

  // 2. Remove from local store
  const reviews = getAllReviews().filter((r) => r.id !== id);
  saveReviews(reviews);

  // 3. Inform API server
  fetch(`/api/reviews?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  }).catch((err) => console.warn("Notice: Review deleted locally:", err));
}

export function deleteAllReviews() {
  // 1. Mark all existing review IDs as deleted
  const current = getAllReviews();
  current.forEach((r) => addDeletedReviewId(r.id));

  // 2. Clear local storage
  saveReviews([]);

  // 3. Inform API server
  fetch("/api/reviews?id=all", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: "all", all: true }),
  }).catch((err) => console.warn("Notice: All reviews cleared locally:", err));
}

export function useApprovedReviews(): ReviewItem[] {
  // Always initialize with default approved reviews to ensure server-rendered markup
  // and initial client hydration markup match 100%. Storage is loaded in useEffect.
  const [reviews, setReviews] = useState<ReviewItem[]>(() =>
    INITIAL_APPROVED_REVIEWS.filter((r) => r.status === "approved"),
  );

  useEffect(() => {
    // Safely hydrate from localStorage after client-side mount
    setReviews(getApprovedReviews());

    fetchReviewsFromServer().then((fresh) => {
      setReviews(fresh.filter((r) => r.status === "approved"));
    });

    const handleUpdate = () => {
      setReviews(getApprovedReviews());
    };
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
  refresh: () => Promise<void>;
} {
  const [reviews, setReviews] = useState<ReviewItem[]>(() => getAllReviews());

  const refresh = async () => {
    const fresh = await fetchReviewsFromServer();
    setReviews(fresh);
  };

  const handleApprove = (id: string) => {
    approveReview(id);
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved" as ReviewStatus } : r)),
    );
  };

  const handleReject = (id: string) => {
    rejectReview(id);
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" as ReviewStatus } : r)),
    );
  };

  const handleRemove = (id: string) => {
    deleteReview(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const handleRemoveAll = () => {
    deleteAllReviews();
    setReviews([]);
  };

  useEffect(() => {
    refresh();

    const handleUpdate = () => {
      setReviews(getAllReviews());
    };
    window.addEventListener(EVENT_KEY, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    // Poll every 8s for live submissions from customers
    const interval = setInterval(() => {
      fetchReviewsFromServer().then((fresh) => setReviews(fresh));
    }, 8000);

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
    approve: handleApprove,
    reject: handleReject,
    remove: handleRemove,
    removeAll: handleRemoveAll,
    refresh,
  };
}
