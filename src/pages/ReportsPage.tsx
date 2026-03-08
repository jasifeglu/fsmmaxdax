import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Clock } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";

const ticketTrend = [
  { week: "W1", tickets: 28 }, { week: "W2", tickets: 35 },
  { week: "W3", tickets: 42 }, { week: "W4", tickets: 38 },
  { week: "W5", tickets: 51 }, { week: "W6", tickets: 46 },
];

const techPerformance = [
  { name: "Amit P.", completed: 48, rating: 4.8 },
  { name: "Suresh K.", completed: 42, rating: 4.5 },
  { name: "Vikram S.", completed: 36, rating: 4.7 },
  { name: "Ravi M.", completed: 30, rating: 4.3 },
  { name: "Karan M.", completed: 28, rating: 4.6 },
];

const ReportsPage = () => (
  <div>
    <PageHeader title="Reports & Analytics" description="Business intelligence and performance metrics" />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard title="First-Time Fix Rate" value="78%" change="+5% improvement" changeType="positive" icon={TrendingUp} iconColor="text-success" />
      <StatCard title="Avg Response Time" value="2.4 hrs" change="-18 min vs last month" changeType="positive" icon={Clock} iconColor="text-info" />
      <StatCard title="Customer Satisfaction" value="4.6★" icon={Users} iconColor="text-warning" />
      <StatCard title="Monthly Tickets" value={154} change="+12% growth" changeType="positive" icon={BarChart3} iconColor="text-primary" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Ticket Trend (Weekly)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={ticketTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="tickets" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Technician Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={techPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} width={70} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Key Metrics Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue", value: "₹5.8L", sub: "This month" },
            { label: "Total Expenses", value: "₹2.1L", sub: "This month" },
            { label: "Net Profit", value: "₹3.7L", sub: "+22% margin" },
            { label: "Outstanding", value: "₹1.2L", sub: "23 invoices" },
          ].map((m) => (
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

export default ReportsPage;
