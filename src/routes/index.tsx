import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/Hero";
import { HomeCategories } from "@/components/HomeCategories";
import { SuperDeals } from "@/components/SuperDeals";
import { HomeAllProducts } from "@/components/HomeAllProducts";
import { CustomerReviews } from "@/components/CustomerReviews";
import { storefrontQuery } from "@/data/storefront";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(storefrontQuery);
    } catch {
      // ignore
    }
  },
  head: () => ({
    meta: [
      { title: "I.A Dewealth's Enterprise | Authentic Tech & Gadgets in Ghana" },
      {
        name: "description",
        content:
          "Direct-import earbuds, GaN fast chargers, smartwatches, hubs and kitchen appliances with same-day Accra delivery and WhatsApp checkout.",
      },
      {
        property: "og:title",
        content: "I.A Dewealth's Enterprise | Authentic Tech & Gadgets in Ghana",
      },
      {
        property: "og:description",
        content:
          "Genuine tech at direct import prices. Same-day Accra delivery, nationwide VIP courier, instant WhatsApp checkout.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <Hero />
      <HomeCategories />
      <SuperDeals />
      <HomeAllProducts />
      <CustomerReviews />
    </main>
  );
}
