import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import fs from "fs";

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

const DELETED_FILE = "/tmp/ia_deleted_review_ids.json";

function getDeletedIdsFromFile(): Set<string> {
  try {
    if (fs.existsSync(DELETED_FILE)) {
      const content = fs.readFileSync(DELETED_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch (e) {
    console.warn("Could not read deleted reviews file:", e);
  }
  return new Set();
}

function saveDeletedIdToFile(id: string) {
  try {
    const set = getDeletedIdsFromFile();
    set.add(id);
    fs.writeFileSync(DELETED_FILE, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn("Could not write to deleted reviews file:", e);
  }
}

// In-memory persistent reviews on server, seeded with approved reviews
const serverReviews: ApiReview[] = [
  {
    id: "rev-1",
    name: "Kwabena Mensah",
    location: "East Legon, Accra",
    rating: 5,
    date: "2 days ago",
    title: "Super fast delivery & 100% original product",
    comment:
      "Ordered the 65W GaN fast charger at 11:00 AM and it was delivered to my office in East Legon by 2:15 PM. Inspected the packaging and tested it before paying the dispatch rider with MoMo. Legit shop!",
    product: "Baseus 65W GaN Fast Charger",
    status: "approved",
    helpfulCount: 28,
    initials: "KM",
    createdAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
  },
  {
    id: "rev-2",
    name: "Akosua Serwaa",
    location: "Kumasi, Ashanti Region",
    rating: 5,
    date: "5 days ago",
    title: "Smooth delivery to Kumasi via VIP bus",
    comment:
      "I was skeptical ordering electronics from Accra to Kumasi, but the WhatsApp team was so reassuring. They sent photos of my package and waybill. Received it the next morning in perfect sealed condition.",
    product: "Apple AirPods Pro 2 (USB-C)",
    status: "approved",
    helpfulCount: 19,
    initials: "AS",
    createdAt: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
  },
  {
    id: "rev-3",
    name: "Emmanuel Owusu",
    location: "Airport Residential, Accra",
    rating: 5,
    date: "1 week ago",
    title: "Best prices for authentic gadgets in Ghana",
    comment:
      "I’ve bought gadgets in Accra for years, but I.A Dewealth stands out for fair pricing and genuine stock. Sound quality on this Anker speaker is incredible, no distortion at high volumes.",
    product: "Anker Soundcore Motion+ Bluetooth Speaker",
    status: "approved",
    helpfulCount: 34,
    initials: "EO",
    createdAt: new Date(Date.now() - 7 * 86400 * 1000).toISOString(),
  },
  {
    id: "rev-4",
    name: "Naa Korkor Mensah",
    location: "Spintex Road, Accra",
    rating: 5,
    date: "1 week ago",
    title: "Seamless WhatsApp checkout and helpful support",
    comment:
      "The WhatsApp ordering is straightforward. Just clicked checkout, sent my delivery location on Spintex, and received my smartwatch the same afternoon. Battery life is amazing.",
    product: "Oraimo Watch 4 Plus Smartwatch",
    status: "approved",
    helpfulCount: 15,
    initials: "NK",
    createdAt: new Date(Date.now() - 8 * 86400 * 1000).toISOString(),
  },
  {
    id: "rev-5",
    name: "Dennis Boateng",
    location: "Takoradi, Western Region",
    rating: 5,
    date: "2 weeks ago",
    title: "Honest customer service, parcel arrived intact",
    comment:
      "Their customer care is 10/10. Answered all my technical questions before I committed. Delivered safely to Takoradi parcel office. Will buy again for my family.",
    product: "Xiaomi Mi TV Box S 4K (2nd Gen)",
    status: "approved",
    helpfulCount: 22,
    initials: "DB",
    createdAt: new Date(Date.now() - 14 * 86400 * 1000).toISOString(),
  },
  {
    id: "rev-6",
    name: "Priscilla Addo",
    location: "Tema Community 1",
    rating: 5,
    date: "2 weeks ago",
    title: "Very polite rider and original quality cable",
    comment:
      "Got the 100W braided charging cables. Charges my MacBook at full speed without heating up. Dispatch rider called before arriving and was very polite.",
    product: "Baseus 100W USB-C PD Cable (2m)",
    status: "approved",
    helpfulCount: 12,
    initials: "PA",
    createdAt: new Date(Date.now() - 15 * 86400 * 1000).toISOString(),
  },
];

export const Route = createFileRoute("/api/reviews")({
  server: {
    handlers: {
      GET: async () => {
        const deleted = getDeletedIdsFromFile();
        const active = serverReviews.filter((r) => !deleted.has(r.id));
        return Response.json({ reviews: active });
      },

      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const parsed = z
            .object({
              name: z.string().trim().min(1, "Name is required"),
              location: z.string().trim().optional(),
              rating: z.number().min(1).max(5).default(5),
              title: z.string().trim().optional(),
              comment: z.string().trim().min(1, "Review comment is required"),
              product: z.string().trim().optional(),
            })
            .safeParse(body);

          if (!parsed.success) {
            return Response.json(
              { error: parsed.error.issues[0]?.message ?? "Invalid input" },
              { status: 400 },
            );
          }

          const { name, location, rating, title, comment, product } = parsed.data;

          const initials = name
            .trim()
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          const newReview: ApiReview = {
            id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: name.trim(),
            location: location?.trim() || "Accra, Ghana",
            rating,
            date: "Just now",
            title: title?.trim() || "Customer Review",
            comment: comment.trim(),
            product: product?.trim() || "Purchased Gadget",
            status: "pending", // Always pending admin approval!
            helpfulCount: 0,
            initials: initials || "CU",
            createdAt: new Date().toISOString(),
          };

          // Prepend so newest pending review is at the top
          serverReviews.unshift(newReview);

          return Response.json({ success: true, review: newReview });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to save review";
          return Response.json({ error: msg }, { status: 500 });
        }
      },

      PATCH: async ({ request }) => {
        try {
          const body = await request.json();
          const { id, status } = body;
          if (!id || !status) {
            return Response.json({ error: "id and status required" }, { status: 400 });
          }

          const found = serverReviews.find((r) => r.id === id);
          if (found) {
            found.status = status;
          }

          return Response.json({ success: true, review: found });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to update review";
          return Response.json({ error: msg }, { status: 500 });
        }
      },

      DELETE: async ({ request }) => {
        try {
          const url = new URL(request.url, "http://localhost:3000");
          let id = url.searchParams.get("id");
          let ids: string[] = [];

          if (!id) {
            try {
              const body = await request.json();
              if (body && typeof body === "object") {
                if (body.id) id = String(body.id);
                if (Array.isArray(body.ids)) ids = body.ids.map(String);
                if (body.all) id = "all";
              }
            } catch {
              // Body parsing failed or empty
            }
          }

          if (!id && ids.length === 0) {
            return Response.json({ error: "id or ids required" }, { status: 400 });
          }

          if (id === "all") {
            serverReviews.forEach((r) => saveDeletedIdToFile(r.id));
            serverReviews.length = 0;
            return Response.json({ success: true, clearedAll: true });
          }

          if (ids.length > 0) {
            ids.forEach((singleId) => {
              saveDeletedIdToFile(singleId);
              const idx = serverReviews.findIndex((r) => r.id === singleId);
              if (idx !== -1) {
                serverReviews.splice(idx, 1);
              }
            });
            return Response.json({ success: true, count: ids.length });
          }

          if (id) {
            saveDeletedIdToFile(id);
            const idx = serverReviews.findIndex((r) => r.id === id);
            if (idx !== -1) {
              serverReviews.splice(idx, 1);
            }
            return Response.json({ success: true, id });
          }

          return Response.json({ success: true });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to delete review";
          return Response.json({ error: msg }, { status: 500 });
        }
      },
    },
  },
});
