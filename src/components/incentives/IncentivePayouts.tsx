import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const payouts = [
  { name: "Suresh Kumar", month: "Mar 2026", total: "₹12,400", status: "Pending", score: 94 },
  { name: "Amit Patil", month: "Mar 2026", total: "₹9,600", status: "Pending", score: 87 },
  { name: "Ravi Mehta", month: "Mar 2026", total: "₹8,200", status: "Pending", score: 85 },
  { name: "Anil Sharma", month: "Feb 2026", total: "₹7,800", status: "Paid", score: 80 },
  { name: "Vikram Singh", month: "Feb 2026", total: "₹5,500", status: "Paid", score: 74 },
  { name: "Prakash Deshmukh", month: "Feb 2026", total: "₹4,200", status: "Paid", score: 68 },
];

export const IncentivePayouts = () => (
  <Card className="glass-card">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">💳 Incentive Payouts</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground text-xs border-b">
              <th className="text-left py-2 font-medium">Technician</th>
              <th className="text-left py-2 font-medium">Month</th>
              <th className="text-center py-2 font-medium">Score</th>
              <th className="text-right py-2 font-medium">Incentive</th>
              <th className="text-center py-2 font-medium">Status</th>
              <th className="text-right py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p, i) => (
              <tr key={`${p.name}-${p.month}`} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-2.5 font-medium">{p.name}</td>
                <td className="py-2.5 text-muted-foreground">{p.month}</td>
                <td className="py-2.5 text-center font-bold text-primary">{p.score}</td>
                <td className="py-2.5 text-right font-mono font-medium">{p.total}</td>
                <td className="py-2.5 text-center"><StatusBadge status={p.status} /></td>
                <td className="py-2.5 text-right">
                  {p.status === "Pending" ? (
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-success">
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);
