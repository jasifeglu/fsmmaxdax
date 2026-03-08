import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "coordinator" | "technician";

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

const roleNames: Record<UserRole, string> = {
  admin: "Admin User",
  coordinator: "Service Coordinator",
  technician: "Field Technician",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>("admin");

  return (
    <AuthContext.Provider value={{ role, setRole, userName: roleNames[role] }}>
      {children}
    </AuthContext.Provider>
  );
};
