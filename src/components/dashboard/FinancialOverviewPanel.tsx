import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatINRCompact } from "@/lib/formatINR";

interface Props {
  invoices: any[];
}

export const FinancialOverviewPanel = ({ invoices }: Props) => {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayRevenue = invoices
    .filter(i => i.payment_status === "Paid" && i.invoice_date === todayStr)
    .reduce((s, i) => s + Number(i.grand_total || 0), 0);

  const weeklyRevenue = invoices
    .filter(i => i.payment_status === "Paid" && new Date(i.invoice_date) >= weekAgo)
    .reduce((s, i) => s + Number(i.grand_total || 0), 0);

  const monthlyRevenue = invoices
    .filter(i => i.payment_status === "Paid" && new Date(i.invoice_date) >= monthStart)
    .reduce((s, i) => s + Number(i.grand_total || 0), 0);

  const outstanding = invoices
    .filter(i => i.payment_status === "Pending")
    .reduce((s, i) => s + Number(i.grand_total || 0), 0);

  const pendingCount = invoices.filter(i => i.payment_status === "Pending").length;

  const fmt = formatINRCompact;

  const metrics = [
    { label: "Today's Revenue", value: fmt(todayRevenue), icon: DollarSign, trend: "", positive: true },
    { label: "Weekly Revenue", value: fmt(weeklyRevenue), icon: TrendingUp, trend: "", positive: true },
    { label: "Monthly Revenue", value: fmt(monthlyRevenue), icon: TrendingUp, trend: "", positive: true },
    { label: "Outstanding", value: fmt(outstanding), icon: CreditCard, trend: `${pendingCount} invoices`, positive: false },
  ];

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">💰 Financial Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-lg bg-muted/40 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <m.icon className="h-3.5 w-3.5" />
                {m.label}
              </div>
              <p className="text-lg font-bold tracking-tight">{m.value}</p>
              {m.trend && (
                <p className={cn("text-xs font-medium", m.positive ? "text-success" : "text-destructive")}>
                  {m.trend}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
