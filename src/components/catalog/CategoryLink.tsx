import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useCategories } from "@/data/category-store";

/** Type-safe link into the dynamic /category/* route. */
export function CategoryLink({
  id,
  className,
  children,
  ...rest
}: {
  id: string;
  className?: string;
  children: ReactNode;
  [key: string]: unknown;
}) {
  const { ancestorsOf } = useCategories();
  const splat = ancestorsOf(id)
    .map((c) => c.slug)
    .join("/");

  return (
    <Link to="/category/$" params={{ _splat: splat }} className={className} {...rest}>
      {children}
    </Link>
  );
}

export const discoverLinks = [
  { to: "/deals", name: "Super Deals" },
  { to: "/top-picks", name: "Top Picks" },
  { to: "/new-arrivals", name: "New Arrivals" },
  { to: "/best-sellers", name: "Best Sellers" },
  { to: "/clearance", name: "Clearance" },
] as const;
