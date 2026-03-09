import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isAdmin: boolean;
  hasPro: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isAdmin: false,
  hasPro: false,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasPro, setHasPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminClaimAttempted, setAdminClaimAttempted] = useState(false);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
    return data;
  };

  const tryClaimAdmin = async (u: User) => {
    // One-time bootstrap: if this account is the configured admin email, claim the admin role.
    if (adminClaimAttempted) return;

    const adminEmail = "admradar@gmail.com";
    const userEmail = (u.email ?? "").toLowerCase();

    if (userEmail !== adminEmail) return;

    setAdminClaimAttempted(true);

    try {
      await supabase.functions.invoke("claim-admin");
    } catch {
      // ignore; role check below will still run
    }
  };

  const checkRoles = async (userId: string) => {
    const { data: adminCheck } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    setIsAdmin(!!adminCheck);

    const { data: proCheck } = await supabase.rpc("has_pro_access", {
      _user_id: userId,
    });
    setHasPro(!!proCheck);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
      await checkRoles(user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
    setHasPro(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to avoid Supabase client deadlock
          setTimeout(async () => {
            await fetchProfile(session.user.id);
            await checkRoles(session.user.id);
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setHasPro(false);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(() => {
          checkRoles(session.user.id).then(() => setLoading(false));
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, user, profile, isAdmin, hasPro, loading, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
