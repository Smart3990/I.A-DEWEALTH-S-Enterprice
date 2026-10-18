import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { storefrontQuery } from "./storefront";
import { catalogProducts, type CatalogProduct } from "./catalog";
import { EVENT_KEY, isLegacyOldProduct } from "./products-store";

/**
 * Products from the database (via the storefront query), identical on every device.
 * Falls back to the bundled catalogue only while nothing has loaded.
 */
export function useProducts(): CatalogProduct[] {
  const qc = useQueryClient();
  const { data } = useQuery(storefrontQuery);

  // An admin save in this tab refreshes the storefront straight away.
  useEffect(() => {
    const refresh = () => qc.invalidateQueries({ queryKey: ["storefront"] });
    window.addEventListener(EVENT_KEY, refresh);
    return () => window.removeEventListener(EVENT_KEY, refresh);
  }, [qc]);

  return useMemo(() => {
    const base = data?.products?.length ? data.products : catalogProducts;
    return base.filter((p) => !isLegacyOldProduct(p.id, p.name));
  }, [data?.products]);
}
