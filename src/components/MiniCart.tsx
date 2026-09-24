import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { cedi, useStore } from "./store";

export function MiniCart({ count }: { count: number }) {
  const { cart, cartOpen, toggleCart, closeCart, setQty, removeLine, total } = useStore();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cartOpen) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) closeCart();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [cartOpen, closeCart]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        aria-label="Cart"
        aria-expanded={cartOpen}
        onClick={toggleCart}
        className="relative p-2 transition hover:opacity-80"
      >
        <ShoppingCart className="h-7 w-7" strokeWidth={1.75} />
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
          {count}
        </span>
      </button>

      {cartOpen && (
        <div className="absolute right-0 top-full z-50 mt-3 w-[min(92vw,22rem)] overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-extrabold tracking-tight">Your Cart</span>
            <span className="text-xs font-semibold text-muted-foreground">
              {count} {count === 1 ? "item" : "items"}
            </span>
          </div>

          {cart.length === 0 ? (
            <p className="px-4 py-8 text-center font-body text-sm text-muted-foreground">
              Your cart is empty. Add a product to get started.
            </p>
          ) : (
            <ul className="max-h-72 divide-y divide-border overflow-y-auto">
              {cart.map((line) => (
                <li key={line.id} className="flex gap-3 px-4 py-3">
                  {line.image ? (
                    <img
                      src={line.image}
                      alt=""
                      loading="lazy"
                      className="h-14 w-14 shrink-0 rounded-lg bg-secondary object-cover object-center"
                    />
                  ) : (
                    <div className="h-14 w-14 shrink-0 rounded-lg bg-secondary" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold leading-snug">{line.name}</p>
                    <p className="mt-0.5 text-sm font-extrabold text-primary-dark">
                      {cedi(line.price * line.qty)}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <button
                        aria-label={`Decrease ${line.name}`}
                        onClick={() => setQty(line.id, line.qty - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-border transition hover:bg-secondary"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold">{line.qty}</span>
                      <button
                        aria-label={`Increase ${line.name}`}
                        onClick={() => setQty(line.id, line.qty + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-border transition hover:bg-secondary"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        aria-label={`Remove ${line.name}`}
                        onClick={() => removeLine(line.id)}
                        className="ml-auto rounded-md p-1 text-muted-foreground transition hover:text-deal"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-border px-4 py-3">
            <div className="mb-2.5 flex items-baseline justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Subtotal</span>
              <span className="text-base font-extrabold">{cedi(total)}</span>
            </div>
            <Link
              to="/cart"
              onClick={closeCart}
              className="flex w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary-dark"
            >
              View cart
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
