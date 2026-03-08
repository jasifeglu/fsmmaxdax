import { Building2, Upload } from "lucide-react";
import { SettingSection, SettingInput } from "./SettingsShared";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Props {
  settings: Record<string, string>;
  update: (k: string, v: string) => void;
}

export const GeneralSettings = ({ settings, update }: Props) => (
  <div className="space-y-6">
    <SettingSection icon={<Building2 className="h-4 w-4" />} title="Company Information" desc="Basic business details displayed across the system">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingInput label="Company Name" settingKey="company_name" settings={settings} update={update} placeholder="MAXDAX" />
        <SettingInput label="Contact Phone" settingKey="company_phone" settings={settings} update={update} placeholder="+91 98765 43210" />
        <SettingInput label="Contact Email" settingKey="company_email" settings={settings} update={update} type="email" placeholder="info@maxdax.in" />
        <SettingInput label="GSTIN" settingKey="gstin" settings={settings} update={update} placeholder="22AAAAA0000A1Z5" />
      </div>
      <SettingInput label="Office Address" settingKey="office_address" settings={settings} update={update} placeholder="Enter full office address" />
    </SettingSection>

    <SettingSection icon={<Upload className="h-4 w-4" />} title="Regional & Format Settings" desc="Timezone, date format, and currency preferences">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-medium">Timezone</Label>
          <Select value={settings.timezone || "Asia/Kolkata"} onValueChange={(v) => update("timezone", v)}>
            <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
              <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
              <SelectItem value="America/New_York">US Eastern</SelectItem>
              <SelectItem value="Europe/London">UK (GMT)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs font-medium">Date Format</Label>
          <Select value={settings.date_format || "DD/MM/YYYY"} onValueChange={(v) => update("date_format", v)}>
            <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs font-medium">Currency</Label>
          <Select value={settings.currency || "INR"} onValueChange={(v) => update("currency", v)}>
            <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="INR">₹ INR</SelectItem>
              <SelectItem value="USD">$ USD</SelectItem>
              <SelectItem value="EUR">€ EUR</SelectItem>
              <SelectItem value="AED">AED</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <SettingInput label="GST Rate (%)" settingKey="gst_rate" settings={settings} update={update} type="number" placeholder="18" />
      </div>
    </SettingSection>
  </div>
);
