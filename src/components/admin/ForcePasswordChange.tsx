import { useState } from "react";
import { Eye, EyeOff, KeyRound, LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/admin-auth";

/**
 * Shown over the dashboard on an administrator's first sign-in (when a System Admin created
 * the account or set its password). It cannot be dismissed: change the password or sign out.
 */
export function ForcePasswordChange({
  email,
  onSignOut,
}: {
  email: string | null;
  onSignOut: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const checks = [
    { ok: password.length >= 8, label: "At least 8 characters" },
    { ok: /[A-Za-z]/.test(password) && /\d/.test(password), label: "Letters and numbers" },
    { ok: password.length > 0 && password === confirm, label: "Both passwords match" },
  ];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!checks.every((c) => c.ok)) {
      setError("Please meet all the requirements below.");
      return;
    }
    setBusy(true);
    setError("");
    // Clearing the flag in the same call means the prompt never shows again once it succeeds.
    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { must_change_password: false },
    });
    if (updateError) {
      setError(
        /different from the old/i.test(updateError.message)
          ? "Choose a new password that is different from the one you were given."
          : updateError.message,
      );
      setBusy(false);
      return;
    }
    await logActivity("Changed password on first sign-in");
    toast.success("Password updated — your account is secured.");
    // useAdminSession reloads on the USER_UPDATED auth event and hides this modal.
  }

  const input =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm text-slate-800 outline-none transition focus:border-[#00a884] focus:ring-4 focus:ring-[#00a884]/15";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="force-password-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-md"
    >
      <form
        onSubmit={submit}
        className="w-full max-w-[420px] rounded-2xl bg-white/95 p-6 shadow-2xl ring-1 ring-black/5 sm:p-7"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00a884]/10 text-[#00a884]">
          <KeyRound className="h-5 w-5" />
        </div>
        <h2
          id="force-password-title"
          className="mt-4 text-lg font-extrabold tracking-tight text-slate-900"
        >
          Secure your account
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Welcome{email ? `, ${email}` : ""}! Your account was created by a System Admin. Please
          replace the temporary password with one only you know.
        </p>

        <label className="mt-5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
          New password
        </label>
        <div className="relative mt-1.5">
          <input
            type={show ? "text" : "password"}
            autoComplete="new-password"
            autoFocus
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={input}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <label className="mt-3 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Confirm new password
        </label>
        <input
          type={show ? "text" : "password"}
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={`${input} mt-1.5`}
        />

        <ul className="mt-3 space-y-1 text-xs">
          {checks.map((c) => (
            <li key={c.label} className={c.ok ? "text-emerald-700" : "text-slate-500"}>
              {c.ok ? "✓" : "•"} {c.label}
            </li>
          ))}
        </ul>

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-lg bg-red-50 p-2.5 text-xs font-medium text-red-700"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-[#00a884] text-sm font-semibold text-white transition hover:bg-[#009676] disabled:opacity-70"
        >
          {busy ? "Updating…" : "Update password"}
        </button>
        <button
          type="button"
          onClick={onSignOut}
          className="mt-3 flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out instead
        </button>
      </form>
    </div>
  );
}
