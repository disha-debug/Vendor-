import { supabase } from "@/integrations/supabase/client";
import { ok, err, type ServiceResult } from "./errors";

export type AdminStats = {
  users: number;
  services: number;
  bookings: number;
  pendingBookings: number;
  totalRevenue: number;
  reviews: number;
};

export async function getAdminStats(): Promise<ServiceResult<AdminStats>> {
  try {
    const [usersRes, servicesRes, bookingsRes, paymentsRes, reviewsRes] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact" }),
      supabase.from("services").select("id", { count: "exact" }),
      supabase.from("bookings").select("id, status", { count: "exact" }),
      supabase.from("payments").select("amount, status"),
      supabase.from("reviews").select("id", { count: "exact" }),
    ]);
    const errMsg = usersRes.error?.message ?? servicesRes.error?.message ?? bookingsRes.error?.message ?? paymentsRes.error?.message ?? reviewsRes.error?.message ?? null;
    console.log("[admin.getAdminStats] error:", errMsg, "counts:", { users: usersRes.count, services: servicesRes.count, bookings: bookingsRes.count, reviews: reviewsRes.count });
    const totalRevenue = paymentsRes.data?.filter(p => p.status === "success").reduce((a, b) => a + Number(b.amount), 0) || 0;
    return ok({
      users: usersRes.count ?? 0,
      services: servicesRes.count ?? 0,
      bookings: bookingsRes.count ?? 0,
      pendingBookings: bookingsRes.data?.filter(b => b.status === "pending").length ?? 0,
      totalRevenue,
      reviews: reviewsRes.count ?? 0,
    });
  } catch (e) {
    return err(e instanceof Error ? e : new Error("Failed to load stats"));
  }
}

export type AdminBookingRow = Awaited<ReturnType<typeof fetchAdminBookings>>[number];

async function fetchAdminBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, services(name, price), customer:profiles!bookings_customer_id_fkey(full_name), vendor:profiles!bookings_vendor_id_fkey(full_name)")
    .order("created_at", { ascending: false });
  console.log("[admin.fetchAdminBookings] data:", data?.length ?? 0, "error:", error?.message ?? null);
  if (error) throw error;
  return data ?? [];
}

export async function getAdminBookings(): Promise<ServiceResult<AdminBookingRow[]>> {
  try {
    const data = await fetchAdminBookings();
    return ok(data);
  } catch (e) {
    return err(e instanceof Error ? e : new Error("Failed to load bookings"));
  }
}

export type AdminUserRow = { id: string; full_name: string | null; email: string; roles: string[] };

export async function getAdminUsers(): Promise<ServiceResult<AdminUserRow[]>> {
  try {
    const { data: profiles, error: pErr } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    console.log("[admin.getAdminUsers] profiles:", profiles?.length ?? 0, "error:", pErr?.message ?? null);
    if (pErr) throw pErr;
    const { data: roles, error: rErr } = await supabase.from("user_roles").select("*");
    console.log("[admin.getAdminUsers] roles:", roles?.length ?? 0, "error:", rErr?.message ?? null);
    if (rErr) throw rErr;
    const list = (profiles ?? []).map(p => ({
      ...p,
      roles: (roles ?? []).filter((r: { user_id: string }) => r.user_id === p.id).map((r: { role: string }) => r.role),
    }));
    return ok(list);
  } catch (e) {
    return err(e instanceof Error ? e : new Error("Failed to load users"));
  }
}

export type AdminServiceRow = Awaited<ReturnType<typeof fetchAdminServices>>[number];

async function fetchAdminServices() {
  const { data, error } = await supabase
    .from("services")
    .select("*, vendor:profiles!services_vendor_id_fkey(full_name)")
    .order("created_at", { ascending: false });
  console.log("[admin.fetchAdminServices] data:", data?.length ?? 0, "error:", error?.message ?? null);
  if (error) throw error;
  return data ?? [];
}

export async function getAdminServices(): Promise<ServiceResult<AdminServiceRow[]>> {
  try {
    const data = await fetchAdminServices();
    return ok(data);
  } catch (e) {
    return err(e instanceof Error ? e : new Error("Failed to load services"));
  }
}

export type AdminPaymentRow = Awaited<ReturnType<typeof fetchAdminPayments>>[number];

async function fetchAdminPayments() {
  const { data, error } = await supabase
    .from("payments")
    .select("*, bookings(services(name), customer:profiles!bookings_customer_id_fkey(full_name))")
    .order("created_at", { ascending: false });
  console.log("[admin.fetchAdminPayments] data:", data?.length ?? 0, "error:", error?.message ?? null);
  if (error) throw error;
  return data ?? [];
}

export async function getAdminPayments(): Promise<ServiceResult<AdminPaymentRow[]>> {
  try {
    const data = await fetchAdminPayments();
    return ok(data);
  } catch (e) {
    return err(e instanceof Error ? e : new Error("Failed to load payments"));
  }
}

export type AdminReviewRow = Awaited<ReturnType<typeof fetchAdminReviews>>[number];

async function fetchAdminReviews() {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, services(name), customer:profiles!reviews_customer_id_fkey(full_name), vendor:profiles!reviews_vendor_id_fkey(full_name)")
    .order("created_at", { ascending: false });
  console.log("[admin.fetchAdminReviews] data:", data?.length ?? 0, "error:", error?.message ?? null);
  if (error) throw error;
  return data ?? [];
}

export async function getAdminReviews(): Promise<ServiceResult<AdminReviewRow[]>> {
  try {
    const data = await fetchAdminReviews();
    return ok(data);
  } catch (e) {
    return err(e instanceof Error ? e : new Error("Failed to load reviews"));
  }
}
