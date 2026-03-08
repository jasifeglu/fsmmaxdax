import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { motion } from "framer-motion";
import { Ticket, Clock, AlertTriangle, Users, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const CoordinatorDashboard = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [tRes, pRes] = await Promise.all([
        supabase.from("tickets").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, full_name"),
      ]);
      setTickets(tRes.data || []);
      setProfiles(pRes.data || []);
      setLoading(false);
    };
    fetch();
    const channel = supabase.channel("coord-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "tickets" }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayTickets = tickets.filter(t => t.created_at?.slice(0, 10) === today);
  const pendingTickets = tickets.filter(t => ["New", "Assigned"].includes(t.status));
  const unassigned = tickets.filter(t => !t.assigned_to && t.status === "New");
  const urgentTickets = tickets.filter(t => t.priority === "Critical" || t.priority === "High").filter(t => !["Completed", "Closed"].includes(t.status)).slice(0, 5);
  const scheduledToday = tickets.filter(t => t.scheduled_at?.slice(0, 10) === today);

  if (loading) {
    return (
      <div>
        <PageHeader title="Service Coordinator" description="Today's operations overview" />
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Service Coordinator" description="Today's operations overview" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Today's Tickets" value={todayTickets.length} change={`${scheduledToday.length} scheduled`} changeType="neutral" icon={Calendar} iconColor="text-primary" />
        <StatCard title="Pending Tickets" value={pendingTickets.length} change={`${unassigned.length} unassigned`} changeType={unassigned.length > 0 ? "negative" : "neutral"} icon={Ticket} iconColor="text-warning" />
        <StatCard title="Technicians" value={profiles.length} icon={Users} iconColor="text-success" />
        <StatCard title="Urgent Alerts" value={urgentTickets.length} change={urgentTickets.length > 0 ? "Needs attention" : "All clear"} changeType={urgentTickets.length > 0 ? "negative" : "positive"} icon={AlertTriangle} iconColor="text-destructive" />
      </div>

      {urgentTickets.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Urgent Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {urgentTickets.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-2.5 rounded-lg bg-card/80 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-primary">{t.ticket_number}</span>
                      <span>{t.customer_name}</span>
                      <span className="text-muted-foreground hidden sm:inline">— {t.issue?.slice(0, 40)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {scheduledToday.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No tickets scheduled for today.</p>
            ) : (
              <div className="space-y-2">
                {scheduledToday.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors text-sm"
                  >
                    <span className="font-mono text-xs text-muted-foreground w-12">
                      {s.scheduled_at ? new Date(s.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </span>
                    <div className="h-8 w-0.5 bg-primary/30 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-primary">{s.ticket_number}</span>
                        <span className="font-medium">{s.customer_name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.category} • {s.assignee_name || "Unassigned"}</p>
                    </div>
                    <StatusBadge status={s.status} />
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tickets.slice(0, 8).map((t) => (
                <div key={t.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{t.customer_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{t.ticket_number} • {t.category}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
              {tickets.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No tickets yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
