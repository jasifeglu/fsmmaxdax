import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  new: "badge-info",
  assigned: "badge-primary",
  scheduled: "badge-primary",
  "on-site": "badge-warning",
  "on-site-attempt": "badge-warning",
  "work-in-progress": "badge-warning",
  "pickup-required": "badge-warning",
  "sent-to-vendor": "badge-info",
  "vendor-repairing": "badge-info",
  "awaiting-return": "badge-info",
  "returned-from-vendor": "badge-primary",
  reinstallation: "badge-warning",
  testing: "badge-warning",
  completed: "badge-success",
  closed: "badge-success",
  pending: "badge-warning",
  paid: "badge-success",
  overdue: "badge-destructive",
  available: "badge-success",
  offline: "badge-destructive",
  "on-job": "badge-warning",
  high: "badge-destructive",
  medium: "badge-warning",
  low: "badge-info",
  critical: "badge-destructive",
  // Delay tags
  "vendor-delay": "badge-destructive",
  "customer-delay": "badge-warning",
  "technician-delay": "badge-warning",
  "spare-parts-delay": "badge-destructive",
  delayed: "badge-destructive",
  "on-hold": "badge-warning",
  escalated: "badge-destructive",
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const key = status.toLowerCase().replace(/\s+/g, "-");
  const style = statusStyles[key] || "badge-info";

  return (
    <span className={cn(style, className)}>
      {status}
    </span>
  );
};
