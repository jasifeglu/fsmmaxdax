import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const metrics = [
  { label: "Today's Revenue", value: "₹24,500", icon: DollarSign, trend: "+8%", positive: true },
  { label: "Weekly Revenue", value: "₹1,42,000", icon: TrendingUp, trend: "+12%", positive: true },
  { label: "Monthly Revenue", value: "₹5,82,000", icon: TrendingUp, trend: "+18%", positive: true },
  { label: "Outstanding", value: "₹1,24,000", icon: CreditCard, trend: "23 invoices", positive: false },
  { label: "Expenses (MTD)", value: "₹1,85,000", icon: TrendingDown, trend: "+5%", positive: false },
  { label: "Profit Margin", value: "68.2%", icon: TrendingUp, trend: "+2.1%", positive: true },
];

export const FinancialOverviewPanel = () => (
  <Card className="glass-card">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">💰 Financial Overview</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-lg bg-muted/40 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <m.icon className="h-3.5 w-3.5" />
              {m.label}
            </div>
            <p className="text-lg font-bold tracking-tight">{m.value}</p>
            <p className={cn("text-xs font-medium", m.positive ? "text-success" : "text-destructive")}>
              {m.trend}
            </p>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
