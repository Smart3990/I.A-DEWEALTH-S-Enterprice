import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { searchCatalog } from "@/data/search";
import { useProducts } from "@/data/use-catalog";
import { cedi } from "@/components/store";

export function HeaderSearch({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const allProducts = useProducts();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const results = term.trim().length >= 2 ? searchCatalog(term, 7, allProducts) : [];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (q: string) => {
    const value = q.trim();
    if (!value) return;
    setOpen(false);
    navigate({ to: "/search", search: { q: value } });
  };

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(term);
        }}
        className="relative flex w-full items-center overflow-hidden rounded-2xl border border-border/90 bg-card shadow-2xs transition focus-within:border-primary"
      >
        <div className="flex pl-3.5 pr-1 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          aria-label="Search"
          placeholder="Search..."
          className="w-full border-0 px-2 py-2 sm:py-2.5 font-body text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <button
          type="button"
          onClick={() => navigate({ to: "/categories" })}
          aria-label="Browse categories"
          className="flex p-2 text-muted-foreground hover:text-foreground transition mr-1"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
        <button
          type="submit"
          className="hidden sm:flex h-full shrink-0 items-center justify-center gap-1.5 bg-primary px-4 py-2 text-xs sm:text-sm font-bold text-primary-foreground transition hover:bg-primary-dark"
        >
          Search
        </button>
      </form>

      {open && term.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-xs text-muted-foreground">No product matched "{term}".</p>
          ) : (
            <>
              <ul className="max-h-[60vh] overflow-y-auto py-1">
                {results.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => submit(p.name)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-secondary"
                    >
                      <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold text-foreground">
                          {p.name}
                        </span>
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {p.spec}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs font-extrabold text-primary">
                        {cedi(p.price)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => submit(term)}
                className="w-full border-t border-border px-4 py-2.5 text-xs font-extrabold text-primary transition hover:bg-secondary"
              >
                See all results for "{term}"
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
