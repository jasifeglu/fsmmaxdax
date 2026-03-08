import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatCard } from "@/components/StatCard";
import { motion } from "framer-motion";
import {
  Users, Search, Download, Eye, BarChart3, Ticket,
  CheckCircle2, Clock, Star, TrendingUp, DollarSign, Target,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const allUsers = [
  { id: 1, name: "Amit Patel", initials: "AP", role: "Technician", status: "Available", tickets: 432, completed: 398, rating: 4.6, revenue: "₹3.02L", efficiency: 92, branch: "Ahmedabad East" },
  { id: 2, name: "Suresh Kumar", initials: "SK", role: "Technician", status: "Available", tickets: 389, completed: 355, rating: 4.3, revenue: "₹2.78L", efficiency: 88, branch: "Mumbai West" },
  { id: 3, name: "Deepak Rao", initials: "DR", role: "Technician", status: "Offline", tickets: 267, completed: 230, rating: 4.1, revenue: "₹1.95L", efficiency: 79, branch: "Pune Central" },
  { id: 4, name: "Vikram Singh", initials: "VS", role: "Technician", status: "On Leave", tickets: 312, completed: 285, rating: 4.5, revenue: "₹2.45L", efficiency: 85, branch: "Delhi NCR" },
  { id: 5, name: "Neha Gupta", initials: "NG", role: "Coordinator", status: "Available", tickets: 856, completed: 790, rating: 4.5, revenue: "—", efficiency: 91, branch: "Pune West" },
  { id: 6, name: "Rahul Singh", initials: "RS", role: "Coordinator", status: "Available", tickets: 720, completed: 660, rating: 4.2, revenue: "—", efficiency: 86, branch: "Mumbai Central" },
];

const comparisonData = [
  { name: "Amit P.", completed: 398, rating: 4.6, efficiency: 92 },
  { name: "Suresh K.", completed: 355, rating: 4.3, efficiency: 88 },
  { name: "Deepak R.", completed: 230, rating: 4.1, efficiency: 79 },
  { name: "Vikram S.", completed: 285, rating: 4.5, efficiency: 85 },
];

const radarCompare = [
  { metric: "Speed", userA: 85, userB: 78 },
  { metric: "Quality", userA: 92, userB: 85 },
  { metric: "Punctuality", userA: 78, userB: 88 },
  { metric: "Rating", userA: 88, userB: 82 },
  { metric: "Fix Rate", userA: 82, userB: 75 },
  { metric: "Revenue", userA: 75, userB: 70 },
];

const activityHistory = [
  { time: "10:32 AM", action: "Completed job TKT-1042 at Andheri", type: "success" },
  { time: "09:15 AM", action: "Checked in at customer site", type: "info" },
  { time: "09:00 AM", action: "Logged in", type: "info" },
  { time: "Yesterday", action: "Submitted invoice #INV-891 — ₹3,200", type: "success" },
  { time: "Yesterday", action: "Used 2x Compressor Filter", type: "info" },
  { time: "Mar 5", action: "Completed 3 jobs, rating 4.8 avg", type: "success" },
];

const chartStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

const UserMonitoringPage = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<typeof allUsers[0] | null>(null);

  const filtered = allUsers.filter((u) => {
    const matchRole = filter === "all" || u.role.toLowerCase() === filter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div>
      <PageHeader title="User Monitoring" description="View performance and activity of all team members">
        <Button size="sm" variant="outline" className="gap-1.5 text-xs">
          <Download className="h-3.5 w-3.5" /> Export Report
        </Button>
      </PageHeader>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Staff" value={allUsers.length} change="4 technicians, 2 coordinators" changeType="neutral" icon={Users} iconColor="text-primary" />
        <StatCard title="Avg Efficiency" value="87%" change="+3% this month" changeType="positive" icon={TrendingUp} iconColor="text-success" />
        <StatCard title="Avg Rating" value="4.4/5" change="Across all staff" changeType="positive" icon={Star} iconColor="text-warning" />
        <StatCard title="Total Revenue" value="₹10.2L" change="From technicians" changeType="positive" icon={DollarSign} iconColor="text-info" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40 h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="technician">Technicians</SelectItem>
            <SelectItem value="coordinator">Coordinators</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* User table */}
      <Card className="glass-card mb-6">
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b">
                  <th className="text-left py-2 font-medium">User</th>
                  <th className="text-left py-2 font-medium">Role</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-left py-2 font-medium hidden md:table-cell">Tickets</th>
                  <th className="text-left py-2 font-medium hidden md:table-cell">Completed</th>
                  <th className="text-left py-2 font-medium hidden sm:table-cell">Efficiency</th>
                  <th className="text-left py-2 font-medium hidden lg:table-cell">Rating</th>
                  <th className="text-left py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{u.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{u.name}</p>
                          <p className="text-[10px] text-muted-foreground">{u.branch}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5"><span className="badge-primary">{u.role}</span></td>
                    <td className="py-2.5"><StatusBadge status={u.status} /></td>
                    <td className="py-2.5 hidden md:table-cell text-foreground">{u.tickets}</td>
                    <td className="py-2.5 hidden md:table-cell text-foreground">{u.completed}</td>
                    <td className="py-2.5 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${u.efficiency}%` }} />
                        </div>
                        <span className="text-xs text-foreground">{u.efficiency}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 hidden lg:table-cell">
                      <span className="flex items-center gap-1 text-foreground">
                        <Star className="h-3 w-3 text-warning fill-warning" /> {u.rating}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <Button variant="ghost" size="sm" className="text-xs h-7 gap-1" onClick={() => setSelectedUser(u)}>
                        <Eye className="h-3 w-3" /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Comparison charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card className="glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Technician Comparison — Jobs Completed</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={chartStyle} />
                <Bar dataKey="completed" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Skill Comparison — Top 2 Technicians</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarCompare}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar dataKey="userA" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.15} name="Amit P." />
                <Radar dataKey="userB" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.15} name="Suresh K." />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User detail dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{selectedUser.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-foreground">{selectedUser.name}</p>
                    <p className="text-xs text-muted-foreground font-normal">{selectedUser.role} — {selectedUser.branch}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {[
                  { label: "Tickets", value: selectedUser.tickets, icon: Ticket, color: "text-primary" },
                  { label: "Completed", value: selectedUser.completed, icon: CheckCircle2, color: "text-success" },
                  { label: "Efficiency", value: `${selectedUser.efficiency}%`, icon: Target, color: "text-info" },
                  { label: "Rating", value: selectedUser.rating, icon: Star, color: "text-warning" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-muted/50 p-3 text-center">
                    <s.icon className={`h-4 w-4 mx-auto mb-1 ${s.color}`} />
                    <p className="text-lg font-bold text-foreground">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-foreground mb-3">Recent Activity</h4>
                <div className="space-y-2.5">
                  {activityHistory.map((a, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="flex gap-3 text-xs">
                      <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${a.type === "success" ? "bg-success" : "bg-info"}`} />
                      <div>
                        <p className="text-foreground">{a.action}</p>
                        <p className="text-muted-foreground">{a.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserMonitoringPage;
