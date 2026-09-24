import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutGrid, Zap, Heart, ShoppingBag } from "lucide-react";
import { useStore } from "./store";

export function MobileBottomNav() {
  const { count, favorites, openCart } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Hide bottom nav if user is inside the admin panel
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    {
      to: "/",
      label: "Home",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      to: "/categories",
      label: "Categories",
      icon: LayoutGrid,
      isActive: pathname.startsWith("/categories") || pathname.startsWith("/category"),
    },
    {
      to: "/deals",
      label: "Deals",
      icon: Zap,
      badge: "HOT",
      isActive: pathname.includes("/deals"),
    },
    {
      to: "/favorites",
      label: "Saved",
      icon: Heart,
      count: favorites.length,
      isActive: pathname === "/favorites",
    },
    {
      to: "/cart",
      label: "Cart",
      icon: ShoppingBag,
      count: count,
      isActive: pathname === "/cart",
      onClick: (e: React.MouseEvent) => {
        if (pathname !== "/cart") {
          e.preventDefault();
          openCart();
        }
      },
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom App Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-card/95 backdrop-blur-lg md:hidden"
      style={{
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="mx-auto flex h-14 max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.label}
              to={item.to}
              onClick={item.onClick}
              className={`relative flex flex-1 flex-col items-center justify-center py-1 text-center transition-colors active:scale-90 select-none ${
                active ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform ${active ? "scale-110 text-primary" : ""}`}
                  strokeWidth={active ? 2.5 : 2}
                />
                {/* Number Badge for cart or favorites */}
                {typeof item.count === "number" && item.count > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white shadow-xs">
                    {item.count > 99 ? "99+" : item.count}
                  </span>
                )}
                {/* Promo Badge for Deals */}
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3 flex items-center justify-center rounded-full bg-deal px-1 py-0.2 text-[8px] font-black tracking-tighter text-white uppercase shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-0.5 text-[10px] tracking-tight leading-tight">{item.label}</span>
              {/* Active Indicator bar */}
              {active && <span className="absolute top-0 h-0.5 w-6 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
