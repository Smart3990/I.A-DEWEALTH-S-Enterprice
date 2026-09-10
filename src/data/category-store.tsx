import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import { categories as liveCategories, type Category } from "./catalog";

const STORAGE_KEY = "ia_admin_categories";
const EVENT_KEY = "ia_categories_updated";

export function getCustomCategories(): Category[] {
  if (typeof window === "undefined") return liveCategories;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return liveCategories;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : liveCategories;
  } catch {
    return liveCategories;
  }
}

export function saveCategories(updated: Category[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(EVENT_KEY));
  } catch (e) {
    console.error("Failed to save categories:", e);
  }
}

export function updateCategoryBanner(
  id: string,
  bannerPatch: {
    bannerTitle?: string;
    bannerSubtitle?: string;
    bannerImage?: string;
    bannerCTA?: string;
    name?: string;
    isActive?: boolean;
  }
) {
  const current = getCustomCategories();
  const updated = current.map((c) => (c.id === id ? { ...c, ...bannerPatch } : c));
  saveCategories(updated);
}

export function resetCategoriesToDefault() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(EVENT_KEY));
  } catch (e) {
    console.error("Failed to reset categories:", e);
  }
}

type CategoryTree = {
  all: Category[];
  active: Category[];
  roots: Category[];
  byId: (id: string) => Category | undefined;
  childrenOf: (id: string | null) => Category[];
  ancestorsOf: (id: string) => Category[];
  descendantIds: (id: string) => string[];
  pathOf: (id: string) => string;
  resolvePath: (segments: string[]) => Category | undefined;
};

const CategoryContext = createContext<CategoryTree | null>(null);

function sortTree(list: Category[]) {
  return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function buildTree(all: Category[]): CategoryTree {
  const active = all.filter((c) => c.isActive);

  const byId = (id: string) => all.find((c) => c.id === id);
  const childrenOf = (id: string | null) => sortTree(active.filter((c) => c.parentId === id));

  const ancestorsOf = (id: string) => {
    const chain: Category[] = [];
    let current = byId(id);
    let guard = 0;
    while (current && guard++ < 12) {
      chain.unshift(current);
      current = current.parentId ? byId(current.parentId) : undefined;
    }
    return chain;
  };

  const descendantIds = (id: string): string[] => {
    const out = [id];
    for (const child of childrenOf(id)) out.push(...descendantIds(child.id));
    return out;
  };

  const resolvePath = (segments: string[]) => {
    let parentId: string | null = null;
    let found: Category | undefined;
    for (const segment of segments) {
      found = active.find((c) => c.slug === segment && c.parentId === parentId);
      if (!found) return undefined;
      parentId = found.id;
    }
    return found;
  };

  return {
    all,
    active,
    roots: childrenOf(null),
    byId,
    childrenOf,
    ancestorsOf,
    descendantIds,
    pathOf: (id) =>
      `/category/${ancestorsOf(id)
        .map((c) => c.slug)
        .join("/")}`,
    resolvePath,
  };
}

export function CategoryProvider({
  categories,
  children,
}: {
  categories?: Category[];
  children: ReactNode;
}) {
  const [customList, setCustomList] = useState<Category[]>(() =>
    categories ?? getCustomCategories(),
  );

  useEffect(() => {
    if (categories) {
      setCustomList(categories);
      return;
    }
    const updateHandler = () => {
      setCustomList(getCustomCategories());
    };
    window.addEventListener(EVENT_KEY, updateHandler);
    return () => window.removeEventListener(EVENT_KEY, updateHandler);
  }, [categories]);

  const value = useMemo(() => buildTree(customList), [customList]);
  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
}

export function useCategories() {
  const ctx = useContext(CategoryContext);
  return ctx ?? buildTree(getCustomCategories());
}
