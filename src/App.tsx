import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import TicketsPage from "./pages/TicketsPage";
import CustomersPage from "./pages/CustomersPage";
import TechniciansPage from "./pages/TechniciansPage";
import InventoryPage from "./pages/InventoryPage";
import BillingPage from "./pages/BillingPage";
import ReportsPage from "./pages/ReportsPage";
import UsersPage from "./pages/UsersPage";
import SchedulePage from "./pages/SchedulePage";
import ProductCatalogPage from "./pages/ProductCatalogPage";
import RouteMapPage from "./pages/RouteMapPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import PerformancePage from "./pages/PerformancePage";
import UserMonitoringPage from "./pages/UserMonitoringPage";
import TravelExpensesPage from "./pages/TravelExpensesPage";
import IncentivesPage from "./pages/IncentivesPage";
import { Loader2 } from "lucide-react";
import type { UserRole } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

const RoleGuard = ({ allowed, children }: { allowed: UserRole[]; children: React.ReactNode }) => {
  const { role } = useAuth();
  if (!allowed.includes(role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const ProtectedRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/tickets" element={<RoleGuard allowed={["admin", "coordinator"]}><TicketsPage /></RoleGuard>} />
        <Route path="/schedule" element={<RoleGuard allowed={["admin", "coordinator"]}><SchedulePage /></RoleGuard>} />
        <Route path="/customers" element={<RoleGuard allowed={["admin", "coordinator"]}><CustomersPage /></RoleGuard>} />
        <Route path="/technicians" element={<RoleGuard allowed={["admin", "coordinator"]}><TechniciansPage /></RoleGuard>} />
        <Route path="/my-jobs" element={<RoleGuard allowed={["technician"]}><Index /></RoleGuard>} />
        <Route path="/inventory" element={<RoleGuard allowed={["admin"]}><InventoryPage /></RoleGuard>} />
        <Route path="/billing" element={<RoleGuard allowed={["admin", "technician"]}><BillingPage /></RoleGuard>} />
        <Route path="/travel-expenses" element={<RoleGuard allowed={["admin", "technician"]}><TravelExpensesPage /></RoleGuard>} />
        <Route path="/reports" element={<RoleGuard allowed={["admin"]}><ReportsPage /></RoleGuard>} />
        <Route path="/incentives" element={<RoleGuard allowed={["admin", "technician"]}><IncentivesPage /></RoleGuard>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/performance" element={<PerformancePage />} />
        <Route path="/user-monitoring" element={<RoleGuard allowed={["admin", "coordinator"]}><UserMonitoringPage /></RoleGuard>} />
        <Route path="/users" element={<RoleGuard allowed={["admin"]}><UsersPage /></RoleGuard>} />
        <Route path="/settings" element={<RoleGuard allowed={["admin"]}><SettingsPage /></RoleGuard>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
