import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage } from "@/components/catalog/CollectionPage";

export const Route = createFileRoute("/clearance")({
  head: () => ({
    meta: [
      { title: "Clearance | Final Stock, Lowest Prices" },
      { name: "description", content: "Last units at clearance prices. No restock once gone." },
      { property: "og:title", content: "Clearance | Final Stock, Lowest Prices" },
      {
        property: "og:description",
        content: "Last units at clearance prices. No restock once gone.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CollectionPage slug="clearance" />,
});
