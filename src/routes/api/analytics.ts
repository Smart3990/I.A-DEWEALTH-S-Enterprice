import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// public.page_views comes from the page_views migration and is not in the generated types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function pageViews(): Promise<any> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabaseAdmin as any).from("page_views");
}

const MAX_DAYS = 400;

export const Route = createFileRoute("/api/analytics")({
  server: {
    handlers: {
      // Public: the storefront records one row per page view.
      POST: async ({ request }) => {
        try {
          const parsed = z
            .object({
              path: z.string().trim().min(1).max(300),
              title: z.string().trim().max(200).optional(),
              visitorId: z.string().trim().max(64).optional(),
              category: z.string().trim().max(120).optional(),
              productId: z.string().trim().max(120).optional(),
            })
            .safeParse(await request.json().catch(() => null));
          if (!parsed.success || parsed.data.path.startsWith("/admin")) {
            return Response.json({ ok: false }, { status: 400 });
          }
          const v = parsed.data;
          const { error } = await (
            await pageViews()
          ).insert({
            path: v.path,
            title: v.title ?? v.path,
            visitor_id: v.visitorId ?? "",
            category: v.category ?? null,
            product_id: v.productId ?? null,
          });
          if (error) {
            // Until the page_views migration is run, skip quietly instead of erroring on
            // every storefront page load.
            if (error.code === "PGRST205" || error.code === "42P01") {
              return Response.json({ ok: false, skipped: "page_views table not set up" });
            }
            return Response.json({ ok: false, error: error.message }, { status: 500 });
          }
          return Response.json({ ok: true });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to record visit";
          return Response.json({ ok: false, error: msg }, { status: 500 });
        }
      },

      // Admins: raw visits for the dashboard to aggregate.
      GET: async ({ request }) => {
        try {
          const { requireAdminRequest } = await import("@/lib/admin-guard.server");
          const caller = await requireAdminRequest(request);
          if (caller instanceof Response) return caller;

          const url = new URL(request.url);
          const days = Math.min(MAX_DAYS, Math.max(1, Number(url.searchParams.get("days")) || 30));
          const since = new Date(Date.now() - days * 86_400_000).toISOString();
          const { data, error } = await (
            await pageViews()
          )
            .select("path, title, visitor_id, category, product_id, created_at")
            .gte("created_at", since)
            .order("created_at", { ascending: false })
            .limit(20000);
          if (error) return Response.json({ error: error.message, visits: [] }, { status: 500 });

          const visits = (data ?? []).map(
            (r: {
              path: string;
              title: string;
              visitor_id: string;
              category: string | null;
              product_id: string | null;
              created_at: string;
            }) => ({
              path: r.path,
              title: r.title,
              visitorId: r.visitor_id || undefined,
              category: r.category ?? undefined,
              productId: r.product_id ?? undefined,
              timestamp: new Date(r.created_at).getTime(),
            }),
          );
          return Response.json({ visits });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to load analytics";
          return Response.json({ error: msg, visits: [] }, { status: 500 });
        }
      },
    },
  },
});
