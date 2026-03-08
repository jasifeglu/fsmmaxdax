import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { exportCSV, exportPDF } from "@/lib/exportUtils";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Ticket, CheckCircle2, Clock, XCircle, Wrench, DollarSign,
  Star, TrendingUp, Users, BarChart3, AlertTriangle, Zap,
  Target, Award, ArrowUpRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area,
} from "recharts";

// Technician data
const techMonthlyData = [
  { month: "Jan", completed: 28, pending: 5 }, { month: "Feb", completed: 32, pending: 3 },
  { month: "Mar", completed: 41, pending: 7 }, { month: "Apr", completed: 35, pending: 4 },
  { month: "May", completed: 45, pending: 6 }, { month: "Jun", completed: 38, pending: 2 },
];
const techRevenueData = [
  { month: "Jan", revenue: 42000 }, { month: "Feb", revenue: 38000 },
  { month: "Mar", revenue: 55000 }, { month: "Apr", revenue: 47000 },
  { month: "May", revenue: 62000 }, { month: "Jun", revenue: 58000 },
];
const techRadarData = [
  { metric: "Speed", value: 85 }, { metric: "Quality", value: 92 },
  { metric: "Punctuality", value: 78 }, { metric: "Customer Rating", value: 88 },
  { metric: "First-Fix Rate", value: 82 }, { metric: "Revenue", value: 75 },
];
const checkInLogs = [
  { date: "Today", checkIn: "09:15 AM", checkOut: "06:30 PM", hours: "9.25 hrs", location: "Andheri, Mumbai" },
  { date: "Yesterday", checkIn: "09:00 AM", checkOut: "05:45 PM", hours: "8.75 hrs", location: "Bandra, Mumbai" },
  { date: "Mar 5", checkIn: "08:45 AM", checkOut: "06:15 PM", hours: "9.5 hrs", location: "Juhu, Mumbai" },
  { date: "Mar 4", checkIn: "09:30 AM", checkOut: "07:00 PM", hours: "9.5 hrs", location: "Powai, Mumbai" },
];

// Coordinator data
const coordTicketTrend = [
  { month: "Jan", created: 45, resolved: 42 }, { month: "Feb", created: 52, resolved: 48 },
  { month: "Mar", created: 38, resolved: 40 }, { month: "Apr", created: 60, resolved: 55 },
  { month: "May", created: 55, resolved: 58 }, { month: "Jun", created: 48, resolved: 50 },
];
const coordRadarData = [
  { metric: "SLA Compliance", value: 91 }, { metric: "Scheduling", value: 85 },
  { metric: "Response Time", value: 78 }, { metric: "Escalation Mgmt", value: 88 },
  { metric: "Utilization", value: 82 }, { metric: "Satisfaction", value: 90 },
];

// Admin data
const adminGrowthData = [
  { month: "Jan", tickets: 120, revenue: 520000 }, { month: "Feb", tickets: 135, revenue: 480000 },
  { month: "Mar", tickets: 155, revenue: 620000 }, { month: "Apr", tickets: 142, revenue: 570000 },
  { month: "May", tickets: 168, revenue: 680000 }, { month: "Jun", tickets: 154, revenue: 640000 },
];
const adminRadarData = [
  { metric: "Team Productivity", value: 87 }, { metric: "Operational Efficiency", value: 82 },
  { metric: "Revenue Growth", value: 91 }, { metric: "Service Quality", value: 88 },
  { metric: "Resource Utilization", value: 79 }, { metric: "Customer Retention", value: 93 },
];

const chartStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

