import { ShoppingCart } from "lucide-react";
import { useStore } from "./store";

export function MiniCart({ count }: { count: number }) {
  const { cartOpen, toggleCart } = useStore();

  return (
    <button
      type="button"
      aria-label="Cart"
      aria-expanded={cartOpen}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleCart();
      }}
      className="relative p-2 transition hover:opacity-80 active:scale-95"
    >
      <ShoppingCart className="h-6 w-6 lg:h-7 lg:w-7" strokeWidth={1.75} />
      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground shadow-xs">
        {count}
      </span>
    </button>
  );
}
