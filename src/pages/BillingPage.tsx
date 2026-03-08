import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Clock, FileText } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const monthlyData = [
  { month: "Jan", income: 42000, expense: 18000 },
  { month: "Feb", income: 38000, expense: 15000 },
  { month: "Mar", income: 55000, expense: 22000 },
  { month: "Apr", income: 47000, expense: 19000 },
  { month: "May", income: 62000, expense: 25000 },
  { month: "Jun", income: 58000, expense: 21000 },
];

const recentInvoices = [
  { id: "INV-892", customer: "Rajesh Kumar", amount: "₹4,500", date: "Today", status: "Paid", method: "UPI" },
  { id: "INV-891", customer: "Priya Sharma", amount: "₹2,800", date: "Today", status: "Pending", method: "—" },
  { id: "INV-890", customer: "Mohammed Ali", amount: "₹8,200", date: "Yesterday", status: "Paid", method: "Cash" },
  { id: "INV-889", customer: "Anita Desai", amount: "₹1,500", date: "Yesterday", status: "Overdue", method: "—" },
  { id: "INV-888", customer: "Sanjay Patel", amount: "₹12,000", date: "2 days ago", status: "Paid", method: "Bank Transfer" },
];

const BillingPage = () => (
  <div>
    <PageHeader title="Billing & Finance" description="Revenue, invoices, and payment tracking" />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard title="Revenue (MTD)" value="₹5.8L" change="+18% growth" changeType="positive" icon={DollarSign} iconColor="text-success" />
      <StatCard title="Expenses (MTD)" value="₹2.1L" change="+5% vs last month" changeType="negative" icon={TrendingUp} iconColor="text-warning" />
      <StatCard title="Pending Payments" value="₹1.2L" change="23 invoices" changeType="negative" icon={Clock} iconColor="text-destructive" />
      <StatCard title="Invoices Issued" value={156} change="This month" changeType="neutral" icon={FileText} iconColor="text-primary" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      <Card className="lg:col-span-2 glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Income vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="income" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 pt-2">
            {[
              { method: "UPI", pct: 45, color: "bg-primary" },
              { method: "Cash", pct: 30, color: "bg-success" },
              { method: "Bank Transfer", pct: 20, color: "bg-info" },
              { method: "Pending", pct: 5, color: "bg-destructive" },
            ].map((p) => (
              <div key={p.method}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{p.method}</span>
                  <span className="font-medium">{p.pct}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>

    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Recent Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs border-b">
                <th className="text-left py-2 font-medium">Invoice</th>
                <th className="text-left py-2 font-medium">Customer</th>
                <th className="text-right py-2 font-medium">Amount</th>
                <th className="text-left py-2 font-medium hidden sm:table-cell">Date</th>
                <th className="text-left py-2 font-medium">Status</th>
                <th className="text-left py-2 font-medium hidden md:table-cell">Method</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 font-mono text-xs text-primary">{inv.id}</td>
                  <td className="py-2.5">{inv.customer}</td>
                  <td className="py-2.5 text-right font-medium">{inv.amount}</td>
                  <td className="py-2.5 text-muted-foreground hidden sm:table-cell">{inv.date}</td>
                  <td className="py-2.5"><StatusBadge status={inv.status} /></td>
                  <td className="py-2.5 text-muted-foreground hidden md:table-cell">{inv.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default BillingPage;
