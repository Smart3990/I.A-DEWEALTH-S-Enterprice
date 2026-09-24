import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingCart, Trash2, X, MessageSquare } from "lucide-react";
import { cedi, useStore } from "./store";
import { useSite, whatsappLink } from "@/data/site";

export function CartDrawer() {
  const { cart, cartOpen, closeCart, setQty, removeLine, total, count } = useStore();
  const { settings } = useSite();
  const drawerRef = useRef<HTMLDivElement>(null);

  const orderText = cart.length
    ? `Hello IA DEWEALTH, I want to order:\n${cart
        .map((l) => `• ${l.name} x${l.qty}: GHC ${(l.price * l.qty).toLocaleString()}`)
        .join("\n")}\nTotal: GHC ${total.toLocaleString()}`
    : "";

  useEffect(() => {
    if (!cartOpen) return;

    // Handle Escape key to close
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };

    // Prevent body scroll on mobile when drawer is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [cartOpen, closeCart]);

  if (!cartOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Your Cart"
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={closeCart}
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className="relative z-10 flex h-full w-full max-w-md flex-col bg-card shadow-2xl border-l border-border transition-transform animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-surface/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-foreground">Your Cart</h2>
              <p className="text-xs font-semibold text-muted-foreground">
                {count} {count === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close cart"
            onClick={closeCart}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content list */}
        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <ShoppingCart className="h-8 w-8" />
            </div>
            <p className="text-base font-extrabold text-foreground">Your cart is empty</p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Add authentic tech, appliances, or accessories to get started.
            </p>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-border overflow-y-auto px-4 py-2">
            {cart.map((line) => (
              <li key={line.id} className="flex gap-3.5 py-4">
                {line.image ? (
                  <img
                    src={line.image}
                    alt={line.name}
                    loading="lazy"
                    className="h-16 w-16 shrink-0 rounded-xl bg-secondary object-cover object-center border border-border/50"
                  />
                ) : (
                  <div className="h-16 w-16 shrink-0 rounded-xl bg-secondary border border-border/50" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold leading-snug text-foreground line-clamp-2">
                    {line.name}
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-primary-dark">
                    {cedi(line.price * line.qty)}
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    {/* Quantity counter */}
                    <div className="flex items-center rounded-lg border border-border bg-surface">
                      <button
                        type="button"
                        aria-label={`Decrease ${line.name}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setQty(line.id, line.qty - 1);
                        }}
                        className="flex h-7 w-7 items-center justify-center text-foreground transition hover:bg-secondary active:scale-95"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-7 text-center text-xs font-black text-foreground">
                        {line.qty}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase ${line.name}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setQty(line.id, line.qty + 1);
                        }}
                        className="flex h-7 w-7 items-center justify-center text-foreground transition hover:bg-secondary active:scale-95"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      aria-label={`Remove ${line.name}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeLine(line.id);
                      }}
                      className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition hover:border-deal hover:bg-deal/10 hover:text-deal active:scale-95"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-border bg-surface/50 p-4 space-y-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-muted-foreground">Subtotal</span>
              <span className="text-lg font-black text-foreground">{cedi(total)}</span>
            </div>

            <a
              href={whatsappLink(settings.whatsappNumber, orderText)}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground shadow-sm transition hover:bg-primary-dark active:scale-[0.98]"
            >
              <MessageSquare className="h-4 w-4" />
              Order via WhatsApp
            </a>

            <Link
              to="/cart"
              onClick={closeCart}
              className="flex w-full items-center justify-center rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground transition hover:bg-secondary active:scale-[0.98]"
            >
              View Full Cart ({count})
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
