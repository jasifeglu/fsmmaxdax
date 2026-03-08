import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Share2 } from "lucide-react";
import { formatINR } from "@/lib/formatINR";

interface Props {
  invoice: any;
  items: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COMPANY = {
  name: "MAXDAX SERVICES PVT LTD",
  address: "123 Business Park, Sector 15, Noida, UP - 201301",
  gstin: "09AABCM1234F1Z5",
  phone: "+91 98765 43210",
  email: "billing@maxdax.in",
};

export const InvoicePreview = ({ invoice, items, open, onOpenChange }: Props) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Invoice ${invoice.invoice_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; }
        body { padding: 20px; color: #1a1a1a; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px 12px; text-align: left; border: 1px solid #e5e5e5; font-size: 12px; }
        th { background: #f5f5f5; font-weight: 600; }
        .header { display: flex; justify-content: space-between; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #1a1a1a; }
        .company { font-size: 18px; font-weight: 700; }
        .gstin { font-size: 11px; color: #666; }
        .section { margin: 16px 0; }
        .section-title { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #888; margin-bottom: 8px; }
        .summary { text-align: right; }
        .total-row { font-weight: 700; font-size: 14px; }
        .footer { margin-top: 40px; display: flex; justify-content: space-between; }
        .sig-line { width: 200px; border-top: 1px solid #999; padding-top: 8px; text-align: center; font-size: 11px; }
        @media print { body { padding: 0; } }
      </style></head><body>${content.innerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Invoice: ${invoice.invoice_number}\nCustomer: ${invoice.customer_name}\nAmount: ₹${Number(invoice.grand_total).toLocaleString()}\nDate: ${invoice.invoice_date}\nStatus: ${invoice.payment_status}`
    );
    const phone = invoice.customer_phone ? invoice.customer_phone.replace(/\D/g, '') : '';
    const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Invoice Preview</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handleWhatsApp}>
                <Share2 className="h-3.5 w-3.5" /> WhatsApp
              </Button>
              <Button size="sm" className="gap-1.5 text-xs" onClick={handlePrint}>
                <Download className="h-3.5 w-3.5" /> Download PDF
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div ref={printRef} className="bg-background p-6 text-sm">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-foreground pb-4 mb-4">
            <div>
              <h1 className="text-xl font-bold">{COMPANY.name}</h1>
              <p className="text-xs text-muted-foreground mt-1">{COMPANY.address}</p>
              <p className="text-xs text-muted-foreground">Phone: {COMPANY.phone} | Email: {COMPANY.email}</p>
              <p className="text-xs font-semibold mt-1">GSTIN: {COMPANY.gstin}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">TAX INVOICE</p>
              <p className="text-xs mt-1"><span className="text-muted-foreground">Invoice No:</span> <span className="font-mono font-semibold">{invoice.invoice_number}</span></p>
              <p className="text-xs"><span className="text-muted-foreground">Date:</span> {invoice.invoice_date}</p>
              <p className="text-xs"><span className="text-muted-foreground">Place of Supply:</span> {invoice.place_of_supply}</p>
            </div>
          </div>

          {/* Customer */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-muted/30 rounded p-3">
              <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">Bill To</p>
              <p className="font-semibold">{invoice.customer_name}</p>
              {invoice.customer_address && <p className="text-xs text-muted-foreground">{invoice.customer_address}</p>}
              {invoice.customer_phone && <p className="text-xs text-muted-foreground">Phone: {invoice.customer_phone}</p>}
              {invoice.customer_gstin && <p className="text-xs font-medium">GSTIN: {invoice.customer_gstin}</p>}
            </div>
            <div className="bg-muted/30 rounded p-3">
              <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">Payment Details</p>
              <p className="text-xs"><span className="text-muted-foreground">Mode:</span> {invoice.payment_mode}</p>
              <p className="text-xs"><span className="text-muted-foreground">Status:</span> <span className={invoice.payment_status === "Paid" ? "text-primary font-semibold" : "text-destructive font-semibold"}>{invoice.payment_status}</span></p>
              {invoice.transaction_reference && <p className="text-xs"><span className="text-muted-foreground">Ref:</span> {invoice.transaction_reference}</p>}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-xs border border-border mb-4">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border p-2 text-left">#</th>
                <th className="border border-border p-2 text-left">Description</th>
                <th className="border border-border p-2 text-left">HSN/SAC</th>
                <th className="border border-border p-2 text-right">Qty</th>
                <th className="border border-border p-2 text-right">Rate (₹)</th>
                <th className="border border-border p-2 text-right">Taxable (₹)</th>
                {!invoice.is_interstate && <th className="border border-border p-2 text-right">CGST</th>}
                {!invoice.is_interstate && <th className="border border-border p-2 text-right">SGST</th>}
                {invoice.is_interstate && <th className="border border-border p-2 text-right">IGST</th>}
                <th className="border border-border p-2 text-right">Tax (₹)</th>
                <th className="border border-border p-2 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, idx: number) => (
                <tr key={item.id}>
                  <td className="border border-border p-2">{idx + 1}</td>
                  <td className="border border-border p-2">{item.description}</td>
                  <td className="border border-border p-2 font-mono">{item.hsn_sac_code || "—"}</td>
                  <td className="border border-border p-2 text-right">{Number(item.quantity)}</td>
                  <td className="border border-border p-2 text-right">{Number(item.unit_price).toLocaleString()}</td>
                  <td className="border border-border p-2 text-right">{Number(item.taxable_value).toLocaleString()}</td>
                  {!invoice.is_interstate && <td className="border border-border p-2 text-right">{Number(item.cgst_rate)}%</td>}
                  {!invoice.is_interstate && <td className="border border-border p-2 text-right">{Number(item.sgst_rate)}%</td>}
                  {invoice.is_interstate && <td className="border border-border p-2 text-right">{Number(item.igst_rate)}%</td>}
                  <td className="border border-border p-2 text-right">{Number(item.tax_amount).toLocaleString()}</td>
                  <td className="border border-border p-2 text-right font-semibold">{Number(item.total_amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tax Summary */}
          <div className="flex justify-end mb-4">
            <div className="w-64 space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal:</span><span className="font-mono">₹{Number(invoice.subtotal).toLocaleString()}</span></div>
              {!invoice.is_interstate && <div className="flex justify-between"><span className="text-muted-foreground">CGST:</span><span className="font-mono">₹{Number(invoice.cgst_total).toLocaleString()}</span></div>}
              {!invoice.is_interstate && <div className="flex justify-between"><span className="text-muted-foreground">SGST:</span><span className="font-mono">₹{Number(invoice.sgst_total).toLocaleString()}</span></div>}
              {invoice.is_interstate && <div className="flex justify-between"><span className="text-muted-foreground">IGST:</span><span className="font-mono">₹{Number(invoice.igst_total).toLocaleString()}</span></div>}
              <div className="flex justify-between border-t border-foreground pt-1 font-bold text-sm">
                <span>Grand Total:</span><span className="font-mono">₹{Number(invoice.grand_total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Amount in words */}
          <div className="bg-muted/30 rounded p-2 mb-6">
            <p className="text-[10px] text-muted-foreground">Amount in Words:</p>
            <p className="text-xs font-semibold italic">{invoice.amount_in_words}</p>
          </div>

          {/* Authorization */}
          <div className="flex justify-between items-end pt-8">
            <div>
              <p className="text-[10px] text-muted-foreground">Terms & Conditions Apply</p>
              <p className="text-[10px] text-muted-foreground">E&OE — Errors and Omissions Excepted</p>
            </div>
            <div className="text-center">
              <div className="w-48 border-t border-muted-foreground pt-2">
                <p className="text-xs font-semibold">Authorized Signatory</p>
                <p className="text-[10px] text-muted-foreground">{COMPANY.name}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
