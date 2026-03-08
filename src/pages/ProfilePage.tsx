import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Calendar, Shield, Building2,
  Clock, CheckCircle2, AlertCircle, Activity, Edit,
} from "lucide-react";

const profileData = {
  admin: {
    name: "Admin User", email: "admin@maxdax.com", phone: "+91 98765 43210",
    address: "HQ Office, Mumbai", branch: "Mumbai Central", joinDate: "Jan 2022",
    status: "Active", avatar: "", initials: "AU",
    totalTasks: 1240, completed: 1180, pending: 42, avgTime: "2.1 hrs", lastActive: "Just now",
  },
  coordinator: {
    name: "Neha Gupta", email: "neha@maxdax.com", phone: "+91 98765 12345",
    address: "Branch Office, Pune", branch: "Pune West", joinDate: "Mar 2023",
    status: "Active", avatar: "", initials: "NG",
    totalTasks: 856, completed: 790, pending: 48, avgTime: "1.8 hrs", lastActive: "5 min ago",
  },
  technician: {
    name: "Amit Patel", email: "amit@maxdax.com", phone: "+91 99876 54321",
    address: "Field Base, Ahmedabad", branch: "Ahmedabad East", joinDate: "Jun 2023",
    status: "Available", avatar: "", initials: "AP",
    totalTasks: 432, completed: 398, pending: 22, avgTime: "1.4 hrs", lastActive: "10 min ago",
  },
};

const activityLog = [
  { time: "10:32 AM", action: "Updated ticket TKT-1042 status", type: "info" },
  { time: "10:15 AM", action: "Logged in to the system", type: "success" },
  { time: "Yesterday", action: "Submitted invoice #INV-892", type: "success" },
  { time: "Yesterday", action: "Changed profile phone number", type: "info" },
  { time: "2 days ago", action: "Completed job TKT-1038", type: "success" },
  { time: "2 days ago", action: "Added service notes to TKT-1037", type: "info" },
];

const roleLabels = { admin: "Administrator", coordinator: "Service Coordinator", technician: "Field Technician" };

const ProfilePage = () => {
  const { role } = useAuth();
  const profile = profileData[role];

  const infoItems = [
    { icon: Mail, label: "Email", value: profile.email },
    { icon: Phone, label: "Phone", value: profile.phone },
    { icon: MapPin, label: "Address", value: profile.address },
    { icon: Building2, label: "Branch", value: profile.branch },
    { icon: Calendar, label: "Joined", value: profile.joinDate },
    { icon: Shield, label: "Role", value: roleLabels[role] },
  ];

  return (
    <div>
      <PageHeader title="My Profile" description="View and manage your personal information">
        <Button size="sm" className="bg-primary text-primary-foreground gap-1.5">
          <Edit className="h-3.5 w-3.5" /> Edit Profile
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Profile Card */}
        <Card className="glass-card">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4 border-4 border-primary/20">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                {profile.initials}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
            <p className="text-sm text-muted-foreground mb-2">{roleLabels[role]}</p>
            <StatusBadge status={profile.status} />

            <div className="w-full mt-6 space-y-3">
              {infoItems.map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-sm">
                  <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="ml-auto font-medium text-foreground text-right truncate max-w-[160px]">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Tasks", value: profile.totalTasks, icon: Activity, color: "text-primary" },
                { label: "Completed", value: profile.completed, icon: CheckCircle2, color: "text-success" },
                { label: "Pending", value: profile.pending, icon: AlertCircle, color: "text-warning" },
                { label: "Avg. Time", value: profile.avgTime, icon: Clock, color: "text-info" },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-muted/50 p-3 text-center"
                >
                  <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Last active: {profile.lastActive}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Log */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activityLog.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex gap-3 text-xs"
                >
                  <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                    log.type === "success" ? "bg-success" : "bg-info"
                  }`} />
                  <div>
                    <p className="text-foreground leading-relaxed">{log.action}</p>
                    <p className="text-muted-foreground mt-0.5">{log.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
