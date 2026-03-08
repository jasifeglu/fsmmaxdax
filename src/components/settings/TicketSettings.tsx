import { Ticket, Zap } from "lucide-react";
import { SettingSection, SettingInput, SettingToggle } from "./SettingsShared";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Props {
  settings: Record<string, string>;
  update: (k: string, v: string) => void;
}

export const TicketSettings = ({ settings, update }: Props) => (
  <div className="space-y-6">
    <SettingSection icon={<Ticket className="h-4 w-4" />} title="Ticket Configuration" desc="Customize ticket numbering and default values">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingInput label="Ticket Number Prefix" desc="e.g. MXD → MXD-000001" settingKey="ticket_prefix" settings={settings} update={update} placeholder="MXD" />
        <div>
          <Label className="text-xs font-medium">Default Priority</Label>
          <Select value={settings.default_priority || "Medium"} onValueChange={(v) => update("default_priority", v)}>
            <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <SettingInput label="Auto-Close After (days)" desc="Automatically close completed tickets after X days" settingKey="auto_close_days" settings={settings} update={update} type="number" placeholder="7" />
    </SettingSection>

    <SettingSection icon={<Zap className="h-4 w-4" />} title="Workflow Rules" desc="Control assignment and escalation behavior">
      <SettingToggle label="Allow Technician Reassignment" desc="Enable reassigning tickets to different technicians" settingKey="allow_reassignment" settings={settings} update={update} />
      <SettingToggle label="Emergency Auto-Priority" desc="Automatically escalate emergency keywords to Critical" settingKey="emergency_auto_priority" settings={settings} update={update} />
    </SettingSection>
  </div>
);
