import { ReactNode, useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Search, FlaskConical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { supabase } from "@/integrations/supabase/client";

const roleTitles = {
  admin: "Admin Panel",
  coordinator: "Service Coordinator",
  technician: "Technician App",
};

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { role } = useAuth();
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "mock_data_enabled")
        .single();
      setDemoMode(data?.value === "true");
    };
    check();
    const ch = supabase
      .channel("demo-mode-watch")
      .on("postgres_changes", { event: "*", schema: "public", table: "app_settings" }, () => check())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card/50 backdrop-blur-sm px-4 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
                {roleTitles[role]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="h-8 w-52 pl-8 text-xs bg-muted/50 border-none"
                />
              </div>
              <NotificationsDropdown />
              <ProfileDropdown />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
