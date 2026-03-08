import { MessageSquare } from "lucide-react";
import { SettingSection, SettingToggle } from "./SettingsShared";

interface Props {
  settings: Record<string, string>;
  update: (k: string, v: string) => void;
}

const templates = [
  { key: "wa_ticket_registered", label: "Ticket Registered", desc: "Send when a new ticket is created" },
  { key: "wa_tech_assigned", label: "Technician Assigned", desc: "Send when technician is assigned" },
  { key: "wa_service_scheduled", label: "Service Scheduled", desc: "Send when visit is scheduled" },
  { key: "wa_delay_notice", label: "Delay Notice", desc: "Send when service is delayed" },
  { key: "wa_service_completed", label: "Service Completed", desc: "Send when job is completed" },
  { key: "wa_payment_reminder", label: "Payment Reminder", desc: "Send invoice and payment reminder" },
  { key: "wa_feedback_request", label: "Feedback Request", desc: "Send after ticket closure" },
];

export const CommunicationSettings = ({ settings, update }: Props) => (
  <div className="space-y-6">
    <SettingSection icon={<MessageSquare className="h-4 w-4" />} title="WhatsApp Message Templates" desc="Enable/disable WhatsApp notifications per stage">
      {templates.map((t) => (
        <SettingToggle
          key={t.key}
          label={t.label}
          desc={t.desc}
          settingKey={t.key}
          settings={{ ...settings, [t.key]: settings[t.key] ?? "true" }}
          update={update}
        />
      ))}
    </SettingSection>

    <SettingSection icon={<MessageSquare className="h-4 w-4" />} title="Other Channels" desc="SMS and Email integration status">
      <div className="rounded-lg bg-muted/50 p-4 text-center">
        <p className="text-sm text-muted-foreground">📱 SMS Integration — Coming Soon</p>
      </div>
      <div className="rounded-lg bg-muted/50 p-4 text-center">
        <p className="text-sm text-muted-foreground">📧 Email Notifications — Coming Soon</p>
      </div>
    </SettingSection>
  </div>
);
