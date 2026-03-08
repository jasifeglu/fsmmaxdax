import { PageHeader } from "@/components/PageHeader";
import { DashboardKPICards } from "@/components/dashboard/DashboardKPICards";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { TechnicianMonitorPanel } from "@/components/dashboard/TechnicianMonitorPanel";
import { LiveTicketMonitor } from "@/components/dashboard/LiveTicketMonitor";
import { FinancialOverviewPanel } from "@/components/dashboard/FinancialOverviewPanel";
import { InventoryAlertPanel } from "@/components/dashboard/InventoryAlertPanel";
import { AlertsNotificationsPanel } from "@/components/dashboard/AlertsNotificationsPanel";
import { QuickActions } from "@/components/dashboard/QuickActions";

const kpiData = {
  totalTicketsToday: 47,
  activeJobs: 38,
  pendingTickets: 24,
  completedTickets: 85,
  techniciansOnline: "12/18",
  monthlyRevenue: "₹5.8L",
  pendingPayments: "₹1.2L",
  lowStockAlerts: 5,
};

export const AdminDashboard = () => {
  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Command center — full operational overview" />

      {/* Quick Actions */}
      <QuickActions />

      {/* KPI Summary Cards */}
      <DashboardKPICards data={kpiData} />

      {/* Analytics & Graphs */}
      <DashboardCharts />

      {/* Technician Monitor + Live Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <TechnicianMonitorPanel />
        <LiveTicketMonitor />
      </div>

      {/* Financial + Inventory + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <FinancialOverviewPanel />
        <InventoryAlertPanel />
        <AlertsNotificationsPanel />
      </div>
    </div>
  );
};
