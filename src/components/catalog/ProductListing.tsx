import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { discountOf, type CatalogProduct } from "@/data/catalog";
import { CatalogProductCard } from "./ProductCard";

const PAGE_SIZE = 12;

const sorts = {
  recommended: {
    label: "Recommended",
    fn: (a: CatalogProduct, b: CatalogProduct) => b.rating * b.sold - a.rating * a.sold,
  },
  newest: {
    label: "Newest",
    fn: (a: CatalogProduct, b: CatalogProduct) => b.addedAt.localeCompare(a.addedAt),
  },
  "price-asc": {
    label: "Price: Low to High",
    fn: (a: CatalogProduct, b: CatalogProduct) => a.price - b.price,
  },
  "price-desc": {
    label: "Price: High to Low",
    fn: (a: CatalogProduct, b: CatalogProduct) => b.price - a.price,
  },
  "best-rated": {
    label: "Best Rated",
    fn: (a: CatalogProduct, b: CatalogProduct) => b.rating - a.rating,
  },
  popular: { label: "Most Popular", fn: (a: CatalogProduct, b: CatalogProduct) => b.sold - a.sold },
  discount: {
    label: "Biggest Discount",
    fn: (a: CatalogProduct, b: CatalogProduct) => discountOf(b) - discountOf(a),
  },
} as const;

type SortKey = keyof typeof sorts;

function unique<T extends string>(values: T[]) {
  return Array.from(new Set(values)).sort();
}

function CheckGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  if (options.length < 2) return null;
  return (
    <div className="border-t border-border pt-4">
      <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-foreground">
        {title}
      </p>
      <div className="flex max-h-44 flex-col gap-1.5 overflow-y-auto pr-1">
        {options.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground"
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onToggle(option)}
              className="h-3.5 w-3.5 accent-[hsl(var(--primary))]"
            />
            <span className="hover:text-foreground">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function ProductListing({
  products,
  emptyNote,
}: {
  products: CatalogProduct[];
  emptyNote?: string;
}) {
  const bounds = useMemo(() => {
    if (!products.length) return { min: 0, max: 0 };
    const prices = products.map((p) => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  const [maxPrice, setMaxPrice] = useState(bounds.max);
  const [brands, setBrands] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [sellers, setSellers] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Reset when the listing changes (e.g. navigating to another category).
  useEffect(() => {
    setMaxPrice(bounds.max);
    setBrands([]);
    setConditions([]);
    setAvailability([]);
    setSellers([]);
    setMinRating(0);
    setVisible(PAGE_SIZE);
  }, [bounds.max, products]);

  const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (value: string) =>
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  const filtered = useMemo(() => {
    const list = products.filter(
      (p) =>
        p.price <= maxPrice &&
        p.rating >= minRating &&
        (brands.length === 0 || brands.includes(p.brand)) &&
        (conditions.length === 0 || conditions.includes(p.condition)) &&
        (availability.length === 0 || availability.includes(p.availability)) &&
        (sellers.length === 0 || sellers.includes(p.seller)),
    );
    return list.sort(sorts[sort].fn);
  }, [products, maxPrice, minRating, brands, conditions, availability, sellers, sort]);

  const shown = filtered.slice(0, visible);

  const filterPanel = (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4">
      <p className="flex items-center gap-2 text-sm font-extrabold text-foreground">
        <SlidersHorizontal className="h-4 w-4 text-primary" /> Filters
      </p>

      <div>
        <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-foreground">
          Max Price
        </p>
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={Math.max(1, Math.round((bounds.max - bounds.min) / 60) || 1)}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[hsl(var(--primary))]"
          aria-label="Maximum price"
        />
        <p className="text-xs text-muted-foreground">
          GHC {bounds.min.toLocaleString()} – GHC {maxPrice.toLocaleString()}
        </p>
      </div>

      <div className="border-t border-border pt-4">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-foreground">
          Rating
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[0, 4, 4.5, 4.8].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={`rounded-full border px-3 py-1 text-xs font-bold transition ${
                minRating === r
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:border-primary"
              }`}
            >
              {r === 0 ? "Any" : `${r}+`}
            </button>
          ))}
        </div>
      </div>

      <CheckGroup
        title="Brand"
        options={unique(products.map((p) => p.brand))}
        selected={brands}
        onToggle={toggle(setBrands)}
      />
      <CheckGroup
        title="Condition"
        options={unique(products.map((p) => p.condition))}
        selected={conditions}
        onToggle={toggle(setConditions)}
      />
      <CheckGroup
        title="Availability"
        options={unique(products.map((p) => p.availability))}
        selected={availability}
        onToggle={toggle(setAvailability)}
      />
      <CheckGroup
        title="Seller / Store"
        options={unique(products.map((p) => p.seller))}
        selected={sellers}
        onToggle={toggle(setSellers)}
      />
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" /> {filtersOpen ? "Hide filters" : "Show filters"}
        </button>
        <div className={filtersOpen ? "block" : "hidden lg:block"}>{filterPanel}</div>
      </aside>

      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{filtered.length}</span> product
            {filtered.length === 1 ? "" : "s"}
          </p>
          <label className="flex items-center gap-2 text-xs font-bold">
            Sort by
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortKey);
                setVisible(PAGE_SIZE);
              }}
              className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
            >
              {Object.entries(sorts).map(([key, s]) => (
                <option key={key} value={key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {shown.length ? (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((p) => (
                <CatalogProductCard key={p.id} product={p} />
              ))}
            </div>
            {visible < filtered.length && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="rounded-full bg-primary px-8 py-3.5 text-sm font-extrabold text-primary-foreground shadow-lg transition hover:bg-primary-dark"
                >
                  Load more ({filtered.length - visible} left)
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            {emptyNote ??
              "No products match these filters yet. Try widening your price or brand selection."}
          </p>
        )}
      </div>
    </div>
  );
}
