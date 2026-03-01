import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getAdminPayments } from "@/services";
import { getErrorMessage } from "@/services";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton, EmptyState, FilterBar } from "@/components/dashboard";
import { CreditCard, Calendar } from "lucide-react";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "amount_high", label: "Amount (high)" },
  { value: "amount_low", label: "Amount (low)" },
];

export default function AdminPayments() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const { data: payments, isLoading, isError, error } = useQuery({
    queryKey: ["admin-payments", user?.id],
    queryFn: async () => {
      const result = await getAdminPayments();
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!user?.id,
  });

  const filtered = useMemo(() => {
    if (!payments) return [];
    let list = [...payments];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        p =>
          (p as any).bookings?.services?.name?.toLowerCase().includes(q) ||
          (p as any).bookings?.customer?.full_name?.toLowerCase().includes(q)
      );
    }
    if (sort === "oldest") list.reverse();
    if (sort === "amount_high") list.sort((a, b) => Number(b.amount) - Number(a.amount));
    if (sort === "amount_low") list.sort((a, b) => Number(a.amount) - Number(b.amount));
    return list;
  }, [payments, search, sort]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">All payments</h1>
          <p className="text-muted-foreground mt-1">Payment history across the platform</p>
        </div>
        <ListSkeleton rows={4} height="h-20" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">All payments</h1>
          <p className="text-muted-foreground mt-1">Payment history across the platform</p>
        </div>
        <EmptyState icon={CreditCard} title="Could not load payments" description={getErrorMessage(error)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">All payments</h1>
        <p className="text-muted-foreground mt-1">Payment history across the platform</p>
      </div>

      <FilterBar
        searchPlaceholder="Search by service or customer…"
        searchValue={search}
        onSearchChange={setSearch}
        sortOptions={SORT_OPTIONS}
        sortValue={sort}
        onSortChange={setSort}
      />

      {filtered.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payments found" description={search ? "Try a different search" : "Payments will appear here"} />
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <Card key={p.id} className="border-border/80 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 md:p-5">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{(p as any).bookings?.services?.name || "Service"}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3 inline" /> {(p as any).bookings?.customer?.full_name} • {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-bold text-lg">₹{p.amount}</p>
                  <Badge variant="secondary" className={p.status === "success" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}>{p.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
