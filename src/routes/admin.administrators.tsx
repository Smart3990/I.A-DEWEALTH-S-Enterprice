import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Btn, Modal, PageHead, Panel } from "@/components/admin/kit";
import { SuperAdminOnly } from "@/components/admin/guard";
import {
  listAdministrators,
  createAdministrator,
  updateAdministrator,
  deleteAdministrator,
} from "@/lib/admins.functions";

export const Route = createFileRoute("/admin/administrators")({
  component: () => (
    <SuperAdminOnly>
      <Administrators />
    </SuperAdminOnly>
  ),
});

type Draft = {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "super_admin";
  isActive: boolean;
};

const blank: Draft = { name: "", email: "", password: "", role: "admin", isActive: true };

function Administrators() {
  const qc = useQueryClient();
  const list = useServerFn(listAdministrators);
  const create = useServerFn(createAdministrator);
  const update = useServerFn(updateAdministrator);
  const del = useServerFn(deleteAdministrator);
  const [draft, setDraft] = useState<Draft | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", "administrators"],
    queryFn: () => list(),
  });

  const save = useMutation({
    mutationFn: async (d: Draft) => {
      if (d.id) {
        await update({
          data: {
            id: d.id,
            name: d.name,
            isActive: d.isActive,
            role: d.role,
            password: d.password || "",
          },
        });
      } else {
        await create({
          data: { name: d.name, email: d.email, password: d.password, role: d.role },
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "administrators"] });
      setDraft(null);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "administrators"] }),
  });

  const input =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

  return (
    <div>
      <PageHead
        title="Administrators"
        description="Admins manage products, categories and inquiries. System Admins can change everything."
        action={
          <Btn onClick={() => setDraft({ ...blank })}>
            <Plus className="h-4 w-4" /> New administrator
          </Btn>
        }
      />
      <Panel>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-bold">Name</th>
                  <th className="py-2 pr-4 font-bold">Email</th>
                  <th className="py-2 pr-4 font-bold">Role</th>
                  <th className="py-2 pr-4 font-bold">Active</th>
                  <th className="py-2 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border/60">
                    <td className="py-2.5 pr-4">{r.name}</td>
                    <td className="py-2.5 pr-4">{r.email}</td>
                    <td className="py-2.5 pr-4">
                      {r.role === "super_admin" ? "System Admin" : "Admin"}
                    </td>
                    <td className="py-2.5 pr-4">{r.isActive ? "Yes" : "No"}</td>
                    <td className="py-2.5 text-right">
                      <div className="flex justify-end gap-2">
                        <Btn
                          tone="ghost"
                          onClick={() =>
                            setDraft({
                              id: r.id,
                              name: r.name,
                              email: r.email,
                              password: "",
                              role: r.role as Draft["role"],
                              isActive: r.isActive,
                            })
                          }
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Btn>
                        <Btn
                          tone="danger"
                          onClick={() => {
                            if (confirm("Remove this administrator?")) remove.mutate(r.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Btn>
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={5} className="py-6 text-sm text-muted-foreground">
                      No administrators yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {remove.error && (
          <p className="mt-3 text-sm text-destructive">{(remove.error as Error).message}</p>
        )}
      </Panel>

      {draft && (
        <Modal
          title={draft.id ? "Edit administrator" : "New administrator"}
          onClose={() => setDraft(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate(draft);
            }}
            className="grid gap-4"
          >
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Name
              </span>
              <input
                required
                className={input}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </label>
            {!draft.id && (
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Email
                </span>
                <input
                  required
                  type="email"
                  className={input}
                  value={draft.email}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                />
              </label>
            )}
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {draft.id ? "New password (leave blank to keep)" : "Password (min 8 characters)"}
              </span>
              <input
                type="password"
                minLength={draft.id ? undefined : 8}
                required={!draft.id}
                className={input}
                value={draft.password}
                onChange={(e) => setDraft({ ...draft, password: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Role
              </span>
              <select
                className={input}
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value as Draft["role"] })}
              >
                <option value="admin">Admin (products, categories, inquiries)</option>
                <option value="super_admin">System Admin (full access)</option>
              </select>
            </label>
            {draft.id && (
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={draft.isActive}
                  onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                  className="h-4 w-4"
                />
                Active
              </label>
            )}
            {save.error && (
              <p className="text-sm text-destructive">{(save.error as Error).message}</p>
            )}
            <div className="flex justify-end gap-2">
              <Btn tone="ghost" onClick={() => setDraft(null)}>
                Cancel
              </Btn>
              <Btn type="submit" disabled={save.isPending}>
                {save.isPending ? "Saving…" : "Save"}
              </Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
