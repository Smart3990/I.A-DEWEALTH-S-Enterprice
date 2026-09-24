import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/admin/categories")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin
            .from("categories")
            .select("*")
            .order("sort_order", { ascending: true });

          if (error) {
            console.error("[API Categories GET Error]:", error);
            return Response.json({ error: error.message, categories: [] }, { status: 500 });
          }

          return Response.json({ categories: data || [] });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Failed to load categories";
          console.error("[API Categories GET Exception]:", err);
          return Response.json({ error: message, categories: [] }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          if (!body || !body.id) {
            return Response.json({ error: "Category ID is required" }, { status: 400 });
          }

          const id = String(body.id).trim();
          const nowIso = new Date().toISOString();

          // Prepare category database payload
          const payload: Record<string, unknown> = {
            id,
            updated_at: nowIso,
          };

          if (body.name !== undefined) payload.name = String(body.name).trim();
          if (body.slug !== undefined) payload.slug = String(body.slug).trim();
          if (body.parent_id !== undefined || body.parentId !== undefined) {
            payload.parent_id = body.parent_id ?? body.parentId ?? null;
          }
          if (body.description !== undefined) payload.description = String(body.description).trim();
          if (body.banner_image !== undefined || body.bannerImage !== undefined) {
            payload.banner_image = String(body.banner_image ?? body.bannerImage ?? "").trim();
          }
          if (body.banner_title !== undefined || body.bannerTitle !== undefined) {
            payload.banner_title = String(body.banner_title ?? body.bannerTitle ?? "").trim();
          }
          if (body.banner_subtitle !== undefined || body.bannerSubtitle !== undefined) {
            payload.banner_subtitle = String(
              body.banner_subtitle ?? body.bannerSubtitle ?? "",
            ).trim();
          }
          if (body.banner_cta !== undefined || body.bannerCTA !== undefined) {
            payload.banner_cta = String(body.banner_cta ?? body.bannerCTA ?? "Shop now").trim();
          }
          if (body.icon !== undefined) payload.icon = String(body.icon).trim();
          if (body.sort_order !== undefined || body.sortOrder !== undefined) {
            payload.sort_order = Number(body.sort_order ?? body.sortOrder) || 0;
          }
          if (body.is_active !== undefined || body.isActive !== undefined) {
            payload.is_active = Boolean(body.is_active ?? body.isActive);
          }

          const { data, error } = await supabaseAdmin
            .from("categories")
            .upsert(payload)
            .select()
            .single();

          if (error) {
            console.error("[API Categories POST Error]:", error);
            return Response.json({ error: error.message }, { status: 500 });
          }

          return Response.json({ success: true, category: data });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Failed to save category";
          console.error("[API Categories POST Exception]:", err);
          return Response.json({ error: message }, { status: 500 });
        }
      },

      DELETE: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const id = url.searchParams.get("id");
          if (!id) {
            return Response.json({ error: "Category ID parameter is required" }, { status: 400 });
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin.from("categories").delete().eq("id", id);

          if (error) {
            console.error("[API Categories DELETE Error]:", error);
            return Response.json({ error: error.message }, { status: 500 });
          }

          return Response.json({ success: true, deletedId: id });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Failed to delete category";
          console.error("[API Categories DELETE Exception]:", err);
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
