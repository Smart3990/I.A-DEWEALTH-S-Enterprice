import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/admin/permissions")({
  server: {
    handlers: {
      // Any administrator may read the rules (the admin menu uses them).
      GET: async ({ request }) => {
        try {
          const { requireAdminRequest } = await import("@/lib/admin-guard.server");
          const caller = await requireAdminRequest(request);
          if (caller instanceof Response) return caller;

          const { loadAdminPermissions } = await import("@/lib/admin-permissions.server");
          return Response.json({ permissions: await loadAdminPermissions() });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to load permissions";
          return Response.json({ error: msg }, { status: 500 });
        }
      },

      POST: async ({ request }) => {
        try {
          const { requireAdminRequest } = await import("@/lib/admin-guard.server");
          const caller = await requireAdminRequest(request, { superAdminOnly: true });
          if (caller instanceof Response) return caller;

          const body = await request.json().catch(() => null);
          if (!body?.permissions || typeof body.permissions !== "object") {
            return Response.json({ error: "permissions object is required" }, { status: 400 });
          }

          const { mergeAdminPermissions } = await import("@/data/permissions-store");
          const { saveAdminPermissionsRow } = await import("@/lib/admin-permissions.server");
          const permissions = mergeAdminPermissions(body.permissions);
          const { error } = await saveAdminPermissionsRow(permissions);
          if (error) return Response.json({ error: error.message }, { status: 500 });
          return Response.json({ success: true, permissions });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to save permissions";
          return Response.json({ error: msg }, { status: 500 });
        }
      },
    },
  },
});
