import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DashboardKPICards } from "@/components/dashboard/DashboardKPICards";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { TechnicianMonitorPanel } from "@/components/dashboard/TechnicianMonitorPanel";
import { LiveTicketMonitor } from "@/components/dashboard/LiveTicketMonitor";
import { FinancialOverviewPanel } from "@/components/dashboard/FinancialOverviewPanel";
import { InventoryAlertPanel } from "@/components/dashboard/InventoryAlertPanel";
import { AlertsNotificationsPanel } from "@/components/dashboard/AlertsNotificationsPanel";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { supabase } from "@/integrations/supabase/client";
import { formatINRCompact } from "@/lib/formatINR";

export const AdminDashboard = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);

  const fetchAll = async () => {
    const [tRes, iRes, invRes, pRes] = await Promise.all([
      supabase.from("tickets").select("*").order("created_at", { ascending: false }),
      supabase.from("inventory").select("*").order("name"),
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name"),
    ]);
    setTickets(tRes.data || []);
    setInventory(iRes.data || []);
    setInvoices(invRes.data || []);
    setProfiles(pRes.data || []);
  };

  useEffect(() => {
    fetchAll();
    // Realtime refresh on ticket changes
    const channel = supabase
      .channel("dashboard-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "tickets" }, () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayTickets = tickets.filter(t => t.created_at?.slice(0, 10) === today);
  const activeJobs = tickets.filter(t => ["Assigned", "Scheduled", "On-Site Attempt", "Reinstallation", "Testing"].includes(t.status));
  const pendingTickets = tickets.filter(t => ["New"].includes(t.status));
  const completedTickets = tickets.filter(t => ["Completed", "Closed"].includes(t.status));
  const lowStockItems = inventory.filter(i => i.status !== "OK");

  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const monthlyInvoices = invoices.filter(inv => new Date(inv.created_at) >= monthStart);
  const monthlyRevenue = monthlyInvoices.reduce((s, inv) => s + Number(inv.grand_total || 0), 0);
  const pendingPayments = invoices.filter(inv => inv.payment_status === "Pending").reduce((s, inv) => s + Number(inv.grand_total || 0), 0);

  const formatCurrency = formatINRCompact;

  const kpiData = {
    totalTicketsToday: todayTickets.length,
    activeJobs: activeJobs.length,
    pendingTickets: pendingTickets.length,
    completedTickets: completedTickets.length,
    techniciansOnline: `${profiles.length}`,
    monthlyRevenue: formatCurrency(monthlyRevenue),
    pendingPayments: formatCurrency(pendingPayments),
    lowStockAlerts: lowStockItems.length,
  };

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Command center — live operational overview" />
      <QuickActions />
      <DashboardKPICards data={kpiData} />
      <DashboardCharts tickets={tickets} invoices={invoices} inventory={inventory} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <TechnicianMonitorPanel tickets={tickets} profiles={profiles} />
        <LiveTicketMonitor tickets={tickets} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <FinancialOverviewPanel invoices={invoices} />
        <InventoryAlertPanel items={inventory} />
        <AlertsNotificationsPanel />
      </div>
    </div>
  );
};
