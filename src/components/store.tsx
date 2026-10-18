import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useSite } from "@/data/site";

export type CartLine = {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
  /** Units in stock when the line was added; caps the quantity. */
  stock?: number | undefined;
};

export type AddToCartOptions = {
  /** Units in stock. 0 blocks the add; undefined means unknown (no stock cap). */
  stock?: number | undefined;
};

type StoreValue = {
  cart: CartLine[];
  favorites: string[];
  cartOpen: boolean;
  /** Increments on every successful add, so badges can animate. */
  addedPulse: number;
  addToCart: (
    id: string,
    name: string,
    price: number,
    image?: string,
    quantity?: number,
    options?: AddToCartOptions,
  ) => boolean;
  setQty: (id: string, qty: number) => void;
  removeLine: (id: string) => void;
  toggleFavorite: (id: string) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  /** Highest quantity allowed for a line, from stock and the store's per-product limit. */
  maxQtyFor: (line: Pick<CartLine, "stock">) => number;
  total: number;
  count: number;
};

const StoreContext = createContext<StoreValue | null>(null);

const CART_KEY = "iadw.cart";
const FAV_KEY = "iadw.favorites";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [addedPulse, setAddedPulse] = useState(0);
  const isHydrated = useRef(false);
  // Mirrors `cart` so rapid clicks compute from the latest lines, not a stale render.
  const cartRef = useRef<CartLine[]>([]);
  const navigate = useNavigate();
  const { settings } = useSite();
  const perProductLimit = Math.max(1, Number(settings.maxQtyPerProduct) || 20);

  // Hydrate from storage after mount so SSR markup matches.
  useEffect(() => {
    const saved = read<CartLine[]>(CART_KEY, []);
    cartRef.current = saved;
    setCart(saved);
    setFavorites(read<string[]>(FAV_KEY, []));
    isHydrated.current = true;
  }, []);

  useEffect(() => {
    if (!isHydrated.current) return;
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart]);

  useEffect(() => {
    if (!isHydrated.current) return;
    try {
      window.localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
    } catch {
      /* ignore */
    }
  }, [favorites]);

  const value = useMemo<StoreValue>(() => {
    const total = cart.reduce((s, l) => s + l.price * l.qty, 0);
    const count = cart.reduce((s, l) => s + l.qty, 0);

    const maxQtyFor = (line: Pick<CartLine, "stock">) =>
      typeof line.stock === "number" && line.stock >= 0
        ? Math.min(line.stock, perProductLimit)
        : perProductLimit;

    const commit = (next: CartLine[]) => {
      cartRef.current = next;
      setCart(next);
    };

    const goToCart = { label: "View cart", onClick: () => navigate({ to: "/cart" }) };

    return {
      cart,
      favorites,
      cartOpen,
      addedPulse,
      total,
      count,
      maxQtyFor,
      addToCart: (id, name, price, image, quantity = 1, options = {}) => {
        if (options.stock === 0) {
          toast.error(`${name} is out of stock`, {
            description: "Message us on WhatsApp and we will tell you when it is back.",
          });
          return false;
        }

        const current = cartRef.current;
        const found = current.find((l) => l.id === id);
        const stock = options.stock ?? found?.stock;
        const limit = maxQtyFor({ stock });
        const already = found?.qty ?? 0;
        const wanted = already + Math.max(1, Math.floor(quantity) || 1);
        const nextQty = Math.min(wanted, limit);

        if (nextQty <= already) {
          toast.warning(`You already have the maximum of ${limit} in your cart`, {
            description: name,
            action: goToCart,
          });
          return false;
        }

        commit(
          found
            ? current.map((l) => (l.id === id ? { ...l, qty: nextQty, stock, price } : l))
            : [...current, { id, name, price, qty: nextQty, stock, ...(image ? { image } : {}) }],
        );
        setAddedPulse((n) => n + 1);

        const added = nextQty - already;
        if (nextQty < wanted) {
          toast.warning(`Only ${limit} available — added ${added} to your cart`, {
            description: name,
            action: goToCart,
          });
        } else {
          toast.success(added > 1 ? `${added} × added to cart` : "Added to cart", {
            description: name,
            action: goToCart,
          });
        }
        return true;
      },
      setQty: (id, qty) => {
        const current = cartRef.current;
        const line = current.find((l) => l.id === id);
        if (!line) return;
        if (qty <= 0) {
          commit(current.filter((l) => l.id !== id));
          return;
        }
        const limit = maxQtyFor(line);
        if (qty > limit) {
          toast.warning(`Maximum ${limit} per order for this item`, { description: line.name });
        }
        commit(current.map((l) => (l.id === id ? { ...l, qty: Math.min(qty, limit) } : l)));
      },
      removeLine: (id) => {
        const current = cartRef.current;
        const index = current.findIndex((l) => l.id === id);
        const removed = current[index];
        if (!removed) return;
        commit(current.filter((l) => l.id !== id));
        toast(`Removed from cart`, {
          description: removed.name,
          action: {
            label: "Undo",
            onClick: () => {
              const now = cartRef.current;
              if (now.some((l) => l.id === removed.id)) return;
              const restored = [...now];
              restored.splice(Math.min(index, restored.length), 0, removed);
              commit(restored);
            },
          },
        });
      },
      toggleFavorite: (id) => {
        const saved = favorites.includes(id);
        setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
        if (saved) {
          toast("Removed from saved items");
        } else {
          toast.success("Saved for later", {
            action: { label: "View saved", onClick: () => navigate({ to: "/favorites" }) },
          });
        }
      },
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      toggleCart: () => setCartOpen((v) => !v),
    };
  }, [cart, favorites, cartOpen, addedPulse, perProductLimit, navigate]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export const cedi = (n: number) => `GHC ${n.toLocaleString("en-US")}`;
