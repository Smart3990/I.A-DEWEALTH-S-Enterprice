import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage } from "@/components/catalog/CollectionPage";

export const Route = createFileRoute("/best-sellers")({
  head: () => ({
    meta: [
      { title: "Best Sellers | What Ghana Is Buying" },
      { name: "description", content: "Ranked by units sold across every category." },
      { property: "og:title", content: "Best Sellers | What Ghana Is Buying" },
      { property: "og:description", content: "Ranked by units sold across every category." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CollectionPage slug="best-sellers" />,
});
