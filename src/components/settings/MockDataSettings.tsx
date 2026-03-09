import { useState } from "react";
import { FlaskConical, AlertTriangle, Users, Ticket, Wrench, Receipt, Package, BarChart3 } from "lucide-react";
import { SettingSection, SettingToggle } from "./SettingsShared";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  settings: Record<string, string>;
  update: (k: string, v: string) => void;
}

const mockModules = [
  { key: "mock_customers", label: "Sample Customers", desc: "Generate demo customer records", icon: Users },
  { key: "mock_tickets", label: "Demo Tickets", desc: "Create sample service tickets with varied statuses", icon: Ticket },
  { key: "mock_technician_activity", label: "Technician Activities", desc: "Simulate technician check-ins and job progress", icon: Wrench },
  { key: "mock_billing", label: "Billing Records", desc: "Generate sample invoices and payment records", icon: Receipt },
  { key: "mock_inventory", label: "Inventory Movements", desc: "Show sample stock issuance and usage data", icon: Package },
  { key: "mock_reports", label: "Report Statistics", desc: "Populate dashboards with demo analytics", icon: BarChart3 },
];

export const MockDataSettings = ({ settings, update }: Props) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValue, setPendingValue] = useState<string | null>(null);

  const isMockEnabled = settings.mock_data_enabled === "true";

  const handleMasterToggle = (newValue: boolean) => {
    if (newValue) {
      setPendingValue("true");
      setConfirmOpen(true);
    } else {
      update("mock_data_enabled", "false");
    }
  };

  const confirmEnable = () => {
    if (pendingValue) {
      update("mock_data_enabled", pendingValue);
    }
    setConfirmOpen(false);
    setPendingValue(null);
  };

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {isMockEnabled && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-400">⚠️ Demo Mode Active</p>
            <p className="text-xs text-yellow-400/80">Mock data is being displayed alongside or instead of real data. Disable before going live.</p>
          </div>
          <Badge variant="outline" className="border-yellow-500/50 text-yellow-500 text-xs shrink-0">
            DEMO
          </Badge>
        </div>
      )}

      {/* Master Toggle */}
      <SettingSection
        icon={<FlaskConical className="h-4 w-4" />}
        title="Mock Data Control"
        desc="Enable or disable demo data for training, testing, and presentations"
      >
        <div className="flex items-center justify-between py-2 border-b border-border/50 mb-2">
          <div className="pr-4">
            <p className="text-sm font-semibold">Master Toggle — Demo Mode</p>
            <p className="text-xs text-muted-foreground">Turn on to display sample data across all modules</p>
          </div>
          <Button
            variant={isMockEnabled ? "destructive" : "default"}
            size="sm"
            onClick={() => handleMasterToggle(!isMockEnabled)}
          >
            {isMockEnabled ? "Disable Demo" : "Enable Demo"}
          </Button>
        </div>

        <div className="rounded-lg bg-muted/30 p-3 mb-2">
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3" />
            Mock data is isolated and will never mix with real operational records.
          </p>
        </div>
      </SettingSection>

      {/* Per-Module Toggles */}
      <SettingSection
        icon={<Package className="h-4 w-4" />}
        title="Module-Level Controls"
        desc="Fine-tune which modules show demo data (requires master toggle ON)"
      >
        {mockModules.map((mod) => (
          <div key={mod.key} className={!isMockEnabled ? "opacity-50 pointer-events-none" : ""}>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 pr-4">
                <mod.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-medium">{mod.label}</p>
                  <p className="text-xs text-muted-foreground">{mod.desc}</p>
                </div>
              </div>
              <SettingToggleInline
                settingKey={mod.key}
                settings={settings}
                update={update}
                disabled={!isMockEnabled}
              />
            </div>
          </div>
        ))}
      </SettingSection>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Enable Demo Mode?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will display sample/mock data throughout the system. Mock data is completely isolated and will
              <strong> not affect real business records</strong>. A visible banner will indicate demo mode is active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEnable}>Yes, Enable Demo Mode</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Inline switch that doesn't render label (parent handles layout)

const SettingToggleInline = ({ settingKey, settings, update, disabled }: {
  settingKey: string;
  settings: Record<string, string>;
  update: (k: string, v: string) => void;
  disabled?: boolean;
}) => (
  <Switch
    checked={settings[settingKey] === "true"}
    onCheckedChange={(c) => update(settingKey, c ? "true" : "false")}
    disabled={disabled}
  />
);
