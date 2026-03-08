import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Star, Clock, CheckCircle2, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const technicians = [
  { id: 1, name: "Amit Patel", phone: "+91 98765 00001", specialization: "AC & Refrigeration", status: "On-Job", rating: 4.8, jobsCompleted: 342, activeJobs: 3, location: "Sector 42, Gurugram" },
  { id: 2, name: "Suresh Kumar", phone: "+91 98765 00002", specialization: "Washing Machine", status: "Available", rating: 4.5, jobsCompleted: 289, activeJobs: 1, location: "Office" },
  { id: 3, name: "Vikram Singh", phone: "+91 98765 00003", specialization: "Installation", status: "On-Job", rating: 4.7, jobsCompleted: 198, activeJobs: 2, location: "Dwarka, Delhi" },
  { id: 4, name: "Ravi Mishra", phone: "+91 98765 00004", specialization: "Plumbing & Electric", status: "Available", rating: 4.3, jobsCompleted: 156, activeJobs: 2, location: "Office" },
  { id: 5, name: "Deepak Rao", phone: "+91 98765 00005", specialization: "Microwave & Chimney", status: "Offline", rating: 4.1, jobsCompleted: 87, activeJobs: 0, location: "—" },
  { id: 6, name: "Karan Mehra", phone: "+91 98765 00006", specialization: "AC Installation", status: "Available", rating: 4.6, jobsCompleted: 215, activeJobs: 1, location: "Office" },
];

const TechniciansPage = () => (
  <div>
    <PageHeader title="Technicians" description="Manage field technicians and performance" />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard title="Total Technicians" value={18} icon={Wrench} iconColor="text-primary" />
      <StatCard title="Online Now" value={12} change="67% availability" changeType="positive" icon={CheckCircle2} iconColor="text-success" />
      <StatCard title="Avg. Rating" value="4.5★" icon={Star} iconColor="text-warning" />
      <StatCard title="Avg. Jobs/Day" value="3.2" change="+0.4 vs last week" changeType="positive" icon={Clock} iconColor="text-info" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {technicians.map((t, i) => (
        <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <Card className="glass-card hover:border-primary/20 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-sm">{t.name}</h3>
                  <p className="text-xs text-muted-foreground">{t.specialization}</p>
                </div>
                <StatusBadge status={t.status} />
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                <MapPin className="h-3 w-3" /> {t.location}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-border/50">
                <div>
                  <p className="font-semibold text-sm">{t.jobsCompleted}</p>
                  <p className="text-muted-foreground">Completed</p>
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.activeJobs}</p>
                  <p className="text-muted-foreground">Active</p>
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.rating}★</p>
                  <p className="text-muted-foreground">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  </div>
);

export default TechniciansPage;
