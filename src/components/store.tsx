import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartLine = { id: string; name: string; price: number; qty: number; image?: string };

type StoreValue = {
  cart: CartLine[];
  favorites: string[];
  cartOpen: boolean;
  addToCart: (id: string, name: string, price: number, image?: string) => void;
  setQty: (id: string, qty: number) => void;
  removeLine: (id: string) => void;
  toggleFavorite: (id: string) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
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

  // Hydrate from storage after mount so SSR markup matches.
  useEffect(() => {
    setCart(read<CartLine[]>(CART_KEY, []));
    setFavorites(read<string[]>(FAV_KEY, []));
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart]);

  useEffect(() => {
    try {
      window.localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
    } catch {
      /* ignore */
    }
  }, [favorites]);

  const value = useMemo<StoreValue>(() => {
    const total = cart.reduce((s, l) => s + l.price * l.qty, 0);
    const count = cart.reduce((s, l) => s + l.qty, 0);
    return {
      cart,
      favorites,
      cartOpen,
      total,
      count,
      addToCart: (id, name, price, image) => {
        setCart((prev) => {
          const found = prev.find((l) => l.id === id);
          if (found) return prev.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l));
          return [...prev, { id, name, price, qty: 1, ...(image ? { image } : {}) }];
        });
        setCartOpen(true);
      },
      setQty: (id, qty) =>
        setCart((prev) =>
          qty <= 0
            ? prev.filter((l) => l.id !== id)
            : prev.map((l) => (l.id === id ? { ...l, qty } : l)),
        ),
      removeLine: (id) => setCart((prev) => prev.filter((l) => l.id !== id)),
      toggleFavorite: (id) =>
        setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id])),
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      toggleCart: () => setCartOpen((v) => !v),
    };
  }, [cart, favorites, cartOpen]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export const cedi = (n: number) => `GHC ${n.toLocaleString("en-US")}`;
