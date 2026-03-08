import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Search, Loader2, Trash2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["Electrical", "Mechanical", "Accessories", "Consumables", "General"];

interface Props {
  items: any[];
  loading: boolean;
  onRefresh: () => void;
}

export const WarehouseCatalog = ({ items, loading, onRefresh }: Props) => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", sku: "", category: "Electrical", warehouse_stock: 0, min_stock: 5, price: 0 });

  const handleCreate = async () => {
    if (!form.name || !form.sku) return;
    setCreating(true);
    const status = form.warehouse_stock <= 0 ? "Critical" : form.warehouse_stock < form.min_stock ? "Low" : "OK";
    const { error } = await supabase.from("inventory").insert({ ...form, status });
    setCreating(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Item added to warehouse" });
      setDialogOpen(false);
      setForm({ name: "", sku: "", category: "Electrical", warehouse_stock: 0, min_stock: 5, price: 0 });
      onRefresh();
    }
  };

  const handleRemoveDamaged = async (id: string, name: string) => {
    const qty = prompt(`How many damaged units of "${name}" to remove?`);
    if (!qty || isNaN(Number(qty))) return;
    const item = items.find(i => i.id === id);
    const newStock = Math.max(0, item.warehouse_stock - Number(qty));
    const status = newStock <= 0 ? "Critical" : newStock < item.min_stock ? "Low" : "OK";
    const { error } = await supabase.from("inventory").update({ warehouse_stock: newStock, status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Removed ${qty} damaged units of ${name}` });
      onRefresh();
    }
  };

  const filtered = items.filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || i.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" /> Spare Parts Catalog
          </CardTitle>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-xs w-44" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-8 text-xs w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 text-xs gap-1"><Plus className="h-3 w-3" /> Add Part</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Spare Part</DialogTitle>
                  <DialogDescription>Add a new item to the warehouse catalog</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div><Label className="text-xs">Part Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" /></div>
                  <div><Label className="text-xs">SKU Code</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="mt-1" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Category</Label>
                      <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label className="text-xs">Unit Price (₹)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="mt-1" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Initial Stock</Label><Input type="number" value={form.warehouse_stock} onChange={(e) => setForm({ ...form, warehouse_stock: Number(e.target.value) })} className="mt-1" /></div>
                    <div><Label className="text-xs">Min Stock Threshold</Label><Input type="number" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: Number(e.target.value) })} className="mt-1" /></div>
                  </div>
                  <Button onClick={handleCreate} disabled={creating} className="w-full">
                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add to Warehouse
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No items found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b">
                  <th className="text-left py-2 font-medium">SKU</th>
                  <th className="text-left py-2 font-medium">Part Name</th>
                  <th className="text-left py-2 font-medium hidden md:table-cell">Category</th>
                  <th className="text-right py-2 font-medium">Warehouse</th>
                  <th className="text-right py-2 font-medium">Van Stock</th>
                  <th className="text-right py-2 font-medium hidden lg:table-cell">Min</th>
                  <th className="text-right py-2 font-medium hidden lg:table-cell">Price</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-right py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 font-mono text-xs text-primary">{item.sku}</td>
                    <td className="py-2.5 font-medium">{item.name}</td>
                    <td className="py-2.5 text-muted-foreground hidden md:table-cell">{item.category}</td>
                    <td className="py-2.5 text-right font-mono">{item.warehouse_stock}</td>
                    <td className="py-2.5 text-right font-mono">{item.van_stock}</td>
                    <td className="py-2.5 text-right text-muted-foreground hidden lg:table-cell">{item.min_stock}</td>
                    <td className="py-2.5 text-right hidden lg:table-cell">₹{Number(item.price).toLocaleString()}</td>
                    <td className="py-2.5">
                      <StatusBadge status={item.status === "OK" ? "Available" : item.status === "Low" ? "Pending" : "Critical"} />
                    </td>
                    <td className="py-2.5 text-right">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => handleRemoveDamaged(item.id, item.name)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
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
