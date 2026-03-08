import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Trophy, Target, Star, Zap, Clock, DollarSign, TrendingUp, Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/formatINR";

// Mock data for current technician
const performanceData = {
  month: "March 2026",
  performanceScore: 87,
  rank: 2,
  totalTechs: 18,
  completedTickets: 28,
  ticketTarget: 30,
  firstFixRate: 82,
  avgRating: 4.6,
  avgCompletionHours: 2.8,
  revenueGenerated: 62000,
  onTimeRate: 94,
  earnings: {
    baseSalary: 25000,
    performanceBonus: 3000,
    revenueCommission: 3100,
    qualityBonus: 2000,
    speedBonus: 1500,
    attendanceBonus: 0,
    totalIncentive: 9600,
    totalEarnings: 34600,
  },
  achievements: [
    { name: "Quality Champion", icon: Star, earned: true },
    { name: "Speed Demon", icon: Zap, earned: true },
    { name: "Ticket Master", icon: Target, earned: false },
    { name: "Perfect Attendance", icon: Clock, earned: false },
  ],
};

const MetricCard = ({ icon: Icon, label, value, target, unit, color }: {
  icon: any; label: string; value: number; target?: number; unit?: string; color: string;
}) => (
  <div className="rounded-lg bg-muted/40 p-3.5 space-y-2">
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className={cn("h-3.5 w-3.5", color)} />
      {label}
    </div>
    <p className="text-xl font-bold tracking-tight">
      {value}{unit}
    </p>
    {target !== undefined && (
      <div className="space-y-1">
        <Progress value={Math.min((value / target) * 100, 100)} className="h-1.5" />
        <p className="text-[10px] text-muted-foreground">Target: {target}{unit}</p>
      </div>
    )}
  </div>
);

export const IncentiveDashboard = () => {
  const d = performanceData;

  return (
    <div className="space-y-4">
      {/* Score & Rank */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card text-center py-6">
            <CardContent className="space-y-2">
              <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">{d.performanceScore}</span>
              </div>
              <p className="text-sm font-medium">Performance Score</p>
              <p className="text-xs text-muted-foreground">{d.month}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="glass-card text-center py-6">
            <CardContent className="space-y-2">
              <div className="mx-auto h-20 w-20 rounded-full bg-warning/10 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-warning" />
              </div>
              <p className="text-2xl font-bold">#{d.rank}</p>
              <p className="text-xs text-muted-foreground">Rank out of {d.totalTechs} technicians</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card text-center py-6">
            <CardContent className="space-y-2">
              <div className="mx-auto h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-success" />
              </div>
              <p className="text-2xl font-bold">{formatINR(d.earnings.totalEarnings)}</p>
              <p className="text-xs text-muted-foreground">Total Earnings (incl. {formatINR(d.earnings.totalIncentive)} incentive)</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <MetricCard icon={Target} label="Tickets Done" value={d.completedTickets} target={d.ticketTarget} color="text-primary" />
            <MetricCard icon={Zap} label="First Fix Rate" value={d.firstFixRate} unit="%" target={85} color="text-warning" />
            <MetricCard icon={Star} label="Avg Rating" value={d.avgRating} target={5} color="text-warning" />
            <MetricCard icon={Clock} label="Avg Time" value={d.avgCompletionHours} unit="h" target={3} color="text-info" />
            <MetricCard icon={DollarSign} label="Revenue" value={d.revenueGenerated} unit="" target={50000} color="text-success" />
            <MetricCard icon={TrendingUp} label="On-Time" value={d.onTimeRate} unit="%" target={95} color="text-primary" />
          </div>
        </CardContent>
      </Card>

      {/* Earnings Breakdown + Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">💰 Earnings Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { label: "Base Salary", value: d.earnings.baseSalary },
                { label: "Performance Bonus", value: d.earnings.performanceBonus, highlight: true },
                { label: "Revenue Commission", value: d.earnings.revenueCommission, highlight: true },
                { label: "Quality Bonus", value: d.earnings.qualityBonus, highlight: true },
                { label: "Speed Bonus", value: d.earnings.speedBonus, highlight: true },
                { label: "Attendance Bonus", value: d.earnings.attendanceBonus, highlight: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm py-1.5 border-b border-border/30">
                  <span className="text-muted-foreground">{item.label}</span>
                   <span className={cn("font-mono font-medium", item.highlight && item.value > 0 && "text-success")}>
                    {formatINR(item.value)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between text-sm py-2 font-bold">
                <span>Total Earnings</span>
                <span className="text-primary font-mono">₹{d.earnings.totalEarnings.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">🏆 Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {d.achievements.map((a) => (
                <div
                  key={a.name}
                  className={cn(
                    "rounded-lg p-4 text-center space-y-2 transition-all",
                    a.earned
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-muted/30 opacity-50"
                  )}
                >
                  <a.icon className={cn("h-8 w-8 mx-auto", a.earned ? "text-primary" : "text-muted-foreground")} />
                  <p className="text-xs font-medium">{a.name}</p>
                  <p className="text-[10px] text-muted-foreground">{a.earned ? "✅ Earned" : "🔒 Locked"}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
