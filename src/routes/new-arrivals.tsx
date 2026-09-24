import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage } from "@/components/catalog/CollectionPage";

export const Route = createFileRoute("/new-arrivals")({
  head: () => ({
    meta: [
      { title: "New Arrivals | Freshly Landed Tech" },
      { name: "description", content: "The newest stock to reach our Accra showroom." },
      { property: "og:title", content: "New Arrivals | Freshly Landed Tech" },
      { property: "og:description", content: "The newest stock to reach our Accra showroom." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CollectionPage slug="new-arrivals" />,
});
