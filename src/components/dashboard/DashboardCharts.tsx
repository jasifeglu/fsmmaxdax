import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

interface Props {
  tickets: any[];
  invoices: any[];
  inventory: any[];
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--accent))", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"];

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

export const DashboardCharts = ({ tickets, invoices, inventory }: Props) => {
  const statusDist = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tickets]);

  const revenueTrend = useMemo(() => {
    const months: Record<string, number> = {};
    invoices.filter(i => i.payment_status === "Paid").forEach(inv => {
      const m = inv.invoice_date?.slice(0, 7);
      if (m) months[m] = (months[m] || 0) + Number(inv.grand_total || 0);
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, revenue]) => ({ month: month.slice(5), revenue: Math.round(revenue) }));
  }, [invoices]);

  const categoryDist = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [tickets]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Ticket Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            {statusDist.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center pt-20">No tickets yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusDist} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {statusDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            {revenueTrend.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center pt-20">No invoice data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Complaint Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            {categoryDist.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center pt-20">No tickets yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryDist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Tickets" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
