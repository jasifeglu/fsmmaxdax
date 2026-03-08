import { Bell, Clock } from "lucide-react";
import { SettingSection, SettingInput, SettingToggle } from "./SettingsShared";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Props {
  settings: Record<string, string>;
  update: (k: string, v: string) => void;
}

export const ReminderSettings = ({ settings, update }: Props) => (
  <div className="space-y-6">
    <SettingSection icon={<Bell className="h-4 w-4" />} title="Reminder Toggles" desc="Enable or disable specific reminder types">
      <SettingToggle label="Upcoming Service Visit" desc="Remind customers before scheduled visits" settingKey="reminder_service_visit" settings={settings} update={update} />
      <SettingToggle label="Pending Job Reminders" desc="Alert staff about pending unresolved jobs" settingKey="reminder_pending_job" settings={settings} update={update} />
      <SettingToggle label="Payment Due Reminders" desc="Notify customers about pending payments" settingKey="reminder_payment_due" settings={settings} update={update} />
      <SettingToggle label="AMC Service Reminders" desc="Remind AMC contract service schedules" settingKey="reminder_amc_service" settings={settings} update={update} />
      <SettingToggle label="Follow-Up Service" desc="Send follow-up reminders after service" settingKey="reminder_followup" settings={settings} update={update} />
    </SettingSection>

    <SettingSection icon={<Clock className="h-4 w-4" />} title="Reminder Timing & Channel" desc="Configure when and how reminders are sent">
      <SettingInput label="Service Visit Reminder (hours before)" settingKey="reminder_service_hours" settings={settings} update={update} type="number" placeholder="24" />
      <div>
        <Label className="text-xs font-medium">Default Channel</Label>
        <Select value={settings.reminder_channel || "whatsapp"} onValueChange={(v) => update("reminder_channel", v)}>
          <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="sms">SMS (Coming Soon)</SelectItem>
            <SelectItem value="email">Email (Coming Soon)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SettingSection>
  </div>
);
