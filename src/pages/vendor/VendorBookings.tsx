import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getVendorBookings, updateBookingStatus, createPaymentForCompletedBooking, getErrorMessage } from "@/services";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton, EmptyState } from "@/components/dashboard";
import { toast } from "sonner";
import { Calendar, Clock, Check, X, CheckCircle, CalendarCheck } from "lucide-react";

const statusVariant = (s: string): "pending" | "accepted" | "completed" | "cancelled" | "rejected" | "secondary" =>
  (s === "pending" || s === "accepted" || s === "completed" || s === "cancelled" || s === "rejected" ? s : "secondary");

export default function VendorBookings() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: bookings, isLoading, isError, error } = useQuery({
    queryKey: ["vendor-bookings", user?.id],
    queryFn: async () => {
      const result = await getVendorBookings(user!.id);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!user?.id,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const result = await updateBookingStatus(id, status as "pending" | "accepted" | "completed" | "cancelled" | "rejected");
      if (result.error) throw result.error;
      const updated = result.data;
      if (status === "completed" && updated) {
        const payResult = await createPaymentForCompletedBooking(id);
        if (payResult.error) {
          console.warn("[VendorBookings] Payment creation failed after marking complete:", payResult.error);
          throw payResult.error;
        }
      }
      return { id, status, data: updated };
    },
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["vendor-bookings", user?.id] });
      const prev = qc.getQueryData(["vendor-bookings", user?.id]) as typeof bookings | undefined;
      if (prev?.length) {
        qc.setQueryData(
          ["vendor-bookings", user?.id],
          prev.map(b => (b.id === id ? { ...b, status } : b))
        );
      }
      return { prev };
    },
    onSuccess: (_data, { status }) => {
      if (user?.id) {
        qc.invalidateQueries({ queryKey: ["vendor-bookings", user.id] });
        qc.invalidateQueries({ queryKey: ["vendor-payments", user.id] });
        qc.invalidateQueries({ queryKey: ["vendor-stats", user.id] });
      }
      qc.invalidateQueries({ queryKey: ["customer-bookings"] });
      qc.invalidateQueries({ queryKey: ["customer-payments"] });
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
      toast.success(status === "completed" ? "Booking completed and payment recorded" : "Booking updated");
    },
    onError: (e: unknown, _variables, context) => {
      if (context?.prev) qc.setQueryData(["vendor-bookings", user?.id], context.prev);
      toast.error(getErrorMessage(e));
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">Booking requests</h1>
          <p className="text-muted-foreground mt-1">Accept, reject, or mark as complete</p>
        </div>
        <ListSkeleton rows={4} height="h-28" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">Booking requests</h1>
          <p className="text-muted-foreground mt-1">Accept, reject, or mark as complete</p>
        </div>
        <EmptyState icon={Calendar} title="Could not load bookings" description={getErrorMessage(error)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">Booking requests</h1>
        <p className="text-muted-foreground mt-1">Accept, reject, or mark as complete</p>
      </div>

      {bookings?.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No booking requests yet" description="Requests will appear here when customers book" />
      ) : (
        <div className="space-y-4">
          {bookings?.map(b => (
            <Card key={b.id} className="border-border/80 shadow-card hover:shadow-card-hover transition-all duration-200 rounded-xl">
              <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 md:p-6">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-base">{(b as any).services?.name}</h3>
                    <Badge variant={statusVariant(b.status)}>{b.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Customer: {(b as any).customer?.full_name} {(b as any).customer?.phone && `• ${(b as any).customer.phone}`}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{b.booking_date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{b.booking_time}</span>
                    <span className="font-medium text-foreground">₹{(b as any).services?.price}</span>
                  </div>
                  {b.notes && <p className="text-sm mt-2 text-muted-foreground italic">"{b.notes}"</p>}
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {b.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => updateStatus.mutate({ id: b.id, status: "accepted" })} className="gap-1.5">
                        <Check className="h-3.5 w-3.5" />Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: b.id, status: "rejected" })} className="gap-1.5">
                        <X className="h-3.5 w-3.5" />Reject
                      </Button>
                    </>
                  )}
                  {b.status === "accepted" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: b.id, status: "completed" })} className="gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5" />Mark complete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
