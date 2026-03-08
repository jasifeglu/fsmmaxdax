import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Truck, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  items: any[];
  onRefresh: () => void;
}

export const StockIssuance = ({ items, onRefresh }: Props) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ inventory_id: "", user_id: "", quantity: 1, notes: "" });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [techRes, txnRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name"),
        supabase.from("inventory_transactions").select("*").eq("transaction_type", "issuance").order("created_at", { ascending: false }).limit(50),
      ]);
      setTechnicians(techRes.data || []);
      setTransactions(txnRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleIssue = async () => {
    if (!form.inventory_id || !form.user_id || form.quantity <= 0) return;
    const item = items.find(i => i.id === form.inventory_id);
    if (!item || item.warehouse_stock < form.quantity) {
      toast({ title: "Insufficient stock", variant: "destructive" });
      return;
    }
    setIssuing(true);
    
    // Insert transaction
    const { error: txnError } = await supabase.from("inventory_transactions").insert({
      inventory_id: form.inventory_id,
      transaction_type: "issuance",
      quantity: form.quantity,
      from_location: "warehouse",
      to_location: "van",
      user_id: form.user_id,
      performed_by: user?.id,
      notes: form.notes,
    });

    if (txnError) {
      toast({ title: "Error", description: txnError.message, variant: "destructive" });
      setIssuing(false);
      return;
    }

    // Update inventory stock
    const newWarehouse = item.warehouse_stock - form.quantity;
    const newVan = item.van_stock + form.quantity;
    const status = newWarehouse <= 0 ? "Critical" : newWarehouse < item.min_stock ? "Low" : "OK";
    await supabase.from("inventory").update({ warehouse_stock: newWarehouse, van_stock: newVan, status }).eq("id", form.inventory_id);

    setIssuing(false);
    toast({ title: `Issued ${form.quantity} units to technician` });
    setDialogOpen(false);
    setForm({ inventory_id: "", user_id: "", quantity: 1, notes: "" });
    onRefresh();
    // Refresh transactions
    const { data } = await supabase.from("inventory_transactions").select("*").eq("transaction_type", "issuance").order("created_at", { ascending: false }).limit(50);
    setTransactions(data || []);
  };

  const getItemName = (id: string) => items.find(i => i.id === id)?.name || id;
  const getTechName = (id: string) => technicians.find(t => t.id === id)?.full_name || "Unknown";

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" /> Stock Issuance to Technicians
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 text-xs gap-1"><Plus className="h-3 w-3" /> Issue Stock</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Issue Stock to Technician</DialogTitle>
                <DialogDescription>Deduct from warehouse and add to technician van</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Spare Part</Label>
                  <Select value={form.inventory_id} onValueChange={(v) => setForm({ ...form, inventory_id: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select part" /></SelectTrigger>
                    <SelectContent>
                      {items.filter(i => i.warehouse_stock > 0).map(i => (
                        <SelectItem key={i.id} value={i.id}>{i.name} (Stock: {i.warehouse_stock})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Technician</Label>
                  <Select value={form.user_id} onValueChange={(v) => setForm({ ...form, user_id: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select technician" /></SelectTrigger>
                    <SelectContent>
                      {technicians.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Quantity</Label><Input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} className="mt-1" /></div>
                <div><Label className="text-xs">Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1" placeholder="Optional notes" /></div>
                <Button onClick={handleIssue} disabled={issuing} className="w-full">
                  {issuing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Issue Stock
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : transactions.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No issuances yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b">
                  <th className="text-left py-2 font-medium">Date</th>
                  <th className="text-left py-2 font-medium">Part</th>
                  <th className="text-left py-2 font-medium">Technician</th>
                  <th className="text-right py-2 font-medium">Qty</th>
                  <th className="text-left py-2 font-medium hidden md:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 text-xs text-muted-foreground">{new Date(txn.created_at).toLocaleDateString()}</td>
                    <td className="py-2.5 font-medium">{getItemName(txn.inventory_id)}</td>
                    <td className="py-2.5">{getTechName(txn.user_id)}</td>
                    <td className="py-2.5 text-right font-mono">{txn.quantity}</td>
                    <td className="py-2.5 text-muted-foreground text-xs hidden md:table-cell">{txn.notes || "—"}</td>
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
