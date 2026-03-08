import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { motion } from "framer-motion";
import {
  Ticket, Users, Wrench, DollarSign, Package, AlertTriangle,
  TrendingUp, Clock, CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 42000 }, { month: "Feb", revenue: 38000 },
  { month: "Mar", revenue: 55000 }, { month: "Apr", revenue: 47000 },
  { month: "May", revenue: 62000 }, { month: "Jun", revenue: 58000 },
];

const ticketStatusData = [
  { name: "New", value: 24, color: "hsl(199 89% 48%)" },
  { name: "In Progress", value: 38, color: "hsl(38 92% 50%)" },
  { name: "Completed", value: 85, color: "hsl(142 71% 45%)" },
  { name: "Overdue", value: 7, color: "hsl(0 84% 60%)" },
];

const recentTickets = [
  { id: "TKT-1042", customer: "Rajesh Kumar", issue: "AC not cooling", status: "New", priority: "High", assignee: "Unassigned" },
  { id: "TKT-1041", customer: "Priya Sharma", issue: "Washing machine repair", status: "On-Site", priority: "Medium", assignee: "Amit P." },
  { id: "TKT-1040", customer: "Mohammed Ali", issue: "Refrigerator gas leak", status: "Completed", priority: "Critical", assignee: "Suresh K." },
  { id: "TKT-1039", customer: "Anita Desai", issue: "Water purifier installation", status: "Scheduled", priority: "Low", assignee: "Vikram S." },
  { id: "TKT-1038", customer: "Sanjay Patel", issue: "Microwave not heating", status: "Work-In-Progress", priority: "Medium", assignee: "Amit P." },
];

const activityFeed = [
  { time: "2 min ago", text: "TKT-1042 created — AC not cooling", type: "info" },
  { time: "15 min ago", text: "Amit P. checked in at Priya Sharma's location", type: "success" },
  { time: "32 min ago", text: "Invoice #INV-892 marked as Paid — ₹4,500", type: "success" },
  { time: "1 hr ago", text: "Low stock alert: Compressor Unit (3 left)", type: "warning" },
  { time: "2 hr ago", text: "TKT-1040 completed by Suresh K.", type: "success" },
];

export const AdminDashboard = () => {
  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Overview of all operations" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Tickets" value={154} change="+12 today" changeType="positive" icon={Ticket} iconColor="text-primary" />
        <StatCard title="Active Jobs" value={38} change="6 urgent" changeType="negative" icon={Clock} iconColor="text-warning" />
        <StatCard title="Technicians Online" value="12/18" change="6 offline" changeType="neutral" icon={Wrench} iconColor="text-success" />
        <StatCard title="Revenue (MTD)" value="₹5.8L" change="+18% vs last month" changeType="positive" icon={DollarSign} iconColor="text-success" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Pending Payments" value="₹1.2L" change="23 invoices" changeType="negative" icon={AlertTriangle} iconColor="text-destructive" />
        <StatCard title="Inventory Alerts" value={5} change="Low stock items" changeType="negative" icon={Package} iconColor="text-warning" />
        <StatCard title="Customers" value={892} change="+34 this month" changeType="positive" icon={Users} iconColor="text-info" />
        <StatCard title="Completion Rate" value="92%" change="+3% improvement" changeType="positive" icon={CheckCircle2} iconColor="text-success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ticket Status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={ticketStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {ticketStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
          <div className="px-6 pb-4 grid grid-cols-2 gap-2">
            {ticketStatusData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                <span className="text-muted-foreground">{s.name}</span>
                <span className="font-medium ml-auto">{s.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs border-b">
                    <th className="text-left py-2 font-medium">ID</th>
                    <th className="text-left py-2 font-medium">Customer</th>
                    <th className="text-left py-2 font-medium hidden md:table-cell">Issue</th>
                    <th className="text-left py-2 font-medium">Status</th>
                    <th className="text-left py-2 font-medium hidden sm:table-cell">Priority</th>
                    <th className="text-left py-2 font-medium hidden lg:table-cell">Assignee</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTickets.map((t) => (
                    <tr key={t.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 font-mono text-xs text-primary">{t.id}</td>
                      <td className="py-2.5">{t.customer}</td>
                      <td className="py-2.5 text-muted-foreground hidden md:table-cell">{t.issue}</td>
                      <td className="py-2.5"><StatusBadge status={t.status} /></td>
                      <td className="py-2.5 hidden sm:table-cell"><StatusBadge status={t.priority} /></td>
                      <td className="py-2.5 text-muted-foreground hidden lg:table-cell">{t.assignee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Activity Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activityFeed.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3 text-xs"
                >
                  <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                    a.type === "success" ? "bg-success" : a.type === "warning" ? "bg-warning" : "bg-info"
                  }`} />
                  <div>
                    <p className="text-foreground leading-relaxed">{a.text}</p>
                    <p className="text-muted-foreground mt-0.5">{a.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
