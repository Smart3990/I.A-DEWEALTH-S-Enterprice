import { useEffect, useState } from "react";
import { CheckCircle2, Heart, ShoppingBag, X } from "lucide-react";

export type StoreNotification = {
  id: string;
  type: "cart" | "favorite_added" | "favorite_removed";
  title: string;
  name: string;
  image?: string;
  price?: number;
};

const EVENT_NAME = "iadw_store_notification";

export function showStoreNotification(detail: Omit<StoreNotification, "id">) {
  if (typeof window === "undefined") return;
  const event = new CustomEvent(EVENT_NAME, {
    detail: { ...detail, id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}` },
  });
  window.dispatchEvent(event);
}

export function NotificationToast() {
  const [activeNotification, setActiveNotification] = useState<StoreNotification | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const handleNotification = (e: Event) => {
      const customEvent = e as CustomEvent<StoreNotification>;
      if (!customEvent.detail) return;

      setActiveNotification(customEvent.detail);

      if (timeoutId) clearTimeout(timeoutId);
      // Automatically dismiss after exactly 3 seconds
      timeoutId = setTimeout(() => {
        setActiveNotification(null);
      }, 3000);
    };

    window.addEventListener(EVENT_NAME, handleNotification);
    return () => {
      window.removeEventListener(EVENT_NAME, handleNotification);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  if (!activeNotification) return null;

  const isCart = activeNotification.type === "cart";
  const isFavAdded = activeNotification.type === "favorite_added";

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-label={activeNotification.title}
      className="fixed top-4 right-4 z-[9999] pointer-events-auto max-w-sm w-[calc(100vw-2rem)] sm:w-auto animate-in fade-in slide-in-from-top-3 duration-200"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card/95 p-3.5 shadow-2xl backdrop-blur-md">
        {/* Product image or Icon badge */}
        {activeNotification.image ? (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-secondary">
            <img
              src={activeNotification.image}
              alt={activeNotification.name}
              className="h-full w-full object-cover object-center"
            />
            <span
              className={`absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-tl-md text-white ${
                isCart ? "bg-primary" : isFavAdded ? "bg-deal" : "bg-muted-foreground"
              }`}
            >
              {isCart ? (
                <ShoppingBag className="h-2.5 w-2.5" />
              ) : (
                <Heart className="h-2.5 w-2.5 fill-current" />
              )}
            </span>
          </div>
        ) : (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              isCart
                ? "bg-primary-soft text-primary"
                : isFavAdded
                  ? "bg-deal/10 text-deal"
                  : "bg-secondary text-muted-foreground"
            }`}
          >
            {isCart ? (
              <ShoppingBag className="h-5 w-5" />
            ) : (
              <Heart className={`h-5 w-5 ${isFavAdded ? "fill-current" : ""}`} />
            )}
          </div>
        )}

        {/* Message body */}
        <div className="min-w-0 flex-1 pr-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`flex h-1.5 w-1.5 rounded-full ${
                isCart ? "bg-primary" : isFavAdded ? "bg-deal" : "bg-muted-foreground"
              }`}
            />
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              {activeNotification.title}
            </p>
          </div>
          <p className="mt-0.5 truncate text-sm font-extrabold text-foreground">
            {activeNotification.name}
          </p>
          {typeof activeNotification.price === "number" && activeNotification.price > 0 && (
            <p className="text-xs font-bold text-primary-dark">
              GHC {activeNotification.price.toLocaleString("en-US")}
            </p>
          )}
        </div>

        {/* Close button */}
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => setActiveNotification(null)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* 3-second progress indicator bar */}
      <div className="mx-3 -mt-0.5 h-1 overflow-hidden rounded-b-full bg-border/40">
        <div
          className={`h-full origin-left animate-shrink-width ${
            isCart ? "bg-primary" : isFavAdded ? "bg-deal" : "bg-muted-foreground"
          }`}
          style={{ animation: "shrinkWidth 3s linear forwards" }}
        />
      </div>

      <style>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </aside>
  );
}
