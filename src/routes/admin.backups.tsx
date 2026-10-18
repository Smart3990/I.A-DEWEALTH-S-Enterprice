import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, Lock, Plus, RotateCcw, ShieldCheck } from "lucide-react";
import { Btn, Modal, PageHead, Panel } from "@/components/admin/kit";
import { SuperAdminOnly } from "@/components/admin/guard";
import { adminFetch, readApiError } from "@/lib/admin-fetch";

export const Route = createFileRoute("/admin/backups")({
  component: () => (
    <SuperAdminOnly>
      <Backups />
    </SuperAdminOnly>
  ),
});

type BackupMeta = {
  id: string;
  created_at: string;
  kind: "weekly" | "manual" | "pre-restore";
  created_by: string;
  note: string;
  counts: Record<string, number>;
};

type TableChange = {
  key: string;
  label: string;
  restoreMode: "replace" | "add-missing";
  inBackup: number;
  now: number;
  comeBack: string[];
  comeBackCount: number;
  removed: string[];
  removedCount: number;
  changed: string[];
  changedCount: number;
};

// The unlocked page forgets the password after 10 minutes without activity.
const AUTO_LOCK_MS = 10 * 60 * 1000;

const KIND_LABEL: Record<BackupMeta["kind"], string> = {
  weekly: "Weekly (automatic)",
  manual: "Manual",
  "pre-restore": "Before a restore (undo point)",
};

