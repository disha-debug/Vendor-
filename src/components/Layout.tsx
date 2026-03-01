import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { toast } from "sonner";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppNavbar } from "@/components/layout/AppNavbar";

export default function Layout({ children }: { children: ReactNode }) {
  const { role, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppNavbar profile={profile} role={role} onSignOut={handleSignOut} />

      <div className="flex flex-1 min-h-0">
        <AppSidebar
          role={role === "admin" || role === "vendor" || role === "customer" ? role : null}
          profile={profile}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 min-w-0 overflow-auto">
          <div className="p-6 md:p-8 lg:p-10 max-w-6xl mx-auto animate-in-fade">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
