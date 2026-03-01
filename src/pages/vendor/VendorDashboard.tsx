import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getVendorStats } from "@/services";
import { getErrorMessage } from "@/services";
import { StatCard, ListSkeleton, EmptyState } from "@/components/dashboard";
import { Package, Calendar, IndianRupee, Star, BarChart3 } from "lucide-react";

const STAT_CARDS = [
  { key: "services", label: "Active Services", icon: Package, color: "bg-primary/10 text-primary" },
  { key: "totalBookings", label: "Total Bookings", icon: Calendar, color: "bg-info/10 text-info" },
  { key: "completedBookings", label: "Completed", icon: IndianRupee, color: "bg-success/10 text-success" },
  { key: "avgRating", label: "Avg Rating", icon: Star, color: "bg-warning/10 text-warning", subKey: "reviewCount" },
] as const;

/** Demo stats shown only when real data is empty. */
const DEMO_STATS = [
  { label: "Active Services", value: "3", icon: Package, color: "bg-primary/10 text-primary" },
  { label: "Total Bookings", value: "12", icon: Calendar, color: "bg-info/10 text-info" },
  { label: "Avg Rating", value: "4.8", icon: Star, color: "bg-warning/10 text-warning", sub: "5 reviews" },
];

export default function VendorDashboard() {
  const { user, profile } = useAuth();

  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ["vendor-stats", user?.id],
    queryFn: async () => {
      const result = await getVendorStats(user!.id);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!user?.id,
  });

  const hasRealData = stats && (stats.services > 0 || stats.totalBookings > 0 || stats.reviewCount > 0);
  const showDemoSection = !isLoading && !isError && stats && !hasRealData;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">Welcome back, {profile?.full_name || "Vendor"}!</h1>
          <p className="text-muted-foreground mt-1">Here’s your business overview</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-36 rounded-xl animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">Welcome back, {profile?.full_name || "Vendor"}!</h1>
          <p className="text-muted-foreground mt-1">Here’s your business overview</p>
        </div>
        <EmptyState icon={BarChart3} title="Could not load stats" description={getErrorMessage(error)} />
      </div>
    );
  }

  const s = stats!;
  const valueFor = (key: (typeof STAT_CARDS)[number]["key"]) => {
    if (key === "services") return s.services ?? 0;
    if (key === "totalBookings") return s.totalBookings ?? 0;
    if (key === "completedBookings") return s.completedBookings ?? 0;
    if (key === "avgRating") return s.avgRating ?? "N/A";
    return 0;
  };
  const subFor = (key: string) => (key === "reviewCount" ? `${s.reviewCount ?? 0} reviews` : undefined);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">Welcome back, {profile?.full_name || "Vendor"}!</h1>
        <p className="text-muted-foreground mt-1">Here’s your business overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
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

      <div className="rounded-2xl border border-border/80 bg-card shadow-card p-5 md:p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">Revenue overview</h2>
        <div className="h-40 rounded-xl bg-muted/30 flex items-center justify-center text-muted-foreground text-sm">
          Chart placeholder — connect a chart library or use Recharts for real data
        </div>
      </div>

      {showDemoSection && (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-5 md:p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <span className="inline-flex rounded-lg bg-muted px-2 py-0.5 text-[10px] font-medium">Example</span>
            Preview when you have activity
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
