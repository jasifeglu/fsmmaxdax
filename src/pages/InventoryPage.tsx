import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, AlertTriangle, TrendingDown, Search, Plus, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const InventoryPage = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", sku: "", category: "General", warehouse_stock: 0, min_stock: 5, price: 0 });

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from("inventory").select("*").order("name");
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.sku) return;
    setCreating(true);
    const status = form.warehouse_stock <= 0 ? "Critical" : form.warehouse_stock < form.min_stock ? "Low" : "OK";
    const { error } = await supabase.from("inventory").insert({ ...form, status });
    setCreating(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Item added" });
      setDialogOpen(false);
      setForm({ name: "", sku: "", category: "General", warehouse_stock: 0, min_stock: 5, price: 0 });
      fetchItems();
    }
  };

  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()));
  const lowItems = items.filter(i => i.status !== "OK").length;

  return (
    <div>
      <PageHeader title="Inventory" description="Warehouse and van stock management">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-primary-foreground gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
              <DialogDescription>Add a new part or supply</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Item Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" /></div>
              <div><Label className="text-xs">SKU</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1" /></div>
                <div><Label className="text-xs">Price (₹)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Stock</Label><Input type="number" value={form.warehouse_stock} onChange={(e) => setForm({ ...form, warehouse_stock: Number(e.target.value) })} className="mt-1" /></div>
                <div><Label className="text-xs">Min Stock</Label><Input type="number" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: Number(e.target.value) })} className="mt-1" /></div>
              </div>
              <Button onClick={handleCreate} disabled={creating} className="w-full">
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Items" value={items.length} icon={Package} iconColor="text-primary" />
        <StatCard title="Low Stock Alerts" value={lowItems} changeType="negative" icon={AlertTriangle} iconColor="text-warning" />
        <StatCard title="Stock Value" value={`₹${items.reduce((s, i) => s + (i.price * i.warehouse_stock), 0).toLocaleString()}`} icon={TrendingDown} iconColor="text-info" />
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search parts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No inventory items. Add your first item!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs border-b">
                    <th className="text-left py-2 font-medium">SKU</th>
                    <th className="text-left py-2 font-medium">Item</th>
                    <th className="text-left py-2 font-medium hidden md:table-cell">Category</th>
                    <th className="text-right py-2 font-medium">Stock</th>
                    <th className="text-right py-2 font-medium hidden lg:table-cell">Price</th>
                    <th className="text-left py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 font-mono text-xs text-primary">{item.sku}</td>
                      <td className="py-2.5 font-medium">{item.name}</td>
                      <td className="py-2.5 text-muted-foreground hidden md:table-cell">{item.category}</td>
                      <td className="py-2.5 text-right">{item.warehouse_stock}</td>
                      <td className="py-2.5 text-right hidden lg:table-cell">₹{Number(item.price).toLocaleString()}</td>
                      <td className="py-2.5">
                        <StatusBadge status={item.status === "OK" ? "Available" : item.status === "Low" ? "Pending" : "Critical"} />
                      </td>
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

export default InventoryPage;
