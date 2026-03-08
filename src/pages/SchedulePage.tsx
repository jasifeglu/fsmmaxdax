import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

const scheduleItems = [
  { time: "09:00", ticket: "TKT-1035", customer: "Rajesh Kumar", tech: "Amit P.", type: "AC Repair", status: "Completed" },
  { time: "10:30", ticket: "TKT-1036", customer: "Meena Devi", tech: "Suresh K.", type: "Installation", status: "On-Site" },
  { time: "12:00", ticket: "TKT-1037", customer: "Vikash Singh", tech: "Amit P.", type: "Maintenance", status: "Scheduled" },
  { time: "14:00", ticket: "TKT-1038", customer: "Priya Sharma", tech: "Vikram S.", type: "Repair", status: "Assigned" },
  { time: "15:30", ticket: "TKT-1043", customer: "Kavita Joshi", tech: "Ravi M.", type: "Inspection", status: "Scheduled" },
  { time: "16:00", ticket: "TKT-1039", customer: "Sanjay Patel", tech: "Ravi M.", type: "Inspection", status: "Scheduled" },
  { time: "17:00", ticket: "TKT-1045", customer: "Deepak Verma", tech: "Karan M.", type: "AC Service", status: "Scheduled" },
];

const SchedulePage = () => (
  <div>
    <PageHeader title="Schedule" description="Service calendar and visit planning" />

    <Card className="glass-card">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <CalendarIcon className="h-4 w-4" />
          <span className="font-medium text-foreground">Today — March 8, 2026</span>
          <span className="ml-2">{scheduleItems.length} visits</span>
        </div>

        <div className="space-y-1">
          {scheduleItems.map((s) => (
            <div key={s.ticket} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors text-sm">
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default SchedulePage;
