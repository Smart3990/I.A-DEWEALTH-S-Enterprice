import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHead, Panel } from "@/components/admin/kit";
import { SuperAdminOnly } from "@/components/admin/guard";

export const Route = createFileRoute("/admin/activity")({
  component: () => (
    <SuperAdminOnly>
      <ActivityLog />
    </SuperAdminOnly>
  ),
});

function ActivityLog() {
  const { data: rows = [] } = useQuery({
    queryKey: ["admin", "activity_log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <PageHead title="Activity log" description="Who changed what, most recent first." />
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4 font-bold">When</th>
                <th className="py-2 pr-4 font-bold">Administrator</th>
                <th className="py-2 font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="py-2.5 pr-4 whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="py-2.5 pr-4">{r.admin_name}</td>
                  <td className="py-2.5">{r.action}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={3} className="py-6 text-sm text-muted-foreground">
                    Nothing recorded yet.
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
