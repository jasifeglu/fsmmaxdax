import { AlertTriangle, Zap } from "lucide-react";
import { SettingSection, SettingInput, SettingToggle } from "./SettingsShared";

interface Props {
  settings: Record<string, string>;
  update: (k: string, v: string) => void;
}

export const EscalationSettings = ({ settings, update }: Props) => (
  <div className="space-y-6">
    <SettingSection icon={<AlertTriangle className="h-4 w-4" />} title="Escalation Rules" desc="Set automatic escalation triggers for tickets">
      <SettingInput label="Escalate if Unassigned (hours)" desc="Trigger escalation if ticket is not assigned within this time" settingKey="escalation_unassigned_hours" settings={settings} update={update} type="number" placeholder="2" />
      <SettingToggle label="Escalate on Technician Delay" desc="Auto-escalate if technician is delayed" settingKey="escalation_delay_enabled" settings={settings} update={update} />
      <SettingToggle label="Escalate Incomplete On Schedule" desc="Escalate if service not completed on schedule" settingKey="escalation_incomplete_enabled" settings={settings} update={update} />
      <SettingToggle label="Escalate Repeated Complaints" desc="Flag customers with repeated complaints" settingKey="escalation_repeat_complaint" settings={settings} update={update} />
    </SettingSection>

    <SettingSection icon={<Zap className="h-4 w-4" />} title="Escalation Actions" desc="Choose who gets notified during escalation">
      <SettingToggle label="Notify Admin Instantly" desc="Send immediate alert to admin on escalation" settingKey="escalation_notify_admin" settings={settings} update={update} />
      <SettingToggle label="Alert Coordinator" desc="Notify assigned coordinator" settingKey="escalation_notify_coordinator" settings={settings} update={update} />
      <SettingToggle label="WhatsApp Escalation Alert" desc="Send escalation notification via WhatsApp" settingKey="escalation_whatsapp_alert" settings={settings} update={update} />
    </SettingSection>
  </div>
);
