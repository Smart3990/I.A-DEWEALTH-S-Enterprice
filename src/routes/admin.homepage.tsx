import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/kit";
import { SuperAdminOnly } from "@/components/admin/guard";

export const Route = createFileRoute("/admin/homepage")({
  component: () => (
    <SuperAdminOnly>
      <ResourceManager
        title="Homepage sections"
        description="Turn homepage sections on or off and change their wording."
        table="homepage_sections"
        orderBy="sort_order"
        canWrite
        columns={[
          { key: "key", label: "Section" },
          { key: "title", label: "Title" },
          { key: "item_limit", label: "Items" },
          { key: "sort_order", label: "Order" },
          { key: "is_active", label: "Shown" },
        ]}
        fields={[
          { key: "key", label: "Section key" },
          { key: "eyebrow", label: "Small label above title" },
          { key: "title", label: "Title", full: true },
          { key: "subtitle", label: "Subtitle", full: true },
          { key: "item_limit", label: "How many products", type: "number", default: 8 },
          { key: "sort_order", label: "Sort order", type: "number" },
          { key: "is_active", label: "Show on homepage", type: "bool", default: true },
        ]}
      />
    </SuperAdminOnly>
  ),
});
