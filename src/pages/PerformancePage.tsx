import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { exportCSV, exportPDF } from "@/lib/exportUtils";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Ticket, CheckCircle2, Clock, Wrench, DollarSign,
  Star, TrendingUp, Users, BarChart3, AlertTriangle, Zap,
  Target, Award, ArrowUpRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useDemoMode } from "@/hooks/useDemoMode";
import { formatINRCompact } from "@/lib/formatINR";

// ── Mock data (only shown in demo mode) ──
const mockTechMonthlyData = [
  { month: "Jan", completed: 28, pending: 5 }, { month: "Feb", completed: 32, pending: 3 },
  { month: "Mar", completed: 41, pending: 7 }, { month: "Apr", completed: 35, pending: 4 },
  { month: "May", completed: 45, pending: 6 }, { month: "Jun", completed: 38, pending: 2 },
];
const mockTechRadarData = [
  { metric: "Speed", value: 85 }, { metric: "Quality", value: 92 },
  { metric: "Punctuality", value: 78 }, { metric: "Customer Rating", value: 88 },
  { metric: "First-Fix Rate", value: 82 }, { metric: "Revenue", value: 75 },
];
const mockTechRevenueData = [
  { month: "Jan", revenue: 42000 }, { month: "Feb", revenue: 38000 },
  { month: "Mar", revenue: 55000 }, { month: "Apr", revenue: 47000 },
  { month: "May", revenue: 62000 }, { month: "Jun", revenue: 58000 },
];
const mockCheckInLogs = [
  { date: "Today", checkIn: "09:15 AM", checkOut: "06:30 PM", hours: "9.25 hrs", location: "Andheri, Mumbai" },
  { date: "Yesterday", checkIn: "09:00 AM", checkOut: "05:45 PM", hours: "8.75 hrs", location: "Bandra, Mumbai" },
  { date: "Mar 5", checkIn: "08:45 AM", checkOut: "06:15 PM", hours: "9.5 hrs", location: "Juhu, Mumbai" },
  { date: "Mar 4", checkIn: "09:30 AM", checkOut: "07:00 PM", hours: "9.5 hrs", location: "Powai, Mumbai" },
];
const mockCoordTicketTrend = [
  { month: "Jan", created: 45, resolved: 42 }, { month: "Feb", created: 52, resolved: 48 },
  { month: "Mar", created: 38, resolved: 40 }, { month: "Apr", created: 60, resolved: 55 },
  { month: "May", created: 55, resolved: 58 }, { month: "Jun", created: 48, resolved: 50 },
];
const mockCoordRadarData = [
  { metric: "SLA Compliance", value: 91 }, { metric: "Scheduling", value: 85 },
  { metric: "Response Time", value: 78 }, { metric: "Escalation Mgmt", value: 88 },
  { metric: "Utilization", value: 82 }, { metric: "Satisfaction", value: 90 },
];
const mockAdminGrowthData = [
  { month: "Jan", tickets: 120, revenue: 520000 }, { month: "Feb", tickets: 135, revenue: 480000 },
  { month: "Mar", tickets: 155, revenue: 620000 }, { month: "Apr", tickets: 142, revenue: 570000 },
  { month: "May", tickets: 168, revenue: 680000 }, { month: "Jun", tickets: 154, revenue: 640000 },
];
const mockAdminRadarData = [
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

const EmptyState = ({ message }: { message: string }) => (
  <p className="text-center text-xs text-muted-foreground py-16">{message}</p>
);

const TechnicianPerformance = ({ isDemoMode, tickets, userId }: { isDemoMode: boolean; tickets: any[]; userId?: string }) => {
  const myTickets = tickets.filter(t => t.assigned_to === userId);
  const completed = myTickets.filter(t => ["Completed", "Closed"].includes(t.status));
  const pending = myTickets.filter(t => !["Completed", "Closed", "Cancelled"].includes(t.status));
  const completedCount = completed.length;
  const totalCount = myTickets.length;
  const firstFixRate = totalCount > 0 ? Math.round(completedCount / totalCount * 100) : 0;

  const monthlyData = useMemo(() => {
    if (isDemoMode) return mockTechMonthlyData;
    const months: Record<string, { completed: number; pending: number }> = {};
    myTickets.forEach(t => {
      const m = new Date(t.created_at).toLocaleString("default", { month: "short" });
      if (!months[m]) months[m] = { completed: 0, pending: 0 };
      if (["Completed", "Closed"].includes(t.status)) months[m].completed++;
      else months[m].pending++;
    });
    return Object.entries(months).slice(-6).map(([month, d]) => ({ month, ...d }));
  }, [isDemoMode, myTickets]);

  const [checkins, setCheckins] = useState<any[]>([]);
  useEffect(() => {
    if (isDemoMode || !userId) return;
    supabase.from("selfie_checkins").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(5)
      .then(({ data }) => setCheckins(data || []));
  }, [isDemoMode, userId]);

  const checkInLogs = isDemoMode ? mockCheckInLogs : checkins.map(c => ({
    date: new Date(c.created_at).toLocaleDateString(),
    checkIn: c.checkin_type === "check_in" ? new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
    checkOut: c.checkin_type === "check_out" ? new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
    hours: "—",
    location: c.address || "—",
  }));

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Assigned Tickets" value={isDemoMode ? 432 : totalCount} icon={Ticket} iconColor="text-primary" />
        <StatCard title="Completed Jobs" value={isDemoMode ? 398 : completedCount} icon={CheckCircle2} iconColor="text-success" />
        <StatCard title="Pending Jobs" value={isDemoMode ? 22 : pending.length} icon={Clock} iconColor="text-warning" />
        <StatCard title="First-Fix Rate" value={isDemoMode ? "82%" : `${firstFixRate}%`} icon={Target} iconColor="text-info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Monthly Job Performance</CardTitle></CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? <EmptyState message="No job data yet" /> : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={chartStyle} />
                  <Bar dataKey="completed" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Completed" />
                  <Bar dataKey="pending" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Skill Radar</CardTitle></CardHeader>
          <CardContent>
            {isDemoMode ? (
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={mockTechRadarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis tick={false} axisLine={false} />
                  <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            ) : <EmptyState message="Skill data not available yet" />}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card className="glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Revenue Contribution</CardTitle></CardHeader>
          <CardContent>
            {isDemoMode ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={mockTechRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={chartStyle} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <EmptyState message="Revenue data not available yet" />}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Check-In / Check-Out Logs</CardTitle></CardHeader>
          <CardContent>
            {checkInLogs.length === 0 ? <EmptyState message="No check-in logs yet" /> : (
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
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

const CoordinatorPerformance = ({ isDemoMode, tickets }: { isDemoMode: boolean; tickets: any[] }) => {
  const totalCreated = tickets.length;
  const resolved = tickets.filter(t => ["Completed", "Closed"].includes(t.status)).length;
  const escalated = tickets.filter(t => t.priority === "Critical" || t.priority === "High").length;
  const slaCompliance = totalCreated > 0 ? Math.round(resolved / totalCreated * 100) : 0;

  const ticketTrend = useMemo(() => {
    if (isDemoMode) return mockCoordTicketTrend;
    const months: Record<string, { created: number; resolved: number }> = {};
    tickets.forEach(t => {
      const m = new Date(t.created_at).toLocaleString("default", { month: "short" });
      if (!months[m]) months[m] = { created: 0, resolved: 0 };
      months[m].created++;
      if (["Completed", "Closed"].includes(t.status)) months[m].resolved++;
    });
    return Object.entries(months).slice(-6).map(([month, d]) => ({ month, ...d }));
  }, [isDemoMode, tickets]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Tickets Created" value={isDemoMode ? 298 : totalCreated} icon={Ticket} iconColor="text-primary" />
        <StatCard title="Resolved Cases" value={isDemoMode ? 265 : resolved} icon={CheckCircle2} iconColor="text-success" />
        <StatCard title="Escalated Cases" value={isDemoMode ? 12 : escalated} icon={AlertTriangle} iconColor="text-destructive" />
        <StatCard title="SLA Compliance" value={isDemoMode ? "91%" : `${slaCompliance}%`} icon={Target} iconColor="text-info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Ticket Flow — Created vs Resolved</CardTitle></CardHeader>
          <CardContent>
            {ticketTrend.length === 0 ? <EmptyState message="No ticket data yet" /> : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={ticketTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={chartStyle} />
                  <Line type="monotone" dataKey="created" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3 }} name="Created" />
                  <Line type="monotone" dataKey="resolved" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} name="Resolved" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Coordination Radar</CardTitle></CardHeader>
          <CardContent>
            {isDemoMode ? (
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={mockCoordRadarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis tick={false} axisLine={false} />
                  <Radar dataKey="value" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            ) : <EmptyState message="Radar data not available yet" />}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

const AdminPerformance = ({ isDemoMode, tickets, invoices, profiles }: { isDemoMode: boolean; tickets: any[]; invoices: any[]; profiles: any[] }) => {
  const totalTickets = tickets.length;
  const totalRevenue = invoices.filter(i => i.payment_status === "Paid").reduce((s, i) => s + Number(i.grand_total || 0), 0);
  const completedCount = tickets.filter(t => ["Completed", "Closed"].includes(t.status)).length;
  const qualityIndex = totalTickets > 0 ? (completedCount / totalTickets * 5).toFixed(1) : "0";
  const productivity = totalTickets > 0 ? Math.round(completedCount / totalTickets * 100) : 0;

  const growthData = useMemo(() => {
    if (isDemoMode) return mockAdminGrowthData;
    const months: Record<string, { tickets: number; revenue: number }> = {};
    tickets.forEach(t => {
      const m = new Date(t.created_at).toLocaleString("default", { month: "short" });
      if (!months[m]) months[m] = { tickets: 0, revenue: 0 };
      months[m].tickets++;
    });
    invoices.filter(i => i.payment_status === "Paid").forEach(inv => {
      const m = new Date(inv.invoice_date || inv.created_at).toLocaleString("default", { month: "short" });
      if (!months[m]) months[m] = { tickets: 0, revenue: 0 };
      months[m].revenue += Number(inv.grand_total || 0);
    });
    return Object.entries(months).slice(-6).map(([month, d]) => ({ month, ...d }));
  }, [isDemoMode, tickets, invoices]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Tickets Managed" value={isDemoMode ? 1240 : totalTickets} icon={Ticket} iconColor="text-primary" />
        <StatCard title="Total Revenue" value={isDemoMode ? "₹64.2L" : formatINRCompact(totalRevenue)} icon={DollarSign} iconColor="text-success" />
        <StatCard title="Team Members" value={isDemoMode ? 18 : profiles.length} icon={Users} iconColor="text-info" />
        <StatCard title="Service Quality Index" value={isDemoMode ? "4.7/5" : `${qualityIndex}/5`} icon={Award} iconColor="text-warning" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Team Productivity" value={isDemoMode ? "87%" : `${productivity}%`} icon={TrendingUp} iconColor="text-primary" />
        <StatCard title="Completion Rate" value={isDemoMode ? "82%" : `${productivity}%`} icon={BarChart3} iconColor="text-warning" />
        <StatCard title="Completed Tickets" value={isDemoMode ? 1020 : completedCount} icon={CheckCircle2} iconColor="text-success" />
        <StatCard title="Pending Tickets" value={isDemoMode ? 220 : totalTickets - completedCount} icon={Clock} iconColor="text-info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">System Growth — Tickets & Revenue</CardTitle></CardHeader>
          <CardContent>
            {growthData.length === 0 ? <EmptyState message="No growth data yet" /> : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={chartStyle} />
                  <Bar yAxisId="left" dataKey="tickets" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Tickets" />
                  <Bar yAxisId="right" dataKey="revenue" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Management KPI Radar</CardTitle></CardHeader>
          <CardContent>
            {isDemoMode ? (
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={mockAdminRadarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis tick={false} axisLine={false} />
                  <Radar dataKey="value" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            ) : <EmptyState message="KPI radar not available yet" />}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

const roleTitle: Record<string, string> = { admin: "Admin", coordinator: "Coordinator", technician: "Technician" };

const PerformancePage = () => {
  const { role, user } = useAuth();
  const isDemoMode = useDemoMode();
  const [tickets, setTickets] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [tRes, invRes, pRes] = await Promise.all([
        supabase.from("tickets").select("*"),
        supabase.from("invoices").select("*"),
        supabase.from("profiles").select("id, full_name"),
      ]);
      setTickets(tRes.data || []);
      setInvoices(invRes.data || []);
      setProfiles(pRes.data || []);
    };
    fetch();
  }, []);

  const handleExportCSV = () => {
    exportCSV(`${role}-performance-data`, ["Metric", "Value"], []);
  };

  const handleExportPDF = () => {
    exportPDF(`${roleTitle[role]} Performance Report`, `${role}-performance-report`, ["Metric", "Value"], [], []);
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
      {role === "technician" && <TechnicianPerformance isDemoMode={isDemoMode} tickets={tickets} userId={user?.id} />}
      {role === "coordinator" && <CoordinatorPerformance isDemoMode={isDemoMode} tickets={tickets} />}
      {role === "admin" && <AdminPerformance isDemoMode={isDemoMode} tickets={tickets} invoices={invoices} profiles={profiles} />}
    </div>
  );
};

export default PerformancePage;
