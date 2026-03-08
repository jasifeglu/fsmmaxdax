import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type UserRole = "admin" | "coordinator" | "technician";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  userName: string;
  avatarUrl: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

const getSignedAvatarUrl = async (path: string | null): Promise<string | null> => {
  if (!path) return null;
  // If it's already a full URL (legacy), return as-is
  if (path.startsWith("http")) return path;
  const { data } = await supabase.storage.from("uploads").createSignedUrl(path, 3600);
  return data?.signedUrl || null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>("technician");
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (userId: string) => {
    // Fetch role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (roleData) {
      setRole(roleData.role as UserRole);
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, avatar_url")
      .eq("id", userId)
      .single();

    if (profile) {
      setUserName(profile.full_name || profile.email || "User");
      const signedUrl = await getSignedAvatarUrl(profile.avatar_url);
      setAvatarUrl(signedUrl);
    }
  }, []);

  const refreshProfile = useCallback(() => {
    if (user) {
      fetchUserData(user.id);
    }
  }, [user, fetchUserData]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Log login
          if (_event === "SIGNED_IN") {
            await supabase.from("audit_logs").insert({
              user_id: session.user.id,
              user_name: session.user.user_metadata?.full_name || session.user.email || "",
              user_role: "",
              action: "login",
              module: "Auth",
              description: "User signed in",
              device_info: navigator.userAgent.slice(0, 120),
            }).then(() => {});
          }
          setTimeout(() => fetchUserData(session.user.id), 0);
        } else {
          setRole("technician");
          setUserName("");
          setAvatarUrl(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, role, userName, avatarUrl, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
