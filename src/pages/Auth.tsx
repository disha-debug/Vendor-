import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signIn, signUp, type AppRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Wrench, User, ShieldCheck } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupRole, setSignupRole] = useState<AppRole>("customer");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Connection timed out. Check your network and Supabase URL.")), 15000)
      );
      const { error } = await Promise.race([signIn(loginEmail, loginPassword), timeout]);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Logged in!");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Connection timed out. Check your network and Supabase URL.")), 15000)
      );
      const { error } = await Promise.race([signUp(signupEmail, signupPassword, signupName, signupRole), timeout]);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created! Please check your email to verify.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const roleOptions: { value: AppRole; label: string; icon: React.ReactNode; desc: string }[] = [
    { value: "customer", label: "Customer", icon: <User className="h-5 w-5" />, desc: "Book services" },
    { value: "vendor", label: "Service Provider", icon: <Wrench className="h-5 w-5" />, desc: "Offer services" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-[400px] animate-in-fade">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <ShieldCheck className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-heading font-bold tracking-tight">Vendor Service Provider</span>
          </Link>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Connect with trusted local service providers
          </p>
        </div>

        <Card className="border border-border/80 shadow-card-hover rounded-2xl overflow-hidden">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="pb-4 pt-6 px-6">
              <TabsList className="grid w-full grid-cols-2 h-11 bg-muted/80 p-1 rounded-lg">
                <TabsTrigger value="login" className="rounded-md text-sm font-medium">Sign in</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-md text-sm font-medium">Sign up</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0">
              <TabsContent value="login" className="mt-0 space-y-5">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      required
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      required
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-11"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 font-medium" disabled={loading}>
                    {loading ? "Signing in…" : "Sign in"}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup" className="mt-0 space-y-5">
                <form onSubmit={handleSignup} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-medium">Full name</Label>
                    <Input
                      id="signup-name"
                      required
                      value={signupName}
                      onChange={e => setSignupName(e.target.value)}
                      placeholder="John Doe"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      required
                      value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupPassword}
                      onChange={e => setSignupPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">I am a…</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {roleOptions.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSignupRole(opt.value)}
                          className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all duration-200 ${
                            signupRole === opt.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/40 hover:bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          {opt.icon}
                          <span className="text-sm font-medium">{opt.label}</span>
                          <span className="text-xs opacity-80">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-11 font-medium" disabled={loading}>
                    {loading ? "Creating account…" : "Create account"}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
