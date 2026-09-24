import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHead, Panel } from "@/components/admin/kit";
import { SuperAdminOnly } from "@/components/admin/guard";
import { getLocalActivityLogs, ActivityRecord } from "@/lib/admin-auth";
import { History, Search, RefreshCw, ShieldCheck, Filter } from "lucide-react";

export const Route = createFileRoute("/admin/activity")({
  component: () => (
    <SuperAdminOnly>
      <ActivityLog />
    </SuperAdminOnly>
  ),
});

function ActivityLog() {
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [localTick, setLocalTick] = useState(0);

  // Listen for real-time local logged actions
  useEffect(() => {
    const handleLogged = () => {
      setLocalTick((t) => t + 1);
      qc.invalidateQueries({ queryKey: ["admin", "activity_log"] });
    };
    window.addEventListener("ia_activity_logged", handleLogged);
    return () => window.removeEventListener("ia_activity_logged", handleLogged);
  }, [qc]);

  const {
    data: dbRows = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin", "activity_log", localTick],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("activity_log")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200);
        if (error) {
          console.warn("Could not fetch remote activity logs, relying on audit logs:", error);
          return [];
        }
        return data ?? [];
      } catch {
        return [];
      }
    },
  });

  // Merge database records with local audit fallback, deduplicating by ID or timestamp+action
  const allRows: ActivityRecord[] = (() => {
    const local = getLocalActivityLogs();
    const seen = new Set<string>();
    const combined: ActivityRecord[] = [];

    // Prioritize db rows
    for (const r of dbRows) {
      const key = `${r.action}_${new Date(r.created_at).getTime()}`;
      seen.add(key);
      combined.push({
        id: r.id,
        admin_name: r.admin_name ?? "Administrator",
        action: r.action,
        created_at: r.created_at,
      });
    }

    // Add local audit rows not in DB
    for (const l of local) {
      const key = `${l.action}_${new Date(l.created_at).getTime()}`;
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(l);
      }
    }

    return combined.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  })();

  const filtered = allRows.filter((r) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      r.action.toLowerCase().includes(term) ||
      r.admin_name.toLowerCase().includes(term) ||
      new Date(r.created_at).toLocaleString().toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHead
          title="Activity & Audit Log"
          description="Live record of all administrative actions, changes, and modifications across the store."
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#00a884]" />
            <span>Refresh Log</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search activities, admin name, or date..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs shadow-2xs focus:border-[#00a884] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <ShieldCheck className="h-4 w-4 text-[#00a884]" />
          <span>{filtered.length} activities logged</span>
        </div>
      </div>

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2.5 pr-4 font-bold">Timestamp</th>
                <th className="py-2.5 pr-4 font-bold">Admin User</th>
                <th className="py-2.5 pr-4 font-bold">Type</th>
                <th className="py-2.5 font-bold">Action Performed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((r) => {
                const actionLower = r.action.toLowerCase();
                const isDelete = actionLower.includes("delete") || actionLower.includes("remove");
                const isCreate = actionLower.includes("create") || actionLower.includes("add");
                const isUpdate = actionLower.includes("update") || actionLower.includes("edit");

                const typeBadge = isDelete
                  ? { label: "DELETE", color: "bg-red-50 text-red-700 border-red-200" }
                  : isCreate
                    ? {
                        label: "CREATE",
                        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      }
                    : isUpdate
                      ? { label: "UPDATE", color: "bg-sky-50 text-sky-700 border-sky-200" }
                      : { label: "EVENT", color: "bg-slate-50 text-slate-700 border-slate-200" };

                return (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 pr-4 whitespace-nowrap text-xs font-mono text-slate-500">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-semibold text-xs text-slate-900">{r.admin_name}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${typeBadge.color}`}
                      >
                        {typeBadge.label}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-slate-800 font-medium">{r.action}</td>
                  </tr>
                );
              })}
              {!filtered.length && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-muted-foreground">
                    {searchTerm
                      ? "No activities match your search query."
                      : "No activities recorded yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
