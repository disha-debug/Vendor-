import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getAdminReviews } from "@/services";
import { getErrorMessage } from "@/services";
import { Card, CardContent } from "@/components/ui/card";
import { ListSkeleton, EmptyState, FilterBar } from "@/components/dashboard";
import { Star } from "lucide-react";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "rating_high", label: "Rating (high)" },
  { value: "rating_low", label: "Rating (low)" },
];

export default function AdminReviews() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const { data: reviews, isLoading, isError, error } = useQuery({
    queryKey: ["admin-reviews", user?.id],
    queryFn: async () => {
      const result = await getAdminReviews();
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!user?.id,
  });

  const filtered = useMemo(() => {
    if (!reviews) return [];
    let list = [...reviews];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        r =>
          (r as any).services?.name?.toLowerCase().includes(q) ||
          (r as any).customer?.full_name?.toLowerCase().includes(q) ||
          (r as any).vendor?.full_name?.toLowerCase().includes(q)
      );
    }
    if (sort === "oldest") list.reverse();
    if (sort === "rating_high") list.sort((a, b) => b.rating - a.rating);
    if (sort === "rating_low") list.sort((a, b) => a.rating - b.rating);
    return list;
  }, [reviews, search, sort]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">All reviews</h1>
          <p className="text-muted-foreground mt-1">Customer feedback across services</p>
        </div>
        <ListSkeleton rows={4} height="h-24" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">All reviews</h1>
          <p className="text-muted-foreground mt-1">Customer feedback across services</p>
        </div>
        <EmptyState icon={Star} title="Could not load reviews" description={getErrorMessage(error)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">All reviews</h1>
        <p className="text-muted-foreground mt-1">Customer feedback across services</p>
      </div>

      <FilterBar
        searchPlaceholder="Search by service, customer, vendor…"
        searchValue={search}
        onSearchChange={setSearch}
        sortOptions={SORT_OPTIONS}
        sortValue={sort}
        onSortChange={setSort}
      />

      {filtered.length === 0 ? (
        <EmptyState icon={Star} title="No reviews found" description={search ? "Try a different search" : "Reviews will appear here"} />
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <Card key={r.id} className="border-border/80 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="p-4 md:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <p className="font-medium">{(r as any).services?.name}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      By {(r as any).customer?.full_name} → {(r as any).vendor?.full_name}
                    </p>
                    {r.comment && <p className="text-sm text-muted-foreground italic mt-2">"{r.comment}"</p>}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star key={n} className={`h-4 w-4 ${n <= r.rating ? "fill-warning text-warning" : "text-muted"}`} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
