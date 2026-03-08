import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
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
  const initializedRef = useRef(false);

  const fetchUserData = useCallback(async (userId: string) => {
    // Fetch role and profile in parallel
    const [roleRes, profileRes] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId).single(),
      supabase.from("profiles").select("full_name, email, avatar_url").eq("id", userId).single(),
    ]);

    if (roleRes.data) {
      setRole(roleRes.data.role as UserRole);
    }

    if (profileRes.data) {
      setUserName(profileRes.data.full_name || profileRes.data.email || "User");
      const signedUrl = await getSignedAvatarUrl(profileRes.data.avatar_url);
      setAvatarUrl(signedUrl);
    }
  }, []);

  const refreshProfile = useCallback(() => {
    if (user) {
      fetchUserData(user.id);
    }
  }, [user, fetchUserData]);

  useEffect(() => {
    // Set up listener FIRST (per Supabase best practice)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          if (_event === "SIGNED_IN") {
            supabase.from("audit_logs").insert({
              user_id: session.user.id,
              user_name: session.user.user_metadata?.full_name || session.user.email || "",
              user_role: "",
              action: "login",
              module: "Auth",
              description: "User signed in",
              device_info: navigator.userAgent.slice(0, 120),
            }).then(() => {});
          }
          await fetchUserData(session.user.id);
        } else {
          setRole("technician");
          setUserName("");
          setAvatarUrl(null);
        }
        initializedRef.current = true;
        setLoading(false);
      }
    );

    // Then check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      // Only handle if onAuthStateChange hasn't fired yet
      if (!initializedRef.current) {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserData(session.user.id);
        }
        initializedRef.current = true;
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  const signOut = async () => {
    if (user) {
      await supabase.from("audit_logs").insert({
        user_id: user.id,
        user_name: userName || user.email || "",
        user_role: role,
        action: "logout",
        module: "Auth",
        description: "User signed out",
        device_info: navigator.userAgent.slice(0, 120),
      });
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, role, userName, avatarUrl, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
