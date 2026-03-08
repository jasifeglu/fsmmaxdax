import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Loader2, Save, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { formatINR } from "@/lib/formatINR";

interface VendorSectionProps {
  ticket: any;
  onUpdated?: () => void;
}

const DELAY_CATEGORIES = ["Vendor Delay", "Customer Delay", "Technician Delay", "Spare Parts Delay"];

export const VendorSection = ({ ticket, onUpdated }: VendorSectionProps) => {
  const { toast } = useToast();
  const { role } = useAuth();
  const [vendors, setVendors] = useState<any[]>([]);
  const [expanded, setExpanded] = useState(!!ticket.vendor_id || !!ticket.vendor_ticket_number);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    vendor_id: ticket.vendor_id || "",
    vendor_ticket_number: ticket.vendor_ticket_number || "",
    vendor_srn: ticket.vendor_srn || "",
    vendor_registration_date: ticket.vendor_registration_date || "",
    pickup_date: ticket.pickup_date || "",
    sent_to_vendor_date: ticket.sent_to_vendor_date || "",
    vendor_expected_completion: ticket.vendor_expected_completion || "",
    vendor_completion_date: ticket.vendor_completion_date || "",
    product_returned_date: ticket.product_returned_date || "",
    vendor_service_notes: ticket.vendor_service_notes || "",
    vendor_invoice_amount: ticket.vendor_invoice_amount || 0,
    company_margin_pct: ticket.company_margin_pct || 0,
    additional_service_charge: ticket.additional_service_charge || 0,
    delay_reason: ticket.delay_reason || "",
    delay_category: ticket.delay_category || "",
  });

  useEffect(() => {
    supabase.from("vendors").select("id, name").eq("is_active", true).order("name")
      .then(({ data }) => setVendors(data || []));
  }, []);

  const canEditDates = role === "admin" || role === "coordinator";
  const canEditFinancials = role === "admin" || role === "coordinator";
  const canViewFinancials = role === "admin" || role === "coordinator";
  const canEditBasic = true; // all roles can edit vendor ticket no & SRN

  const finalAmount = Number(form.vendor_invoice_amount) +
    (Number(form.vendor_invoice_amount) * Number(form.company_margin_pct) / 100) +
    Number(form.additional_service_charge);

  const handleSave = async () => {
    setSaving(true);
    const updates: any = {};

    // All roles can update these
    if (canEditBasic) {
      updates.vendor_ticket_number = form.vendor_ticket_number;
      updates.vendor_srn = form.vendor_srn;
    }

    // Coordinator + Admin
    if (canEditDates) {
      updates.vendor_id = form.vendor_id || null;
      updates.vendor_registration_date = form.vendor_registration_date || null;
      updates.pickup_date = form.pickup_date || null;
      updates.sent_to_vendor_date = form.sent_to_vendor_date || null;
      updates.vendor_expected_completion = form.vendor_expected_completion || null;
      updates.vendor_completion_date = form.vendor_completion_date || null;
      updates.product_returned_date = form.product_returned_date || null;
      updates.vendor_service_notes = form.vendor_service_notes;
      updates.delay_reason = form.delay_reason;
      updates.delay_category = form.delay_category;
    }

    // Financial fields
    if (canEditFinancials) {
      updates.vendor_invoice_amount = Number(form.vendor_invoice_amount);
      updates.company_margin_pct = Number(form.company_margin_pct);
      updates.additional_service_charge = Number(form.additional_service_charge);
      updates.final_customer_amount = finalAmount;
    }

    const { error } = await supabase.from("tickets").update(updates).eq("id", ticket.id);
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Vendor details saved" });
    onUpdated?.();
  };

  return (
    <div className="space-y-2">
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1">
        <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> Vendor / External Service Details</span>
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {expanded && (
        <div className="bg-muted/20 rounded-lg p-3 space-y-3 border border-border/30">
          {/* Vendor selection - coordinator/admin only */}
          {canEditDates && (
            <div>
              <Label className="text-xs">Vendor</Label>
              <Select value={form.vendor_id} onValueChange={v => setForm({...form, vendor_id: v})}>
                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder="Select vendor" /></SelectTrigger>
                <SelectContent>
                  {vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Basic fields - all roles */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Vendor Ticket No</Label>
              <Input value={form.vendor_ticket_number} onChange={e => setForm({...form, vendor_ticket_number: e.target.value})}
                className="mt-1 h-8 text-xs" />
            </div>
            <div>
              <Label className="text-xs">SRN Number</Label>
              <Input value={form.vendor_srn} onChange={e => setForm({...form, vendor_srn: e.target.value})}
                className="mt-1 h-8 text-xs" />
            </div>
          </div>

          {/* Date fields - coordinator/admin only */}
          {canEditDates && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Registration Date</Label>
                  <Input type="date" value={form.vendor_registration_date} onChange={e => setForm({...form, vendor_registration_date: e.target.value})}
                    className="mt-1 h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-xs">Pickup Date</Label>
                  <Input type="date" value={form.pickup_date} onChange={e => setForm({...form, pickup_date: e.target.value})}
                    className="mt-1 h-8 text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Sent to Vendor</Label>
                  <Input type="date" value={form.sent_to_vendor_date} onChange={e => setForm({...form, sent_to_vendor_date: e.target.value})}
                    className="mt-1 h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-xs">Expected Completion</Label>
                  <Input type="date" value={form.vendor_expected_completion} onChange={e => setForm({...form, vendor_expected_completion: e.target.value})}
                    className="mt-1 h-8 text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Vendor Completion</Label>
                  <Input type="date" value={form.vendor_completion_date} onChange={e => setForm({...form, vendor_completion_date: e.target.value})}
                    className="mt-1 h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-xs">Product Returned</Label>
                  <Input type="date" value={form.product_returned_date} onChange={e => setForm({...form, product_returned_date: e.target.value})}
                    className="mt-1 h-8 text-xs" />
                </div>
              </div>
            </>
          )}

          {/* Read-only date display for technicians */}
          {!canEditDates && (ticket.pickup_date || ticket.sent_to_vendor_date) && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {ticket.pickup_date && <div><span className="text-muted-foreground">Pickup:</span> {ticket.pickup_date}</div>}
              {ticket.sent_to_vendor_date && <div><span className="text-muted-foreground">Sent to Vendor:</span> {ticket.sent_to_vendor_date}</div>}
              {ticket.vendor_expected_completion && <div><span className="text-muted-foreground">Expected:</span> {ticket.vendor_expected_completion}</div>}
              {ticket.vendor_completion_date && <div><span className="text-muted-foreground">Completed:</span> {ticket.vendor_completion_date}</div>}
            </div>
          )}

          {/* Delay tracking */}
          {canEditDates && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Delay Category</Label>
                <Select value={form.delay_category} onValueChange={v => setForm({...form, delay_category: v})}>
                  <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder="No delay" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Delay</SelectItem>
                    {DELAY_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Delay Reason</Label>
                <Input value={form.delay_reason} onChange={e => setForm({...form, delay_reason: e.target.value})}
                  className="mt-1 h-8 text-xs" placeholder="Reason..." />
              </div>
            </div>
          )}

          {/* Vendor notes */}
          {canEditDates && (
            <div>
              <Label className="text-xs">Vendor Service Notes</Label>
              <Textarea value={form.vendor_service_notes} onChange={e => setForm({...form, vendor_service_notes: e.target.value})}
                className="mt-1 text-xs" rows={2} />
            </div>
          )}

          {/* Financial section - hidden from technicians */}
          {canViewFinancials && (
            <div className="border-t border-border/30 pt-2 space-y-2">
              <p className="text-[10px] font-medium text-muted-foreground">VENDOR FINANCIALS</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Vendor Cost</Label>
                  <Input type="number" value={form.vendor_invoice_amount} onChange={e => setForm({...form, vendor_invoice_amount: Number(e.target.value)})}
                    className="mt-1 h-8 text-xs" disabled={!canEditFinancials} />
                </div>
                <div>
                  <Label className="text-xs">Margin %</Label>
                  <Input type="number" value={form.company_margin_pct} onChange={e => setForm({...form, company_margin_pct: Number(e.target.value)})}
                    className="mt-1 h-8 text-xs" disabled={!canEditFinancials} />
                </div>
                <div>
                  <Label className="text-xs">Add. Charges</Label>
                  <Input type="number" value={form.additional_service_charge} onChange={e => setForm({...form, additional_service_charge: Number(e.target.value)})}
                    className="mt-1 h-8 text-xs" disabled={!canEditFinancials} />
                </div>
              </div>
              <div className="flex justify-between text-xs font-semibold bg-muted/40 rounded p-2">
                <span>Final Customer Amount</span>
                <span className="font-mono">{formatINR(finalAmount)}</span>
              </div>
            </div>
          )}

          <Button onClick={handleSave} disabled={saving} size="sm" className="w-full h-8 text-xs gap-1">
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save Vendor Details
          </Button>
        </div>
      )}
    </div>
  );
};
