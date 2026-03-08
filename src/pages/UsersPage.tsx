import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { UserCog, Plus, Shield } from "lucide-react";

const users = [
  { id: 1, name: "Admin User", email: "admin@maxdax.com", role: "Admin", status: "Available", lastLogin: "Just now" },
  { id: 2, name: "Neha Gupta", email: "neha@maxdax.com", role: "Coordinator", status: "Available", lastLogin: "2 hrs ago" },
  { id: 3, name: "Rahul Singh", email: "rahul@maxdax.com", role: "Coordinator", status: "Available", lastLogin: "1 day ago" },
  { id: 4, name: "Amit Patel", email: "amit@maxdax.com", role: "Technician", status: "Available", lastLogin: "30 min ago" },
  { id: 5, name: "Suresh Kumar", email: "suresh@maxdax.com", role: "Technician", status: "Available", lastLogin: "1 hr ago" },
  { id: 6, name: "Deepak Rao", email: "deepak@maxdax.com", role: "Technician", status: "Offline", lastLogin: "3 days ago" },
];

const UsersPage = () => (
  <div>
    <PageHeader title="User Management" description="Manage coordinators, technicians, and permissions">
      <Button size="sm" className="bg-primary text-primary-foreground gap-1.5">
        <Plus className="h-3.5 w-3.5" /> Add User
      </Button>
    </PageHeader>

    <Card className="glass-card">
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs border-b">
                <th className="text-left py-2 font-medium">Name</th>
                <th className="text-left py-2 font-medium">Email</th>
                <th className="text-left py-2 font-medium">Role</th>
                <th className="text-left py-2 font-medium">Status</th>
                <th className="text-left py-2 font-medium hidden sm:table-cell">Last Login</th>
                <th className="text-left py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 font-medium">{u.name}</td>
                  <td className="py-2.5 text-muted-foreground">{u.email}</td>
                  <td className="py-2.5">
                    <span className="badge-primary flex items-center gap-1 w-fit">
                      <Shield className="h-3 w-3" /> {u.role}
                    </span>
                  </td>
                  <td className="py-2.5"><StatusBadge status={u.status} /></td>
                  <td className="py-2.5 text-muted-foreground hidden sm:table-cell">{u.lastLogin}</td>
                  <td className="py-2.5">
                    <Button variant="ghost" size="sm" className="text-xs h-7">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default UsersPage;