const TechnicianPerformance = () => (
  <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard title="Assigned Tickets" value={432} change="+8 this week" changeType="positive" icon={Ticket} iconColor="text-primary" />
      <StatCard title="Completed Jobs" value={398} change="92% rate" changeType="positive" icon={CheckCircle2} iconColor="text-success" />
      <StatCard title="Pending Jobs" value={22} change="5 urgent" changeType="negative" icon={Clock} iconColor="text-warning" />
      <StatCard title="First-Fix Rate" value="82%" change="+4% vs last month" changeType="positive" icon={Target} iconColor="text-info" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard title="Avg Service Time" value="1.4 hrs" change="-12 min improvement" changeType="positive" icon={Clock} iconColor="text-primary" />
      <StatCard title="Revenue Generated" value="₹3.02L" change="+22% growth" changeType="positive" icon={DollarSign} iconColor="text-success" />
      <StatCard title="Spare Parts Used" value={156} change="₹48K value" changeType="neutral" icon={Wrench} iconColor="text-warning" />
      <StatCard title="Customer Rating" value="4.6/5" change="Based on 210 reviews" changeType="positive" icon={Star} iconColor="text-warning" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      <Card className="lg:col-span-2 glass-card">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Monthly Job Performance</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={techMonthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={chartStyle} />
              <Bar dataKey="completed" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Completed" />
              <Bar dataKey="pending" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Skill Radar</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={techRadarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <Card className="glass-card">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Revenue Contribution</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={techRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={chartStyle} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Check-In / Check-Out Logs</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b">
                  <th className="text-left py-2 font-medium">Date</th>
                  <th className="text-left py-2 font-medium">In</th>
                  <th className="text-left py-2 font-medium">Out</th>
                  <th className="text-left py-2 font-medium">Hours</th>
                  <th className="text-left py-2 font-medium hidden sm:table-cell">Location</th>
                </tr>
              </thead>
              <tbody>
                {checkInLogs.map((log, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 font-medium text-foreground">{log.date}</td>
                    <td className="py-2 text-success">{log.checkIn}</td>
                    <td className="py-2 text-destructive">{log.checkOut}</td>
                    <td className="py-2 text-foreground">{log.hours}</td>
                    <td className="py-2 text-muted-foreground hidden sm:table-cell">{log.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  </>
);

const CoordinatorPerformance = () => (
  <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard title="Tickets Created" value={298} change="+15 this week" changeType="positive" icon={Ticket} iconColor="text-primary" />
      <StatCard title="Resolved Cases" value={265} change="88.9% rate" changeType="positive" icon={CheckCircle2} iconColor="text-success" />
      <StatCard title="Escalated Cases" value={12} change="4% escalation rate" changeType="negative" icon={AlertTriangle} iconColor="text-destructive" />
      <StatCard title="SLA Compliance" value="91%" change="+2% improvement" changeType="positive" icon={Target} iconColor="text-info" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard title="Avg Scheduling Time" value="28 min" change="-5 min faster" changeType="positive" icon={Clock} iconColor="text-primary" />
      <StatCard title="Tech Utilization" value="78%" change="12/18 active" changeType="neutral" icon={Users} iconColor="text-warning" />
      <StatCard title="Reassignment Rate" value="8%" change="Low is better" changeType="positive" icon={Zap} iconColor="text-success" />
      <StatCard title="Satisfaction Score" value="4.5/5" change="Based on 180 reviews" changeType="positive" icon={Star} iconColor="text-warning" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      <Card className="lg:col-span-2 glass-card">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Ticket Flow — Created vs Resolved</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={coordTicketTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={chartStyle} />
              <Line type="monotone" dataKey="created" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3 }} name="Created" />
              <Line type="monotone" dataKey="resolved" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Coordination Radar</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={coordRadarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              <Radar dataKey="value" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  </>
);

const AdminPerformance = () => (
  <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard title="Total Tickets Managed" value={1240} change="+154 this month" changeType="positive" icon={Ticket} iconColor="text-primary" />
      <StatCard title="Total Revenue" value="₹64.2L" change="+18% growth" changeType="positive" icon={DollarSign} iconColor="text-success" />
      <StatCard title="Technicians Supervised" value={18} change="12 online now" changeType="neutral" icon={Users} iconColor="text-info" />
      <StatCard title="Service Quality Index" value="4.7/5" change="Top quartile" changeType="positive" icon={Award} iconColor="text-warning" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard title="Team Productivity" value="87%" change="+5% vs Q1" changeType="positive" icon={TrendingUp} iconColor="text-primary" />
      <StatCard title="Operational Efficiency" value="82%" change="Target: 85%" changeType="neutral" icon={BarChart3} iconColor="text-warning" />
      <StatCard title="Revenue Growth Rate" value="+18%" change="YoY comparison" changeType="positive" icon={ArrowUpRight} iconColor="text-success" />
      <StatCard title="Customer Retention" value="93%" change="+2% improvement" changeType="positive" icon={Users} iconColor="text-info" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      <Card className="lg:col-span-2 glass-card">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">System Growth — Tickets & Revenue</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={adminGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={chartStyle} />
              <Bar yAxisId="left" dataKey="tickets" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Tickets" />
              <Bar yAxisId="right" dataKey="revenue" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Management KPI Radar</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={adminRadarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              <Radar dataKey="value" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  </>
);

const getExportData = (role: string) => {
  if (role === "technician") {
    return {
      summary: [
        { label: "Assigned Tickets", value: 432 }, { label: "Completed Jobs", value: 398 },
        { label: "Pending Jobs", value: 22 }, { label: "First-Fix Rate", value: "82%" },
        { label: "Avg Service Time", value: "1.4 hrs" }, { label: "Revenue Generated", value: "₹3.02L" },
        { label: "Customer Rating", value: "4.6/5" },
      ],
      headers: ["Month", "Completed", "Pending"],
      rows: techMonthlyData.map((d) => [d.month, d.completed, d.pending]),
    };
  }
  if (role === "coordinator") {
    return {
      summary: [
        { label: "Tickets Created", value: 298 }, { label: "Resolved Cases", value: 265 },
        { label: "Escalated Cases", value: 12 }, { label: "SLA Compliance", value: "91%" },
        { label: "Avg Scheduling Time", value: "28 min" }, { label: "Satisfaction Score", value: "4.5/5" },
      ],
      headers: ["Month", "Created", "Resolved"],
      rows: coordTicketTrend.map((d) => [d.month, d.created, d.resolved]),
    };
  }
  return {
    summary: [
      { label: "Total Tickets Managed", value: 1240 }, { label: "Total Revenue", value: "₹64.2L" },
      { label: "Technicians Supervised", value: 18 }, { label: "Service Quality Index", value: "4.7/5" },
      { label: "Team Productivity", value: "87%" }, { label: "Revenue Growth Rate", value: "+18%" },
    ],
    headers: ["Month", "Tickets", "Revenue (₹)"],
    rows: adminGrowthData.map((d) => [d.month, d.tickets, d.revenue]),
  };
};

const roleTitle = { admin: "Admin", coordinator: "Coordinator", technician: "Technician" };

const PerformancePage = () => {
  const { role } = useAuth();
  const data = getExportData(role);

  const handleExportPDF = () => {
    exportPDF(`${roleTitle[role]} Performance Report`, `${role}-performance-report`, data.headers, data.rows, data.summary);
  };

  const handleExportCSV = () => {
    exportCSV(`${role}-performance-data`, data.headers, data.rows);
  };

  return (
    <div>
      <PageHeader
        title="My Performance"
        description={
          role === "technician" ? "Your field performance and service metrics" :
          role === "coordinator" ? "Your coordination efficiency and KPIs" :
          "System oversight and management KPIs"
        }
      >
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handleExportCSV}>
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground gap-1.5 text-xs" onClick={handleExportPDF}>
            <FileText className="h-3.5 w-3.5" /> PDF
          </Button>
        </div>
      </PageHeader>
      {role === "technician" && <TechnicianPerformance />}
      {role === "coordinator" && <CoordinatorPerformance />}
      {role === "admin" && <AdminPerformance />}
    </div>
  );
};

export default PerformancePage;
