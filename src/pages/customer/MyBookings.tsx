import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  getCustomerBookingsWithDetails,
  getCustomerReviewedBookingIds,
  updateBookingStatus,
  createReview,
  getErrorMessage,
} from "@/services";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListSkeleton, EmptyState, ConfirmDialog } from "@/components/dashboard";
import { toast } from "sonner";
import { Calendar, Clock, X, Star, CalendarDays } from "lucide-react";

const statusVariant = (s: string): "pending" | "accepted" | "completed" | "cancelled" | "rejected" | "secondary" =>
  (s === "pending" || s === "accepted" || s === "completed" || s === "cancelled" || s === "rejected" ? s : "secondary");

export default function MyBookings() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [cancelId, setCancelId] = useState<string | null>(null);

  const { data: bookings, isLoading, isError, error } = useQuery({
    queryKey: ["customer-bookings", user?.id],
    queryFn: async () => {
      const result = await getCustomerBookingsWithDetails(user!.id);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!user?.id,
  });

  const { data: reviewedIds } = useQuery({
    queryKey: ["customer-reviews", user?.id],
    queryFn: async () => {
      const result = await getCustomerReviewedBookingIds(user!.id);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!user?.id,
  });

  const cancelMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const result = await updateBookingStatus(bookingId, "cancelled");
      if (result.error) throw result.error;
    },
    onSuccess: () => {
      if (user?.id) qc.invalidateQueries({ queryKey: ["customer-bookings", user.id] });
      qc.invalidateQueries({ queryKey: ["vendor-bookings"] });
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Booking cancelled");
      setCancelId(null);
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ bookingId, vendorId, serviceId }: { bookingId: string; vendorId: string; serviceId: string }) => {
      const result = await createReview({
        booking_id: bookingId,
        customer_id: user!.id,
        vendor_id: vendorId,
        service_id: serviceId,
        rating,
        comment: comment || null,
      });
      if (result.error) throw result.error;
    },
    onSuccess: () => {
      if (user?.id) qc.invalidateQueries({ queryKey: ["customer-reviews", user.id] });
      toast.success("Review submitted!");
      setReviewBookingId(null);
      setComment("");
      setRating(5);
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">My bookings</h1>
          <p className="text-muted-foreground mt-1">View and manage your appointments</p>
        </div>
        <ListSkeleton rows={4} height="h-28" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">My bookings</h1>
          <p className="text-muted-foreground mt-1">View and manage your appointments</p>
        </div>
        <EmptyState icon={Calendar} title="Could not load bookings" description={getErrorMessage(error)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">My bookings</h1>
        <p className="text-muted-foreground mt-1">View and manage your appointments</p>
      </div>

      {bookings?.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No bookings yet" description="Browse services to get started" />
      ) : (
        <div className="space-y-4">
          {bookings?.map(b => {
            const hasReview = reviewedIds?.includes(b.id);
            return (
              <Card key={b.id} className="border-border/80 shadow-card hover:shadow-card-hover transition-all duration-200 rounded-xl">
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 md:p-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base">{(b as any).services?.name}</h3>
                      <Badge variant={statusVariant(b.status)}>{b.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Provider: {(b as any).vendor?.full_name}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{b.booking_date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{b.booking_time}</span>
                      <span className="font-medium text-foreground">₹{(b as any).services?.price}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {b.status === "pending" && (
                      <Button variant="outline" size="sm" onClick={() => setCancelId(b.id)} className="gap-1.5">
                        <X className="h-3.5 w-3.5" />Cancel
                      </Button>
                    )}
                    {b.status === "completed" && !hasReview && (
                      <Dialog open={reviewBookingId === b.id} onOpenChange={open => { if (!open) setReviewBookingId(null); }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setReviewBookingId(b.id)} className="gap-1.5">
                            <Star className="h-3.5 w-3.5" />Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md gap-5 p-6">
                          <DialogHeader><DialogTitle>Leave a review</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Rating</Label>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(n => (
                                  <button key={n} type="button" onClick={() => setRating(n)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                                    <Star className={`h-7 w-7 ${n <= rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground"}`} />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Comment</Label>
                              <Input value={comment} onChange={e => setComment(e.target.value)} placeholder="How was the service?" className="h-11 rounded-lg" />
                            </div>
                            <Button className="w-full h-11 rounded-lg" onClick={() => reviewMutation.mutate({ bookingId: b.id, vendorId: b.vendor_id, serviceId: b.service_id })}>
                              Submit review
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={cancelId != null}
        onOpenChange={open => !open && setCancelId(null)}
        title="Cancel booking?"
        description="This action cannot be undone."
        confirmLabel="Cancel booking"
        variant="destructive"
        onConfirm={() => cancelId && cancelMutation.mutate(cancelId)}
      />
    </div>
  );
}
