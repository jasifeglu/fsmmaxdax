import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Clock } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useDemoMode } from "@/hooks/useDemoMode";
import { formatINRCompact } from "@/lib/formatINR";

const mockTicketTrend = [
  { week: "W1", tickets: 28 }, { week: "W2", tickets: 35 },
  { week: "W3", tickets: 42 }, { week: "W4", tickets: 38 },
  { week: "W5", tickets: 51 }, { week: "W6", tickets: 46 },
];
const mockTechPerformance = [
  { name: "Amit P.", completed: 48, rating: 4.8 },
  { name: "Suresh K.", completed: 42, rating: 4.5 },
  { name: "Vikram S.", completed: 36, rating: 4.7 },
  { name: "Ravi M.", completed: 30, rating: 4.3 },
  { name: "Karan M.", completed: 28, rating: 4.6 },
];
const mockKeyMetrics = [
  { label: "Total Revenue", value: "₹5.8L", sub: "This month" },
  { label: "Total Expenses", value: "₹2.1L", sub: "This month" },
  { label: "Net Profit", value: "₹3.7L", sub: "+22% margin" },
  { label: "Outstanding", value: "₹1.2L", sub: "23 invoices" },
];

const ReportsPage = () => {
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

  // Real KPI stats
  const completedTickets = tickets.filter(t => ["Completed", "Closed"].includes(t.status));
  const totalTickets = tickets.length;
  const firstFixRate = totalTickets > 0 ? Math.round(completedTickets.length / totalTickets * 100) : 0;
  const monthlyTickets = tickets.filter(t => {
    const d = new Date(t.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Real ticket trend (weekly, last 6 weeks)
  const realTicketTrend = useMemo(() => {
    const now = Date.now();
    const weeks: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      weeks[`W${6 - i}`] = 0;
    }
    tickets.forEach(t => {
      const age = Math.floor((now - new Date(t.created_at).getTime()) / (7 * 86400000));
      if (age < 6) {
        const key = `W${6 - age}`;
        if (weeks[key] !== undefined) weeks[key]++;
      }
    });
    return Object.entries(weeks).map(([week, count]) => ({ week, tickets: count }));
  }, [tickets]);

  // Real tech performance
  const realTechPerformance = useMemo(() => {
    return profiles.map(p => {
      const completed = tickets.filter(t => t.assigned_to === p.id && ["Completed", "Closed"].includes(t.status)).length;
      return { name: (p.full_name || "Unknown").split(" ").map((w: string) => w[0] + w.slice(1, 3)).join(" "), completed, rating: 0 };
    }).filter(t => t.completed > 0).sort((a, b) => b.completed - a.completed).slice(0, 5);
  }, [tickets, profiles]);

  // Real key metrics
  const paidInvoices = invoices.filter(i => i.payment_status === "Paid");
  const pendingInvoices = invoices.filter(i => i.payment_status === "Pending");
  const totalRevenue = paidInvoices.reduce((s, i) => s + Number(i.grand_total || 0), 0);
  const totalOutstanding = pendingInvoices.reduce((s, i) => s + Number(i.grand_total || 0), 0);
  const realKeyMetrics = [
    { label: "Total Revenue", value: formatINRCompact(totalRevenue), sub: "Paid invoices" },
    { label: "Total Invoices", value: String(invoices.length), sub: "All time" },
    { label: "Paid Invoices", value: String(paidInvoices.length), sub: `${invoices.length > 0 ? Math.round(paidInvoices.length / invoices.length * 100) : 0}% collected` },
    { label: "Outstanding", value: formatINRCompact(totalOutstanding), sub: `${pendingInvoices.length} invoices` },
  ];

  const ticketTrend = isDemoMode ? mockTicketTrend : realTicketTrend;
  const techPerformance = isDemoMode ? mockTechPerformance : realTechPerformance;
  const keyMetrics = isDemoMode ? mockKeyMetrics : realKeyMetrics;

  return (
    <div>
      <PageHeader title="Reports & Analytics" description="Business intelligence and performance metrics" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="First-Time Fix Rate" value={isDemoMode ? "78%" : `${firstFixRate}%`} icon={TrendingUp} iconColor="text-success" />
        <StatCard title="Avg Response Time" value={isDemoMode ? "2.4 hrs" : "—"} icon={Clock} iconColor="text-info" />
        <StatCard title="Total Tickets" value={isDemoMode ? "154" : totalTickets} icon={Users} iconColor="text-warning" />
        <StatCard title="Monthly Tickets" value={isDemoMode ? 154 : monthlyTickets} icon={BarChart3} iconColor="text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ticket Trend (Weekly)</CardTitle>
          </CardHeader>
          <CardContent>
            {ticketTrend.every(t => t.tickets === 0) && !isDemoMode ? (
              <p className="text-center text-xs text-muted-foreground py-16">No ticket data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={ticketTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="tickets" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Technician Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {techPerformance.length === 0 && !isDemoMode ? (
              <p className="text-center text-xs text-muted-foreground py-16">No performance data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={techPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} width={70} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Key Metrics Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {keyMetrics.map((m) => (
              <div key={m.label} className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-lg font-bold">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{m.sub}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
