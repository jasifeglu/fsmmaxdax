import { MapPin, Shield } from "lucide-react";
import { SettingSection, SettingInput, SettingToggle } from "./SettingsShared";

interface Props {
  settings: Record<string, string>;
  update: (k: string, v: string) => void;
}

export const TrackingSettings = ({ settings, update }: Props) => (
  <div className="space-y-6">
    <SettingSection icon={<MapPin className="h-4 w-4" />} title="Live Technician Tracking" desc="Enable real-time location tracking for field technicians">
      <SettingToggle label="Enable Live Tracking" desc="Track technician location during active jobs" settingKey="live_tracking_enabled" settings={settings} update={update} />
      <SettingToggle label="Auto-Stop After Job" desc="Automatically stop tracking when job is completed" settingKey="tracking_auto_stop" settings={settings} update={update} />
      <SettingInput label="Tracking Link Expiry (hours)" desc="How long the customer tracking link stays active" settingKey="tracking_link_expiry_hours" settings={settings} update={update} type="number" placeholder="8" />
    </SettingSection>

    <SettingSection icon={<Shield className="h-4 w-4" />} title="Privacy Controls" desc="Manage technician privacy and data handling">
      <SettingToggle label="Selfie Check-In Required" desc="Require selfie photo when checking in at job site" settingKey="selfie_checkin_enabled" settings={settings} update={update} />
      <SettingToggle label="Travel Expense Tracking" desc="Allow technicians to log travel expenses" settingKey="travel_expense_enabled" settings={settings} update={update} />
    </SettingSection>
  </div>
);
