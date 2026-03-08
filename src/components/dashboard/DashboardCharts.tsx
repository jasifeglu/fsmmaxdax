import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from "recharts";

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

const tickStyle = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };

const revenueData = [
  { month: "Jan", revenue: 42000 }, { month: "Feb", revenue: 38000 },
  { month: "Mar", revenue: 55000 }, { month: "Apr", revenue: 47000 },
  { month: "May", revenue: 62000 }, { month: "Jun", revenue: 58000 },
  { month: "Jul", revenue: 64000 },
];

const ticketStatusData = [
  { name: "New", value: 24, color: "hsl(var(--info))" },
  { name: "In Progress", value: 38, color: "hsl(var(--warning))" },
  { name: "Completed", value: 85, color: "hsl(var(--success))" },
  { name: "Overdue", value: 7, color: "hsl(var(--destructive))" },
];

const techProductivity = [
  { name: "Amit P.", jobs: 28, rating: 4.5 },
  { name: "Suresh K.", jobs: 35, rating: 4.8 },
  { name: "Vikram S.", jobs: 22, rating: 4.2 },
  { name: "Ravi M.", jobs: 31, rating: 4.6 },
  { name: "Prakash D.", jobs: 19, rating: 3.9 },
];

const completionTime = [
  { day: "Mon", hours: 3.2 }, { day: "Tue", hours: 2.8 },
  { day: "Wed", hours: 4.1 }, { day: "Thu", hours: 3.5 },
  { day: "Fri", hours: 2.6 }, { day: "Sat", hours: 3.8 },
];

const categoryData = [
  { name: "AC", value: 42, color: "hsl(var(--primary))" },
  { name: "Washing Machine", value: 28, color: "hsl(var(--success))" },
  { name: "Refrigerator", value: 18, color: "hsl(var(--warning))" },
  { name: "Water Purifier", value: 12, color: "hsl(var(--info))" },
];

const inventoryUsage = [
  { month: "Jan", used: 120, restocked: 150 },
  { month: "Feb", used: 135, restocked: 100 },
  { month: "Mar", used: 160, restocked: 180 },
  { month: "Apr", used: 140, restocked: 120 },
  { month: "May", used: 175, restocked: 200 },
  { month: "Jun", used: 155, restocked: 160 },
];

export const DashboardCharts = () => (
  <div className="space-y-4 mb-6">
    {/* Row 1: Revenue + Ticket Status */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2 glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={tickStyle} />
              <YAxis tick={tickStyle} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`₹${v.toLocaleString()}`, "Revenue"]} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Ticket Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={ticketStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                {ticketStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
        <div className="px-6 pb-4 grid grid-cols-2 gap-1.5">
          {ticketStatusData.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5 text-xs">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-muted-foreground">{s.name}</span>
              <span className="font-semibold ml-auto">{s.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>

    {/* Row 2: Tech Productivity + Completion Time + Categories */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Technician Productivity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={techProductivity} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={tickStyle} />
              <YAxis dataKey="name" type="category" tick={tickStyle} width={70} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="jobs" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={completionTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={tickStyle} />
              <YAxis tick={tickStyle} tickFormatter={(v) => `${v}h`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} hrs`, "Avg Time"]} />
              <Area type="monotone" dataKey="hours" stroke="hsl(var(--warning))" fill="hsl(var(--warning) / 0.15)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Complaint Categories</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={65} dataKey="value">
                {categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
        <div className="px-6 pb-4 grid grid-cols-2 gap-1.5">
          {categoryData.map((c) => (
            <div key={c.name} className="flex items-center gap-1.5 text-xs">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: c.color }} />
              <span className="text-muted-foreground truncate">{c.name}</span>
              <span className="font-semibold ml-auto">{c.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>

    {/* Row 3: Inventory Usage */}
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Inventory Usage vs Restocking</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={inventoryUsage}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={tickStyle} />
            <YAxis tick={tickStyle} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="used" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} barSize={14} name="Used" />
            <Bar dataKey="restocked" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} barSize={14} name="Restocked" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  </div>
);
