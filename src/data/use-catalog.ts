import { useQuery } from "@tanstack/react-query";
import { storefrontQuery } from "./storefront";
import { catalogProducts, type CatalogProduct } from "./catalog";

/** Products saved by the admin, falling back to the bundled catalogue. */
export function useProducts(): CatalogProduct[] {
  const { data } = useQuery(storefrontQuery);
  return data?.products.length ? data.products : catalogProducts;
}
