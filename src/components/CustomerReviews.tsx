import { useState, useEffect, useRef, type FormEvent } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, PenLine, Star, ThumbsUp, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface ReviewItem {
  id: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  product?: string;
  verified: boolean;
  helpfulCount: number;
  initials: string;
}

const INITIAL_REVIEWS: ReviewItem[] = [
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
    verified: true,
    helpfulCount: 28,
    initials: "KM",
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
    verified: true,
    helpfulCount: 19,
    initials: "AS",
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
    verified: true,
    helpfulCount: 34,
    initials: "EO",
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
    verified: true,
    helpfulCount: 15,
    initials: "NK",
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
    verified: true,
    helpfulCount: 22,
    initials: "DB",
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
    verified: true,
    helpfulCount: 12,
    initials: "PA",
  },
];

const LOCAL_STORAGE_KEY = "ia_dewealth_user_reviews_v1";

export function CustomerReviews() {
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [helpfulLiked, setHelpfulLiked] = useState<Record<string, boolean>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formProduct, setFormProduct] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formHoverRating, setFormHoverRating] = useState(0);
  const [formTitle, setFormTitle] = useState("");
  const [formComment, setFormComment] = useState("");
  const [recommend, setRecommend] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  // Load saved user reviews on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed: ReviewItem[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReviews([...parsed, ...INITIAL_REVIEWS]);
        }
      }
    } catch (e) {
      console.warn("Could not load stored reviews:", e);
    }
  }, []);

  // Auto-scroll horizontally every 3 seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const card = container.querySelector<HTMLElement>("[data-review-card]");
      const cardWidth = card ? card.offsetWidth : 380;
      const step = cardWidth + 20; // card width + gap

      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScroll - 15) {
        // Loop back to start smoothly
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, reviews.length]);

  const handleScrollLeft = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const card = container.querySelector<HTMLElement>("[data-review-card]");
    const cardWidth = card ? card.offsetWidth : 380;
    const step = cardWidth + 20;

    if (container.scrollLeft <= 15) {
      container.scrollTo({ left: container.scrollWidth, behavior: "smooth" });
    } else {
      container.scrollBy({ left: -step, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const card = container.querySelector<HTMLElement>("[data-review-card]");
    const cardWidth = card ? card.offsetWidth : 380;
    const step = cardWidth + 20;

    const maxScroll = container.scrollWidth - container.clientWidth;
    if (container.scrollLeft >= maxScroll - 15) {
      container.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      container.scrollBy({ left: step, behavior: "smooth" });
    }
  };

  const handleHelpfulClick = (id: string) => {
    if (helpfulLiked[id]) return;
    setHelpfulLiked((prev) => ({ ...prev, [id]: true }));
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, helpfulCount: r.helpfulCount + 1 } : r)),
    );
  };

  const handleSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formComment.trim()) return;

    setIsSubmitting(true);

    const initials = formName
      .trim()
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const newReview: ReviewItem = {
      id: `usr-${Date.now()}`,
      name: formName.trim(),
      location: formLocation.trim() || "Accra, Ghana",
      rating: formRating,
      date: "Just now",
      title: formTitle.trim() || "Great experience with I.A Dewealth",
      comment: formComment.trim(),
      product: formProduct.trim() || "Purchased Gadget",
      verified: true,
      helpfulCount: 1,
      initials: initials || "CU",
    };

    // Save to local storage
    try {
      const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY);
      const existing: ReviewItem[] = existingStr ? JSON.parse(existingStr) : [];
      const updated = [newReview, ...existing];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn("Failed to cache review:", err);
    }

    // Also optionally log to inquiries table in Supabase so store admins can see it!
    try {
      await supabase.from("inquiries").insert({
        item_count: 1,
        items: [
          {
            type: "customer_review",
            name: formName,
            rating: formRating,
            product: formProduct,
            location: formLocation,
            recommend,
          },
        ],
        note: `New Customer Review (${formRating} Stars):\nName: ${formName} (${formLocation})\nProduct: ${formProduct}\nReview: ${formComment}`,
        status: "new",
        total: 0,
      });
    } catch (err) {
      console.warn("Could not log review to database:", err);
    }

    setReviews((prev) => [newReview, ...prev]);
    setIsSubmitting(false);
    setSuccessToast(true);

    // Reset form
    setFormName("");
    setFormLocation("");
    setFormProduct("");
    setFormRating(5);
    setFormTitle("");
    setFormComment("");

    setTimeout(() => {
      setSuccessToast(false);
      setIsModalOpen(false);
    }, 1800);
  };

  return (
    <section className="w-full border-t border-slate-200/80 bg-slate-50/60 py-14 sm:py-20 overflow-hidden">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        {/* Section Header */}
        <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
          Customer Reviews
        </h2>
        <p className="mt-2 max-w-xl mx-auto text-xs leading-relaxed text-slate-600 sm:text-sm">
          See feedback from buyers across Greater Accra, Kumasi, Takoradi, and nationwide.
        </p>

        {/* Navigation controls & Share review trigger - Centered */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleScrollLeft}
            aria-label="Previous review"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-2xs transition hover:bg-slate-100 hover:text-emerald-600 active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95"
          >
            <PenLine className="h-3.5 w-3.5" />
            <span>Share Review</span>
          </button>
          <button
            type="button"
            onClick={handleScrollRight}
            aria-label="Next review"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-2xs transition hover:bg-slate-100 hover:text-emerald-600 active:scale-95"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Reviews Single Row with Auto-Scroll every 3s */}
      <div
        ref={scrollContainerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="mt-8 flex w-full gap-5 overflow-x-auto px-4 pb-5 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth sm:px-8 lg:px-12"
      >
        {reviews.map((r) => {
          const hasLiked = helpfulLiked[r.id];
          return (
            <div
              key={r.id}
              data-review-card
              className="flex w-[320px] sm:w-[380px] md:w-[420px] shrink-0 flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs transition hover:shadow-md"
            >
              <div>
                {/* Top row: Name & Location + Stars */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{r.name}</h3>
                    <p className="text-xs text-slate-500">{r.location}</p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
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
                </div>

                {/* Review Title & Date */}
                <div className="mt-3.5 flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-slate-800">{r.title}</span>
                  <span className="text-[11px] text-slate-400 shrink-0">{r.date}</span>
                </div>

                {/* Review Comment */}
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  &ldquo;{r.comment}&rdquo;
                </p>
              </div>

              {/* Card Bottom: Product Tag & Helpful Counter */}
              <div className="mt-5 border-t border-slate-100 pt-3.5 flex items-center justify-between gap-3">
                {r.product ? (
                  <p className="text-xs font-medium text-slate-500 line-clamp-1 flex-1 pr-2">
                    <span className="text-slate-400">Purchased:</span>{" "}
                    <span className="text-slate-700 font-semibold">{r.product}</span>
                  </p>
                ) : (
                  <span />
                )}

                <button
                  type="button"
                  onClick={() => handleHelpfulClick(r.id)}
                  disabled={hasLiked}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    hasLiked
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  <ThumbsUp className={`h-3 w-3 ${hasLiked ? "fill-emerald-600" : ""}`} />
                  <span className="text-[11px]">({r.helpfulCount})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Share Your Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Title */}
            <div className="text-center">
              <h3 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                Share Your Review
              </h3>
              <p className="mt-1.5 max-w-sm mx-auto text-xs text-slate-500 leading-relaxed">
                Tell us about your experience with our products, dispatch speed, or customer
                service.
              </p>
            </div>

            {/* Success Toast Banner */}
            {successToast && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                <div className="text-xs">
                  <p className="font-bold">Thank you for sharing your review!</p>
                  <p className="text-emerald-700">Your review is now live on our website.</p>
                </div>
              </div>
            )}

            {/* Review Form */}
            <form onSubmit={handleSubmitReview} className="mt-5 space-y-4">
              {/* Star Rating Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">Overall Rating</label>
                <div className="mt-1.5 flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const activeVal = formHoverRating || formRating;
                    const isFilled = starVal <= activeVal;
                    return (
                      <button
                        type="button"
                        key={starVal}
                        onClick={() => setFormRating(starVal)}
                        onMouseEnter={() => setFormHoverRating(starVal)}
                        onMouseLeave={() => setFormHoverRating(0)}
                        className="rounded-md p-1 transition hover:scale-110 focus:outline-hidden"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            isFilled
                              ? "fill-amber-400 text-amber-400"
                              : "fill-slate-100 text-slate-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 text-xs font-bold text-slate-700">
                    {formRating === 5
                      ? "5 Stars - Excellent!"
                      : formRating === 4
                        ? "4 Stars - Very Good"
                        : formRating === 3
                          ? "3 Stars - Good"
                          : formRating === 2
                            ? "2 Stars - Fair"
                            : "1 Star - Needs Improvement"}
                  </span>
                </div>
              </div>

              {/* Name & Location */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="reviewName"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Your Name *
                  </label>
                  <input
                    id="reviewName"
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Kwabena Mensah"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label
                    htmlFor="reviewLocation"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    City / Suburb in Ghana
                  </label>
                  <input
                    id="reviewLocation"
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. East Legon, Accra"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Product Purchased */}
              <div>
                <label
                  htmlFor="reviewProduct"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Product Purchased (Optional)
                </label>
                <input
                  id="reviewProduct"
                  type="text"
                  value={formProduct}
                  onChange={(e) => setFormProduct(e.target.value)}
                  placeholder="e.g. Baseus 65W GaN Charger, AirPods Pro, Smartwatch..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Review Headline */}
              <div>
                <label htmlFor="reviewTitle" className="block text-xs font-semibold text-slate-700">
                  Review Headline
                </label>
                <input
                  id="reviewTitle"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Fast Accra delivery and genuine quality"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Review Comment */}
              <div>
                <label
                  htmlFor="reviewComment"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Your Review *
                </label>
                <textarea
                  id="reviewComment"
                  required
                  rows={4}
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder="Write details about product quality, dispatch rider, packaging, WhatsApp checkout..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Recommendation Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="recommend"
                  checked={recommend}
                  onChange={(e) => setRecommend(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="recommend" className="text-xs text-slate-700 font-medium">
                  I recommend I.A Dewealth&apos;s Enterprise to others
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || successToast}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  <PenLine className="h-3.5 w-3.5" />
                  {isSubmitting ? "Submitting Review..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
