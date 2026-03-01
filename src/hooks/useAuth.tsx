import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserRole, type AppRole } from "@/lib/auth";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  role: AppRole | null;
  loading: boolean;
  profile: { full_name: string; email: string; phone: string | null; address: string | null } | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, role: null, loading: true, profile: null });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const applySession = async (session: Session | null) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        try {
          const r = await getUserRole(u.id);
          setRole(r);
          const { data: p } = await supabase.from("profiles").select("full_name, email, phone, address").eq("id", u.id).single();
          setProfile(p);
        } catch {
          setRole(null);
          setProfile(null);
        }
      } else {
        setRole(null);
        setProfile(null);
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    supabase.auth.getSession()
      .then(({ data: { session } }) => applySession(session))
      .catch(() => setLoading(false));

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, profile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
