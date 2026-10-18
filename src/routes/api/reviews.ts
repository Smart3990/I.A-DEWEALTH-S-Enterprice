import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export interface ApiReview {
  id: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  product?: string;
  status: "pending" | "approved" | "rejected";
  helpfulCount: number;
  initials: string;
  createdAt: string;
}

type ReviewRow = {
  id: string;
  name: string;
  location: string;
  rating: number;
  title: string;
  comment: string;
  product: string;
  status: ApiReview["status"];
  helpful_count: number;
  created_at: string;
};

// The reviews table is created by the align_schema_with_app migration; it is not in the
// generated Database types yet, so it is queried through an untyped handle.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function reviewsTable(): Promise<any> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabaseAdmin as any).from("reviews");
}

function initialsOf(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 2) || "CU"
  );
}

function relativeDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return "1 month ago";
  return `${Math.floor(days / 30)} months ago`;
}

function toApiReview(row: ReviewRow): ApiReview {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    rating: row.rating,
    date: relativeDate(row.created_at),
    title: row.title,
    comment: row.comment,
    product: row.product,
    status: row.status,
    helpfulCount: row.helpful_count,
    initials: initialsOf(row.name),
    createdAt: row.created_at,
  };
}

export const Route = createFileRoute("/api/reviews")({
  server: {
    handlers: {
      // Public: approved reviews only. Administrators (with a token) see every status.
      GET: async ({ request }) => {
        try {
          let isAdmin = false;
          if (request.headers.get("authorization")) {
            const { requireAdminRequest } = await import("@/lib/admin-guard.server");
            isAdmin = !((await requireAdminRequest(request)) instanceof Response);
          }

          let query = (await reviewsTable())
            .select("*")
            .order("created_at", { ascending: false })
            .limit(500);
          if (!isAdmin) query = query.eq("status", "approved");

          const { data, error } = await query;
          if (error) return Response.json({ error: error.message, reviews: [] }, { status: 500 });
          return Response.json({ reviews: (data ?? []).map(toApiReview) });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to load reviews";
          return Response.json({ error: msg, reviews: [] }, { status: 500 });
        }
      },

      // Public: customers submit reviews, which wait for admin approval.
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const parsed = z
            .object({
              name: z.string().trim().min(1, "Name is required").max(80),
              location: z.string().trim().max(80).optional(),
              rating: z.number().int().min(1).max(5).default(5),
              title: z.string().trim().max(120).optional(),
              comment: z.string().trim().min(1, "Review comment is required").max(2000),
              product: z.string().trim().max(120).optional(),
            })
            .safeParse(body);

          if (!parsed.success) {
            return Response.json(
              { error: parsed.error.issues[0]?.message ?? "Invalid input" },
              { status: 400 },
            );
          }

          const { name, location, rating, title, comment, product } = parsed.data;
          const { data, error } = await (
            await reviewsTable()
          )
            .insert({
              id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              name,
              location: location || "Accra, Ghana",
              rating,
              title: title || "Customer Review",
              comment,
              product: product || "",
              status: "pending",
            })
            .select()
            .single();

          if (error) return Response.json({ error: error.message }, { status: 500 });
          return Response.json({ success: true, review: toApiReview(data as ReviewRow) });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to save review";
          return Response.json({ error: msg }, { status: 500 });
        }
      },

      PATCH: async ({ request }) => {
        try {
          const { requireAdminRequest } = await import("@/lib/admin-guard.server");
          const caller = await requireAdminRequest(request, {
            permission: ["reviews", "canModerate"],
          });
          if (caller instanceof Response) return caller;

          const parsed = z
            .object({ id: z.string().min(1), status: z.enum(["pending", "approved", "rejected"]) })
            .safeParse(await request.json());
          if (!parsed.success) {
            return Response.json({ error: "id and a valid status are required" }, { status: 400 });
          }

          const { data, error } = await (
            await reviewsTable()
          )
            .update({ status: parsed.data.status })
            .eq("id", parsed.data.id)
            .select();
          if (error) return Response.json({ error: error.message }, { status: 500 });
          if (!data?.length) return Response.json({ error: "Review not found" }, { status: 404 });
          return Response.json({ success: true, review: toApiReview(data[0] as ReviewRow) });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to update review";
          return Response.json({ error: msg }, { status: 500 });
        }
      },

      DELETE: async ({ request }) => {
        try {
          const { requireAdminRequest } = await import("@/lib/admin-guard.server");
          const caller = await requireAdminRequest(request, {
            permission: ["reviews", "canModerate"],
          });
          if (caller instanceof Response) return caller;

          const url = new URL(request.url, "http://localhost:3000");
          let id = url.searchParams.get("id");
          let ids: string[] = [];
          if (!id) {
            const body = await request.json().catch(() => null);
            if (body && typeof body === "object") {
              if (body.id) id = String(body.id);
              if (Array.isArray(body.ids)) ids = body.ids.map(String);
              if (body.all) id = "all";
            }
          }

          const table = await reviewsTable();
          let result;
          if (id === "all") {
            if (caller.role !== "super_admin") {
              return Response.json(
                { error: "Only a System Admin can delete every review." },
                { status: 403 },
              );
            }
            result = await table.delete().neq("id", "");
          } else if (ids.length > 0) {
            result = await table.delete().in("id", ids);
          } else if (id) {
            result = await table.delete().eq("id", id);
          } else {
            return Response.json({ error: "id or ids required" }, { status: 400 });
          }

          if (result.error) return Response.json({ error: result.error.message }, { status: 500 });
          return Response.json({ success: true });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to delete review";
          return Response.json({ error: msg }, { status: 500 });
        }
      },
    },
  },
});
