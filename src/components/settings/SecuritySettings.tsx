import { Lock, Key } from "lucide-react";
import { SettingSection, SettingInput, SettingToggle } from "./SettingsShared";

interface Props {
  settings: Record<string, string>;
  update: (k: string, v: string) => void;
}

export const SecuritySettings = ({ settings, update }: Props) => (
  <div className="space-y-6">
    <SettingSection icon={<Lock className="h-4 w-4" />} title="Login & Authentication" desc="Control login behavior and session rules">
      <SettingInput label="Max Failed Login Attempts" desc="Lock account after X failed attempts" settingKey="max_login_attempts" settings={settings} update={update} type="number" placeholder="5" />
      <SettingInput label="Session Timeout (hours)" desc="Auto logout after inactivity" settingKey="session_timeout_hours" settings={settings} update={update} type="number" placeholder="8" />
      <SettingToggle label="Force Password Change on First Login" desc="New users must change password immediately" settingKey="force_password_change" settings={settings} update={update} />
      <SettingToggle label="Two-Factor Authentication" desc="Enable 2FA for all users (Coming Soon)" settingKey="two_factor_enabled" settings={settings} update={update} />
    </SettingSection>
  </div>
);
