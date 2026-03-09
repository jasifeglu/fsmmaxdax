import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Clock, FileText } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { InvoiceForm } from "@/components/billing/InvoiceForm";
import { InvoiceHistory } from "@/components/billing/InvoiceHistory";
import { supabase } from "@/integrations/supabase/client";
import { formatINRCompact } from "@/lib/formatINR";
import { useDemoMode } from "@/hooks/useDemoMode";

const mockMonthlyData = [
  { month: "Jan", income: 42000, expense: 18000 },
  { month: "Feb", income: 38000, expense: 15000 },
  { month: "Mar", income: 55000, expense: 22000 },
  { month: "Apr", income: 47000, expense: 19000 },
  { month: "May", income: 62000, expense: 25000 },
  { month: "Jun", income: 58000, expense: 21000 },
];

const mockPaymentMethods = [
  { method: "UPI", pct: 45, color: "bg-primary" },
  { method: "Cash", pct: 30, color: "bg-success" },
  { method: "Bank Transfer", pct: 20, color: "bg-info" },
  { method: "Pending", pct: 5, color: "bg-destructive" },
];

const BillingPage = () => {
  const isDemoMode = useDemoMode();
  const [invoiceRefresh, setInvoiceRefresh] = useState(0);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("invoices").select("*").order("created_at", { ascending: false });
      setInvoices(data || []);
    };
    fetch();
  }, [invoiceRefresh]);

  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const monthlyInvoices = invoices.filter(inv => new Date(inv.created_at) >= monthStart);
  const revenue = monthlyInvoices.filter(i => i.payment_status === "Paid").reduce((s, i) => s + Number(i.grand_total || 0), 0);
  const pendingAmount = invoices.filter(i => i.payment_status === "Pending").reduce((s, i) => s + Number(i.grand_total || 0), 0);
  const pendingCount = invoices.filter(i => i.payment_status === "Pending").length;
  const monthlyCount = monthlyInvoices.length;

  // Real monthly chart data
  const realMonthlyData = useMemo(() => {
    const months: Record<string, { income: number; expense: number }> = {};
    invoices.forEach(inv => {
      const m = new Date(inv.invoice_date || inv.created_at).toLocaleString("default", { month: "short" });
      if (!months[m]) months[m] = { income: 0, expense: 0 };
      if (inv.payment_status === "Paid") months[m].income += Number(inv.grand_total || 0);
    });
    return Object.entries(months).slice(-6).map(([month, d]) => ({ month, ...d }));
  }, [invoices]);

  // Real payment method breakdown
  const realPaymentMethods = useMemo(() => {
    const total = invoices.length || 1;
    const counts: Record<string, number> = {};
    invoices.forEach(inv => {
      const mode = inv.payment_mode || "Other";
      counts[mode] = (counts[mode] || 0) + 1;
    });
    const colors: Record<string, string> = { UPI: "bg-primary", Cash: "bg-success", "Bank Transfer": "bg-info", Other: "bg-warning" };
    return Object.entries(counts).map(([method, count]) => ({
      method,
      pct: Math.round(count / total * 100),
      color: colors[method] || "bg-muted-foreground",
    }));
  }, [invoices]);

  const monthlyData = isDemoMode ? mockMonthlyData : realMonthlyData;
  const paymentMethods = isDemoMode ? mockPaymentMethods : realPaymentMethods;

  return (
    <div>
      <PageHeader title="Billing & Finance" description="Revenue, GST invoices, and payment tracking">
        <InvoiceForm onCreated={() => setInvoiceRefresh(p => p + 1)} />
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Revenue (MTD)" value={isDemoMode ? "₹5.8L" : formatINRCompact(revenue)} icon={DollarSign} iconColor="text-success" />
        <StatCard title="Total Invoices" value={isDemoMode ? 156 : invoices.length} icon={TrendingUp} iconColor="text-warning" />
        <StatCard title="Pending Payments" value={isDemoMode ? "₹1.2L" : formatINRCompact(pendingAmount)} change={`${pendingCount} invoices`} changeType={pendingCount > 0 ? "negative" : "neutral"} icon={Clock} iconColor="text-destructive" />
        <StatCard title="This Month" value={isDemoMode ? 156 : monthlyCount} icon={FileText} iconColor="text-primary" />
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
                {monthlyData.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-16">No invoice data yet</p>
                ) : (
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
                )}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentMethods.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-8">No payment data yet</p>
                ) : (
                  <div className="space-y-4 pt-2">
                    {paymentMethods.map((p) => (
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
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingPage;
