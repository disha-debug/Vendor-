import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { ok, err, type ServiceResult } from "./errors";

function isValidId(id: string | undefined | null): id is string {
  return typeof id === "string" && id.trim().length > 0;
}

export type Booking = Tables<"bookings">;
export type BookingInsert = TablesInsert<"bookings">;

export async function getBookingsByCustomer(
  customerId: string
): Promise<ServiceResult<Booking[]>> {
  if (!isValidId(customerId)) {
    console.log("[bookings.getBookingsByCustomer] skip: invalid customerId", { customerId });
    return ok([]);
  }
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  console.log("[bookings.getBookingsByCustomer] data:", data?.length ?? 0, "error:", error?.message ?? null, "customerId:", customerId);
  if (error) return err(error);
  return ok(data ?? []);
}

/** Customer bookings with service and vendor profile for UI. */
export type CustomerBookingRow = Awaited<ReturnType<typeof fetchCustomerBookingsWithDetails>>[number];

async function fetchCustomerBookingsWithDetails(customerId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, services(name, price, category), vendor:profiles!bookings_vendor_id_fkey(full_name)")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  console.log("[bookings.getCustomerBookingsWithDetails] data:", data?.length ?? 0, "error:", error?.message ?? null, "customerId:", customerId);
  if (error) throw error;
  return data ?? [];
}

export async function getCustomerBookingsWithDetails(customerId: string): Promise<ServiceResult<CustomerBookingRow[]>> {
  if (!isValidId(customerId)) {
    console.log("[bookings.getCustomerBookingsWithDetails] skip: invalid customerId", { customerId });
    return ok([]);
  }
  try {
    const data = await fetchCustomerBookingsWithDetails(customerId);
    return ok(data);
  } catch (e) {
    return err(e instanceof Error ? e : new Error("Failed to load bookings"));
  }
}

export async function getBookingsByVendor(
  vendorId: string
): Promise<ServiceResult<Booking[]>> {
  if (!isValidId(vendorId)) {
    console.log("[bookings.getBookingsByVendor] skip: invalid vendorId", { vendorId });
    return ok([]);
  }
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });
  console.log("[bookings.getBookingsByVendor] data:", data?.length ?? 0, "error:", error?.message ?? null, "vendorId:", vendorId);
  if (error) return err(error);
  return ok(data ?? []);
}

export async function getBookingById(
  id: string
): Promise<ServiceResult<Booking | null>> {
  if (!isValidId(id)) {
    console.log("[bookings.getBookingById] skip: invalid id", { id });
    return ok(null);
  }
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  console.log("[bookings.getBookingById] data:", !!data, "error:", error?.message ?? null, "id:", id);
  if (error) return err(error);
  return ok(data);
}

export async function createBooking(
  payload: BookingInsert
): Promise<ServiceResult<Booking>> {
  if (!isValidId(payload.customer_id) || !isValidId(payload.vendor_id) || !isValidId(payload.service_id)) {
    console.log("[bookings.createBooking] skip: invalid payload ids", { customer_id: payload.customer_id, vendor_id: payload.vendor_id, service_id: payload.service_id });
    return err(new Error("customer_id, vendor_id and service_id are required"));
  }
  try {
    console.log("[bookings.createBooking] insert payload:", { customer_id: payload.customer_id, vendor_id: payload.vendor_id, service_id: payload.service_id, booking_date: payload.booking_date });
    const { data, error } = await supabase
      .from("bookings")
      .insert(payload)
      .select()
      .single();
    if (error) {
      console.error("[bookings.createBooking] insert error:", error.message, "code:", error.code, "details:", error.details);
      return err(error);
    }
    console.log("[bookings.createBooking] inserted row id:", data?.id);
    return ok(data);
  } catch (e) {
    console.error("[bookings.createBooking] caught:", e instanceof Error ? e.message : e);
    return err(e instanceof Error ? e : new Error("Failed to create booking"));
  }
}

export async function updateBookingStatus(
  id: string,
  status: Booking["status"]
): Promise<ServiceResult<Booking>> {
  if (!isValidId(id)) {
    console.log("[bookings.updateBookingStatus] skip: invalid id", { id });
    return err(new Error("Booking id is required"));
  }
  try {
    console.log("[bookings.updateBookingStatus] update id:", id, "status:", status);
    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.error("[bookings.updateBookingStatus] error:", error.message, "code:", error.code);
      return err(error);
    }
    console.log("[bookings.updateBookingStatus] updated row id:", data?.id);
    return ok(data);
  } catch (e) {
    console.error("[bookings.updateBookingStatus] caught:", e instanceof Error ? e.message : e);
    return err(e instanceof Error ? e : new Error("Failed to update booking status"));
  }
}
