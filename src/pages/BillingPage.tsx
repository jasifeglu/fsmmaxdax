import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Clock, FileText } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { InvoiceForm } from "@/components/billing/InvoiceForm";
import { InvoiceHistory } from "@/components/billing/InvoiceHistory";

const monthlyData = [
  { month: "Jan", income: 42000, expense: 18000 },
  { month: "Feb", income: 38000, expense: 15000 },
  { month: "Mar", income: 55000, expense: 22000 },
  { month: "Apr", income: 47000, expense: 19000 },
  { month: "May", income: 62000, expense: 25000 },
  { month: "Jun", income: 58000, expense: 21000 },
];

const BillingPage = () => {
  const [invoiceRefresh, setInvoiceRefresh] = useState(0);

  return (
    <div>
      <PageHeader title="Billing & Finance" description="Revenue, GST invoices, and payment tracking">
        <InvoiceForm onCreated={() => setInvoiceRefresh(p => p + 1)} />
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Revenue (MTD)" value="₹5.8L" change="+18% growth" changeType="positive" icon={DollarSign} iconColor="text-success" />
        <StatCard title="Expenses (MTD)" value="₹2.1L" change="+5% vs last month" changeType="negative" icon={TrendingUp} iconColor="text-warning" />
        <StatCard title="Pending Payments" value="₹1.2L" change="23 invoices" changeType="negative" icon={Clock} iconColor="text-destructive" />
        <StatCard title="Invoices Issued" value={156} change="This month" changeType="neutral" icon={FileText} iconColor="text-primary" />
      </div>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="overview">Revenue Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <InvoiceHistory refreshKey={invoiceRefresh} />
        </TabsContent>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingPage;
