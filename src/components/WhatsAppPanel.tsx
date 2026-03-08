import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

interface TicketData {
  ticket_number: string;
  customer_name: string;
  customer_phone: string;
  assignee_name?: string;
  scheduled_at?: string;
  status?: string;
  notes?: string;
}

interface WhatsAppTemplate {
  id: string;
  label: string;
  icon: string;
  allowedRoles: UserRole[];
  getMessage: (t: TicketData) => string;
}

const templates: WhatsAppTemplate[] = [
  {
    id: "registration",
    label: "Ticket Registered",
    icon: "📋",
    allowedRoles: ["admin", "coordinator"],
    getMessage: (t) =>
      `Hello ${t.customer_name},\n\nYour service request (Ticket No: ${t.ticket_number}) has been successfully registered.\n\nOur support team will contact you shortly.\n\nThank you for choosing us.\n— MAXDAX Service`,
  },
  {
    id: "technician_assigned",
    label: "Technician Assigned",
    icon: "🔧",
    allowedRoles: ["admin", "coordinator"],
    getMessage: (t) =>
      `Hello ${t.customer_name},\n\nA technician has been assigned for your service request (Ticket No: ${t.ticket_number}).\n\nTechnician Name: ${t.assignee_name || "TBD"}\nVisit scheduled on: ${t.scheduled_at ? new Date(t.scheduled_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "To be confirmed"}\n\nThank you for choosing us.\n— MAXDAX Service`,
  },
  {
    id: "pickup",
    label: "Product Pickup",
    icon: "📦",
    allowedRoles: ["admin", "coordinator"],
    getMessage: (t) =>
      `Hello ${t.customer_name},\n\nYour product pickup is scheduled for ${t.scheduled_at ? new Date(t.scheduled_at).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "[Date]"}.\n\nOur technician will collect the item for service.\nTicket No: ${t.ticket_number}\n\n— MAXDAX Service`,
  },
  {
    id: "schedule_confirmed",
    label: "Service Scheduled",
    icon: "📅",
    allowedRoles: ["admin", "coordinator"],
    getMessage: (t) =>
      `Hello ${t.customer_name},\n\nYour service appointment is confirmed for ${t.scheduled_at ? new Date(t.scheduled_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "[Date & Time]"}.\n\nTechnician will visit your location.\nTicket No: ${t.ticket_number}\n\n— MAXDAX Service`,
  },
  {
    id: "delay",
    label: "Service Delay",
    icon: "⏳",
    allowedRoles: ["admin", "coordinator"],
    getMessage: (t) =>
      `Hello ${t.customer_name},\n\nWe regret to inform you that your service visit (Ticket No: ${t.ticket_number}) has been delayed.\n\nNew expected time: ${t.scheduled_at ? new Date(t.scheduled_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "[Updated Time]"}\n\nThank you for your patience.\n— MAXDAX Service`,
  },
  {
    id: "completed",
    label: "Service Completed",
    icon: "✅",
    allowedRoles: ["admin", "coordinator", "technician"],
    getMessage: (t) =>
      `Hello ${t.customer_name},\n\nYour service request (Ticket No: ${t.ticket_number}) has been completed successfully.\n\nIf you face any issues, please contact us.\n\nThank you for choosing our service.\n— MAXDAX Service`,
  },
  {
    id: "invoice",
    label: "Invoice & Payment",
    icon: "💰",
    allowedRoles: ["admin", "technician"],
    getMessage: (t) =>
      `Hello ${t.customer_name},\n\nYour invoice for Ticket No: ${t.ticket_number} is ready.\n\nTotal Amount: ₹[Amount]\nPayment Status: [Paid/Pending]\n\nThank you.\n— MAXDAX Service`,
  },
  {
    id: "feedback",
    label: "Feedback Request",
    icon: "⭐",
    allowedRoles: ["admin", "coordinator"],
    getMessage: (t) =>
      `Hello ${t.customer_name},\n\nWe hope you are satisfied with our service.\n\nPlease share your valuable feedback for Ticket No: ${t.ticket_number}.\n\nYour feedback helps us improve.\n— MAXDAX Service`,
  },
];

const formatPhone = (phone: string) => {
  let cleaned = phone.replace(/[^0-9+]/g, "");
  if (cleaned.startsWith("+")) return cleaned.substring(1);
  if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
  if (cleaned.length === 10) return `91${cleaned}`;
  return cleaned;
};

interface WhatsAppPanelProps {
  ticket: TicketData;
}

export const WhatsAppPanel = ({ ticket }: WhatsAppPanelProps) => {
  const { role } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [editMessage, setEditMessage] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const visibleTemplates = templates.filter((t) => t.allowedRoles.includes(role));

  const openWhatsApp = (message: string) => {
    const phone = formatPhone(ticket.customer_phone);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleSend = (template: WhatsAppTemplate) => {
    const msg = template.getMessage(ticket);
    setEditMessage(msg);
    setEditPhone(ticket.customer_phone);
    setEditOpen(true);
  };

  const confirmSend = () => {
    openWhatsApp(editMessage);
    setEditOpen(false);
  };

  if (!ticket.customer_phone || visibleTemplates.length === 0) return null;

  return (
    <>
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2">
          <MessageSquare className="h-3.5 w-3.5" /> WhatsApp Notifications
        </p>
        <div className="grid grid-cols-2 gap-2">
          {visibleTemplates.map((template) => (
            <Button
              key={template.id}
              variant="outline"
              size="sm"
              className="text-xs h-9 justify-start gap-1.5 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              onClick={() => handleSend(template)}
            >
              <span>{template.icon}</span>
              <span className="truncate">{template.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Send via WhatsApp
            </DialogTitle>
            <DialogDescription>
              To: {editPhone} ({ticket.customer_name})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
              rows={8}
              className="text-sm font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              You can edit the message above before sending. WhatsApp will open with this message prefilled.
            </p>
            <Button onClick={confirmSend} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Open WhatsApp & Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
