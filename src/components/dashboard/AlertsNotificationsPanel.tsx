import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const alerts = [
  { text: "SLA breach: MXD-001020 overdue by 2 hours", type: "destructive", time: "5 min ago" },
  { text: "Service delay: Amit P. running 30 min behind on MXD-001041", type: "warning", time: "12 min ago" },
  { text: "Escalation: MXD-001028 — 3rd complaint from customer", type: "destructive", time: "18 min ago" },
  { text: "Payment overdue: Invoice #INV-845 — ₹8,200 (7 days)", type: "warning", time: "25 min ago" },
  { text: "Technician absent: Prakash D. not checked in today", type: "info", time: "1 hr ago" },
  { text: "Invoice #INV-892 marked as Paid — ₹4,500", type: "success", time: "1.5 hr ago" },
  { text: "Low stock: Compressor Unit (3 remaining)", type: "warning", time: "2 hr ago" },
  { text: "MXD-001040 completed by Suresh K.", type: "success", time: "2.5 hr ago" },
];

const typeColors: Record<string, string> = {
  destructive: "bg-destructive",
  warning: "bg-warning",
  success: "bg-success",
  info: "bg-info",
};

export const AlertsNotificationsPanel = () => (
  <Card className="glass-card">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">🚨 Alerts & Notifications</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
        {alerts.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex gap-3 text-xs"
          >
            <span className={cn("mt-1.5 h-2 w-2 rounded-full shrink-0", typeColors[a.type])} />
            <div className="min-w-0">
              <p className="text-foreground leading-relaxed">{a.text}</p>
              <p className="text-muted-foreground mt-0.5">{a.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </CardContent>
  </Card>
);
