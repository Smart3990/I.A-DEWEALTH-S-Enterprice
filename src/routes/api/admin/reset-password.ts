import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/api/admin/reset-password")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const parsed = z
            .object({ email: z.string().trim().email("Invalid email address") })
            .safeParse(body);

          if (!parsed.success) {
            return Response.json(
              { error: parsed.error.issues[0]?.message ?? "Invalid email address" },
              { status: 400 },
            );
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin.auth.resetPasswordForEmail(parsed.data.email);

          if (error) {
            return Response.json({ error: error.message }, { status: 500 });
          }

          return Response.json({ ok: true });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Password reset failed";
          return Response.json({ error: msg }, { status: 500 });
        }
      },
    },
  },
});
