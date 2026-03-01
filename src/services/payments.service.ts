import { supabase } from "@/integrations/supabase/client";
import { ok, err, type ServiceResult } from "./errors";

function isValidId(id: string | undefined | null): id is string {
  return typeof id === "string" && id.trim().length > 0;
}

/** Call after vendor marks a booking as completed. Fetches booking + service price, inserts payment. */
export async function createPaymentForCompletedBooking(bookingId: string): Promise<ServiceResult<{ id: string }>> {
  if (!isValidId(bookingId)) {
    console.log("[payments.createPaymentForCompletedBooking] skip: invalid bookingId", { bookingId });
    return err(new Error("Booking id is required"));
  }
  const { data: booking, error: fetchErr } = await supabase
    .from("bookings")
    .select("id, status, service_id, services(price)")
    .eq("id", bookingId)
    .single();
  console.log("[payments.createPaymentForCompletedBooking] booking:", !!booking, "error:", fetchErr?.message ?? null, "bookingId:", bookingId);
  if (fetchErr || !booking) return err(fetchErr || new Error("Booking not found"));
  if ((booking as { status: string }).status !== "completed") {
    return err(new Error("Booking must be completed before creating payment"));
  }
  const amount = (booking as { services?: { price: number } }).services?.price;
  if (amount == null || Number(amount) <= 0) {
    return err(new Error("Could not resolve service price for payment"));
  }
  const { data: payment, error: insertErr } = await supabase
    .from("payments")
    .insert({
      booking_id: bookingId,
      amount: Number(amount),
      status: "success",
      transaction_id: "txn_" + Math.random().toString(36).slice(2, 14),
      payment_method: "razorpay",
    })
    .select("id")
    .single();
  console.log("[payments.createPaymentForCompletedBooking] payment:", !!payment, "error:", insertErr?.message ?? null);
  if (insertErr) return err(insertErr);
  return ok({ id: payment!.id });
}

export type CustomerPaymentRow = Awaited<ReturnType<typeof fetchCustomerPayments>>[number];

async function fetchCustomerPayments(customerId: string) {
  const { data, error } = await supabase
    .from("payments")
    .select("*, bookings!inner(customer_id, services(name))")
    .eq("bookings.customer_id", customerId)
    .order("created_at", { ascending: false });
  console.log("[payments.fetchCustomerPayments] data:", data?.length ?? 0, "error:", error?.message ?? null, "customerId:", customerId);
  if (error) throw error;
  return data ?? [];
}

export async function getPaymentsByCustomer(customerId: string): Promise<ServiceResult<CustomerPaymentRow[]>> {
  if (!isValidId(customerId)) {
    console.log("[payments.getPaymentsByCustomer] skip: invalid customerId", { customerId });
    return ok([]);
  }
  try {
    const data = await fetchCustomerPayments(customerId);
    return ok(data);
  } catch (e) {
    return err(e instanceof Error ? e : new Error("Failed to load payments"));
  }
}
