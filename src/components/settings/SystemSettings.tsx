import { Link2, Database, Palette } from "lucide-react";
import { SettingSection, SettingInput, SettingToggle } from "./SettingsShared";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Props {
  settings: Record<string, string>;
  update: (k: string, v: string) => void;
}

export const IntegrationSettings = ({ settings, update }: Props) => (
  <SettingSection icon={<Link2 className="h-4 w-4" />} title="Integrations" desc="Manage external service connections">
    <SettingToggle label="Google Form Ticket Sync" desc="Auto-create tickets from Google Form submissions" settingKey="google_form_sync" settings={settings} update={update} />
    <SettingToggle label="Google Sheets Data Import" desc="Import data from Google Sheets" settingKey="google_sheets_import" settings={settings} update={update} />
    <SettingToggle label="WhatsApp Integration" desc="Enable WhatsApp messaging features" settingKey="whatsapp_integration" settings={settings} update={update} />
    <div className="rounded-lg bg-muted/50 p-4 text-center space-y-2">
      <p className="text-sm text-muted-foreground">💳 Payment Gateway — Coming Soon</p>
      <p className="text-sm text-muted-foreground">📊 ERP/Accounting Integration — Coming Soon</p>
    </div>
  </SettingSection>
);

export const AppearanceSettings = ({ settings, update }: Props) => (
  <SettingSection icon={<Palette className="h-4 w-4" />} title="UI & Appearance" desc="Customize the look and feel">
    <div>
      <Label className="text-xs font-medium">Theme Mode</Label>
      <Select value={settings.theme_mode || "dark"} onValueChange={(v) => update("theme_mode", v)}>
        <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="dark">🌙 Dark Mode</SelectItem>
          <SelectItem value="light">☀️ Light Mode</SelectItem>
          <SelectItem value="system">🖥️ System Default</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div>
      <Label className="text-xs font-medium">Dashboard Layout</Label>
      <Select value={settings.dashboard_layout || "default"} onValueChange={(v) => update("dashboard_layout", v)}>
        <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default</SelectItem>
          <SelectItem value="compact">Compact</SelectItem>
          <SelectItem value="expanded">Expanded</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </SettingSection>
);

export const DataSettings = ({ settings, update }: Props) => (
  <SettingSection icon={<Database className="h-4 w-4" />} title="Data Management" desc="Backup, retention, and audit settings">
    <SettingInput label="Data Retention (days)" desc="How long to keep historical data" settingKey="data_retention_days" settings={settings} update={update} type="number" placeholder="365" />
    <SettingToggle label="Automatic Backups" desc="Enable scheduled database backups" settingKey="auto_backup" settings={settings} update={update} />
    <div className="rounded-lg bg-muted/50 p-4 text-center space-y-2">
      <p className="text-sm text-muted-foreground">📋 Audit Trail Viewer — Coming Soon</p>
      <p className="text-sm text-muted-foreground">📥 Export Reports — Available in Reports page</p>
    </div>
  </SettingSection>
);
