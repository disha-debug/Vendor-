import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getAvailableServices, getReviewSummaries, createBooking, getErrorMessage } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ListSkeleton, EmptyState } from "@/components/dashboard";
import { toast } from "sonner";
import { Search, Clock, IndianRupee, Star, Calendar } from "lucide-react";

const categoryLabels: Record<string, string> = {
  plumbing: "Plumbing", electrical: "Electrical", carpentry: "Carpentry",
  cleaning: "Cleaning", painting: "Painting", gardening: "Gardening",
  pest_control: "Pest Control", appliance_repair: "Appliance Repair", other: "Other",
};

const categoryColors: Record<string, string> = {
  plumbing: "bg-info/10 text-info", electrical: "bg-warning/10 text-warning",
  carpentry: "bg-accent/10 text-accent", cleaning: "bg-success/10 text-success",
  painting: "bg-destructive/10 text-destructive", gardening: "bg-accent/10 text-accent",
  pest_control: "bg-warning/10 text-warning", appliance_repair: "bg-info/10 text-info",
  other: "bg-muted text-muted-foreground",
};

/** Different job-profile image per category (each category has its own image). */
const categoryImages: Record<string, string> = {
  plumbing: "https://images.unsplash.com/photo-1607478912214-192c7142e2b6?w=400&h=240&fit=crop",
  electrical: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=240&fit=crop",
  carpentry: "https://images.unsplash.com/photo-1504144022847-9c7d959ff2b9?w=400&h=240&fit=crop",
  cleaning: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=240&fit=crop",
  painting: "https://images.unsplash.com/photo-1563986768473-7a1b2c3d4e5f?w=400&h=240&fit=crop",
  gardening: "https://images.unsplash.com/photo-1592150621748-2a5c2b2b2b2b?w=400&h=240&fit=crop",
  pest_control: "https://images.unsplash.com/photo-1558642452-9d0e1f2a3b4c?w=400&h=240&fit=crop",
  appliance_repair: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=240&fit=crop",
  other: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=240&fit=crop",
};

function getAvgRating(serviceId: string, reviews: { service_id: string; rating: number }[] | null) {
  if (!reviews?.length) return null;
  const srvReviews = reviews.filter(r => r.service_id === serviceId);
  if (srvReviews.length === 0) return null;
  return (srvReviews.reduce((a, b) => a + b.rating, 0) / srvReviews.length).toFixed(1);
}

export default function BrowseServices() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [bookingService, setBookingService] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const { data: services, isLoading: servicesLoading, isError: servicesError, error: servicesErrorObj } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const result = await getAvailableServices();
      if (result.error) throw result.error;
      return result.data;
    },
  });

  const { data: reviews } = useQuery({
    queryKey: ["all-reviews"],
    queryFn: async () => {
      const result = await getReviewSummaries();
      if (result.error) throw result.error;
      return result.data;
    },
  });

  const filtered = services?.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !selectedCategory || s.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const handleBook = async () => {
    if (!user || !bookingService || !bookingDate || !bookingTime) {
      toast.error("Please fill all fields");
      return;
    }
    setBookingLoading(true);
    const result = await createBooking({
      customer_id: user.id,
      service_id: bookingService.id,
      vendor_id: bookingService.vendor_id,
      booking_date: bookingDate,
      booking_time: bookingTime,
      notes: bookingNotes || null,
    });
    setBookingLoading(false);
    if (result.error) {
      toast.error(result.error.message);
    } else {
      if (user?.id) qc.invalidateQueries({ queryKey: ["customer-bookings", user.id] });
      qc.invalidateQueries({ queryKey: ["vendor-bookings"] });
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Booking submitted!");
      setBookingService(null);
      setBookingDate("");
      setBookingTime("");
      setBookingNotes("");
    }
  };

  const categories = Object.keys(categoryLabels);

  if (servicesLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">Find a service</h1>
          <p className="text-muted-foreground mt-1">Browse trusted local service providers near you</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-2xl overflow-hidden animate-shimmer h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (servicesError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">Find a service</h1>
          <p className="text-muted-foreground mt-1">Browse trusted local service providers near you</p>
        </div>
        <EmptyState icon={Search} title="Could not load services" description={getErrorMessage(servicesErrorObj)} />
      </div>
    );
  }

  const imageForCategory = (category: string) => categoryImages[category] ?? categoryImages.other;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section
        className="relative rounded-2xl overflow-hidden min-h-[200px] md:min-h-[240px] flex flex-col justify-end p-6 md:p-8 text-white"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%), url(https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&fit=crop)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 animate-in-fade">
          <h1 className="text-2xl md:text-4xl font-heading font-bold tracking-tight">Find a service</h1>
          <p className="text-white/90 mt-1 text-sm md:text-base max-w-xl">Browse trusted local service providers near you. Book, pay, and review — all in one place.</p>
        </div>
      </section>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search services…" className="pl-10 h-11 rounded-lg" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant={selectedCategory === null ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(null)} className="rounded-lg">All</Button>
        {categories.map(cat => (
          <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)} className="rounded-lg">
            {categoryLabels[cat]}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered?.map(service => {
          const avg = getAvgRating(service.id, reviews ?? null);
          return (
            <Card key={service.id} className="border-border/80 shadow-card hover:shadow-card-hover overflow-hidden rounded-2xl card-hover-scale">
              <div className="aspect-[5/3] w-full bg-muted/50 relative overflow-hidden">
                <img
                  src={imageForCategory(service.category)}
                  alt=""
                  className="object-cover w-full h-full"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <div className="absolute top-3 right-3">
                  <Badge className={categoryColors[service.category] || ""} variant="secondary">{categoryLabels[service.category]}</Badge>
                </div>
              </div>
              <CardHeader className="pb-2 pt-4 px-5">
                <CardTitle className="text-lg leading-tight">{service.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">by {(service as any).vendor?.full_name || "Unknown"}</p>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{service.description || "No description"}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                  <span className="flex items-center gap-1 font-semibold"><IndianRupee className="h-4 w-4" />₹{service.price}</span>
                  <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-4 w-4" />{service.duration_minutes} min</span>
                  {avg && <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400"><Star className="h-4 w-4 fill-current" />{avg}</span>}
                </div>
                <Dialog open={bookingService?.id === service.id} onOpenChange={open => { if (!open) setBookingService(null); }}>
                  <DialogTrigger asChild>
                    <Button className="w-full gap-2 rounded-lg" onClick={() => setBookingService(service)}><Calendar className="h-4 w-4" />Book now</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md gap-5 p-6">
                    <DialogHeader>
                      <DialogTitle>Book: {service.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2"><Label>Date</Label><Input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="h-11 rounded-lg" /></div>
                      <div className="space-y-2"><Label>Time</Label><Input type="time" value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="h-11 rounded-lg" /></div>
                      <div className="space-y-2"><Label>Notes (optional)</Label><Input value={bookingNotes} onChange={e => setBookingNotes(e.target.value)} placeholder="Any special instructions…" className="h-11 rounded-lg" /></div>
                      <div className="flex items-center justify-between p-4 bg-muted/60 rounded-xl"><span className="text-sm text-muted-foreground">Total</span><span className="font-bold text-lg">₹{service.price}</span></div>
                      <Button className="w-full h-11 rounded-lg" onClick={handleBook} disabled={bookingLoading}>{bookingLoading ? "Booking…" : "Confirm booking"}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          );
        })}
        {filtered?.length === 0 && (
          <div className="col-span-full">
            <EmptyState icon={Search} title="No services found" description="Try adjusting your search or filters" />
          </div>
        )}
      </div>
    </div>
  );
}
