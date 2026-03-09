import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Loader2, Edit2, Package, Shield } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  "CCTV Cameras", "Home Automation", "Video Door Phone", "Networking",
  "Gates & Shutters", "Multi-room Audio", "Sensors & Detectors",
  "Smart Locks", "Intercoms", "General",
];

const BRANDS = [
  "CP Plus", "Hikvision", "BFT", "DEA", "FoxTex", "Autowatch",
  "Dahua", "Honeywell", "Schneider", "Legrand", "Sonos", "Yale", "Other",
];

const emptyForm = {
  name: "", brand: "", model: "", category: "General", hsn_sac_code: "",
  service_price: 0, warranty_months: 12, spare_parts: "", description: "", is_active: true,
};

const ProductCatalogPage = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from("product_catalog").select("*").order("name");
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const openEdit = (p: any) => {
    setEditId(p.id);
    setForm({
      name: p.name, brand: p.brand, model: p.model, category: p.category,
      hsn_sac_code: p.hsn_sac_code || "", service_price: p.service_price,
      warranty_months: p.warranty_months, spare_parts: p.spare_parts || "",
      description: p.description || "", is_active: p.is_active,
    });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.brand) {
      toast({ title: "Please fill required fields", description: "Product name and brand are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = { ...form, service_price: Number(form.service_price), warranty_months: Number(form.warranty_months) };

    const { error } = editId
      ? await supabase.from("product_catalog").update(payload).eq("id", editId)
      : await supabase.from("product_catalog").insert(payload);

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editId ? "Product updated" : "Product added" });
      setDialogOpen(false);
      fetchProducts();
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch = `${p.name} ${p.brand} ${p.model}`.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || p.category === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <div>
      <PageHeader title="Product Catalog" description="Manage products, brands, service pricing and warranty">
        <Button size="sm" className="gap-1.5" onClick={openNew}>
          <Plus className="h-3.5 w-3.5" /> Add Product
        </Button>
      </PageHeader>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
            </div>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-44 h-9 text-sm"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No products found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((p) => (
                <Card key={p.id} className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => openEdit(p)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{p.name}</span>
                      </div>
                      {!p.is_active && <Badge variant="secondary" className="text-[10px]">Inactive</Badge>}
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>{p.brand} • {p.model}</p>
                      <p className="flex items-center gap-1"><Badge variant="outline" className="text-[10px]">{p.category}</Badge></p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="font-mono font-semibold text-foreground text-sm">₹{Number(p.service_price).toLocaleString()}</span>
                        <span className="flex items-center gap-1 text-muted-foreground"><Shield className="h-3 w-3" />{p.warranty_months}m warranty</span>
                      </div>
                      {p.hsn_sac_code && <p className="font-mono text-[10px]">HSN: {p.hsn_sac_code}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription>Product details with service pricing and warranty</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Product Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Brand *</Label>
                <Select value={form.brand} onValueChange={v => setForm(f => ({ ...f, brand: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select brand" /></SelectTrigger>
                  <SelectContent>{BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Model</Label>
                <Input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">HSN/SAC Code</Label>
                <Input value={form.hsn_sac_code} onChange={e => setForm(f => ({ ...f, hsn_sac_code: e.target.value }))} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Service Price (₹)</Label>
                <Input type="number" value={form.service_price} onChange={e => setForm(f => ({ ...f, service_price: Number(e.target.value) }))} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Warranty (months)</Label>
                <Input type="number" value={form.warranty_months} onChange={e => setForm(f => ({ ...f, warranty_months: Number(e.target.value) }))} className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Spare Parts (comma-separated)</Label>
              <Input value={form.spare_parts} onChange={e => setForm(f => ({ ...f, spare_parts: e.target.value }))} className="mt-1" placeholder="e.g. Compressor, PCB Board, Fan Motor" />
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1" rows={2} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label className="text-xs">Active</Label>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editId ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductCatalogPage;
