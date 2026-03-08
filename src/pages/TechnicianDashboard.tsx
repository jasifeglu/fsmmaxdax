import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { motion } from "framer-motion";
import { MapPin, Clock, Camera, CheckCircle2, Navigation } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const assignedJobs = [
  {
    id: "TKT-1041", customer: "Priya Sharma", phone: "+91 98765 43210",
    address: "B-42, Sector 18, Noida", issue: "Washing machine not draining",
    type: "Repair", priority: "Medium", status: "On-Site", scheduledTime: "10:30 AM",
    parts: ["Drain pump", "Hose clamp"],
  },
  {
    id: "TKT-1039", customer: "Vikash Singh", phone: "+91 87654 32109",
    address: "D-15, Dwarka Sector 7, Delhi", issue: "AC installation — 1.5 ton split",
    type: "Installation", priority: "Low", status: "Scheduled", scheduledTime: "2:00 PM",
    parts: ["Copper pipe 3m", "Bracket set"],
  },
  {
    id: "TKT-1044", customer: "Sanjay Patel", phone: "+91 76543 21098",
    address: "A-8, Vasant Kunj, Delhi", issue: "Microwave sparking inside",
    type: "Repair", priority: "High", status: "Assigned", scheduledTime: "4:30 PM",
    parts: [],
  },
];

export const TechnicianDashboard = () => {
  const [availability, setAvailability] = useState("available");

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="My Jobs" description="Today's assigned work">
        <Select value={availability} onValueChange={setAvailability}>
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">🟢 Available</SelectItem>
            <SelectItem value="on-job">🟡 On Job</SelectItem>
            <SelectItem value="offline">🔴 Offline</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      <div className="space-y-4">
        {assignedJobs.map((job, i) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="glass-card overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-primary">{job.id}</span>
                    <StatusBadge status={job.status} />
                    <StatusBadge status={job.priority} />
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {job.scheduledTime}
                  </span>
                </div>
                <CardTitle className="text-base mt-1">{job.customer}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{job.issue}</p>
                
                <div className="flex items-start gap-2 mb-3 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{job.address}</span>
                </div>

                {job.parts.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1">Required Parts:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.parts.map((p) => (
                        <span key={p} className="badge-info">{p}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                  <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5">
                    <Navigation className="h-3 w-3" /> Navigate
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5">
                    <CheckCircle2 className="h-3 w-3" /> Check-In
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5">
                    <Camera className="h-3 w-3" /> Photos
                  </Button>
                  <Button size="sm" className="text-xs h-8 ml-auto bg-primary text-primary-foreground">
                    Update Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
