import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AdminRole = "super_admin" | "admin" | null;

export type AdminSession = {
  loading: boolean;
  userId: string | null;
  email: string | null;
  role: AdminRole;
};

/** Reads the signed-in staff member and their role. */
export function useAdminSession(): AdminSession {
  const [state, setState] = useState<AdminSession>({
    loading: true,
    userId: null,
    email: null,
    role: null,
  });

  useEffect(() => {
    let alive = true;

    async function load() {
      const { data } = await supabase.auth.getUser();
      const user = data.user ?? null;
      if (!user) {
        if (alive) setState({ loading: false, userId: null, email: null, role: null });
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const list = (roles ?? []).map((r) => r.role as string);
      const role: AdminRole = list.includes("super_admin")
        ? "super_admin"
        : list.includes("admin")
          ? "admin"
          : null;
      if (alive) setState({ loading: false, userId: user.id, email: user.email ?? null, role });
    }

    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load();
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

/** Records an admin action in the activity log. Failures are non-fatal. */
export async function logActivity(action: string) {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    await supabase.from("activity_log").insert({
      admin_name: data.user.email ?? "Administrator",
      action,
    });
  } catch {
    /* logging must never block the action */
  }
}
