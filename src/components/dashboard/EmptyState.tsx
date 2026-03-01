import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  iconClassName?: string;
}

/** Empty state with icon, title and optional description. */
export function EmptyState({ icon: Icon, title, description, className, iconClassName }: EmptyStateProps) {
  return (
    <Card className={cn("border border-dashed border-border/80 shadow-card", className)}>
      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className={cn("mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50", iconClassName)}>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-base font-semibold text-foreground">{title}</p>
        {description && <p className="text-sm text-muted-foreground mt-2 max-w-sm">{description}</p>}
      </CardContent>
    </Card>
  );
}
