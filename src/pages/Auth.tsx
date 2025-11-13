import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Recycle, Mail, Lock, User, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AIChatButton } from "@/components/AIChatButton";

const Auth = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('admin-login', {
        body: { username, password }
      });

      if (error) throw error;

      if (data?.success && data?.isAdmin) {
        localStorage.setItem('ecomart_admin_session', 'true');
        toast.success("Admin login successful!");
        navigate("/admin");
      } else {
        toast.error("Invalid admin credentials");
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error("Failed to login as admin");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome to Ecomart! Check your email to verify.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        navigate("/");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Nature Background */}
      <div className="nature-bg">
        <div className="nature-gradient" />
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
            }}
          />
        ))}
      </div>
      
      {/* Theme Toggle and AI Chat Button */}
      <div className="fixed top-6 right-6 z-[100] flex items-center gap-3">
        <ThemeToggle />
        <AIChatButton />
      </div>
      
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-0 overflow-hidden relative z-10">
        {/* Left side - Branding */}
        <div className="glass-panel rounded-l-3xl md:rounded-r-none rounded-3xl md:rounded-l-3xl p-12 flex flex-col justify-center items-center bio-glow">
          <div className="mb-8">
            <Recycle className="w-24 h-24 text-primary animate-pulse" />
          </div>
          <h2 className="text-4xl font-bold mb-4 text-center bg-gradient-primary bg-clip-text text-transparent">Terra Vitta</h2>
          <p className="text-center text-xl opacity-90 font-light leading-relaxed">
            Building a Circular Future Together
          </p>
        </div>

        {/* Right side - Auth form */}
        <div className="glass-panel rounded-r-3xl md:rounded-l-none rounded-3xl md:rounded-r-3xl p-12 flex flex-col justify-center refract-hover">
          <div className="text-center mb-10 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              {isAdminLogin ? "Admin Access" : isSignUp ? "Join the Movement" : "Welcome Back"}
            </h2>
            <p className="text-muted-foreground text-lg font-light">
              {isAdminLogin 
                ? "Secure dashboard access" 
                : isSignUp 
                  ? "Start your sustainable journey today" 
                  : "Sign in to continue your eco-journey"}
            </p>
          </div>

          {isAdminLogin ? (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="glass-panel border-0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <Input
                  id="adminPassword"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-panel border-0"
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full btn-glow" size="lg">
                {loading ? "Loading..." : "Admin Sign In"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          ) : (
            <>
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Your name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="glass-panel border-0"
                      required={isSignUp}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-panel border-0 h-12 text-base transition-spring focus:scale-[1.01] focus:shadow-lg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-base font-semibold flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-panel border-0 h-12 text-base transition-spring focus:scale-[1.01] focus:shadow-lg"
                    required
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full btn-glow h-12 text-base font-semibold transition-spring hover:scale-[1.02]" size="lg">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                      Processing...
                    </span>
                  ) : isSignUp ? (
                    "Create Account"
                  ) : (
                    "Sign In"
                  )}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isAdminLogin ? (
              <button
                onClick={() => setIsAdminLogin(false)}
                className="text-accent font-medium hover:underline"
                type="button"
              >
                Back to user login
              </button>
            ) : (
              <>
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-accent font-medium hover:underline"
                  type="button"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
                {" | "}
                <button
                  onClick={() => setIsAdminLogin(true)}
                  className="text-accent font-medium hover:underline"
                  type="button"
                >
                  Admin
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
