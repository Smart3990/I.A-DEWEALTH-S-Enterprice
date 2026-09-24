/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/admin-auth";
import { ImageUploadInput } from "@/components/admin/ImageUploadInput";

export function PageHead({
  title,
  description,
  action,
}: {
  title: string;
  description?: string | undefined;
  action?: ReactNode | undefined;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white p-4 shadow-xs border-0 md:p-5 ${className}`}>
      {children}
    </div>
  );
}

export function Btn({
  children,
  onClick,
  tone = "primary",
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "primary" | "ghost" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const tones: Record<string, string> = {
    primary: "bg-[#00a884] text-white hover:bg-[#009676] shadow-sm border-0",
    ghost: "bg-slate-100 text-slate-700 hover:bg-slate-200 border-0",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border-0",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition disabled:opacity-50 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

export type Field = {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "bool" | "select" | "image";
  options?: { value: string; label: string }[];
  placeholder?: string;
  default?: any;
  full?: boolean;
};

export function FieldInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: any;
  onChange: (v: any) => void;
}) {
  const isImageField =
    field.type === "image" ||
    field.key.includes("logo") ||
    field.key.includes("favicon") ||
    field.key.includes("image") ||
    field.key.includes("banner") ||
    field.key.includes("photo") ||
    field.key.includes("avatar") ||
    field.key.includes("thumbnail");

  if (isImageField) {
    return (
      <div className={field.full ? "sm:col-span-2" : ""}>
        <ImageUploadInput
          label={field.label}
          value={value ?? ""}
          onChange={onChange}
          placeholder={field.placeholder || "https://..."}
        />
      </div>
    );
  }

  const base =
    "w-full rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:bg-white border-0 transition";

  if (field.type === "bool") {
    return (
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 accent-[var(--color-primary)]"
        />
        {field.label}
      </label>
    );
  }

  return (
    <label className={`block ${field.full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {field.label}
      </span>
      {field.type === "textarea" ? (
        <textarea
          rows={3}
          className={base}
          value={value ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === "select" ? (
        <select className={base} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {(field.options ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={field.type === "number" ? "number" : "text"}
          className={base}
          value={value ?? ""}
          placeholder={field.placeholder}
          onChange={(e) =>
            onChange(field.type === "number" ? Number(e.target.value || 0) : e.target.value)
          }
        />
      )}
    </label>
  );
}

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4">
      <div className="my-8 w-full max-w-2xl rounded-2xl border border-border bg-card p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-extrabold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Generic list + create/edit/delete screen for one database table. */
export function ResourceManager({
  title,
  description,
  table,
  fields,
  columns,
  orderBy,
  canWrite,
  idField,
  newIdLabel,
}: {
  title: string;
  description?: string | undefined;
  table: string;
  fields: Field[];
  columns: { key: string; label: string }[];
  orderBy?: string;
  canWrite: boolean;
  /** Set when the table's primary key is entered by hand (text ids). */
  idField?: string;
  newIdLabel?: string;
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      let q: any = (supabase as any).from(table).select("*");
      if (orderBy) q = q.order(orderBy);
      const { data, error } = await q;
      if (error) throw error;
      return data as any[];
    },
  });

  const save = useMutation({
    mutationFn: async (row: any) => {
      const isNew = !row.__id;
      const payload = { ...row };
      delete payload.__id;
      if (isNew) {
        const { error } = await (supabase as any).from(table).insert(payload);
        if (error) throw error;
      } else {
        const key = idField ?? "id";
        const { error } = await (supabase as any).from(table).update(payload).eq(key, row.__id);
        if (error) throw error;
      }
      await logActivity(
        `${isNew ? "Created" : "Updated"} ${title.toLowerCase()}: ${row.name ?? row.label ?? row.title ?? row.__id ?? ""}`,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", table] });
      qc.invalidateQueries({ queryKey: ["storefront"] });
      setEditing(null);
    },
  });

  const remove = useMutation({
    mutationFn: async (row: any) => {
      const key = idField ?? "id";
      const { error } = await (supabase as any).from(table).delete().eq(key, row[key]);
      if (error) throw error;
      await logActivity(
        `Deleted ${title.toLowerCase()}: ${row.name ?? row.label ?? row.title ?? row[key]}`,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", table] });
      qc.invalidateQueries({ queryKey: ["storefront"] });
    },
  });

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) =>
      columns.some((c) =>
        String(r[c.key] ?? "")
          .toLowerCase()
          .includes(term),
      ),
    );
  }, [rows, search, columns]);

  function startNew() {
    const blank: any = { __id: null };
    if (idField) blank[idField] = "";
    fields.forEach((f) => {
      blank[f.key] = f.default ?? (f.type === "bool" ? true : f.type === "number" ? 0 : "");
    });
    setEditing(blank);
  }

  return (
    <div>
      <PageHead
        title={title}
        description={description}
        action={
          canWrite ? (
            <Btn onClick={startNew}>
              <Plus className="h-4 w-4" /> New
            </Btn>
          ) : undefined
        }
      />

      <Panel>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="mb-4 w-full max-w-sm rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:bg-white border-0 transition"
        />
        {isLoading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  {columns.map((c) => (
                    <th key={c.key} className="py-2.5 pr-4 font-bold">
                      {c.label}
                    </th>
                  ))}
                  {canWrite && <th className="py-2.5 text-right font-bold">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((r) => (
                  <tr key={r[idField ?? "id"]} className="hover:bg-slate-50/60 transition">
                    {columns.map((c) => (
                      <td key={c.key} className="py-3 pr-4 align-top text-xs text-slate-700">
                        {typeof r[c.key] === "boolean" ? (
                          r[c.key] ? (
                            "Yes"
                          ) : (
                            "No"
                          )
                        ) : r[c.key] &&
                          typeof r[c.key] === "string" &&
                          (c.key.includes("image") ||
                            c.key.includes("banner") ||
                            c.key.includes("logo")) ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={r[c.key]}
                              alt=""
                              className="h-8 w-14 rounded-md object-cover border border-slate-200"
                            />
                          </div>
                        ) : (
                          String(r[c.key] ?? "")
                        )}
                      </td>
                    ))}
                    {canWrite && (
                      <td className="py-2.5 text-right">
                        <div className="flex justify-end gap-2">
                          <Btn
                            tone="ghost"
                            onClick={() => setEditing({ ...r, __id: r[idField ?? "id"] })}
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </Btn>
                          <Btn
                            tone="danger"
                            onClick={() => {
                              if (confirm("Delete this item?")) remove.mutate(r);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Btn>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {!visible.length && (
                  <tr>
                    <td className="py-6 text-sm text-muted-foreground" colSpan={columns.length + 1}>
                      Nothing here yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {editing && (
        <Modal
          title={editing.__id ? `Edit ${title}` : `New ${title}`}
          onClose={() => setEditing(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate(editing);
            }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {idField && !editing.__id && (
              <FieldInput
                field={{
                  key: idField,
                  label: newIdLabel ?? "ID (lowercase, no spaces)",
                  full: true,
                }}
                value={editing[idField]}
                onChange={(v) => setEditing({ ...editing, [idField]: v })}
              />
            )}
            {fields.map((f) => (
              <div key={f.key} className={f.full || f.type === "textarea" ? "sm:col-span-2" : ""}>
                <FieldInput
                  field={f}
                  value={editing[f.key]}
                  onChange={(v) => setEditing({ ...editing, [f.key]: v })}
                />
              </div>
            ))}
            {save.error && (
              <p className="sm:col-span-2 text-sm text-destructive">
                {(save.error as Error).message}
              </p>
            )}
            <div className="sm:col-span-2 flex justify-end gap-2">
              <Btn tone="ghost" onClick={() => setEditing(null)}>
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
