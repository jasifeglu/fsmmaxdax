import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { ShoppingCart, Loader2, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  items: any[];
}

export const PurchaseRequests = ({ items }: Props) => {
  const { toast } = useToast();
  const { user, role } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    const { data } = await supabase.from("purchase_requests").select("*").order("created_at", { ascending: false });
    setRequests(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  // Auto-suggest purchase requests for low stock items
  const autoSuggest = async () => {
    const lowItems = items.filter(i => i.status !== "OK");
    let created = 0;
    for (const item of lowItems) {
      const existing = requests.find(r => r.inventory_id === item.id && r.status === "pending");
      if (!existing) {
        await supabase.from("purchase_requests").insert({
          inventory_id: item.id,
          requested_quantity: item.min_stock * 2,
          reason: "low_stock",
          requested_by: user?.id,
          notes: `Auto-suggested: ${item.name} is ${item.status}`,
        });
        created++;
      }
    }
    if (created > 0) {
      toast({ title: `${created} purchase request(s) created` });
      fetchRequests();
    } else {
      toast({ title: "No new requests needed" });
    }
  };

  const handleApproval = async (id: string, newStatus: "approved" | "rejected") => {
    await supabase.from("purchase_requests").update({ status: newStatus, approved_by: user?.id, updated_at: new Date().toISOString() }).eq("id", id);
    toast({ title: `Request ${newStatus}` });
    fetchRequests();
  };

  const getItemName = (id: string) => items.find(i => i.id === id)?.name || "Unknown";

  const statusMap: Record<string, string> = { pending: "Pending", approved: "Available", rejected: "Critical", ordered: "Completed" };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" /> Purchase Requests
          </CardTitle>
          {role === "admin" && (
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={autoSuggest}>
              Auto-Suggest for Low Stock
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : requests.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No purchase requests</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b">
                  <th className="text-left py-2 font-medium">Date</th>
                  <th className="text-left py-2 font-medium">Part</th>
                  <th className="text-right py-2 font-medium">Qty</th>
                  <th className="text-left py-2 font-medium">Reason</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  {role === "admin" && <th className="text-right py-2 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 text-xs text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</td>
                    <td className="py-2.5 font-medium">{getItemName(req.inventory_id)}</td>
                    <td className="py-2.5 text-right font-mono">{req.requested_quantity}</td>
                    <td className="py-2.5 text-xs text-muted-foreground">{req.notes || req.reason}</td>
                    <td className="py-2.5"><StatusBadge status={statusMap[req.status] || req.status} /></td>
                    {role === "admin" && (
                      <td className="py-2.5 text-right">
                        {req.status === "pending" && (
                          <div className="flex gap-1 justify-end">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600" onClick={() => handleApproval(req.id, "approved")}>
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleApproval(req.id, "rejected")}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </td>
                    )}
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
