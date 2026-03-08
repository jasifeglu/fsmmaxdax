import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, RotateCcw, Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";

interface Props {
  items: any[];
  onRefresh: () => void;
}

export const StockUsageReturn = ({ items, onRefresh }: Props) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usageOpen, setUsageOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [usageForm, setUsageForm] = useState({ inventory_id: "", ticket_id: "", quantity: 1, notes: "" });
  const [returnForm, setReturnForm] = useState({ inventory_id: "", quantity: 1, notes: "" });

  const fetchData = async () => {
    setLoading(true);
    const [txnRes, ticketRes] = await Promise.all([
      supabase.from("inventory_transactions").select("*").in("transaction_type", ["usage", "return"]).order("created_at", { ascending: false }).limit(50),
      supabase.from("tickets").select("id, ticket_number, customer_name").in("status", ["In Progress", "Assigned"]).limit(100),
    ]);
    setTransactions(txnRes.data || []);
    setTickets(ticketRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleUsage = async () => {
    if (!usageForm.inventory_id || usageForm.quantity <= 0) return;
    const item = items.find(i => i.id === usageForm.inventory_id);
    if (!item || item.van_stock < usageForm.quantity) {
      toast({ title: "Insufficient van stock", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    await supabase.from("inventory_transactions").insert({
      inventory_id: usageForm.inventory_id,
      transaction_type: "usage",
      quantity: usageForm.quantity,
      from_location: "van",
      to_location: "customer",
      user_id: user?.id,
      performed_by: user?.id,
      ticket_id: usageForm.ticket_id || null,
      notes: usageForm.notes,
    });
    const newVan = item.van_stock - usageForm.quantity;
    await supabase.from("inventory").update({ van_stock: newVan }).eq("id", usageForm.inventory_id);
    setSubmitting(false);
    toast({ title: "Usage recorded" });
    setUsageOpen(false);
    setUsageForm({ inventory_id: "", ticket_id: "", quantity: 1, notes: "" });
    onRefresh();
    fetchData();
  };

  const handleReturn = async () => {
    if (!returnForm.inventory_id || returnForm.quantity <= 0) return;
    const item = items.find(i => i.id === returnForm.inventory_id);
    if (!item) return;
    setSubmitting(true);
    await supabase.from("inventory_transactions").insert({
      inventory_id: returnForm.inventory_id,
      transaction_type: "return",
      quantity: returnForm.quantity,
      from_location: "van",
      to_location: "warehouse",
      user_id: userId,
      performed_by: userId,
      notes: returnForm.notes,
    });
    const newWarehouse = item.warehouse_stock + returnForm.quantity;
    const newVan = Math.max(0, item.van_stock - returnForm.quantity);
    const status = newWarehouse <= 0 ? "Critical" : newWarehouse < item.min_stock ? "Low" : "OK";
    await supabase.from("inventory").update({ warehouse_stock: newWarehouse, van_stock: newVan, status }).eq("id", returnForm.inventory_id);
    setSubmitting(false);
    toast({ title: "Stock returned to warehouse" });
    setReturnOpen(false);
    setReturnForm({ inventory_id: "", quantity: 1, notes: "" });
    onRefresh();
    fetchData();
  };

  const getItemName = (id: string) => items.find(i => i.id === id)?.name || id;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Dialog open={usageOpen} onOpenChange={setUsageOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Wrench className="h-3.5 w-3.5" /> Record Usage</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Spare Part Usage</DialogTitle>
              <DialogDescription>Deduct from van inventory during service</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Spare Part</Label>
                <Select value={usageForm.inventory_id} onValueChange={(v) => setUsageForm({ ...usageForm, inventory_id: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select part" /></SelectTrigger>
                  <SelectContent>
                    {items.filter(i => i.van_stock > 0).map(i => (
                      <SelectItem key={i.id} value={i.id}>{i.name} (Van: {i.van_stock})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Link to Ticket (optional)</Label>
                <Select value={usageForm.ticket_id} onValueChange={(v) => setUsageForm({ ...usageForm, ticket_id: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select ticket" /></SelectTrigger>
                  <SelectContent>
                    {tickets.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.ticket_number} - {t.customer_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Quantity Used</Label><Input type="number" min={1} value={usageForm.quantity} onChange={(e) => setUsageForm({ ...usageForm, quantity: Number(e.target.value) })} className="mt-1" /></div>
              <div><Label className="text-xs">Notes</Label><Input value={usageForm.notes} onChange={(e) => setUsageForm({ ...usageForm, notes: e.target.value })} className="mt-1" /></div>
              <Button onClick={handleUsage} disabled={submitting} className="w-full">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Record Usage
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1.5"><RotateCcw className="h-3.5 w-3.5" /> Return Stock</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Return Stock to Warehouse</DialogTitle>
              <DialogDescription>Return unused parts from van to warehouse</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Spare Part</Label>
                <Select value={returnForm.inventory_id} onValueChange={(v) => setReturnForm({ ...returnForm, inventory_id: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select part" /></SelectTrigger>
                  <SelectContent>
                    {items.filter(i => i.van_stock > 0).map(i => (
                      <SelectItem key={i.id} value={i.id}>{i.name} (Van: {i.van_stock})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Quantity</Label><Input type="number" min={1} value={returnForm.quantity} onChange={(e) => setReturnForm({ ...returnForm, quantity: Number(e.target.value) })} className="mt-1" /></div>
              <div><Label className="text-xs">Notes</Label><Input value={returnForm.notes} onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })} className="mt-1" /></div>
              <Button onClick={handleReturn} disabled={submitting} className="w-full">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Return to Warehouse
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Usage & Return History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : transactions.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No usage or return records</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs border-b">
                    <th className="text-left py-2 font-medium">Date</th>
                    <th className="text-left py-2 font-medium">Type</th>
                    <th className="text-left py-2 font-medium">Part</th>
                    <th className="text-right py-2 font-medium">Qty</th>
                    <th className="text-left py-2 font-medium hidden md:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 text-xs text-muted-foreground">{new Date(txn.created_at).toLocaleDateString()}</td>
                      <td className="py-2.5">
                        <StatusBadge status={txn.transaction_type === "usage" ? "Critical" : "Available"} />
                      </td>
                      <td className="py-2.5 font-medium">{getItemName(txn.inventory_id)}</td>
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
    </div>
  );
};
