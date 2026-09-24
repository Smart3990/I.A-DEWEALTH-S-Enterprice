import { Link } from "@tanstack/react-router";
import {
  Smartphone,
  Laptop,
  Headphones,
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Tag,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { useCategories } from "@/data/category-store";
import { CategoryLink } from "@/components/catalog/CategoryLink";

function getCategoryIcon(id: string, iconName?: string): LucideIcon {
  const key = `${id} ${iconName || ""}`.toLowerCase();
  if (key.includes("phone") || key.includes("tablet") || key.includes("handset")) {
    return Smartphone;
  }
  if (key.includes("comp") || key.includes("laptop") || key.includes("pc")) {
    return Laptop;
  }
  if (
    key.includes("audio") ||
    key.includes("gadget") ||
    key.includes("sound") ||
    key.includes("headphone") ||
    key.includes("earbud")
  ) {
    return Headphones;
  }
  if (
    key.includes("kitchen") ||
    key.includes("appliance") ||
    key.includes("cook") ||
    key.includes("fryer") ||
    key.includes("blender")
  ) {
    return UtensilsCrossed;
  }
  if (key.includes("car") || key.includes("vehicle") || key.includes("motor")) {
    return Car;
  }
  if (
    key.includes("access") ||
    key.includes("bag") ||
    key.includes("pack") ||
    key.includes("watch")
  ) {
    return ShoppingBag;
  }
  return Tag;
}

export function HomeCategories() {
  const { roots } = useCategories();

  if (!roots.length) return null;

  return (
    <section
      id="home-categories"
      className="block md:hidden w-full bg-card py-4 border-b border-border/70"
    >
      <div className="mx-auto max-w-container-max px-3 sm:px-4 lg:px-6">
        <div className="mb-3 sm:mb-4 flex items-center justify-between">
          <h2 className="text-base sm:text-xl font-black tracking-tight text-foreground">
            Categories
          </h2>
          <Link
            to="/categories"
            className="inline-flex items-center gap-0.5 text-xs font-bold text-primary hover:text-primary-dark transition active:scale-95"
            aria-label="See all categories"
          >
            <span>See All</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Horizontal scrollable row of categories on mobile: icons on mobile view, actual images on tablet/desktop */}
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none sm:grid sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 sm:overflow-visible">
          {roots.map((cat) => {
            const Icon = getCategoryIcon(cat.id, cat.icon);

            return (
              <CategoryLink
                key={cat.id}
                id={cat.id}
                className="group flex flex-col items-center shrink-0 w-[72px] sm:w-auto text-center focus-visible:outline-none"
              >
                {/* Mobile view only: use icons to represent the category */}
                <div className="flex sm:hidden h-14 w-14 rounded-2xl bg-primary/10 text-primary border border-primary/20 items-center justify-center transition duration-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105 shadow-2xs">
                  <Icon className="h-6 w-6 stroke-[2]" />
                </div>

                {/* Tablet / larger view: fallback thumbnail */}
                <div className="hidden sm:flex h-20 w-20 rounded-2xl bg-surface border border-border/80 p-1 items-center justify-center overflow-hidden transition duration-300 group-hover:border-primary group-hover:shadow-md group-hover:-translate-y-0.5">
                  <img
                    src={cat.bannerImage}
                    alt={cat.name}
                    loading="lazy"
                    className="h-full w-full object-cover rounded-xl transition duration-300 group-hover:scale-110"
                  />
                </div>

                <span className="mt-1.5 text-[11px] sm:text-xs font-bold text-foreground leading-tight line-clamp-1 max-w-[72px] sm:max-w-[96px] group-hover:text-primary transition">
                  {cat.name}
                </span>
              </CategoryLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}
