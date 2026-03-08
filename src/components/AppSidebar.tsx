import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Ticket, Users, Wrench, Package, DollarSign,
  BarChart3, Settings, Calendar, ClipboardList,
  Zap, User, TrendingUp, Eye, LogOut, UserCog,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  url: string;
  icon: any;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ["admin", "coordinator", "technician"] },
  { title: "Tickets", url: "/tickets", icon: Ticket, roles: ["admin", "coordinator"] },
  { title: "Schedule", url: "/schedule", icon: Calendar, roles: ["admin", "coordinator"] },
  { title: "Customers", url: "/customers", icon: Users, roles: ["admin", "coordinator"] },
  { title: "Technicians", url: "/technicians", icon: Wrench, roles: ["admin", "coordinator"] },
  { title: "My Jobs", url: "/my-jobs", icon: ClipboardList, roles: ["technician"] },
  { title: "Inventory", url: "/inventory", icon: Package, roles: ["admin"] },
  { title: "Billing", url: "/billing", icon: DollarSign, roles: ["admin", "technician"] },
  { title: "Reports", url: "/reports", icon: BarChart3, roles: ["admin"] },
  { title: "My Profile", url: "/profile", icon: User, roles: ["admin", "coordinator", "technician"] },
  { title: "My Performance", url: "/performance", icon: TrendingUp, roles: ["admin", "coordinator", "technician"] },
  { title: "User Monitoring", url: "/user-monitoring", icon: Eye, roles: ["admin", "coordinator"] },
  { title: "User Management", url: "/users", icon: UserCog, roles: ["admin"] },
  { title: "Settings", url: "/settings", icon: Settings, roles: ["admin"] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { role, userName, signOut } = useAuth();

  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="sidebar-gradient border-b border-sidebar-border px-4 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <span className="text-base font-bold text-sidebar-accent-foreground tracking-tight">
                MAXDAX
              </span>
              <span className="text-xs text-sidebar-muted ml-1.5 font-medium">FSM</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="sidebar-gradient">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-widest">Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => {
                const active = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.url}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-primary font-medium"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="sidebar-gradient border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="space-y-2">
            <div className="text-xs text-sidebar-muted truncate px-1">
              {userName}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 text-xs"
              onClick={signOut}
            >
              <LogOut className="h-3.5 w-3.5 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
