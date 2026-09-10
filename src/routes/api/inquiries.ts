import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

function parseStoredMessage(rawMessage: string) {
  let email: string | undefined;
  let subject = "General Inquiry";
  let notes: string | undefined;
  let cleanMessage = rawMessage || "";

  const emailMatch = cleanMessage.match(/\[Email:\s*([^\]]+)\]/i);
  if (emailMatch) {
    email = emailMatch[1].trim();
    cleanMessage = cleanMessage.replace(emailMatch[0], "").trim();
  }

  const subjectMatch = cleanMessage.match(/\[Subject:\s*([^\]]+)\]/i);
  if (subjectMatch) {
    subject = subjectMatch[1].trim();
    cleanMessage = cleanMessage.replace(subjectMatch[0], "").trim();
  }

  const notesMatch = cleanMessage.match(/\[Notes:\s*([\s\S]*?)\]\s*$/i);
  if (notesMatch) {
    notes = notesMatch[1].trim();
    cleanMessage = cleanMessage.replace(notesMatch[0], "").trim();
  }

  return { email, subject, cleanMessage, notes };
}

export const Route = createFileRoute("/api/inquiries")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin
            .from("customer_inquiries")
            .select("*")
            .order("created_at", { ascending: false });

          if (error) {
            console.error("[API Inquiries GET Error]:", error);
            return Response.json({ error: error.message, inquiries: [] }, { status: 500 });
          }

          const inquiries = (data || []).map((row) => {
            const parsed = parseStoredMessage(row.message || "");
            return {
              id: row.id,
              name: row.customer_name || "Anonymous Customer",
              phone: row.customer_phone || "Not provided",
              email: parsed.email,
              subject: parsed.subject,
              message: parsed.cleanMessage,
              createdAt: row.created_at,
              status: row.status || "new",
              notes: parsed.notes,
              productId: row.product_id,
            };
          });

          return Response.json({ inquiries });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to load inquiries";
          console.error("[API Inquiries GET Exception]:", err);
          return Response.json({ error: msg, inquiries: [] }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const parsed = z
            .object({
              name: z.string().trim().min(1, "Name is required"),
              phone: z.string().trim().optional(),
              email: z.string().trim().email().optional().or(z.literal("")),
              subject: z.string().trim().optional(),
              message: z.string().trim().min(1, "Message is required"),
            })
            .safeParse(body);

          if (!parsed.success) {
            return Response.json(
              { error: parsed.error.issues[0]?.message ?? "Invalid input" },
              { status: 400 },
            );
          }

          const { name, phone, email, subject, message } = parsed.data;

          const metadataParts: string[] = [];
          if (email) metadataParts.push(`[Email: ${email}]`);
          if (subject) metadataParts.push(`[Subject: ${subject}]`);

          const storedMessage =
            metadataParts.length > 0 ? `${metadataParts.join(" ")}\n\n${message}` : message;

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          const { data, error } = await supabaseAdmin
            .from("customer_inquiries")
            .insert({
              customer_name: name,
              customer_phone: phone || "Not provided",
              message: storedMessage,
              status: "new",
            })
            .select()
            .single();

          if (error) {
            console.error("[API Inquiries POST Error]:", error);
            return Response.json({ error: error.message }, { status: 500 });
          }

          const parsedBack = parseStoredMessage(data.message || "");

          return Response.json({
            ok: true,
            inquiry: {
              id: data.id,
              name: data.customer_name,
              phone: data.customer_phone,
              email: parsedBack.email,
              subject: parsedBack.subject,
              message: parsedBack.cleanMessage,
              createdAt: data.created_at,
              status: data.status,
              notes: parsedBack.notes,
            },
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to record inquiry";
          console.error("[API Inquiries POST Exception]:", err);
          return Response.json({ error: msg }, { status: 500 });
        }
      },

      PATCH: async ({ request }) => {
        try {
          const body = await request.json();
          const { id, status, notes } = body;

          if (!id) {
            return Response.json({ error: "Inquiry ID is required" }, { status: 400 });
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          // If notes are passed, we update the message with [Notes: ...]
          if (notes !== undefined) {
            const { data: existing } = await supabaseAdmin
              .from("customer_inquiries")
              .select("message")
              .eq("id", id)
              .single();

            if (existing) {
              let updatedMsg = existing.message || "";
              // Remove existing [Notes: ...]
              updatedMsg = updatedMsg.replace(/\[Notes:\s*([\s\S]*?)\]\s*$/i, "").trim();
              if (notes) {
                updatedMsg = `${updatedMsg}\n\n[Notes: ${notes}]`;
              }

              await supabaseAdmin
                .from("customer_inquiries")
                .update({ status: status || "new", message: updatedMsg })
                .eq("id", id);
            }
          } else if (status) {
            await supabaseAdmin.from("customer_inquiries").update({ status }).eq("id", id);
          }

          return Response.json({ ok: true });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to update inquiry";
          return Response.json({ error: msg }, { status: 500 });
        }
      },

      DELETE: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const id = url.searchParams.get("id");
          if (!id) {
            return Response.json({ error: "Missing inquiry ID" }, { status: 400 });
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin.from("customer_inquiries").delete().eq("id", id);

          if (error) {
            return Response.json({ error: error.message }, { status: 500 });
          }

          return Response.json({ ok: true });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to delete inquiry";
          return Response.json({ error: msg }, { status: 500 });
        }
      },
    },
  },
});
