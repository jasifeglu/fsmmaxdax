import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Search, Eye, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { InvoicePreview } from "./InvoicePreview";
import { formatINR } from "@/lib/formatINR";

interface Props {
  refreshKey: number;
}

export const InvoiceHistory = ({ refreshKey }: Props) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    const { data } = await supabase.from("invoices").select("*").order("created_at", { ascending: false });
    setInvoices(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchInvoices(); }, [refreshKey]);

  const handleView = async (invoice: any) => {
    const { data } = await supabase.from("invoice_items").select("*").eq("invoice_id", invoice.id);
    setSelectedInvoice(invoice);
    setSelectedItems(data || []);
    setPreviewOpen(true);
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    await supabase.from("invoices").update({ payment_status: status, updated_at: new Date().toISOString() }).eq("id", id);
    fetchInvoices();
  };

  const filtered = invoices.filter(inv =>
    inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    inv.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  const statusMap: Record<string, string> = { Paid: "Available", Pending: "Pending", Overdue: "Critical", "Partially Paid": "Warning" };

  return (
    <>
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Invoice History</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs w-52" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No invoices found. Create your first invoice!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs border-b">
                    <th className="text-left py-2 font-medium">Invoice #</th>
                    <th className="text-left py-2 font-medium">Customer</th>
                    <th className="text-left py-2 font-medium hidden sm:table-cell">Date</th>
                    <th className="text-right py-2 font-medium">Amount</th>
                    <th className="text-left py-2 font-medium">Status</th>
                    <th className="text-left py-2 font-medium hidden md:table-cell">Mode</th>
                    <th className="text-right py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(inv => (
                    <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 font-mono text-xs text-primary">{inv.invoice_number}</td>
                      <td className="py-2.5 font-medium">{inv.customer_name}</td>
                      <td className="py-2.5 text-muted-foreground text-xs hidden sm:table-cell">{inv.invoice_date}</td>
                      <td className="py-2.5 text-right font-mono font-semibold">₹{Number(inv.grand_total).toLocaleString()}</td>
                      <td className="py-2.5">
                        <button onClick={() => handleStatusUpdate(inv.id, inv.payment_status === "Pending" ? "Paid" : "Pending")} className="cursor-pointer">
                          <StatusBadge status={statusMap[inv.payment_status] || inv.payment_status} />
                        </button>
                      </td>
                      <td className="py-2.5 text-muted-foreground text-xs hidden md:table-cell">{inv.payment_mode}</td>
                      <td className="py-2.5 text-right">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleView(inv)}>
                          <Eye className="h-3.5 w-3.5" />
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

      <InvoicePreview
        invoice={selectedInvoice}
        items={selectedItems}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </>
  );
};
