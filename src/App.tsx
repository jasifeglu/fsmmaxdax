import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Loader2 } from "lucide-react";
import type { UserRole } from "@/contexts/AuthContext";

// Lazy-loaded pages
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const InstallPage = lazy(() => import("./pages/InstallPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const TicketsPage = lazy(() => import("./pages/TicketsPage"));
const CustomersPage = lazy(() => import("./pages/CustomersPage"));
const TechniciansPage = lazy(() => import("./pages/TechniciansPage"));
const InventoryPage = lazy(() => import("./pages/InventoryPage"));
const BillingPage = lazy(() => import("./pages/BillingPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const UsersPage = lazy(() => import("./pages/UsersPage"));
const SchedulePage = lazy(() => import("./pages/SchedulePage"));
const ProductCatalogPage = lazy(() => import("./pages/ProductCatalogPage"));
const RouteMapPage = lazy(() => import("./pages/RouteMapPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const PerformancePage = lazy(() => import("./pages/PerformancePage"));
const UserMonitoringPage = lazy(() => import("./pages/UserMonitoringPage"));
const TravelExpensesPage = lazy(() => import("./pages/TravelExpensesPage"));
const IncentivesPage = lazy(() => import("./pages/IncentivesPage"));
const AuditLogsPage = lazy(() => import("./pages/AuditLogsPage"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <AppLayout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tickets" element={<RoleGuard allowed={["admin", "coordinator"]}><TicketsPage /></RoleGuard>} />
          <Route path="/schedule" element={<RoleGuard allowed={["admin", "coordinator"]}><SchedulePage /></RoleGuard>} />
          <Route path="/route-map" element={<RoleGuard allowed={["admin", "coordinator", "technician"]}><RouteMapPage /></RoleGuard>} />
          <Route path="/product-catalog" element={<RoleGuard allowed={["admin"]}><ProductCatalogPage /></RoleGuard>} />
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
          <Route path="/audit-logs" element={<RoleGuard allowed={["admin"]}><AuditLogsPage /></RoleGuard>} />
          <Route path="/settings" element={<RoleGuard allowed={["admin"]}><SettingsPage /></RoleGuard>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
};

const RoleGuard = ({ allowed, children }: { allowed: UserRole[]; children: React.ReactNode }) => {
  const { role } = useAuth();
  if (!allowed.includes(role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const ProtectedRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <AppLayout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tickets" element={<RoleGuard allowed={["admin", "coordinator"]}><TicketsPage /></RoleGuard>} />
          <Route path="/schedule" element={<RoleGuard allowed={["admin", "coordinator"]}><SchedulePage /></RoleGuard>} />
          <Route path="/route-map" element={<RoleGuard allowed={["admin", "coordinator", "technician"]}><RouteMapPage /></RoleGuard>} />
          <Route path="/product-catalog" element={<RoleGuard allowed={["admin"]}><ProductCatalogPage /></RoleGuard>} />
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
          <Route path="/audit-logs" element={<RoleGuard allowed={["admin"]}><AuditLogsPage /></RoleGuard>} />
          <Route path="/settings" element={<RoleGuard allowed={["admin"]}><SettingsPage /></RoleGuard>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
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
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/install" element={<InstallPage />} />
              <Route path="/*" element={<ProtectedRoutes />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
