import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getAdminBookings } from "@/services";
import { getErrorMessage } from "@/services";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard, ListSkeleton, EmptyState, FilterBar } from "@/components/dashboard";
import { Calendar, Clock, CalendarCheck } from "lucide-react";

const statusVariant = (s: string): "pending" | "accepted" | "completed" | "cancelled" | "rejected" | "secondary" =>
  (s === "pending" || s === "accepted" || s === "completed" || s === "cancelled" || s === "rejected" ? s : "secondary");

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "rejected", label: "Rejected" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

export default function AdminBookings() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  const { data: bookings, isLoading, isError, error } = useQuery({
    queryKey: ["admin-bookings", user?.id],
    queryFn: async () => {
      const result = await getAdminBookings();
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!user?.id,
  });

  const filtered = useMemo(() => {
    if (!bookings) return [];
    let list = [...bookings];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        b =>
          (b as any).services?.name?.toLowerCase().includes(q) ||
          (b as any).customer?.full_name?.toLowerCase().includes(q) ||
          (b as any).vendor?.full_name?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") list = list.filter(b => b.status === statusFilter);
    if (sort === "oldest") list.reverse();
    return list;
  }, [bookings, search, statusFilter, sort]);

  const showDemoCards = !isLoading && !isError && bookings?.length === 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">All bookings</h1>
          <p className="text-muted-foreground mt-1">Manage and view every booking</p>
        </div>
        <ListSkeleton rows={5} height="h-24" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">All bookings</h1>
          <p className="text-muted-foreground mt-1">Manage and view every booking</p>
        </div>
        <EmptyState icon={Calendar} title="Could not load bookings" description={getErrorMessage(error)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">All bookings</h1>
        <p className="text-muted-foreground mt-1">Manage and view every booking</p>
      </div>

      <FilterBar
        searchPlaceholder="Search by service, customer, vendor…"
        searchValue={search}
        onSearchChange={setSearch}
        statusOptions={STATUS_OPTIONS}
        statusValue={statusFilter}
        onStatusChange={setStatusFilter}
        sortOptions={SORT_OPTIONS}
        sortValue={sort}
        onSortChange={setSort}
      />

      {filtered.length === 0 && !showDemoCards && (
        <EmptyState
          icon={CalendarCheck}
          title="No bookings match your filters"
          description="Try changing search or status filter"
        />
      )}

      {filtered.length === 0 && showDemoCards && (
        <>
          <EmptyState
            icon={Calendar}
            title="No bookings yet"
            description="Bookings will appear here when customers make requests"
          />
          {/* Demo cards: only when real data is empty. Disappear when real data loads. */}
          <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-4 md:p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium">Example</span>
              What a booking card looks like
            </p>
            <div className="space-y-3">
              <Card className="border-border/80 opacity-80">
                <CardContent className="p-4 md:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">Plumbing Repair</h3>
                        <Badge className="bg-info/10 text-info" variant="secondary">accepted</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>Customer: Jane Doe</span>
                        <span>Vendor: John Smith</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />2025-03-01</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />10:00</span>
                      </div>
                    </div>
                    <span className="font-bold text-lg shrink-0">₹500</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map(b => (
            <Card key={b.id} className="border-border/80 shadow-card hover:shadow-card-hover transition-all duration-200 rounded-xl">
              <CardContent className="p-5 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{(b as any).services?.name}</h3>
                      <Badge variant={statusVariant(b.status)}>{b.status}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span>Customer: {(b as any).customer?.full_name}</span>
                      <span>Vendor: {(b as any).vendor?.full_name}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{b.booking_date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{b.booking_time}</span>
                    </div>
                  </div>
                  <span className="font-bold text-lg shrink-0">₹{(b as any).services?.price}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
