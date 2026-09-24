import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/api/admin/setup")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { count, error } = await supabaseAdmin
            .from("user_roles")
            .select("*", { count: "exact", head: true });

          if (error) {
            return Response.json({ needsSetup: false, error: error.message });
          }
          return Response.json({ needsSetup: (count ?? 0) === 0 });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Database check failed";
          return Response.json({ needsSetup: false, error: msg }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const parsed = z
            .object({
              name: z.string().trim().min(1, "Name is required"),
              email: z.string().trim().email("Invalid email address"),
              password: z.string().min(8, "Password must be at least 8 characters"),
            })
            .safeParse(body);

          if (!parsed.success) {
            return Response.json(
              { error: parsed.error.issues[0]?.message ?? "Invalid input" },
              { status: 400 },
            );
          }

          const { name, email, password } = parsed.data;
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          // Guard: Only allow bootstrap if NO roles exist yet
          const { count } = await supabaseAdmin
            .from("user_roles")
            .select("*", { count: "exact", head: true });

          if ((count ?? 0) > 0) {
            return Response.json(
              { error: "Administrator setup has already been completed. Please sign in." },
              { status: 403 },
            );
          }

          // Check if user already exists in auth
          const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
          let userId = userList?.users?.find(
            (u) => u.email?.toLowerCase() === email.toLowerCase(),
          )?.id;

          if (!userId) {
            const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
              email,
              password,
              email_confirm: true,
              user_metadata: { name },
            });

            if (createErr || !created.user) {
              return Response.json(
                { error: createErr?.message ?? "Could not create administrator account" },
                { status: 500 },
              );
            }
            userId = created.user.id;
          } else {
            await supabaseAdmin.auth.admin.updateUserById(userId, {
              password,
              email_confirm: true,
            });
          }

          // Create or update profile
          await supabaseAdmin.from("profiles").upsert(
            {
              id: userId,
              name,
              email,
              is_active: true,
            },
            { onConflict: "id" },
          );

          // Assign super_admin role
          const { error: roleErr } = await supabaseAdmin.from("user_roles").upsert(
            {
              user_id: userId,
              role: "super_admin",
            },
            { onConflict: "user_id,role" },
          );

          if (roleErr) {
            return Response.json({ error: roleErr.message }, { status: 500 });
          }

          await supabaseAdmin.from("activity_log").insert({
            admin_name: name,
            action: "Initial Super Administrator created",
          });

          return Response.json({ ok: true, email });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Setup failed";
          return Response.json({ error: msg }, { status: 500 });
        }
      },
    },
  },
});
