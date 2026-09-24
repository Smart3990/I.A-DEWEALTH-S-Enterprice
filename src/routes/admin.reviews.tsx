import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  Clock,
  Search,
  Filter,
  Eye,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Check,
} from "lucide-react";
import { PageHead, Panel, Btn } from "@/components/admin/kit";
import { useAllReviews, type ReviewItem, type ReviewStatus } from "@/data/reviews-store";
import { logActivity } from "@/lib/admin-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviewsPage,
});

function AdminReviewsPage() {
  const { all, pending, approved, rejected, approve, reject, remove, removeAll } = useAllReviews();
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [starFilter, setStarFilter] = useState<number | "all">("all");
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  // Filter reviews based on tab, search query, and star rating
  const filteredReviews = useMemo(() => {
    let list = all;
    if (activeTab === "pending") list = pending;
    else if (activeTab === "approved") list = approved;
    else if (activeTab === "rejected") list = rejected;

    if (starFilter !== "all") {
      list = list.filter((r) => r.rating === starFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q) ||
          (r.product && r.product.toLowerCase().includes(q)) ||
          r.location.toLowerCase().includes(q),
      );
    }

    return list;
  }, [all, pending, approved, rejected, activeTab, starFilter, searchQuery]);

  const [reviewToDelete, setReviewToDelete] = useState<ReviewItem | null>(null);

  const handleApprove = (review: ReviewItem) => {
    approve(review.id);
    logActivity(`Approved customer review from "${review.name}" (${review.rating}★)`);
    toast.success(`Review from "${review.name}" approved and is now live on the homepage!`);
    if (selectedReview?.id === review.id) {
      setSelectedReview((prev) => (prev ? { ...prev, status: "approved" } : null));
    }
  };

  const handleReject = (review: ReviewItem) => {
    reject(review.id);
    logActivity(`Rejected customer review from "${review.name}"`);
    toast.info(`Review from "${review.name}" marked as rejected.`);
    if (selectedReview?.id === review.id) {
      setSelectedReview((prev) => (prev ? { ...prev, status: "rejected" } : null));
    }
  };

  const handleDelete = (review: ReviewItem) => {
    setReviewToDelete(review);
  };

  const confirmDelete = () => {
    if (!reviewToDelete) return;
    const name = reviewToDelete.name;
    const id = reviewToDelete.id;
    remove(id);
    logActivity(`Deleted review from "${name}"`);
    toast.success("Review permanently deleted.");
    if (selectedReview?.id === id) {
      setSelectedReview(null);
    }
    setReviewToDelete(null);
  };

  const confirmClearAll = () => {
    removeAll();
    logActivity("Permanently deleted all customer reviews");
    toast.success("All customer reviews have been cleared.");
    setSelectedReview(null);
    setShowClearAllModal(false);
  };

  const averageRating = useMemo(() => {
    if (approved.length === 0) return 5.0;
    const total = approved.reduce((sum, r) => sum + r.rating, 0);
    return (total / approved.length).toFixed(1);
  }, [approved]);

  return (
    <div className="space-y-6">
      <PageHead
        title="Customer Ratings & Reviews"
        description="Moderate customer ratings. Reviews submitted by shoppers require admin approval before displaying on the homepage."
        action={
          all.length > 0 ? (
            <button
              type="button"
              onClick={() => setShowClearAllModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 hover:text-rose-800"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear All Reviews</span>
            </button>
          ) : undefined
        }
      />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Pending Approval
            </span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-950">{pending.length}</p>
          <span className="text-[11px] text-amber-700">Requires store admin review</span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Live on Homepage
            </span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-950">{approved.length}</p>
          <span className="text-[11px] text-emerald-700">Approved customer feedback</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Average Rating
            </span>
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{averageRating} / 5.0</p>
          <span className="text-[11px] text-slate-500">Based on approved reviews</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Feedback
            </span>
            <MessageSquare className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{all.length}</p>
          <span className="text-[11px] text-slate-500">{rejected.length} rejected</span>
        </div>
      </div>

      {/* Tabs & Controls */}
      <Panel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                activeTab === "all"
                  ? "bg-[#00a884] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>All Reviews ({all.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`relative inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                activeTab === "pending"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>Pending</span>
              {pending.length > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                    activeTab === "pending"
                      ? "bg-amber-800 text-white"
                      : "bg-amber-200 text-amber-900"
                  }`}
                >
                  {pending.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("approved")}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                activeTab === "approved"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>Approved ({approved.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("rejected")}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                activeTab === "rejected"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>Rejected ({rejected.length})</span>
            </button>
          </div>

          {/* Search & Stars Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reviews..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-3 text-xs focus:border-[#00a884] focus:bg-white focus:outline-hidden"
              />
            </div>

            <select
              value={starFilter}
              onChange={(e) =>
                setStarFilter(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              className="rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-[#00a884] focus:bg-white focus:outline-hidden"
            >
              <option value="all">All Stars</option>
              <option value={5}>5 Stars ★★★★★</option>
              <option value={4}>4 Stars ★★★★</option>
              <option value={3}>3 Stars ★★★</option>
              <option value={2}>2 Stars ★★</option>
              <option value={1}>1 Star ★</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="mt-5 space-y-3">
          {filteredReviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-bold text-slate-700">No reviews found</p>
              <p className="text-xs text-slate-500">
                {activeTab === "pending"
                  ? "No customer reviews are currently waiting for approval."
                  : "No reviews match your selected filter."}
              </p>
            </div>
          ) : (
            filteredReviews.map((r) => (
              <div
                key={r.id}
                className={`flex flex-col justify-between gap-4 rounded-xl border p-4 transition sm:flex-row sm:items-center ${
                  r.status === "pending"
                    ? "border-amber-300 bg-amber-50/30"
                    : r.status === "approved"
                      ? "border-slate-200 bg-white hover:border-slate-300"
                      : "border-rose-200 bg-rose-50/20"
                }`}
              >
                {/* Left: Customer Info & Rating */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{r.name}</span>
                    <span className="text-xs text-slate-500">({r.location})</span>

                    {/* Status Badge */}
                    {r.status === "pending" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                        <Clock className="h-3 w-3" />
                        Pending Approval
                      </span>
                    )}
                    {r.status === "approved" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        <Check className="h-3 w-3" />
                        Approved & Live
                      </span>
                    )}
                    {r.status === "rejected" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800">
                        <XCircle className="h-3 w-3" />
                        Rejected
                      </span>
                    )}

                    <span className="text-[11px] text-slate-400">{r.date}</span>
                  </div>

                  {/* Stars & Title */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`h-3.5 w-3.5 ${
                            starIdx <= r.rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-slate-200 text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-800">{r.title}</span>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    &ldquo;{r.comment}&rdquo;
                  </p>

                  {/* Product Tag */}
                  {r.product && (
                    <div className="pt-1 text-[11px] text-slate-500">
                      <span>Product: </span>
                      <span className="font-semibold text-slate-700">{r.product}</span>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex shrink-0 items-center gap-2 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0">
                  {r.status !== "approved" && (
                    <button
                      type="button"
                      onClick={() => handleApprove(r)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Approve</span>
                    </button>
                  )}

                  {r.status !== "rejected" && (
                    <button
                      type="button"
                      onClick={() => handleReject(r)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                    >
                      <XCircle className="h-3.5 w-3.5 text-rose-500" />
                      <span>Reject</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(r)}
                    title="Delete review permanently"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 hover:text-rose-800"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Panel>

      {/* In-DOM Deletion Confirmation Dialog - Avoids iframe window.confirm blocking */}
      {reviewToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
                <Trash2 className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Review</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete the review from{" "}
              <strong className="text-slate-900">{reviewToDelete.name}</strong>? It will be
              immediately removed from the admin panel and store.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setReviewToDelete(null)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Dialog */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
                <Trash2 className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Clear All Reviews</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete all <strong>{all.length}</strong> customer
              reviews? They will be wiped from both the admin dashboard and the storefront.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowClearAllModal(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmClearAll}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition"
              >
                Clear All Reviews
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
