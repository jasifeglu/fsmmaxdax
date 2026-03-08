import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { motion } from "framer-motion";
import { Ticket, Clock, AlertTriangle, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const todaySchedule = [
  { time: "09:00", ticket: "TKT-1035", customer: "Rajesh Kumar", tech: "Amit P.", type: "AC Repair", status: "Scheduled" },
  { time: "10:30", ticket: "TKT-1036", customer: "Meena Devi", tech: "Suresh K.", type: "Installation", status: "On-Site" },
  { time: "12:00", ticket: "TKT-1037", customer: "Vikash Singh", tech: "Amit P.", type: "Maintenance", status: "Scheduled" },
  { time: "14:00", ticket: "TKT-1038", customer: "Priya Sharma", tech: "Vikram S.", type: "Repair", status: "Assigned" },
  { time: "16:00", ticket: "TKT-1039", customer: "Sanjay Patel", tech: "Ravi M.", type: "Inspection", status: "Scheduled" },
];

const techAvailability = [
  { name: "Amit P.", status: "On-Job", jobs: 3, location: "Sector 42, Gurugram" },
  { name: "Suresh K.", status: "Available", jobs: 1, location: "Office" },
  { name: "Vikram S.", status: "On-Job", jobs: 2, location: "Dwarka, Delhi" },
  { name: "Ravi M.", status: "Available", jobs: 2, location: "Office" },
  { name: "Deepak R.", status: "Offline", jobs: 0, location: "—" },
];

const urgentTickets = [
  { id: "TKT-1042", customer: "Anita Desai", issue: "Gas leak — immediate", priority: "Critical", age: "45 min" },
  { id: "TKT-1040", customer: "Mohammed Ali", issue: "No power — commercial", priority: "High", age: "2 hrs" },
];

export const CoordinatorDashboard = () => {
  return (
    <div>
      <PageHeader title="Service Coordinator" description="Today's operations overview">
        <Button size="sm" className="bg-primary text-primary-foreground">
          + New Ticket
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Today's Schedule" value={12} change="3 remaining" changeType="neutral" icon={Calendar} iconColor="text-primary" />
        <StatCard title="Pending Tickets" value={8} change="2 unassigned" changeType="negative" icon={Ticket} iconColor="text-warning" />
        <StatCard title="Technicians Available" value="4/6" change="1 offline" changeType="neutral" icon={Users} iconColor="text-success" />
        <StatCard title="Urgent Alerts" value={2} change="Needs attention" changeType="negative" icon={AlertTriangle} iconColor="text-destructive" />
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
                      <span className="font-mono text-xs text-primary">{t.id}</span>
                      <span>{t.customer}</span>
                      <span className="text-muted-foreground hidden sm:inline">— {t.issue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={t.priority} />
                      <span className="text-xs text-muted-foreground">{t.age}</span>
                      <Button variant="outline" size="sm" className="text-xs h-7">Assign</Button>
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
            <div className="space-y-2">
              {todaySchedule.map((s, i) => (
                <motion.div
                  key={s.ticket}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors text-sm"
                >
                  <span className="font-mono text-xs text-muted-foreground w-12">{s.time}</span>
                  <div className="h-8 w-0.5 bg-primary/30 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-primary">{s.ticket}</span>
                      <span className="font-medium">{s.customer}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{s.type} • {s.tech}</p>
                  </div>
                  <StatusBadge status={s.status} />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Technician Board</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {techAvailability.map((t) => (
                <div key={t.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.location}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={t.status} />
                    <p className="text-xs text-muted-foreground mt-1">{t.jobs} jobs</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
