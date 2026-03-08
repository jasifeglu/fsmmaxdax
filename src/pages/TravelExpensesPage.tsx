import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, Download, Car } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const expenseTypes = [
  { value: "fuel", label: "Fuel" },
  { value: "toll", label: "Toll" },
  { value: "parking", label: "Parking" },
  { value: "food", label: "Food" },
  { value: "other", label: "Other" },
];

const TravelExpensesPage = () => {
  const { toast } = useToast();
  const { user, role } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ expense_type: "fuel", description: "", amount: 0, distance_km: 0 });

  const fetchExpenses = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("travel_expenses")
      .select("*")
      .order("created_at", { ascending: false });
    setExpenses(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleCreate = async () => {
    if (!form.amount) return;
    setCreating(true);
    const { error } = await supabase.from("travel_expenses").insert({
      ...form,
      user_id: user?.id,
    });
    setCreating(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Expense added" });
      setDialogOpen(false);
      setForm({ expense_type: "fuel", description: "", amount: 0, distance_km: 0 });
      fetchExpenses();
    }
  };

  const exportCSV = () => {
    const headers = ["Date", "Type", "Description", "Amount (₹)", "Distance (km)", "Status"];
    const rows = expenses.map(e => [
      new Date(e.expense_date).toLocaleDateString(),
      e.expense_type,
      e.description || "",
      e.amount,
      e.distance_km || "",
      e.status,
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `travel-expenses-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalAmount = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div>
      <PageHeader title="Travel Expenses" description="Track and export travel costs">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={exportCSV} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary text-primary-foreground gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Travel Expense</DialogTitle>
                <DialogDescription>Record a travel-related expense</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Expense Type</Label>
                  <Select value={form.expense_type} onValueChange={(v) => setForm({ ...form, expense_type: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {expenseTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Amount (₹)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="mt-1" /></div>
                  <div><Label className="text-xs">Distance (km)</Label><Input type="number" value={form.distance_km} onChange={(e) => setForm({ ...form, distance_km: Number(e.target.value) })} className="mt-1" /></div>
                </div>
                <Button onClick={handleCreate} disabled={creating} className="w-full">
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add Expense
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card className="glass-card p-4">
          <div className="flex items-center gap-3">
            <Car className="h-8 w-8 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="glass-card p-4">
          <div className="flex items-center gap-3">
            <Car className="h-8 w-8 text-info" />
            <div>
              <p className="text-xs text-muted-foreground">Total Entries</p>
              <p className="text-2xl font-bold">{expenses.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="glass-card">
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : expenses.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No expenses recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs border-b">
                    <th className="text-left py-2 font-medium">Date</th>
                    <th className="text-left py-2 font-medium">Type</th>
                    <th className="text-left py-2 font-medium hidden sm:table-cell">Description</th>
                    <th className="text-right py-2 font-medium">Amount</th>
                    <th className="text-right py-2 font-medium hidden md:table-cell">Distance</th>
                    <th className="text-left py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 text-xs">{new Date(e.expense_date).toLocaleDateString()}</td>
                      <td className="py-2.5 capitalize">{e.expense_type}</td>
                      <td className="py-2.5 text-muted-foreground hidden sm:table-cell truncate max-w-40">{e.description || "—"}</td>
                      <td className="py-2.5 text-right font-medium">₹{Number(e.amount).toLocaleString()}</td>
                      <td className="py-2.5 text-right text-muted-foreground hidden md:table-cell">{e.distance_km ? `${e.distance_km} km` : "—"}</td>
                      <td className="py-2.5"><StatusBadge status={e.status === "approved" ? "Completed" : e.status === "rejected" ? "Critical" : "Pending"} /></td>
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

export default TravelExpensesPage;
