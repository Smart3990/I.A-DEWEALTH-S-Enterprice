import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

export type SetupStatus =
  | { state: "checking" }
  | { state: "needs-setup" }
  | { state: "ready" }
  | { state: "unreachable"; message: string };

/** Asks the server whether any administrator exists yet. */
export function useAdminSetupStatus(): SetupStatus {
  const [status, setStatus] = useState<SetupStatus>({ state: "checking" });

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/setup")
      .then(async (res) => {
        const body = (await res.json().catch(() => ({}))) as {
          needsSetup?: boolean;
          error?: string;
        };
        if (!alive) return;
        if (body.error) setStatus({ state: "unreachable", message: body.error });
        else setStatus(body.needsSetup ? { state: "needs-setup" } : { state: "ready" });
      })
      .catch((err: unknown) => {
        if (alive) setStatus({ state: "unreachable", message: String(err) });
      });
    return () => {
      alive = false;
    };
  }, []);

  return status;
}

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[14px] text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#00a884] focus:ring-4 focus:ring-[#00a884]/15";
const labelClass = "mb-2 block text-[10.5px] font-bold uppercase tracking-wider text-slate-500";

/** One-time form that creates the first System Admin, then signs them in. */
export function AdminSetupForm({
  onCreated,
}: {
  onCreated: (email: string, password: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(body.error || `Server returned ${res.status}`);
      await onCreated(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 w-full space-y-4">
      <p className="rounded-xl bg-[#00a884]/10 p-3 text-xs font-medium text-slate-700">
        No administrator exists yet. Create the first <strong>System Admin</strong> account — you
        can add more administrators from the dashboard afterwards.
      </p>
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div>
        <label className={labelClass}>Your name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Email address</label>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Password (min 8 characters)</label>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Confirm password</label>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="mt-2 flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[#00a884] text-[15px] font-semibold text-white shadow-sm shadow-[#00a884]/25 transition hover:bg-[#009676] disabled:opacity-70"
      >
        {busy ? "Creating account…" : "Create System Admin"}
      </button>
    </form>
  );
}
