import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus, Trash2, Loader2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { generateInvoiceNumber, numberToWords } from "@/lib/invoiceUtils";
import { formatINR } from "@/lib/formatINR";

interface LineItem {
  description: string;
  hsn_sac_code: string;
  quantity: number;
  unit_price: number;
  cgst_rate: number;
  sgst_rate: number;
  igst_rate: number;
  inventory_id: string;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh",
];

const PAYMENT_MODES = ["Cash", "UPI", "Card", "Bank Transfer", "Cheque"];
const GST_RATES = [0, 5, 12, 18, 28];

interface Props {
  onCreated: () => void;
}

export const InvoiceForm = ({ onCreated }: Props) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);

  const [form, setForm] = useState({
    customer_id: "",
    customer_name: "",
    customer_address: "",
    customer_phone: "",
    customer_gstin: "",
    ticket_id: "",
    place_of_supply: "",
    is_interstate: false,
    payment_mode: "Cash",
    transaction_reference: "",
    notes: "",
  });

  const [items, setItems] = useState<LineItem[]>([
    { description: "", hsn_sac_code: "", quantity: 1, unit_price: 0, cgst_rate: 9, sgst_rate: 9, igst_rate: 0, inventory_id: "" },
  ]);

  useEffect(() => {
    if (!open) return;
    Promise.all([
      supabase.from("customers").select("id, name, address, phone, email").order("name"),
      supabase.from("tickets").select("id, ticket_number, customer_name").limit(200),
      supabase.from("inventory").select("id, name, sku, price"),
    ]).then(([cRes, tRes, iRes]) => {
      setCustomers(cRes.data || []);
      setTickets(tRes.data || []);
      setInventoryItems(iRes.data || []);
    });
  }, [open]);

  const handleCustomerSelect = (id: string) => {
    const c = customers.find(c => c.id === id);
    if (c) {
      setForm(f => ({ ...f, customer_id: id, customer_name: c.name, customer_address: c.address || "", customer_phone: c.phone || "" }));
    }
  };

  const updateItem = (idx: number, field: keyof LineItem, value: any) => {
    setItems(prev => {
      const next = [...prev];
      (next[idx] as any)[field] = value;
      if (field === "inventory_id" && value) {
        const inv = inventoryItems.find(i => i.id === value);
        if (inv) {
          next[idx].description = inv.name;
          next[idx].unit_price = Number(inv.price);
        }
      }
      return next;
    });
  };

  const addItem = () => setItems(prev => [...prev, { description: "", hsn_sac_code: "", quantity: 1, unit_price: 0, cgst_rate: form.is_interstate ? 0 : 9, sgst_rate: form.is_interstate ? 0 : 9, igst_rate: form.is_interstate ? 18 : 0, inventory_id: "" }]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const toggleInterstate = (checked: boolean) => {
    setForm(f => ({ ...f, is_interstate: checked }));
    setItems(prev => prev.map(item => ({
      ...item,
      cgst_rate: checked ? 0 : (item.cgst_rate + item.sgst_rate + item.igst_rate) / 2,
      sgst_rate: checked ? 0 : (item.cgst_rate + item.sgst_rate + item.igst_rate) / 2,
      igst_rate: checked ? (item.cgst_rate + item.sgst_rate + item.igst_rate) : 0,
    })));
  };

  const calcLine = (item: LineItem) => {
    const taxable = item.quantity * item.unit_price;
    const tax = taxable * ((item.cgst_rate + item.sgst_rate + item.igst_rate) / 100);
    return { taxable, tax, total: taxable + tax };
  };

  const subtotal = items.reduce((s, i) => s + calcLine(i).taxable, 0);
  const cgstTotal = items.reduce((s, i) => s + (calcLine(i).taxable * i.cgst_rate / 100), 0);
  const sgstTotal = items.reduce((s, i) => s + (calcLine(i).taxable * i.sgst_rate / 100), 0);
  const igstTotal = items.reduce((s, i) => s + (calcLine(i).taxable * i.igst_rate / 100), 0);
  const grandTotal = subtotal + cgstTotal + sgstTotal + igstTotal;

  const handleSave = async () => {
    if (!form.customer_name || !form.place_of_supply || items.some(i => !i.description)) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setSaving(true);
    const invoiceNumber = generateInvoiceNumber();
    const amountInWords = numberToWords(grandTotal);

    const { data: invoice, error } = await supabase.from("invoices").insert({
      invoice_number: invoiceNumber,
      customer_id: form.customer_id || null,
      customer_name: form.customer_name,
      customer_address: form.customer_address,
      customer_phone: form.customer_phone,
      customer_gstin: form.customer_gstin,
      ticket_id: form.ticket_id || null,
      place_of_supply: form.place_of_supply,
      is_interstate: form.is_interstate,
      subtotal,
      cgst_total: cgstTotal,
      sgst_total: sgstTotal,
      igst_total: igstTotal,
      grand_total: grandTotal,
      amount_in_words: amountInWords,
      payment_mode: form.payment_mode,
      transaction_reference: form.transaction_reference,
      notes: form.notes,
      created_by: user?.id,
    }).select().single();

    if (error || !invoice) {
      toast({ title: "Error creating invoice", description: error?.message, variant: "destructive" });
      setSaving(false);
      return;
    }

    const lineItems = items.map(item => {
      const { taxable, tax, total } = calcLine(item);
      return {
        invoice_id: invoice.id,
        description: item.description,
        hsn_sac_code: item.hsn_sac_code,
        quantity: item.quantity,
        unit_price: item.unit_price,
        taxable_value: taxable,
        cgst_rate: item.cgst_rate,
        sgst_rate: item.sgst_rate,
        igst_rate: item.igst_rate,
        tax_amount: tax,
        total_amount: total,
        inventory_id: item.inventory_id || null,
      };
    });

    await supabase.from("invoice_items").insert(lineItems);

    setSaving(false);
    toast({ title: `Invoice ${invoiceNumber} created!` });
    setOpen(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Create Invoice</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create GST Invoice</DialogTitle>
          <DialogDescription>Indian GST-compliant tax invoice</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer */}
          <Card className="border-border/50">
            <CardHeader className="py-3"><CardTitle className="text-xs font-medium text-muted-foreground">CUSTOMER DETAILS</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Select Customer</Label>
                <Select value={form.customer_id} onValueChange={handleCustomerSelect}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Choose customer" /></SelectTrigger>
                  <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Name</Label><Input value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} className="mt-1" /></div>
                <div><Label className="text-xs">Phone</Label><Input value={form.customer_phone} onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))} className="mt-1" /></div>
              </div>
              <div><Label className="text-xs">Address</Label><Input value={form.customer_address} onChange={e => setForm(f => ({ ...f, customer_address: e.target.value }))} className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">GSTIN (if B2B)</Label><Input value={form.customer_gstin} onChange={e => setForm(f => ({ ...f, customer_gstin: e.target.value }))} className="mt-1" placeholder="Optional" /></div>
                <div>
                  <Label className="text-xs">Link Ticket</Label>
                  <Select value={form.ticket_id} onValueChange={v => setForm(f => ({ ...f, ticket_id: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>{tickets.map(t => <SelectItem key={t.id} value={t.id}>{t.ticket_number}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax config */}
          <Card className="border-border/50">
            <CardHeader className="py-3"><CardTitle className="text-xs font-medium text-muted-foreground">TAX CONFIGURATION</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Place of Supply</Label>
                  <Select value={form.place_of_supply} onValueChange={v => setForm(f => ({ ...f, place_of_supply: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>{INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3 pt-5">
                  <Switch checked={form.is_interstate} onCheckedChange={toggleInterstate} />
                  <Label className="text-xs">Interstate Supply (IGST)</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line items */}
          <Card className="border-border/50">
            <CardHeader className="py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">ITEMS / SERVICES</CardTitle>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={addItem}><Plus className="h-3 w-3" /> Add Line</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="border border-border/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Item {idx + 1}</span>
                    {items.length > 1 && <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => removeItem(idx)}><Trash2 className="h-3 w-3" /></Button>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">From Inventory</Label>
                      <Select value={item.inventory_id} onValueChange={v => updateItem(idx, "inventory_id", v)}>
                        <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder="Optional" /></SelectTrigger>
                        <SelectContent>{inventoryItems.map(i => <SelectItem key={i.id} value={i.id}>{i.name} ({i.sku})</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label className="text-xs">HSN/SAC Code</Label><Input value={item.hsn_sac_code} onChange={e => updateItem(idx, "hsn_sac_code", e.target.value)} className="mt-1 h-8 text-xs" /></div>
                  </div>
                  <div><Label className="text-xs">Description</Label><Input value={item.description} onChange={e => updateItem(idx, "description", e.target.value)} className="mt-1 h-8 text-xs" /></div>
                  <div className="grid grid-cols-4 gap-2">
                    <div><Label className="text-xs">Qty</Label><Input type="number" min={1} value={item.quantity} onChange={e => updateItem(idx, "quantity", Number(e.target.value))} className="mt-1 h-8 text-xs" /></div>
                    <div><Label className="text-xs">Price (₹)</Label><Input type="number" value={item.unit_price} onChange={e => updateItem(idx, "unit_price", Number(e.target.value))} className="mt-1 h-8 text-xs" /></div>
                    {form.is_interstate ? (
                      <div className="col-span-2">
                        <Label className="text-xs">IGST %</Label>
                        <Select value={String(item.igst_rate)} onValueChange={v => updateItem(idx, "igst_rate", Number(v))}>
                          <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{GST_RATES.map(r => <SelectItem key={r} value={String(r)}>{r}%</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <>
                        <div>
                          <Label className="text-xs">CGST %</Label>
                          <Select value={String(item.cgst_rate)} onValueChange={v => { updateItem(idx, "cgst_rate", Number(v)); updateItem(idx, "sgst_rate", Number(v)); }}>
                            <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>{[0, 2.5, 6, 9, 14].map(r => <SelectItem key={r} value={String(r)}>{r}%</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">SGST %</Label>
                          <Input value={item.sgst_rate} disabled className="mt-1 h-8 text-xs bg-muted" />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    Taxable: {formatINR(calcLine(item).taxable)} | Tax: {formatINR(calcLine(item).tax)} | <span className="font-semibold text-foreground">Total: {formatINR(calcLine(item).total)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tax Summary */}
          <Card className="border-border/50 bg-muted/30">
            <CardContent className="py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Subtotal:</span><span className="text-right font-mono">{formatINR(subtotal)}</span>
                {!form.is_interstate && <><span className="text-muted-foreground">CGST:</span><span className="text-right font-mono">{formatINR(cgstTotal)}</span></>}
                {!form.is_interstate && <><span className="text-muted-foreground">SGST:</span><span className="text-right font-mono">{formatINR(sgstTotal)}</span></>}
                {form.is_interstate && <><span className="text-muted-foreground">IGST:</span><span className="text-right font-mono">{formatINR(igstTotal)}</span></>}
                <span className="font-semibold border-t border-border pt-2">Grand Total:</span><span className="text-right font-mono font-bold text-lg border-t border-border pt-2">{formatINR(grandTotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">{numberToWords(grandTotal)}</p>
            </CardContent>
          </Card>

          {/* Payment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Payment Mode</Label>
              <Select value={form.payment_mode} onValueChange={v => setForm(f => ({ ...f, payment_mode: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{PAYMENT_MODES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Transaction Reference</Label><Input value={form.transaction_reference} onChange={e => setForm(f => ({ ...f, transaction_reference: e.target.value }))} className="mt-1" placeholder="Optional" /></div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Generate Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
