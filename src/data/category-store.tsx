import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import {
  categories as liveCategories,
  type Category,
  type CatalogProduct,
  catalogProducts,
  applyCatalogSnapshot,
  seedCategories,
} from "./catalog";
import { sendAdminChange } from "@/lib/admin-fetch";

const EVENT_KEY = "ia_categories_updated";

/**
 * The category list loaded from the database (kept in the shared catalogue snapshot).
 * A browser-local copy is never preferred: it made edits look saved on one device only.
 */
export function getCustomCategories(): Category[] {
  return liveCategories;
}

/** Updates the in-memory list so admin screens reflect an edit before the next reload. */
export function saveCategories(updated: Category[]) {
  applyCatalogSnapshot(updated, catalogProducts);
  window.dispatchEvent(new Event(EVENT_KEY));
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
  },
) {
  const current = getCustomCategories();
  const target = current.find((c) => c.id === id);
  const updated = current.map((c) => (c.id === id ? { ...c, ...bannerPatch } : c));
  saveCategories(updated);

  if (typeof window !== "undefined" && target) {
    void sendAdminChange(
      "/api/admin/categories",
      {
        method: "POST",
        body: JSON.stringify({
          id,
          banner_title: bannerPatch.bannerTitle ?? target.bannerTitle,
          banner_subtitle: bannerPatch.bannerSubtitle ?? target.bannerSubtitle,
          banner_image: bannerPatch.bannerImage ?? target.bannerImage,
          banner_cta: bannerPatch.bannerCTA ?? target.bannerCTA,
          name: bannerPatch.name ?? target.name,
          is_active: bannerPatch.isActive ?? target.isActive,
        }),
      },
      "Category banner was not saved to the database",
    );
  }
}

/**
 * Restores every category banner to the built-in image and copy, on the server.
 * Resolves with how many categories failed to save.
 */
export async function resetCategoriesToDefault(): Promise<number> {
  const defaults = new Map(seedCategories.map((c) => [c.id, c]));
  const targets = liveCategories.filter((c) => defaults.has(c.id));
  const results = await Promise.all(
    targets.map((c) => {
      const d = defaults.get(c.id)!;
      return sendAdminChange(
        "/api/admin/categories",
        {
          method: "POST",
          body: JSON.stringify({
            id: c.id,
            banner_title: d.bannerTitle,
            banner_subtitle: d.bannerSubtitle,
            banner_image: d.bannerImage,
            banner_cta: d.bannerCTA,
          }),
        },
        "",
        { quiet: true },
      );
    }),
  );
  saveCategories(
    liveCategories.map((c): Category => {
      const d = defaults.get(c.id);
      return d
        ? {
            ...c,
            bannerTitle: d.bannerTitle,
            bannerSubtitle: d.bannerSubtitle,
            bannerImage: d.bannerImage,
            ...(d.bannerCTA !== undefined ? { bannerCTA: d.bannerCTA } : {}),
          }
        : c;
    }),
  );
  return results.filter((ok) => !ok).length;
}

type CategoryTree = {
  all: Category[];
  active: Category[];
  roots: Category[];
  byId: (id: string) => Category | undefined;
  childrenOf: (id: string | null) => Category[];
  nonEmptyChildrenOf: (id: string | null, productPool?: CatalogProduct[]) => Category[];
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

  const nonEmptyChildrenOf = (id: string | null, productPool?: CatalogProduct[]) => {
    const pool = productPool ?? catalogProducts;
    return childrenOf(id).filter((cat) => {
      const ids = new Set(descendantIds(cat.id));
      return pool.some((p) => ids.has(p.categoryId));
    });
  };

  const resolvePath = (segments: string[]) => {
    if (!segments || !segments.length) return undefined;

    // 1. Try strict ancestor hierarchy walk first
    let parentId: string | null = null;
    let found: Category | undefined;
    let strictMatchSucceeded = true;

    for (const segment of segments) {
      found = active.find(
        (c) => (c.slug === segment || c.id === segment) && c.parentId === parentId,
      );
      if (!found) {
        strictMatchSucceeded = false;
        break;
      }
      parentId = found.id;
    }

    if (strictMatchSucceeded && found) {
      return found;
    }

    // 2. Fallback: match by the last segment against slug or id
    const lastSegment = segments[segments.length - 1];
    const directMatch = active.find((c) => c.slug === lastSegment || c.id === lastSegment);
    if (directMatch) return directMatch;

    // 3. Fallback: case-insensitive or name-based slug
    const normalized = lastSegment.toLowerCase().trim();
    return (
      active.find(
        (c) =>
          c.slug.toLowerCase() === normalized ||
          c.id.toLowerCase() === normalized ||
          c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === normalized,
      ) || all.find((c) => c.slug.toLowerCase() === normalized || c.id.toLowerCase() === normalized)
    );
  };

  return {
    all,
    active,
    roots: childrenOf(null),
    byId,
    childrenOf,
    nonEmptyChildrenOf,
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
    categories ? [] : liveCategories,
  );

  useEffect(() => {
    if (categories) return;
    setCustomList(getCustomCategories());
    const updateHandler = () => {
      setCustomList(getCustomCategories());
    };
    window.addEventListener(EVENT_KEY, updateHandler);
    return () => window.removeEventListener(EVENT_KEY, updateHandler);
  }, [categories]);

  const activeCategories = categories ?? customList;
  const value = useMemo(() => buildTree(activeCategories), [activeCategories]);
  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
}

export function useCategories() {
  const ctx = useContext(CategoryContext);
  return ctx ?? buildTree(getCustomCategories());
}
