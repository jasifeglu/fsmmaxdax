import { Package, DollarSign, BarChart3 } from "lucide-react";
import { SettingSection, SettingInput, SettingToggle } from "./SettingsShared";

interface Props {
  settings: Record<string, string>;
  update: (k: string, v: string) => void;
}

export const InventorySettings = ({ settings, update }: Props) => (
  <SettingSection icon={<Package className="h-4 w-4" />} title="Inventory Management" desc="Stock alerts and auto-deduction rules">
    <SettingInput label="Low Stock Alert Threshold" desc="Alert when stock falls below this number" settingKey="low_stock_threshold" settings={settings} update={update} type="number" placeholder="5" />
    <SettingToggle label="Auto Stock Deduction" desc="Automatically deduct parts when job is completed" settingKey="auto_stock_deduction" settings={settings} update={update} />
  </SettingSection>
);

export const BillingSettings = ({ settings, update }: Props) => (
  <div className="space-y-6">
    <SettingSection icon={<DollarSign className="h-4 w-4" />} title="Billing & Invoice" desc="Configure charges, invoicing, and payment rules">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingInput label="Default Service Charge (₹)" settingKey="default_service_charge" settings={settings} update={update} type="number" placeholder="500" />
        <SettingInput label="Invoice Prefix" settingKey="invoice_prefix" settings={settings} update={update} placeholder="INV" />
        <SettingInput label="Late Payment Penalty (%)" settingKey="late_payment_penalty" settings={settings} update={update} type="number" placeholder="0" />
        <SettingInput label="Accepted Payment Methods" desc="Comma-separated" settingKey="payment_methods" settings={settings} update={update} placeholder="Cash,UPI,Card" />
      </div>
    </SettingSection>
  </div>
);

export const KPISettings = ({ settings, update }: Props) => (
  <SettingSection icon={<BarChart3 className="h-4 w-4" />} title="KPI & Performance Targets" desc="Set performance benchmarks and SLA targets">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SettingInput label="SLA Target (hours)" desc="Maximum hours to resolve a ticket" settingKey="sla_target_hours" settings={settings} update={update} type="number" placeholder="24" />
      <SettingInput label="Completion Rate Target (%)" settingKey="kpi_completion_rate_target" settings={settings} update={update} type="number" placeholder="90" />
      <SettingInput label="Response Time Target (hours)" settingKey="kpi_response_time_target" settings={settings} update={update} type="number" placeholder="2" />
    </div>
  </SettingSection>
);
