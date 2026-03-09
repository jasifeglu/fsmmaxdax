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
    <StatCard title="Tickets Today" value={data.totalTicketsToday} icon={Ticket} iconColor="text-primary" />
    <StatCard title="Active Jobs" value={data.activeJobs} icon={Clock} iconColor="text-warning" />
    <StatCard title="Pending Tickets" value={data.pendingTickets} icon={AlertTriangle} iconColor="text-destructive" />
    <StatCard title="Completed" value={data.completedTickets} icon={CheckCircle2} iconColor="text-success" />
    <StatCard title="Techs Online" value={data.techniciansOnline} icon={Wrench} iconColor="text-success" />
    <StatCard title="Revenue (MTD)" value={data.monthlyRevenue} icon={DollarSign} iconColor="text-primary" />
    <StatCard title="Pending Payments" value={data.pendingPayments} icon={CreditCard} iconColor="text-warning" />
    <StatCard title="Low Stock Alerts" value={data.lowStockAlerts} icon={Package} iconColor="text-destructive" />
  </div>
);
