import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// Tables in a backup, in the order they are shown. Content tables are replaced on restore;
// customer tables only get missing rows back (see restore_site_backup in the migration).
const TABLES = [
  { key: "products", label: "Products", restore: "replace" },
  { key: "categories", label: "Categories", restore: "replace" },
  { key: "site_settings", label: "Store settings", restore: "replace" },
  { key: "banners", label: "Banners, announcement bar & site config", restore: "replace" },
  { key: "homepage_sections", label: "Homepage sections", restore: "replace" },
  { key: "nav_items", label: "Menu links", restore: "replace" },
  { key: "reviews", label: "Customer reviews", restore: "add-missing" },
  { key: "customer_inquiries", label: "Customer messages", restore: "add-missing" },
] as const;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type Row = Record<string, unknown>;

// site_backups and the backup functions come from the site_backups migration and are not
// in the generated Database types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function db(): Promise<any> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Checks the caller's own password again before any backup action. */
async function verifyPassword(email: string, password: string): Promise<boolean> {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key || !email || !password) return false;
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session) return false;
  // End only this temporary check session; the default "global" scope would sign the
  // admin out on every device.
  await client.auth.signOut({ scope: "local" }).catch(() => {});
  return true;
}

function rowLabel(table: string, row: Row): string {
  const name = row["title"] ?? row["name"] ?? row["customer_name"] ?? row["label"] ?? row["id"];
  return String(name ?? "");
}

/** What restoring this backup would change compared with the live data, per table. */
async function describeChanges(backupData: Record<string, Row[]>) {
  const supabase = await db();
  const tables = [];
  for (const t of TABLES) {
    const saved: Row[] = backupData[t.key] ?? [];
    const { data: currentRows } = await supabase.from(t.key).select("*");
    const current: Row[] = currentRows ?? [];
    const savedById = new Map(saved.map((r) => [String(r["id"]), r]));
    const currentById = new Map(current.map((r) => [String(r["id"]), r]));

    const comeBack = saved.filter((r) => !currentById.has(String(r["id"])));
    const removed =
      t.restore === "replace" ? current.filter((r) => !savedById.has(String(r["id"]))) : [];
    const changed =
      t.restore === "replace"
        ? saved.filter((r) => {
            const now = currentById.get(String(r["id"]));
            if (!now) return false;
            const strip = (x: Row) => JSON.stringify({ ...x, updated_at: undefined });
            return strip(now) !== strip(r);
          })
        : [];

    tables.push({
      key: t.key,
      label: t.label,
      restoreMode: t.restore,
      inBackup: saved.length,
      now: current.length,
      comeBack: comeBack.map((r) => rowLabel(t.key, r)).slice(0, 50),
      comeBackCount: comeBack.length,
      removed: removed.map((r) => rowLabel(t.key, r)).slice(0, 50),
      removedCount: removed.length,
      changed: changed.map((r) => rowLabel(t.key, r)).slice(0, 50),
      changedCount: changed.length,
    });
  }
  return tables;
}

export const Route = createFileRoute("/api/admin/backups")({
  server: {
    handlers: {
      // Everything goes through POST so the password never appears in a URL.
      POST: async ({ request }) => {
        try {
          const { requireAdminRequest } = await import("@/lib/admin-guard.server");
          const caller = await requireAdminRequest(request, { superAdminOnly: true });
          if (caller instanceof Response) return caller;

          const parsed = z
            .object({
              action: z.enum(["list", "detail", "create", "restore"]),
              password: z.string().min(1, "Enter your password"),
              id: z.string().uuid().optional(),
              note: z.string().trim().max(200).optional(),
            })
            .safeParse(await request.json().catch(() => null));
          if (!parsed.success) {
            return Response.json(
              { error: parsed.error.issues[0]?.message ?? "Invalid request" },
              { status: 400 },
            );
          }
          const { action, password, id, note } = parsed.data;

          if (!(await verifyPassword(caller.email, password))) {
            return Response.json(
              { error: "Incorrect password.", code: "bad_password" },
              { status: 403 },
            );
          }

          const supabase = await db();
          const logAction = (text: string) =>
            supabase.from("activity_log").insert({ admin_name: caller.email, action: text });

          if (action === "list") {
            const list = async () =>
              supabase
                .from("site_backups")
                .select("id, created_at, kind, created_by, note, counts")
                .order("created_at", { ascending: false })
                .limit(60);
            let { data, error } = await list();
            if (error) {
              const missing = /site_backups/.test(error.message);
              return Response.json(
                {
                  error: missing
                    ? "Backups are not set up yet. Run the site_backups SQL file in Supabase."
                    : error.message,
                },
                { status: 500 },
              );
            }
            // Safety net if the scheduled weekly backup did not run.
            const newest = data?.[0] ? new Date(data[0].created_at).getTime() : 0;
            if (Date.now() - newest > WEEK_MS) {
              await supabase.rpc("create_site_backup", {
                p_kind: "weekly",
                p_created_by: "Automatic weekly backup (catch-up)",
                p_note: "",
              });
              ({ data, error } = await list());
            }
            return Response.json({ backups: data ?? [] });
          }

          if (action === "create") {
            const { data, error } = await supabase.rpc("create_site_backup", {
              p_kind: "manual",
              p_created_by: caller.email,
              p_note: note ?? "",
            });
            if (error) return Response.json({ error: error.message }, { status: 500 });
            await logAction("Created a manual site backup");
            return Response.json({ success: true, id: data });
          }

          if (!id) return Response.json({ error: "Backup id is required" }, { status: 400 });
          const { data: backup, error: getError } = await supabase
            .from("site_backups")
            .select("id, created_at, kind, created_by, note, counts, data")
            .eq("id", id)
            .maybeSingle();
          if (getError) return Response.json({ error: getError.message }, { status: 500 });
          if (!backup) return Response.json({ error: "Backup not found" }, { status: 404 });

          if (action === "detail") {
            const { data: _omit, ...meta } = backup;
            return Response.json({ backup: meta, changes: await describeChanges(backup.data) });
          }

          // restore
          const { data: preRestoreId, error } = await supabase.rpc("restore_site_backup", {
            p_backup_id: id,
            p_restored_by: caller.email,
          });
          if (error) {
            return Response.json({ error: `Restore failed: ${error.message}` }, { status: 500 });
          }
          await logAction(
            `Restored the site backup from ${new Date(backup.created_at).toISOString()} (undo backup ${preRestoreId})`,
          );
          return Response.json({ success: true, preRestoreId });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Backup request failed";
          return Response.json({ error: msg }, { status: 500 });
        }
      },
    },
  },
});
