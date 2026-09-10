import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, Search } from "lucide-react";
import { searchCatalog } from "@/data/search";
import { cedi } from "@/components/store";

export function HeaderSearch() {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const results = term.trim().length >= 2 ? searchCatalog(term, 7) : [];

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
    <div ref={boxRef} className="relative">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(term);
        }}
        className="relative flex w-full items-center overflow-hidden rounded-full border-2 border-border bg-card shadow-sm transition focus-within:border-primary"
      >
        <button
          type="button"
          className="hidden items-center gap-1 whitespace-nowrap border-r border-border bg-secondary px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted sm:flex"
        >
          All <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
        <input
          type="text"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          aria-label="Search for any product"
          placeholder="Search for any product"
          className="w-full border-0 px-4 py-2.5 font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none md:text-sm"
        />
        <button
          type="submit"
          className="flex h-full shrink-0 items-center justify-center gap-1.5 bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark"
        >
          <Search className="h-5 w-5" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </form>

      {open && term.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {results.length === 0 ? (
            <p className="px-4 py-4 text-xs text-muted-foreground">No product matched "{term}".</p>
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
