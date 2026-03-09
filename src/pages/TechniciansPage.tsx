import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Wrench, Star, Clock, CheckCircle2, MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useDemoMode } from "@/hooks/useDemoMode";

const mockTechnicians = [
  { id: "m1", name: "Amit Patel", phone: "+91 98765 00001", specialization: "AC & Refrigeration", status: "On-Job", rating: 4.8, jobsCompleted: 342, activeJobs: 3, location: "Sector 42, Gurugram" },
  { id: "m2", name: "Suresh Kumar", phone: "+91 98765 00002", specialization: "Washing Machine", status: "Available", rating: 4.5, jobsCompleted: 289, activeJobs: 1, location: "Office" },
  { id: "m3", name: "Vikram Singh", phone: "+91 98765 00003", specialization: "Installation", status: "On-Job", rating: 4.7, jobsCompleted: 198, activeJobs: 2, location: "Dwarka, Delhi" },
  { id: "m4", name: "Ravi Mishra", phone: "+91 98765 00004", specialization: "Plumbing & Electric", status: "Available", rating: 4.3, jobsCompleted: 156, activeJobs: 2, location: "Office" },
  { id: "m5", name: "Deepak Rao", phone: "+91 98765 00005", specialization: "Microwave & Chimney", status: "Offline", rating: 4.1, jobsCompleted: 87, activeJobs: 0, location: "—" },
  { id: "m6", name: "Karan Mehra", phone: "+91 98765 00006", specialization: "AC Installation", status: "Available", rating: 4.6, jobsCompleted: 215, activeJobs: 1, location: "Office" },
];

const TechniciansPage = () => {
  const isDemoMode = useDemoMode();
  const [realTechnicians, setRealTechnicians] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, email");
      const { data: skills } = await supabase.from("technician_skills").select("*");
      const { data: tickets } = await supabase.from("tickets").select("assigned_to, status");

      const techProfiles = (profiles || []).map(p => {
        const skill = (skills || []).find(s => s.user_id === p.id);
        const assigned = (tickets || []).filter(t => t.assigned_to === p.id);
        const active = assigned.filter(t => ["Assigned", "Scheduled", "On-Site Attempt", "Work-In-Progress"].includes(t.status));
        const completed = assigned.filter(t => ["Completed", "Closed"].includes(t.status));
        const status = active.length > 0 ? "On-Job" : "Available";
        return {
          id: p.id,
          name: p.full_name || p.email,
          specialization: skill?.skill_category || "General",
          status,
          jobsCompleted: completed.length,
          activeJobs: active.length,
          location: skill?.home_address || "—",
          rating: 0,
          phone: "",
        };
      });
      setRealTechnicians(techProfiles);
    };
    fetch();
  }, []);

  const technicians = isDemoMode ? mockTechnicians : realTechnicians;

  const onlineCount = technicians.filter(t => t.status !== "Offline").length;
  const avgRating = technicians.length > 0
    ? (technicians.reduce((s, t) => s + (t.rating || 0), 0) / technicians.length).toFixed(1)
    : "0";

  return (
    <div>
      <PageHeader title="Technicians" description="Manage field technicians and performance" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Technicians" value={technicians.length} icon={Users} iconColor="text-primary" />
        <StatCard title="Online Now" value={onlineCount} change={`${technicians.length > 0 ? Math.round(onlineCount / technicians.length * 100) : 0}% availability`} changeType="positive" icon={CheckCircle2} iconColor="text-success" />
        <StatCard title="Avg. Rating" value={`${avgRating}★`} icon={Star} iconColor="text-warning" />
        <StatCard title="Active Jobs" value={technicians.reduce((s, t) => s + t.activeJobs, 0)} icon={Clock} iconColor="text-info" />
      </div>

      {technicians.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Wrench className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No technicians found</p>
          <p className="text-xs mt-1">Add team members or enable Demo Mode in Settings to see sample data</p>
        </div>
      ) : (
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
                      <p className="font-semibold text-sm">{t.rating > 0 ? `${t.rating}★` : "—"}</p>
                      <p className="text-muted-foreground">Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TechniciansPage;