function Backups() {
  const qc = useQueryClient();
  // Kept in memory only (never stored), and sent with every request for the server to check.
  const [password, setPassword] = useState<string | null>(null);
  const [unlockInput, setUnlockInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [backups, setBackups] = useState<BackupMeta[]>([]);
  const [preview, setPreview] = useState<{ backup: BackupMeta; changes: TableChange[] } | null>(
    null,
  );
  const [confirmText, setConfirmText] = useState("");
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lock = () => {
    setPassword(null);
    setBackups([]);
    setPreview(null);
  };

  const touch = () => {
    if (lockTimer.current) clearTimeout(lockTimer.current);
    lockTimer.current = setTimeout(() => {
      lock();
      toast.info("Backups locked after 10 minutes of inactivity.");
    }, AUTO_LOCK_MS);
  };
  useEffect(
    () => () => {
      if (lockTimer.current) clearTimeout(lockTimer.current);
    },
    [],
  );

  async function call<T>(body: Record<string, unknown>, pw = password): Promise<T> {
    const res = await adminFetch("/api/admin/backups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, password: pw }),
    });
    if (!res.ok) {
      const message = await readApiError(res);
      if (res.status === 403 && message === "Incorrect password.") lock();
      throw new Error(message);
    }
    touch();
    return res.json() as Promise<T>;
  }

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await call<{ backups: BackupMeta[] }>({ action: "list" }, unlockInput);
      setBackups(data.backups);
      setPassword(unlockInput);
      setUnlockInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function refresh() {
    const data = await call<{ backups: BackupMeta[] }>({ action: "list" });
    setBackups(data.backups);
  }

  async function createNow() {
    setBusy(true);
    try {
      await call({ action: "create" });
      await refresh();
      toast.success("Backup created.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function openPreview(backup: BackupMeta) {
    setBusy(true);
    try {
      const data = await call<{ backup: BackupMeta; changes: TableChange[] }>({
        action: "detail",
        id: backup.id,
      });
      setConfirmText("");
      setPreview(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function restore() {
    if (!preview) return;
    setBusy(true);
    try {
      await call({ action: "restore", id: preview.backup.id });
      setPreview(null);
      await refresh();
      // Every open page (on this device) reloads the restored data; other devices pick it
      // up on their next refresh.
      await qc.invalidateQueries();
      toast.success(
        "Restored. An undo point was saved first — restore it from the list if needed.",
        { duration: 8000 },
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

  if (!password) {
    return (
      <div>
        <PageHead
          title="Backups & Restore"
          description="Weekly snapshots of products, categories, settings, banners, reviews and customer messages."
        />
        <Panel className="mx-auto max-w-md">
          <form onSubmit={unlock} className="grid gap-4">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Lock className="h-4 w-4 text-[#00a884]" />
              Confirm it's you
            </div>
            <p className="text-xs text-muted-foreground">
              Backups can overwrite the whole store, so enter your System Admin password to
              continue. You'll be asked again after 10 minutes of inactivity.
            </p>
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="Your password"
              className={input}
              value={unlockInput}
              onChange={(e) => setUnlockInput(e.target.value)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Btn type="submit" disabled={busy || !unlockInput}>
              <ShieldCheck className="h-4 w-4" /> {busy ? "Checking…" : "Unlock backups"}
            </Btn>
          </form>
        </Panel>
      </div>
    );
  }

  return (
    <div>
      <PageHead
        title="Backups & Restore"
        description="A backup is taken automatically every Sunday at 02:00 (Ghana time). Preview what a restore would change before applying it."
        action={
          <div className="flex gap-2">
            <Btn tone="ghost" onClick={lock}>
              <Lock className="h-4 w-4" /> Lock
            </Btn>
            <Btn onClick={createNow} disabled={busy}>
              <Plus className="h-4 w-4" /> Back up now
            </Btn>
          </div>
        }
      />
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4 font-bold">Date</th>
                <th className="py-2 pr-4 font-bold">Type</th>
                <th className="py-2 pr-4 font-bold">Contents</th>
                <th className="py-2 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((b) => (
                <tr key={b.id} className="border-b border-border/60 align-top">
                  <td className="py-2.5 pr-4 font-semibold">
                    {new Date(b.created_at).toLocaleString()}
                    <div className="text-xs font-normal text-muted-foreground">{b.created_by}</div>
                  </td>
                  <td className="py-2.5 pr-4">
                    {KIND_LABEL[b.kind]}
                    {b.note && <div className="text-xs text-muted-foreground">{b.note}</div>}
                  </td>
                  <td className="py-2.5 pr-4 text-xs text-muted-foreground">
                    {b.counts["products"] ?? 0} products · {b.counts["categories"] ?? 0} categories
                    · {b.counts["reviews"] ?? 0} reviews · {b.counts["customer_inquiries"] ?? 0}{" "}
                    messages
                  </td>
                  <td className="py-2.5 text-right">
                    <Btn tone="ghost" disabled={busy} onClick={() => openPreview(b)}>
                      <Eye className="h-3.5 w-3.5" /> Preview & restore
                    </Btn>
                  </td>
                </tr>
              ))}
              {!backups.length && (
                <tr>
                  <td colSpan={4} className="py-6 text-sm text-muted-foreground">
                    No backups yet — press "Back up now".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {preview && (
        <Modal
          title={`Restore backup from ${new Date(preview.backup.created_at).toLocaleString()}`}
          onClose={() => setPreview(null)}
        >
          <p className="mb-3 text-sm text-muted-foreground">
            This is what would change on the live site. Products, categories, settings, banners,
            homepage sections and menu links are put back exactly as they were. Reviews and customer
            messages are only added back — nothing newer is removed.
          </p>
          <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
            {preview.changes.map((c) => {
              const none = !c.comeBackCount && !c.removedCount && !c.changedCount;
              return (
                <div key={c.key} className="rounded-xl border border-border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold">{c.label}</span>
                    <span className="text-xs text-muted-foreground">
                      backup {c.inBackup} · now {c.now}
                    </span>
                  </div>
                  {none ? (
                    <p className="mt-1 text-xs text-muted-foreground">No changes.</p>
                  ) : (
                    <ul className="mt-1 space-y-1 text-xs">
                      {c.comeBackCount > 0 && (
                        <li className="text-emerald-700">
                          Comes back ({c.comeBackCount}): {c.comeBack.join(", ")}
                        </li>
                      )}
                      {c.changedCount > 0 && (
                        <li className="text-amber-700">
                          Reverted to the backup version ({c.changedCount}): {c.changed.join(", ")}
                        </li>
                      )}
                      {c.removedCount > 0 && (
                        <li className="text-red-700">
                          Removed — added after this backup ({c.removedCount}):{" "}
                          {c.removed.join(", ")}
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 grid gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
            <span>
              An automatic undo point is saved before restoring. Type <strong>RESTORE</strong> to
              confirm.
            </span>
            <input
              className={input}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="RESTORE"
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Btn tone="ghost" onClick={() => setPreview(null)}>
              Cancel
            </Btn>
            <Btn tone="danger" disabled={busy || confirmText !== "RESTORE"} onClick={restore}>
              <RotateCcw className="h-4 w-4" /> {busy ? "Restoring…" : "Restore this backup"}
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
