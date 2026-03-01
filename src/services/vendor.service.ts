import { supabase } from "@/integrations/supabase/client";
import { ok, err, type ServiceResult } from "./errors";

function isValidId(id: string | undefined | null): id is string {
  return typeof id === "string" && id.trim().length > 0;
}

export type VendorStats = {
  services: number;
  totalBookings: number;
  completedBookings: number;
  avgRating: string;
  reviewCount: number;
};

export async function getVendorStats(vendorId: string): Promise<ServiceResult<VendorStats>> {
  if (!isValidId(vendorId)) {
    console.log("[vendor.getVendorStats] skip: invalid vendorId", { vendorId });
    return err(new Error("vendor_id is required"));
  }
  try {
    const [servicesRes, bookingsRes, reviewsRes] = await Promise.all([
      supabase.from("services").select("id", { count: "exact" }).eq("vendor_id", vendorId),
      supabase.from("bookings").select("id, status", { count: "exact" }).eq("vendor_id", vendorId),
      supabase.from("reviews").select("rating").eq("vendor_id", vendorId),
    ]);
    console.log("[vendor.getVendorStats] error:", servicesRes.error?.message ?? bookingsRes.error?.message ?? reviewsRes.error?.message ?? null, "vendorId:", vendorId);
    const totalBookings = bookingsRes.count ?? 0;
    const completedBookings = bookingsRes.data?.filter(b => b.status === "completed").length ?? 0;
    const reviewList = reviewsRes.data ?? [];
    const avgRating = reviewList.length
      ? (reviewList.reduce((a, b) => a + b.rating, 0) / reviewList.length).toFixed(1)
      : "N/A";
    return ok({
      services: servicesRes.count ?? 0,
      totalBookings,
      completedBookings,
      avgRating,
      reviewCount: reviewList.length,
    });
  } catch (e) {
    return err(e instanceof Error ? e : new Error("Failed to load stats"));
  }
}

export type VendorServiceRow = Awaited<ReturnType<typeof fetchVendorServices>>[number];

async function fetchVendorServices(vendorId: string) {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });
  console.log("[vendor.fetchVendorServices] data:", data?.length ?? 0, "error:", error?.message ?? null, "vendorId:", vendorId);
  if (error) throw error;
  return data ?? [];
}

export async function getVendorServices(vendorId: string): Promise<ServiceResult<VendorServiceRow[]>> {
  if (!isValidId(vendorId)) {
    console.log("[vendor.getVendorServices] skip: invalid vendorId", { vendorId });
    return ok([]);
  }
  try {
    const data = await fetchVendorServices(vendorId);
    return ok(data);
  } catch (e) {
    return err(e instanceof Error ? e : new Error("Failed to load services"));
  }
}

export type VendorBookingRow = Awaited<ReturnType<typeof fetchVendorBookings>>[number];

async function fetchVendorBookings(vendorId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, services(name, price), customer:profiles!bookings_customer_id_fkey(full_name, phone)")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });
  console.log("[vendor.fetchVendorBookings] data:", data?.length ?? 0, "error:", error?.message ?? null, "vendorId:", vendorId);
  if (error) throw error;
  return data ?? [];
}

export async function getVendorBookings(vendorId: string): Promise<ServiceResult<VendorBookingRow[]>> {
  if (!isValidId(vendorId)) {
    console.log("[vendor.getVendorBookings] skip: invalid vendorId", { vendorId });
    return ok([]);
  }
  try {
    const data = await fetchVendorBookings(vendorId);
    return ok(data);
  } catch (e) {
    return err(e instanceof Error ? e : new Error("Failed to load bookings"));
  }
}

export type VendorPaymentRow = Awaited<ReturnType<typeof fetchVendorPayments>>[number];

async function fetchVendorPayments(vendorId: string) {
  const { data, error } = await supabase
    .from("payments")
    .select("*, bookings!inner(vendor_id, services(name))")
    .eq("bookings.vendor_id", vendorId)
    .order("created_at", { ascending: false });
  console.log("[vendor.fetchVendorPayments] data:", data?.length ?? 0, "error:", error?.message ?? null, "vendorId:", vendorId);
  if (error) throw error;
  return data ?? [];
}

export async function getVendorPayments(vendorId: string): Promise<ServiceResult<VendorPaymentRow[]>> {
  if (!isValidId(vendorId)) {
    console.log("[vendor.getVendorPayments] skip: invalid vendorId", { vendorId });
    return ok([]);
  }
  try {
    const data = await fetchVendorPayments(vendorId);
    return ok(data);
  } catch (e) {
    return err(e instanceof Error ? e : new Error("Failed to load payments"));
  }
}
