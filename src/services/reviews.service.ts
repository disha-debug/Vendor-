import { supabase } from "@/integrations/supabase/client";
import { ok, err, type ServiceResult } from "./errors";

function isValidId(id: string | undefined | null): id is string {
  return typeof id === "string" && id.trim().length > 0;
}

/** Returns booking IDs that the customer has already reviewed (for hiding Review button). */
export async function getCustomerReviewedBookingIds(customerId: string): Promise<ServiceResult<string[]>> {
  if (!isValidId(customerId)) {
    console.log("[reviews.getCustomerReviewedBookingIds] skip: invalid customerId", { customerId });
    return ok([]);
  }
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("booking_id")
      .eq("customer_id", customerId);
    console.log("[reviews.getCustomerReviewedBookingIds] data:", data?.length ?? 0, "error:", error?.message ?? null, "customerId:", customerId);
    if (error) throw error;
    return ok((data ?? []).map(r => r.booking_id));
  } catch (e) {
    return err(e instanceof Error ? e : new Error("Failed to load reviews"));
  }
}

export type ReviewInsert = {
  booking_id: string;
  customer_id: string;
  vendor_id: string;
  service_id: string;
  rating: number;
  comment: string | null;
};

export async function createReview(payload: ReviewInsert): Promise<ServiceResult<unknown>> {
  if (!isValidId(payload.booking_id) || !isValidId(payload.customer_id) || !isValidId(payload.vendor_id) || !isValidId(payload.service_id)) {
    console.log("[reviews.createReview] skip: invalid payload ids", payload);
    return err(new Error("booking_id, customer_id, vendor_id and service_id are required"));
  }
  try {
    const { error } = await supabase.from("reviews").insert(payload);
    console.log("[reviews.createReview] error:", error?.message ?? null, "bookingId:", payload.booking_id);
    if (error) throw error;
    return ok(undefined);
  } catch (e) {
    return err(e instanceof Error ? e : new Error("Failed to create review"));
  }
}
