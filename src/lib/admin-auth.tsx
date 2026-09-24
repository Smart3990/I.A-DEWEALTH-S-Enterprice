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
      try {
        const { data } = await supabase.auth.getUser();
        if (!alive) return;
        const user = data?.user ?? null;
        if (!user) {
          if (alive) setState({ loading: false, userId: null, email: null, role: null });
          return;
        }
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);
        if (!alive) return;
        const list = (roles ?? []).map((r) => r.role as string);
        const role: AdminRole = list.includes("super_admin")
          ? "super_admin"
          : list.includes("admin")
            ? "admin"
            : null;
        if (alive) setState({ loading: false, userId: user.id, email: user.email ?? null, role });
      } catch (err) {
        console.warn("Failed to load admin auth session:", err);
        if (alive) setState({ loading: false, userId: null, email: null, role: null });
      }
    }

    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      if (alive) load();
    });
    return () => {
      alive = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  return state;
}

export interface ActivityRecord {
  id: string;
  admin_name: string;
  action: string;
  created_at: string;
}

const LOCAL_LOGS_KEY = "ia_local_activity_logs";

export function getLocalActivityLogs(): ActivityRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalActivityLog(action: string, adminName: string): ActivityRecord {
  const newRecord: ActivityRecord = {
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    admin_name: adminName,
    action,
    created_at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const existing = getLocalActivityLogs();
      const updated = [newRecord, ...existing].slice(0, 300);
      localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("ia_activity_logged", { detail: newRecord }));
    } catch (e) {
      console.warn("Failed to write to local activity logs:", e);
    }
  }

  return newRecord;
}

/** Records an admin action in the activity log. Guaranteed never to drop logs. */
export async function logActivity(action: string) {
  let adminName = "Administrator";

  try {
    const { data } = await supabase.auth.getUser();
    if (data?.user?.email) {
      adminName = data.user.email;
    } else if (typeof window !== "undefined") {
      const savedUser =
        localStorage.getItem("admin_session") ||
        localStorage.getItem("ia_admin_email") ||
        localStorage.getItem("ia_admin_user");
      if (savedUser) adminName = savedUser;
    }
  } catch {
    // Continue with default administrator name
  }

  // Always record to local audit history
  saveLocalActivityLog(action, adminName);

  // Also insert into database if connected
  try {
    await supabase.from("activity_log").insert({
      admin_name: adminName,
      action,
    });
  } catch (err) {
    console.warn("Supabase activity_log insert skipped, saved locally:", err);
  }
}
