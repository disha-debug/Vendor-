import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getAdminServices } from "@/services";
import { getErrorMessage } from "@/services";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton, EmptyState, FilterBar } from "@/components/dashboard";
import { Package } from "lucide-react";

export default function AdminServices() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { data: services, isLoading, isError, error } = useQuery({
    queryKey: ["admin-services", user?.id],
    queryFn: async () => {
      const result = await getAdminServices();
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!user?.id,
  });

  const filtered = useMemo(() => {
    if (!services) return [];
    if (!search.trim()) return services;
    const q = search.toLowerCase();
    return services.filter(
      s =>
        s.name?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        (s as any).vendor?.full_name?.toLowerCase().includes(q)
    );
  }, [services, search]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">All services</h1>
          <p className="text-muted-foreground mt-1">Services listed by providers</p>
        </div>
        <ListSkeleton rows={4} height="h-20" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">All services</h1>
          <p className="text-muted-foreground mt-1">Services listed by providers</p>
        </div>
        <EmptyState icon={Package} title="Could not load services" description={getErrorMessage(error)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">All services</h1>
        <p className="text-muted-foreground mt-1">Services listed by providers</p>
      </div>

      <FilterBar searchPlaceholder="Search by name, category, vendor…" searchValue={search} onSearchChange={setSearch} />

      {filtered.length === 0 ? (
        <EmptyState icon={Package} title="No services found" description={search ? "Try a different search" : "Services will appear here"} />
      ) : (
        <div className="space-y-3">
          {filtered.map(s => (
            <Card key={s.id} className="border-border/80 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 md:p-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{s.name}</h3>
                    <Badge variant="secondary">{s.category}</Badge>
                    {!s.is_available && <Badge variant="outline" className="text-destructive">Unavailable</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">by {(s as any).vendor?.full_name || "Unknown"} • ₹{s.price}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
