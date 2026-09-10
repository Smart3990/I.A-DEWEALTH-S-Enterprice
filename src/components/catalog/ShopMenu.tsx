import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { useCategories } from "@/data/category-store";
import { CategoryLink, discoverLinks } from "./CategoryLink";

/** Desktop hover mega-menu + mobile expandable drawer, driven by the category tree. */
export function ShopMenu() {
  const { roots, childrenOf } = useCategories();
  const [openId, setOpenId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expanded, setExpanded] = useState<string[]>([]);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Close everything on navigation.
  useEffect(() => {
    setOpenId(null);
    setDrawerOpen(false);
  }, [pathname]);

  const open = (id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenId(id);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenId(null), 140);
  };

  const toggleExpanded = (id: string) =>
    setExpanded((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));

  return (
    <div className="relative bg-nav text-nav-foreground">
      <div className="mx-auto max-w-container-max px-4 lg:px-6">
        <nav
          aria-label="Shop categories"
          className="flex items-center justify-center gap-3 py-2.5 text-xs font-medium tracking-wide lg:gap-6 lg:text-[13px]"
          onMouseLeave={scheduleClose}
        >
          {/* Mobile drawer trigger */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
            className="flex items-center gap-2 font-bold transition hover:text-primary lg:hidden"
          >
            <Menu className="h-5 w-5" /> All Categories
          </button>

          <div className="hidden flex-wrap items-center justify-center gap-1 lg:flex">
            {roots.map((root) => {
              const groups = childrenOf(root.id);
              const isOpen = openId === root.id;
              return (
                <div
                  key={root.id}
                  className="relative"
                  onMouseEnter={() => open(root.id)}
                  onFocus={() => open(root.id)}
                >
                  <CategoryLink
                    id={root.id}
                    aria-haspopup={groups.length > 0}
                    aria-expanded={isOpen}
                    className={`flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 font-semibold transition ${
                      isOpen ? "bg-white/10 text-primary" : "hover:text-primary"
                    }`}
                  >
                    {root.name}
                    {groups.length > 0 && <ChevronDown className="h-3.5 w-3.5 opacity-70" />}
                  </CategoryLink>

                  {isOpen && groups.length > 0 && (
                    <div
                      onMouseEnter={() => open(root.id)}
                      onMouseLeave={scheduleClose}
                      className="absolute left-0 top-full z-50 mt-1 w-max max-w-[min(90vw,720px)] rounded-xl border border-border bg-card p-4 text-foreground shadow-2xl"
                    >
                      <div
                        className={`grid gap-x-8 gap-y-4 ${
                          groups.length > 8
                            ? "grid-cols-3"
                            : groups.length > 4
                              ? "grid-cols-2"
                              : "grid-cols-1"
                        }`}
                      >
                        {groups.map((group) => {
                          const kids = childrenOf(group.id);
                          return (
                            <div key={group.id} className="min-w-[160px]">
                              <CategoryLink
                                id={group.id}
                                className="block truncate text-[13px] font-extrabold text-foreground transition hover:text-primary"
                              >
                                {group.name}
                              </CategoryLink>
                              {kids.length > 0 && (
                                <ul className="mt-2 space-y-1.5 border-l border-border pl-3">
                                  {kids.map((kid) => (
                                    <li key={kid.id}>
                                      <CategoryLink
                                        id={kid.id}
                                        className="block truncate text-xs text-muted-foreground transition hover:text-primary"
                                      >
                                        {kid.name}
                                      </CategoryLink>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-card text-foreground shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <span className="text-sm font-extrabold">Shop by category</span>
              <button aria-label="Close menu" onClick={() => setDrawerOpen(false)} className="p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-3">
              {roots.map((root) => {
                const groups = childrenOf(root.id);
                const isOpen = expanded.includes(root.id);
                return (
                  <div key={root.id} className="border-b border-border/70">
                    <div className="flex items-center">
                      <CategoryLink id={root.id} className="flex-1 px-3 py-3.5 text-sm font-bold">
                        {root.name}
                      </CategoryLink>
                      {groups.length > 0 && (
                        <button
                          aria-label={`${isOpen ? "Collapse" : "Expand"} ${root.name}`}
                          aria-expanded={isOpen}
                          onClick={() => toggleExpanded(root.id)}
                          className="p-3"
                        >
                          <ChevronRight
                            className={`h-4 w-4 transition ${isOpen ? "rotate-90" : ""}`}
                          />
                        </button>
                      )}
                    </div>

                    {isOpen && (
                      <div className="pb-2 pl-4">
                        {groups.map((group) => {
                          const kids = childrenOf(group.id);
                          const kidsOpen = expanded.includes(group.id);
                          return (
                            <div key={group.id}>
                              <div className="flex items-center">
                                <CategoryLink
                                  id={group.id}
                                  className="flex-1 px-3 py-2.5 text-sm font-semibold"
                                >
                                  {group.name}
                                </CategoryLink>
                                {kids.length > 0 && (
                                  <button
                                    aria-label={`${kidsOpen ? "Collapse" : "Expand"} ${group.name}`}
                                    aria-expanded={kidsOpen}
                                    onClick={() => toggleExpanded(group.id)}
                                    className="p-3"
                                  >
                                    <ChevronRight
                                      className={`h-3.5 w-3.5 transition ${kidsOpen ? "rotate-90" : ""}`}
                                    />
                                  </button>
                                )}
                              </div>
                              {kidsOpen &&
                                kids.map((kid) => (
                                  <CategoryLink
                                    key={kid.id}
                                    id={kid.id}
                                    className="block py-2 pl-6 pr-3 text-xs text-muted-foreground"
                                  >
                                    {kid.name}
                                  </CategoryLink>
                                ))}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              <p className="px-3 pb-2 pt-4 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Discover
              </p>
              {discoverLinks.map((c) => (
                <Link key={c.to} to={c.to} className="block px-3 py-2.5 text-sm font-semibold">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
