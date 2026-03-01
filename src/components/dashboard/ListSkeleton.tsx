import { cn } from "@/lib/utils";

interface ListSkeletonProps {
  rows?: number;
  height?: string;
  className?: string;
}

/** Skeleton placeholder for list/card layouts. */
export function ListSkeleton({ rows = 4, height = "h-24", className }: ListSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={cn("rounded-xl overflow-hidden animate-shimmer", height)}
        />
      ))}
    </div>
  );
}
