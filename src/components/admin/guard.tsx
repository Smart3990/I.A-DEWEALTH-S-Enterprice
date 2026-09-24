import type { ReactNode } from "react";
import { useAdminSession } from "@/lib/admin-auth";
import { Panel } from "./kit";

/** Renders children only for System Admins. */
export function SuperAdminOnly({ children }: { children: ReactNode }) {
  const { loading, role } = useAdminSession();
  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (role !== "super_admin") {
    return (
      <Panel>
        <h1 className="text-base font-extrabold">System Admin only</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask a System Admin if you need access to this area.
        </p>
      </Panel>
    );
  }
  return <>{children}</>;
}
