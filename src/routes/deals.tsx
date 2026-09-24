import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage } from "@/components/catalog/CollectionPage";

export const Route = createFileRoute("/deals")({
  head: () => ({
    meta: [
      { title: "Super Deals | Biggest Discounts in Ghana" },
      {
        name: "description",
        content: "Every product with 20% off or more, updated as stock lands.",
      },
      { property: "og:title", content: "Super Deals | Biggest Discounts in Ghana" },
      {
        property: "og:description",
        content: "Every product with 20% off or more, updated as stock lands.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CollectionPage slug="deals" />,
});
