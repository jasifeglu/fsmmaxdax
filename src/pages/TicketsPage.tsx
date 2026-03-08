import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const allTickets = [
  { id: "TKT-1042", customer: "Rajesh Kumar", phone: "+91 98765 43210", issue: "AC not cooling properly", category: "AC Repair", status: "New", priority: "High", assignee: "Unassigned", created: "10 min ago", sla: "4 hrs" },
  { id: "TKT-1041", customer: "Priya Sharma", phone: "+91 87654 32109", issue: "Washing machine not draining", category: "Appliance Repair", status: "On-Site", priority: "Medium", assignee: "Amit P.", created: "2 hrs ago", sla: "6 hrs" },
  { id: "TKT-1040", customer: "Mohammed Ali", phone: "+91 76543 21098", issue: "Refrigerator gas leak", category: "Refrigerator", status: "Completed", priority: "Critical", assignee: "Suresh K.", created: "5 hrs ago", sla: "2 hrs" },
  { id: "TKT-1039", customer: "Anita Desai", phone: "+91 65432 10987", issue: "Water purifier installation", category: "Installation", status: "Scheduled", priority: "Low", assignee: "Vikram S.", created: "1 day ago", sla: "24 hrs" },
  { id: "TKT-1038", customer: "Sanjay Patel", phone: "+91 54321 09876", issue: "Microwave not heating", category: "Appliance Repair", status: "Work-In-Progress", priority: "Medium", assignee: "Amit P.", created: "1 day ago", sla: "8 hrs" },
  { id: "TKT-1037", customer: "Kavita Joshi", phone: "+91 43210 98765", issue: "Chimney servicing", category: "Maintenance", status: "Assigned", priority: "Low", assignee: "Ravi M.", created: "2 days ago", sla: "48 hrs" },
  { id: "TKT-1036", customer: "Deepak Verma", phone: "+91 32109 87654", issue: "Geyser leaking from top", category: "Plumbing", status: "Closed", priority: "High", assignee: "Deepak R.", created: "3 days ago", sla: "4 hrs" },
];

const TicketsPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = allTickets.filter((t) => {
    const matchSearch = t.customer.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status.toLowerCase().replace(/\s+/g, "-") === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <PageHeader title="Service Tickets" description="Manage all service requests">
        <Button size="sm" className="bg-primary text-primary-foreground gap-1.5">
          <Plus className="h-3.5 w-3.5" /> New Ticket
        </Button>
      </PageHeader>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 h-9 text-sm">
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="on-site">On-Site</SelectItem>
                <SelectItem value="work-in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b">
                  <th className="text-left py-2 font-medium">Ticket</th>
                  <th className="text-left py-2 font-medium">Customer</th>
                  <th className="text-left py-2 font-medium hidden md:table-cell">Issue</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-left py-2 font-medium hidden sm:table-cell">Priority</th>
                  <th className="text-left py-2 font-medium hidden lg:table-cell">Assignee</th>
                  <th className="text-left py-2 font-medium hidden lg:table-cell">SLA</th>
                  <th className="text-left py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 font-mono text-xs text-primary">{t.id}</td>
                    <td className="py-2.5">
                      <div>
                        <span className="font-medium">{t.customer}</span>
                        <span className="block text-xs text-muted-foreground">{t.phone}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-muted-foreground hidden md:table-cell max-w-48 truncate">{t.issue}</td>
                    <td className="py-2.5"><StatusBadge status={t.status} /></td>
                    <td className="py-2.5 hidden sm:table-cell"><StatusBadge status={t.priority} /></td>
                    <td className="py-2.5 text-muted-foreground hidden lg:table-cell">{t.assignee}</td>
                    <td className="py-2.5 text-xs text-muted-foreground hidden lg:table-cell">{t.sla}</td>
                    <td className="py-2.5">
                      <Button variant="ghost" size="sm" className="text-xs h-7">View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketsPage;
