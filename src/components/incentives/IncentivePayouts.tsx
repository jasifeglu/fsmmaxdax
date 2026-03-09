import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { CheckCircle2, XCircle, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDemoMode } from "@/hooks/useDemoMode";
import { formatINR } from "@/lib/formatINR";

const mockPayouts = [
  { name: "Suresh Kumar", month: "Mar 2026", total: "₹12,400", status: "Pending", score: 94 },
  { name: "Amit Patil", month: "Mar 2026", total: "₹9,600", status: "Pending", score: 87 },
  { name: "Ravi Mehta", month: "Mar 2026", total: "₹8,200", status: "Pending", score: 85 },
  { name: "Anil Sharma", month: "Feb 2026", total: "₹7,800", status: "Paid", score: 80 },
  { name: "Vikram Singh", month: "Feb 2026", total: "₹5,500", status: "Paid", score: 74 },
  { name: "Prakash Deshmukh", month: "Feb 2026", total: "₹4,200", status: "Paid", score: 68 },
];

type PayoutRow = { id?: string; name: string; month: string; total: string; status: string; score: number };

export const IncentivePayouts = () => {
  const isDemoMode = useDemoMode();
  const [realPayouts, setRealPayouts] = useState<PayoutRow[]>([]);

  useEffect(() => {
    if (isDemoMode) return;
    const fetch = async () => {
      const { data: incentives } = await supabase
        .from("technician_incentives")
        .select("*")
        .order("month", { ascending: false })
        .limit(20);
      const { data: profiles } = await supabase.from("profiles").select("id, full_name");

      const rows: PayoutRow[] = (incentives || []).map(inc => {
        const profile = (profiles || []).find(p => p.id === inc.user_id);
        const statusMap: Record<string, string> = { pending: "Pending", approved: "Paid", paid: "Paid", rejected: "Rejected" };
        return {
          id: inc.id,
          name: profile?.full_name || "Unknown",
          month: inc.month,
          total: formatINR(Number(inc.total_incentive)),
          status: statusMap[inc.status] || inc.status,
          score: Number(inc.performance_score),
        };
      });
      setRealPayouts(rows);
    };
    fetch();
  }, [isDemoMode]);

  const payouts = isDemoMode ? mockPayouts : realPayouts;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">💳 Incentive Payouts</CardTitle>
      </CardHeader>
      <CardContent>
        {payouts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No payout data available</p>
            <p className="text-xs mt-1">Payouts will appear after monthly incentive calculations</p>
          </div>
        ) : (
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
                  <tr key={`${p.name}-${p.month}-${i}`} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
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
        )}
      </CardContent>
    </Card>
  );
};
