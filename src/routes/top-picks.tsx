import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage } from "@/components/catalog/CollectionPage";

export const Route = createFileRoute("/top-picks")({
  head: () => ({
    meta: [
      { title: "Top Picks | Recommended by I.A Dewealth" },
      { name: "description", content: "The products our team tests, trusts and recommends first." },
      { property: "og:title", content: "Top Picks | Recommended by I.A Dewealth" },
      {
        property: "og:description",
        content: "The products our team tests, trusts and recommends first.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CollectionPage slug="top-picks" />,
});
