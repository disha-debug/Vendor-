import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getAdminStats } from "@/services";
import { StatCard, ListSkeleton, EmptyState } from "@/components/dashboard";
import { Users, Package, Calendar, CreditCard, Star, TrendingUp, BarChart3 } from "lucide-react";

const STAT_CARDS = [
  { key: "users", label: "Total Users", icon: Users, color: "bg-primary/10 text-primary" },
  { key: "services", label: "Services Listed", icon: Package, color: "bg-accent/10 text-accent" },
  { key: "bookings", label: "Total Bookings", icon: Calendar, color: "bg-info/10 text-info", subKey: "pendingBookings" },
  { key: "revenue", label: "Revenue", icon: TrendingUp, color: "bg-success/10 text-success", format: "currency" },
  { key: "payments", label: "Payments", icon: CreditCard, color: "bg-warning/10 text-warning" },
  { key: "reviews", label: "Reviews", icon: Star, color: "bg-destructive/10 text-destructive" },
] as const;

/** Demo stat values shown only when real data is empty (all zeros). Disappear when real data loads. */
const DEMO_STATS = [
  { label: "Total Users", value: "12", icon: Users, color: "bg-primary/10 text-primary" },
  { label: "Active Bookings", value: "5", icon: Calendar, color: "bg-info/10 text-info", sub: "2 pending" },
  { label: "Revenue", value: "₹24,500", icon: TrendingUp, color: "bg-success/10 text-success" },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ["admin-stats", user?.id],
    queryFn: async () => {
      const result = await getAdminStats();
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!user?.id,
  });

  const hasRealData = stats && (stats.users > 0 || stats.services > 0 || stats.bookings > 0 || stats.totalRevenue > 0 || stats.reviews > 0);
  const showDemoSection = !isLoading && !isError && stats && !hasRealData;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">Admin dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your platform</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-36 rounded-xl bg-muted/60 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">Admin dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your platform</p>
        </div>
        <EmptyState
          icon={BarChart3}
          title="Could not load stats"
          description={error instanceof Error ? error.message : "Something went wrong. Try again."}
        />
      </div>
    );
  }

  const s = stats!;
  const valueFor = (key: (typeof STAT_CARDS)[number]["key"]) => {
    if (key === "revenue") return `₹${(s.totalRevenue || 0).toLocaleString()}`;
    if (key === "users") return s.users ?? 0;
    if (key === "services") return s.services ?? 0;
    if (key === "bookings") return s.bookings ?? 0;
    if (key === "payments") return s.bookings ?? 0;
    if (key === "reviews") return s.reviews ?? 0;
    return 0;
  };
  const subFor = (key: string) => (key === "pendingBookings" ? `${s.pendingBookings ?? 0} pending` : undefined);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">Admin dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {STAT_CARDS.map(({ key, label, icon: Icon, color, subKey }) => (
          <StatCard
            key={key}
            label={label}
            value={valueFor(key)}
            icon={Icon}
            iconClassName={color}
            sub={subKey ? subFor(subKey) : undefined}
          />
        ))}
      </div>

      {/* Demo section: only when real data is empty. Disappears when real data loads. */}
      {showDemoSection && (
        <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-4 md:p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium">Example</span>
            Preview when you have data
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DEMO_STATS.map(({ label, value, icon: Icon, color, sub }) => (
              <StatCard key={label} label={label} value={value} icon={Icon} iconClassName={color} sub={sub} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
