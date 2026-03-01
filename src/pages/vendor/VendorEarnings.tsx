import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getVendorPayments, getErrorMessage } from "@/services";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton, EmptyState } from "@/components/dashboard";
import { IndianRupee, TrendingUp, Calendar, Wallet } from "lucide-react";

export default function VendorEarnings() {
  const { user } = useAuth();

  const { data: payments, isLoading, isError, error } = useQuery({
    queryKey: ["vendor-payments", user?.id],
    queryFn: async () => {
      const result = await getVendorPayments(user!.id);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!user?.id,
  });

  const totalEarnings = payments?.filter(p => p.status === "success").reduce((a, b) => a + Number(b.amount), 0) || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">Earnings</h1>
          <p className="text-muted-foreground mt-1">Your payment history and total earnings</p>
        </div>
        <div className="h-28 rounded-xl bg-muted/60 animate-pulse" />
        <ListSkeleton rows={3} height="h-20" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">Earnings</h1>
          <p className="text-muted-foreground mt-1">Your payment history and total earnings</p>
        </div>
        <EmptyState icon={Wallet} title="Could not load payments" description={getErrorMessage(error)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">Earnings</h1>
        <p className="text-muted-foreground mt-1">Your payment history and total earnings</p>
      </div>

      <Card className="border-primary/20 bg-primary/5 shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-success/10 flex items-center justify-center shrink-0">
              <TrendingUp className="h-7 w-7 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total earnings</p>
              <p className="text-3xl font-heading font-bold tracking-tight mt-0.5">₹{totalEarnings.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {payments?.length === 0 ? (
        <EmptyState icon={Wallet} title="No payment records yet" description="Completed bookings will show here" />
      ) : (
        <div className="space-y-3">
          {payments?.map(p => (
            <Card key={p.id} className="border-border/80 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 md:p-5">
                <div>
                  <p className="font-medium">{(p as any).bookings?.services?.name || "Service"}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3 w-3" />{new Date(p.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-left sm:text-right flex items-center gap-3">
                  <p className="font-bold text-lg flex items-center gap-1"><IndianRupee className="h-4 w-4" />{p.amount}</p>
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
