import { useAuth } from "@/contexts/AuthContext";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { CoordinatorDashboard } from "@/pages/CoordinatorDashboard";
import { TechnicianDashboard } from "@/pages/TechnicianDashboard";

const Index = () => {
  const { role } = useAuth();

  if (role === "coordinator") return <CoordinatorDashboard />;
  if (role === "technician" || role === "manager" || role === "hr") return <TechnicianDashboard />;
  return <AdminDashboard />;
};

export default Index;
