import { StatCard } from "@/components/StatCard";
import {
  Ticket, Clock, AlertTriangle, CheckCircle2, Wrench,
  DollarSign, CreditCard, Package,
} from "lucide-react";

interface KPIData {
  totalTicketsToday: number;
  activeJobs: number;
  pendingTickets: number;
  completedTickets: number;
  techniciansOnline: string;
  monthlyRevenue: string;
  pendingPayments: string;
  lowStockAlerts: number;
}

export const DashboardKPICards = ({ data }: { data: KPIData }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
    <StatCard title="Tickets Today" value={data.totalTicketsToday} change="+5 new" changeType="positive" icon={Ticket} iconColor="text-primary" />
    <StatCard title="Active Jobs" value={data.activeJobs} change="6 urgent" changeType="negative" icon={Clock} iconColor="text-warning" />
    <StatCard title="Pending Tickets" value={data.pendingTickets} change="Awaiting action" changeType="negative" icon={AlertTriangle} iconColor="text-destructive" />
    <StatCard title="Completed" value={data.completedTickets} change="+12 today" changeType="positive" icon={CheckCircle2} iconColor="text-success" />
    <StatCard title="Techs Online" value={data.techniciansOnline} change="6 offline" changeType="neutral" icon={Wrench} iconColor="text-success" />
    <StatCard title="Revenue (MTD)" value={data.monthlyRevenue} change="+18% vs last month" changeType="positive" icon={DollarSign} iconColor="text-primary" />
    <StatCard title="Pending Payments" value={data.pendingPayments} change="23 invoices" changeType="negative" icon={CreditCard} iconColor="text-warning" />
    <StatCard title="Low Stock Alerts" value={data.lowStockAlerts} change="Items need reorder" changeType="negative" icon={Package} iconColor="text-destructive" />
  </div>
);
