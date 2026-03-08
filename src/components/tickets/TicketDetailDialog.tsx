import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/StatusBadge";
import { SmartDispatchPanel } from "@/components/tickets/SmartDispatchPanel";
import { WhatsAppPanel } from "@/components/WhatsAppPanel";
import { DeviceSection } from "@/components/tickets/DeviceSection";
import { VendorSection } from "@/components/tickets/VendorSection";
import { TicketTimeline } from "@/components/tickets/TicketTimeline";
import { MultiTechnicianSection } from "@/components/tickets/MultiTechnicianSection";
import { TicketComments } from "@/components/tickets/TicketComments";
import { formatINR } from "@/lib/formatINR";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface TicketDetailDialogProps {
  ticket: any | null;
  onClose: () => void;
  onRefresh: () => void;
}

export const TicketDetailDialog = ({ ticket, onClose, onRefresh }: TicketDetailDialogProps) => {
  const { role } = useAuth();

  if (!ticket) return null;

  return (
    <Dialog open={!!ticket} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-primary">{ticket.ticket_number}</span>
            <StatusBadge status={ticket.status} />
            <StatusBadge status={ticket.priority} />
            {ticket.delay_category && <StatusBadge status={ticket.delay_category} />}
          </DialogTitle>
          <DialogDescription>{ticket.issue}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-xs text-muted-foreground">Customer</p><p className="font-medium">{ticket.customer_name}</p></div>
            <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium">{ticket.customer_phone || "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">Category</p><p className="font-medium">{ticket.category}</p></div>
            <div><p className="text-xs text-muted-foreground">Assigned To</p><p className="font-medium">{ticket.assignee_name || "Unassigned"}</p></div>
            <div><p className="text-xs text-muted-foreground">Created</p><p className="font-medium">{new Date(ticket.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p></div>
            <div><p className="text-xs text-muted-foreground">Scheduled</p><p className="font-medium">{ticket.scheduled_at ? new Date(ticket.scheduled_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Not scheduled"}</p></div>
          </div>

          {/* Complaint details */}
          {(ticket.complaint_description || ticket.customer_explanation || ticket.technician_observations) && (
            <div className="bg-muted/20 rounded-lg p-3 space-y-1.5 text-xs">
              <p className="text-[10px] font-medium text-muted-foreground">COMPLAINT DETAILS</p>
              {ticket.complaint_description && <div><span className="text-muted-foreground">Description:</span> {ticket.complaint_description}</div>}
              {ticket.customer_explanation && <div><span className="text-muted-foreground">Customer Says:</span> {ticket.customer_explanation}</div>}
              {ticket.technician_observations && <div><span className="text-muted-foreground">Tech Observations:</span> {ticket.technician_observations}</div>}
            </div>
          )}

          {/* Charges */}
          {(Number(ticket.service_charge) > 0 || Number(ticket.distance_charge) > 0 || Number(ticket.final_customer_amount) > 0) && (
            <div className="bg-muted/30 rounded-lg p-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">CHARGE BREAKDOWN</p>
              {Number(ticket.service_charge) > 0 && (
                <div className="flex justify-between text-xs"><span>Service Charge</span><span className="font-mono">{formatINR(Number(ticket.service_charge))}</span></div>
              )}
              {ticket.distance_km && (
                <div className="flex justify-between text-xs"><span>Distance ({Number(ticket.distance_km).toFixed(1)} km)</span><span className="font-mono">{formatINR(Number(ticket.distance_charge))}</span></div>
              )}
              {Number(ticket.final_customer_amount) > 0 && (role === "admin" || role === "coordinator") && (
                <div className="flex justify-between text-xs"><span>Vendor Service (incl. margin)</span><span className="font-mono">{formatINR(Number(ticket.final_customer_amount))}</span></div>
              )}
              <div className="flex justify-between text-xs font-semibold border-t border-border pt-1">
                <span>Total</span>
                <span className="font-mono">{formatINR(
                  Number(ticket.service_charge || 0) + Number(ticket.distance_charge || 0) +
                  ((role === "admin" || role === "coordinator") ? Number(ticket.final_customer_amount || 0) : 0)
                )}</span>
              </div>
            </div>
          )}

          {ticket.customer_latitude && (
            <Button variant="outline" size="sm" className="w-full text-xs gap-1" asChild>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${ticket.customer_latitude},${ticket.customer_longitude}`} target="_blank" rel="noopener noreferrer">
                Navigate to Customer →
              </a>
            </Button>
          )}

          {ticket.notes && (
            <div><p className="text-xs text-muted-foreground">Notes</p><p className="text-sm mt-0.5">{ticket.notes}</p></div>
          )}

          <Separator />

          {/* Device / Asset Section */}
          <DeviceSection ticketId={ticket.id} deviceId={ticket.device_id} customerId={ticket.customer_id}
            onDeviceLinked={() => onRefresh()} readOnly={role === "technician"} />

          <Separator />

          {/* Vendor Section */}
          <VendorSection ticket={ticket} onUpdated={onRefresh} />

          <Separator />

          {/* Multi-Technician */}
          <MultiTechnicianSection ticketId={ticket.id} />

          <Separator />

          {/* Smart Dispatch */}
          {(!ticket.assigned_to || ticket.status === "New") && (role === "admin" || role === "coordinator") && (
            <>
              <SmartDispatchPanel ticket={ticket} onAssigned={() => { onRefresh(); onClose(); }} />
              <Separator />
            </>
          )}

          {/* Timeline */}
          <TicketTimeline ticketId={ticket.id} />

          <Separator />

          <WhatsAppPanel ticket={ticket} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
