import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Loader2, Building2, Ticket, MapPin, Bell, AlertTriangle, MessageSquare, Package, DollarSign, BarChart3, Lock, Link2, Palette, Database, UserCog } from "lucide-react";
import { useSettings } from "@/components/settings/SettingsShared";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { TicketSettings } from "@/components/settings/TicketSettings";
import { TrackingSettings } from "@/components/settings/TrackingSettings";
import { ReminderSettings } from "@/components/settings/ReminderSettings";
import { EscalationSettings } from "@/components/settings/EscalationSettings";
import { CommunicationSettings } from "@/components/settings/CommunicationSettings";
import { InventorySettings, BillingSettings, KPISettings } from "@/components/settings/OperationalSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { IntegrationSettings, AppearanceSettings, DataSettings } from "@/components/settings/SystemSettings";
import { MockDataSettings } from "@/components/settings/MockDataSettings";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FlaskConical } from "lucide-react";

const tabs = [
  { id: "general", label: "General", icon: Building2 },
  { id: "tickets", label: "Tickets & Workflow", icon: Ticket },
  { id: "tracking", label: "Tracking", icon: MapPin },
  { id: "reminders", label: "Reminders", icon: Bell },
  { id: "escalation", label: "Escalation", icon: AlertTriangle },
  { id: "communication", label: "Communication", icon: MessageSquare },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "billing", label: "Billing", icon: DollarSign },
  { id: "kpi", label: "KPI & Performance", icon: BarChart3 },
  { id: "security", label: "Security", icon: Lock },
  { id: "integrations", label: "Integrations", icon: Link2 },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "data", label: "Data Management", icon: Database },
  { id: "mockdata", label: "Mock Data", icon: FlaskConical },
];

const SettingsPage = () => {
  const { settings, loading, update } = useSettings();
  const [activeTab, setActiveTab] = useState("general");

  if (loading) {
    return (
      <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "general": return <GeneralSettings settings={settings} update={update} />;
      case "tickets": return <TicketSettings settings={settings} update={update} />;
      case "tracking": return <TrackingSettings settings={settings} update={update} />;
      case "reminders": return <ReminderSettings settings={settings} update={update} />;
      case "escalation": return <EscalationSettings settings={settings} update={update} />;
      case "communication": return <CommunicationSettings settings={settings} update={update} />;
      case "inventory": return <InventorySettings settings={settings} update={update} />;
      case "billing": return <BillingSettings settings={settings} update={update} />;
      case "kpi": return <KPISettings settings={settings} update={update} />;
      case "security": return <SecuritySettings settings={settings} update={update} />;
      case "integrations": return <IntegrationSettings settings={settings} update={update} />;
      case "appearance": return <AppearanceSettings settings={settings} update={update} />;
      case "data": return <DataSettings settings={settings} update={update} />;
      case "mockdata": return <MockDataSettings settings={settings} update={update} />;
      default: return null;
    }
  };

  return (
    <div>
      <PageHeader title="Settings & Configuration" description="Full system control — admin only" />

      <div className="flex gap-6 min-h-[70vh]">
        {/* Sidebar Navigation */}
        <div className="w-56 shrink-0 hidden lg:block">
          <ScrollArea className="h-[70vh]">
            <nav className="space-y-1 pr-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors text-left",
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <tab.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              ))}
            </nav>
          </ScrollArea>
        </div>

        {/* Mobile Tab Selector */}
        <div className="lg:hidden w-full">
          <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs whitespace-nowrap transition-colors shrink-0",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                <tab.icon className="h-3 w-3" />
                {tab.label}
              </button>
            ))}
          </div>
          <div>{renderContent()}</div>
        </div>

        {/* Desktop Content */}
        <div className="flex-1 hidden lg:block max-w-3xl">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
