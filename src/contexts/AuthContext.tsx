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
    try {
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
        try {
          const signedUrl = await getSignedAvatarUrl(profileRes.data.avatar_url);
          setAvatarUrl(signedUrl);
        } catch {
          setAvatarUrl(null);
        }
      }
    } catch (err) {
      console.error("fetchUserData error:", err);
    }
  }, []);

  const refreshProfile = useCallback(() => {
    if (user) {
      fetchUserData(user.id);
    }
  }, [user, fetchUserData]);

  useEffect(() => {
    let mounted = true;
    const MAX_AUTH_LOADING_MS = 5000;
    const MAX_PROFILE_FETCH_MS = 2500;

    const loadingFailsafe = window.setTimeout(() => {
      if (mounted) setLoading(false);
    }, MAX_AUTH_LOADING_MS);

    const waitForUserData = async (userId: string) => {
      await Promise.race([
        fetchUserData(userId),
        new Promise<void>((resolve) => window.setTimeout(resolve, MAX_PROFILE_FETCH_MS)),
      ]).catch(() => undefined);
    };

    // 1. Set up auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

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
          await waitForUserData(session.user.id);
        } else {
          setRole("technician");
          setUserName("");
          setAvatarUrl(null);
        }

        if (mounted) setLoading(false);
      }
    );

    // 2. Then get existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await waitForUserData(session.user.id);
      }

      if (mounted) setLoading(false);
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      window.clearTimeout(loadingFailsafe);
      subscription.unsubscribe();
    };
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
