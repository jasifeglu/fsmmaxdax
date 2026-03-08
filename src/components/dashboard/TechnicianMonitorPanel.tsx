import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Star } from "lucide-react";

interface Props {
  tickets: any[];
  profiles: any[];
}

export const TechnicianMonitorPanel = ({ tickets, profiles }: Props) => {
  const today = new Date().toISOString().slice(0, 10);

  const techData = profiles.map(p => {
    const assigned = tickets.filter(t => t.assigned_to === p.id);
    const active = assigned.filter(t => ["Assigned", "Scheduled", "On-Site", "Work-In-Progress"].includes(t.status));
    const completedToday = assigned.filter(t => t.status === "Completed" && t.completed_at?.slice(0, 10) === today);
    const status = active.length > 0 ? "On-Job" : completedToday.length > 0 ? "Available" : "Idle";
    return {
      id: p.id,
      name: p.full_name || "Unknown",
      status,
      jobsToday: completedToday.length,
      totalAssigned: assigned.length,
    };
  });

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">🧑‍🔧 Technician Monitor</CardTitle>
      </CardHeader>
      <CardContent>
        {techData.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-4">No technicians found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b">
                  <th className="text-left py-2 font-medium">Technician</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-center py-2 font-medium">Today</th>
                  <th className="text-center py-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {techData.map((t) => (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 font-medium">{t.name}</td>
                    <td className="py-2.5"><StatusBadge status={t.status === "On-Job" ? "In Progress" : t.status} /></td>
                    <td className="py-2.5 text-center font-semibold">{t.jobsToday}</td>
                    <td className="py-2.5 text-center text-muted-foreground">{t.totalAssigned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
