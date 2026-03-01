import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconClassName?: string;
  sub?: string;
  className?: string;
}

/** Animated stat card with icon; use for dashboard summaries. */
export function StatCard({ label, value, icon: Icon, iconClassName, sub, className }: StatCardProps) {
  return (
    <Card
      className={cn(
        "group border-border/80 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5",
        className
      )}
    >
      <CardContent className="p-5 md:p-6">
        <div
          className={cn(
            "h-12 w-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-105",
            iconClassName ?? "bg-primary/10 text-primary"
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <p className="text-2xl font-heading font-bold tracking-tight">{value}</p>
        <p className="text-sm font-medium text-muted-foreground mt-0.5">{label}</p>
        {sub != null && sub !== "" && (
          <p className="text-xs text-muted-foreground mt-1">{sub}</p>
        )}
      </CardContent>
    </Card>
  );
}
