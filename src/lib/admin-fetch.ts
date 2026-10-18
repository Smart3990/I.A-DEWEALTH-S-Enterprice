import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * fetch() for /api/admin/* and other staff-only endpoints.
 * Attaches the signed-in administrator's access token so the server can verify them.
 */
export async function adminFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
  } catch {
    // No session available; the server will answer 401.
  }
  return fetch(input, { ...init, headers });
}

/** Reads the `error` field from a failed JSON response, falling back to the HTTP status. */
export async function readApiError(res: Response): Promise<string> {
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (body.error) return body.error;
  if (res.status === 401) return "Your admin session has expired. Please sign in again.";
  if (res.status === 403) return "You do not have permission to do this.";
  return `Server returned ${res.status}`;
}

/**
 * Sends an admin change to the server. Resolves true on success; on failure it tells the
 * admin with a toast (the change only exists in this browser until the server accepts it).
 */
export async function sendAdminChange(
  url: string,
  init: RequestInit,
  failMessage: string,
  { quiet = false }: { quiet?: boolean } = {},
): Promise<boolean> {
  try {
    const res = await adminFetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...init.headers },
    });
    if (!res.ok) throw new Error(await readApiError(res));
    return true;
  } catch (err) {
    if (!quiet) {
      toast.error(`${failMessage}: ${err instanceof Error ? err.message : String(err)}`);
    }
    return false;
  }
}
