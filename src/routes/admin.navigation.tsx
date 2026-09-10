import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/kit";
import { SuperAdminOnly } from "@/components/admin/guard";

export const Route = createFileRoute("/admin/navigation")({
  component: () => (
    <SuperAdminOnly>
      <ResourceManager
        title="Navigation"
        description="The links shown in the site menu."
        table="nav_items"
        orderBy="sort_order"
        canWrite
        columns={[
          { key: "label", label: "Label" },
          { key: "path", label: "Link" },
          { key: "sort_order", label: "Order" },
          { key: "is_active", label: "Shown" },
        ]}
        fields={[
          { key: "label", label: "Label" },
          { key: "path", label: "Link (e.g. /deals)" },
          { key: "sort_order", label: "Sort order", type: "number" },
          { key: "is_active", label: "Show in menu", type: "bool", default: true },
        ]}
      />
    </SuperAdminOnly>
  ),
});
