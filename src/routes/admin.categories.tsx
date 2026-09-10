import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResourceManager, type Field } from "@/components/admin/kit";

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesAdmin,
});

function CategoriesAdmin() {
  const { data: categories = [] } = useQuery({
    queryKey: ["admin", "category-options"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id, name").order("name");
      return data ?? [];
    },
  });

  const fields: Field[] = [
    { key: "name", label: "Category name" },
    { key: "slug", label: "URL slug" },
    {
      key: "parent_id",
      label: "Parent category",
      type: "select",
      options: categories.map((c) => ({ value: c.id, label: c.name })),
    },
    { key: "icon", label: "Icon name" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "banner_image", label: "Banner image URL", full: true },
    { key: "banner_title", label: "Banner title" },
    { key: "banner_subtitle", label: "Banner subtitle" },
    { key: "banner_cta", label: "Button text", default: "Shop now" },
    { key: "sort_order", label: "Sort order", type: "number" },
    { key: "is_active", label: "Visible on site", type: "bool", default: true },
  ];

  return (
    <ResourceManager
      title="Categories"
      description="Organise the shop menu and category pages."
      table="categories"
      orderBy="sort_order"
      idField="id"
      newIdLabel="Category ID (lowercase, no spaces)"
      canWrite
      columns={[
        { key: "name", label: "Name" },
        { key: "parent_id", label: "Parent" },
        { key: "sort_order", label: "Order" },
        { key: "is_active", label: "Visible" },
      ]}
      fields={fields}
    />
  );
}
