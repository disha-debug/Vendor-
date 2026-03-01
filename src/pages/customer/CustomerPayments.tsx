import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getPaymentsByCustomer, getErrorMessage } from "@/services";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton, EmptyState } from "@/components/dashboard";
import { CreditCard, Calendar } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  success: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
  refunded: "bg-info/10 text-info",
};

export default function CustomerPayments() {
  const { user } = useAuth();

  const { data: payments, isLoading, isError, error } = useQuery({
    queryKey: ["customer-payments", user?.id],
    queryFn: async () => {
      const result = await getPaymentsByCustomer(user!.id);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">My payments</h1>
          <p className="text-muted-foreground mt-1">Payment history for your bookings</p>
        </div>
        <ListSkeleton rows={4} height="h-20" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">My payments</h1>
          <p className="text-muted-foreground mt-1">Payment history for your bookings</p>
        </div>
        <EmptyState icon={CreditCard} title="Could not load payments" description={getErrorMessage(error)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">My payments</h1>
        <p className="text-muted-foreground mt-1">Payment history for your bookings</p>
      </div>

      {payments?.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payments yet" description="Payments will appear here after you book" />
      ) : (
        <div className="space-y-3">
          {payments?.map(p => (
            <Card key={p.id} className="border-border/80 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 md:p-5">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{(p as any).bookings?.services?.name || "Service"}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3" />{new Date(p.created_at).toLocaleDateString()}
                      {p.transaction_id && <span className="ml-2">• {p.transaction_id}</span>}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-bold text-lg">₹{p.amount}</p>
                  <Badge className={statusColors[p.status]} variant="secondary">{p.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
