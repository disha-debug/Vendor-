import { Link, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { ShieldCheck, LogOut, ChevronDown, Home, Calendar, CreditCard, Package, Users, Wrench, Star, Sun, Moon, Monitor } from "lucide-react";

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

export interface AppNavbarProps {
  profile: { full_name?: string | null } | null;
  role: string | null;
  onSignOut: () => void;
}

export function AppNavbar({ profile, role, onSignOut }: AppNavbarProps) {
  const location = useLocation();
  const { setTheme } = useTheme();
  const links = role === "admin" ? adminLinks : role === "vendor" ? vendorLinks : customerLinks;

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/80 bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Link to="/dashboard" className="flex items-center gap-2 md:gap-3 shrink-0">
        <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shadow-md shadow-primary/20">
          <ShieldCheck className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-heading font-bold text-base md:text-lg tracking-tight hidden sm:inline">Vendor Service Provider</span>
      </Link>
      <div className="flex-1 min-w-0" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full md:h-auto md:w-auto md:px-3 md:py-2 md:gap-2">
            <Avatar className="h-8 w-8 md:h-8 md:w-8 rounded-full border border-border">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:flex flex-col items-start text-left text-sm">
              <span className="font-medium">{profile?.full_name || "User"}</span>
              <span className="text-xs text-muted-foreground capitalize">{role}</span>
            </span>
            <ChevronDown className="h-4 w-4 hidden md:block text-muted-foreground shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 align-end" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {links.map((link) => {
            const Icon = link.icon;
            const active = location.pathname === link.to;
            return (
              <DropdownMenuItem key={link.to} asChild>
                <Link to={link.to} className={`cursor-pointer ${active ? "bg-accent" : ""}`}>
                  <Icon className="mr-2 h-4 w-4" />
                  {link.label}
                </Link>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Theme</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
            <Sun className="mr-2 h-4 w-4" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
            <Monitor className="mr-2 h-4 w-4" />
            System
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSignOut} className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
