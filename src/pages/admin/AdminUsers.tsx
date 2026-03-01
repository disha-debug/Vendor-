import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getAdminUsers } from "@/services";
import { getErrorMessage } from "@/services";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton, EmptyState, FilterBar } from "@/components/dashboard";
import { Users } from "lucide-react";

const roleColors: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive",
  vendor: "bg-primary/10 text-primary",
  customer: "bg-success/10 text-success",
};

export default function AdminUsers() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { data: users, isLoading, isError, error } = useQuery({
    queryKey: ["admin-users", user?.id],
    queryFn: async () => {
      const result = await getAdminUsers();
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!user?.id,
  });

  const filtered = useMemo(() => {
    if (!users) return [];
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      u =>
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.roles.some((r: string) => r.toLowerCase().includes(q))
    );
  }, [users, search]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">Manage users</h1>
          <p className="text-muted-foreground mt-1">View and manage all user accounts</p>
        </div>
        <ListSkeleton rows={5} height="h-20" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">Manage users</h1>
          <p className="text-muted-foreground mt-1">View and manage all user accounts</p>
        </div>
        <EmptyState icon={Users} title="Could not load users" description={getErrorMessage(error)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">Manage users</h1>
        <p className="text-muted-foreground mt-1">View and manage all user accounts</p>
      </div>

      <FilterBar
        searchPlaceholder="Search by name, email, role…"
        searchValue={search}
        onSearchChange={setSearch}
      />

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No users found" description={search ? "Try a different search" : "User accounts will appear here"} />
      ) : (
        <div className="space-y-3">
          {filtered.map(u => (
            <Card key={u.id} className="border-border/80 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 md:p-5">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-full gradient-primary flex items-center justify-center text-sm font-semibold text-primary-foreground shrink-0">
                    {u.full_name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-medium">{u.full_name || "No name"}</p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {u.roles.map((r: string) => (
                    <Badge key={r} className={roleColors[r] || ""} variant="secondary">{r}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
