import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { storefrontQuery } from "./storefront";
import { catalogProducts, type CatalogProduct } from "./catalog";
import { EVENT_KEY, getCombinedCatalogProducts } from "./products-store";

/** Products saved by the admin and fetched from Supabase, falling back to the bundled catalogue. */
export function useProducts(): CatalogProduct[] {
  const qc = useQueryClient();
  const { data } = useQuery(storefrontQuery);
  const [localVersion, setLocalVersion] = useState(0);

  useEffect(() => {
    const handleUpdate = () => {
      setLocalVersion((v) => v + 1);
      qc.invalidateQueries({ queryKey: ["storefront"] });
    };
    window.addEventListener(EVENT_KEY, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(EVENT_KEY, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [qc]);

  return useMemo(() => {
    const base =
      data?.products !== undefined && Array.isArray(data.products) && data.products.length > 0
        ? data.products
        : catalogProducts;
    return getCombinedCatalogProducts(base);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.products, localVersion]);
}
