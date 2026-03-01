import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShieldCheck, Home, Calendar, LogOut, Wrench, Users, CreditCard, Star, Package } from "lucide-react";

const customerLinks = [
  { to: "/dashboard", label: "Browse Services", icon: Home },
  { to: "/dashboard/bookings", label: "My Bookings", icon: Calendar },
  { to: "/dashboard/payments", label: "Payments", icon: CreditCard },
];

const vendorLinks = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/dashboard/services", label: "My Services", icon: Package },
  { to: "/dashboard/bookings", label: "Booking Requests", icon: Calendar },
  { to: "/dashboard/earnings", label: "Earnings", icon: CreditCard },
];

const adminLinks = [
  { to: "/dashboard", label: "Overview", icon: Home },
  { to: "/dashboard/users", label: "Users", icon: Users },
  { to: "/dashboard/services", label: "Services", icon: Wrench },
  { to: "/dashboard/bookings", label: "All Bookings", icon: Calendar },
  { to: "/dashboard/payments", label: "All Payments", icon: CreditCard },
  { to: "/dashboard/reviews", label: "Reviews", icon: Star },
];

export interface AppSidebarProps {
  role: "admin" | "vendor" | "customer" | null;
  profile: { full_name?: string | null } | null;
  onSignOut: () => void;
}

export function AppSidebar({ role, profile, onSignOut }: AppSidebarProps) {
  const location = useLocation();
  const links = role === "admin" ? adminLinks : role === "vendor" ? vendorLinks : customerLinks;

  return (
    <aside className="w-[260px] shrink-0 hidden md:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="p-5 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <ShieldCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-lg tracking-tight">Vendor Service Provider</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <p className="px-3 mb-2 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">Menu</p>
        <ul className="space-y-0.5">
          {links.map(link => {
            const Icon = link.icon;
            const active = location.pathname === link.to;
            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    active
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-90" />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3 px-2 py-1.5 rounded-lg bg-sidebar-accent/50">
          <Avatar className="h-9 w-9 rounded-full shrink-0">
            <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
              {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{profile?.full_name || "User"}</p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">{role}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
          onClick={onSignOut}
        >
          <LogOut className="h-4 w-4 mr-2 shrink-0" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
