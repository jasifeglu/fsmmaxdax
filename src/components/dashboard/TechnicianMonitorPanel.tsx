import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Star, MapPin } from "lucide-react";

const technicians = [
  { name: "Amit Patil", status: "On-Job", location: "Andheri West", jobsToday: 4, rating: 4.5, revenue: "₹12,500" },
  { name: "Suresh Kumar", status: "Available", location: "Bandra East", jobsToday: 5, rating: 4.8, revenue: "₹18,200" },
  { name: "Vikram Singh", status: "Available", location: "Powai", jobsToday: 3, rating: 4.2, revenue: "₹9,800" },
  { name: "Ravi Mehta", status: "On-Job", location: "Dadar", jobsToday: 4, rating: 4.6, revenue: "₹15,600" },
  { name: "Prakash Deshmukh", status: "Offline", location: "—", jobsToday: 0, rating: 3.9, revenue: "₹0" },
  { name: "Anil Sharma", status: "On-Job", location: "Malad", jobsToday: 3, rating: 4.3, revenue: "₹11,400" },
];

export const TechnicianMonitorPanel = () => (
  <Card className="glass-card">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">🧑‍🔧 Technician Monitor</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground text-xs border-b">
              <th className="text-left py-2 font-medium">Technician</th>
              <th className="text-left py-2 font-medium">Status</th>
              <th className="text-left py-2 font-medium hidden md:table-cell">Location</th>
              <th className="text-center py-2 font-medium">Jobs</th>
              <th className="text-center py-2 font-medium hidden sm:table-cell">Rating</th>
              <th className="text-right py-2 font-medium hidden lg:table-cell">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {technicians.map((t) => (
              <tr key={t.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-2.5 font-medium">{t.name}</td>
                <td className="py-2.5"><StatusBadge status={t.status} /></td>
                <td className="py-2.5 text-muted-foreground hidden md:table-cell">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{t.location}</span>
                </td>
                <td className="py-2.5 text-center font-semibold">{t.jobsToday}</td>
                <td className="py-2.5 hidden sm:table-cell">
                  <span className="flex items-center justify-center gap-0.5 text-warning">
                    <Star className="h-3 w-3 fill-current" />{t.rating}
                  </span>
                </td>
                <td className="py-2.5 text-right font-mono text-xs hidden lg:table-cell">{t.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);
