import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useUserRole } from "@/hooks/useUserRole";
import FluidRibbons from "@/components/FluidRibbons";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const { role, loading: roleLoading } = useUserRole(user);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setSessionLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!sessionLoading && !roleLoading) {
      if (!user) {
        navigate("/landing");
      } else if (role) {
        // Route based on role
        if (role === "admin") navigate("/admin");
        else if (role === "seller") navigate("/seller");
        else navigate("/buyer");
      }
    }
  }, [user, role, sessionLoading, roleLoading, navigate]);

  if (sessionLoading || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center relative">
        <FluidRibbons />
        <div className="text-center relative z-10">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Ecomart...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default Index;
