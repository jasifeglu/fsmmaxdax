import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Ticket, UserPlus, Users, Wrench, FileText, Package, DollarSign,
} from "lucide-react";

const actions = [
  { label: "Create Ticket", icon: Ticket, path: "/tickets", color: "bg-primary text-primary-foreground hover:bg-primary/90" },
  { label: "Assign Technician", icon: Wrench, path: "/schedule", color: "bg-warning/15 text-warning hover:bg-warning/25" },
  { label: "Add Customer", icon: UserPlus, path: "/customers", color: "bg-success/15 text-success hover:bg-success/25" },
  { label: "Add Technician", icon: Users, path: "/technicians", color: "bg-info/15 text-info hover:bg-info/25" },
  { label: "Generate Report", icon: FileText, path: "/reports", color: "bg-accent text-accent-foreground hover:bg-accent/80" },
  { label: "View Inventory", icon: Package, path: "/inventory", color: "bg-warning/15 text-warning hover:bg-warning/25" },
  { label: "Financial Dashboard", icon: DollarSign, path: "/billing", color: "bg-success/15 text-success hover:bg-success/25" },
];

export const QuickActions = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {actions.map((a) => (
        <Button
          key={a.label}
          variant="ghost"
          size="sm"
          className={`${a.color} text-xs font-medium gap-1.5 h-8 px-3 rounded-lg`}
          onClick={() => navigate(a.path)}
        >
          <a.icon className="h-3.5 w-3.5" />
          {a.label}
        </Button>
      ))}
    </div>
  );
};
