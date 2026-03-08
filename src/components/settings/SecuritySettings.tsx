import { Lock, Key, ShieldCheck } from "lucide-react";
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
      <SettingInput label="Account Lockout Duration (minutes)" desc="How long account stays locked after max failed attempts" settingKey="lockout_duration_minutes" settings={settings} update={update} type="number" placeholder="30" />
      <SettingToggle label="Force Password Change on First Login" desc="New users must change password immediately" settingKey="force_password_change" settings={settings} update={update} />
      <SettingToggle label="Two-Factor Authentication" desc="Enable 2FA for all users (Coming Soon)" settingKey="two_factor_enabled" settings={settings} update={update} />
    </SettingSection>

    <SettingSection icon={<Key className="h-4 w-4" />} title="Password Policy" desc="Enforce strong password requirements across the system">
      <SettingInput label="Minimum Password Length" desc="Minimum number of characters required" settingKey="min_password_length" settings={settings} update={update} type="number" placeholder="8" />
      <SettingToggle label="Require Uppercase Letter" desc="Password must contain at least one uppercase letter" settingKey="require_uppercase" settings={settings} update={update} />
      <SettingToggle label="Require Lowercase Letter" desc="Password must contain at least one lowercase letter" settingKey="require_lowercase" settings={settings} update={update} />
      <SettingToggle label="Require Number" desc="Password must contain at least one number" settingKey="require_number" settings={settings} update={update} />
      <SettingToggle label="Require Special Character" desc="Password must contain at least one special character" settingKey="require_special_char" settings={settings} update={update} />
      <SettingInput label="Password Expiry (days)" desc="Force password change after X days (0 = never)" settingKey="password_expiry_days" settings={settings} update={update} type="number" placeholder="0" />
      <SettingToggle label="Prevent Password Reuse" desc="Block reuse of last 5 passwords" settingKey="prevent_password_reuse" settings={settings} update={update} />
    </SettingSection>

    <SettingSection icon={<ShieldCheck className="h-4 w-4" />} title="Session Security" desc="Control active session behavior">
      <SettingToggle label="Invalidate Sessions on Password Reset" desc="Force logout from all devices when password is changed" settingKey="invalidate_sessions_on_reset" settings={settings} update={update} />
      <SettingToggle label="Single Session Mode" desc="Only allow one active session per user" settingKey="single_session_mode" settings={settings} update={update} />
    </SettingSection>
  </div>
);
