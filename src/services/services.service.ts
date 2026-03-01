import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { ok, err, type ServiceResult } from "./errors";

function isValidId(id: string | undefined | null): id is string {
  return typeof id === "string" && id.trim().length > 0;
}

export type ServiceRow = Tables<"services">;
export type ServiceInsert = TablesInsert<"services">;

export type ServiceWithVendor = Awaited<ReturnType<typeof fetchAvailableServices>>[number];

async function fetchAvailableServices() {
  const { data, error } = await supabase
    .from("services")
    .select("*, vendor:profiles!services_vendor_id_fkey(full_name)")
    .eq("is_available", true)
    .order("created_at", { ascending: false });
  console.log("[services.fetchAvailableServices] data:", data?.length ?? 0, "error:", error?.message ?? null);
  if (error) throw error;
  return data ?? [];
}

export async function getAvailableServices(): Promise<ServiceResult<ServiceWithVendor[]>> {
  try {
    const data = await fetchAvailableServices();
    return ok(data);
  } catch (e) {
    return err(e instanceof Error ? e : new Error("Failed to load services"));
  }
}

export type ReviewSummaryRow = { service_id: string; rating: number };

export async function getReviewSummaries(): Promise<ServiceResult<ReviewSummaryRow[]>> {
  try {
    const { data, error } = await supabase.from("reviews").select("service_id, rating");
    console.log("[services.getReviewSummaries] data:", data?.length ?? 0, "error:", error?.message ?? null);
    if (error) throw error;
    return ok(data ?? []);
  } catch (e) {
    return err(e instanceof Error ? e : new Error("Failed to load reviews"));
  }
}

export async function createService(payload: ServiceInsert): Promise<ServiceResult<ServiceRow>> {
  if (!isValidId(payload.vendor_id)) {
    console.log("[services.createService] skip: invalid vendor_id", { vendor_id: payload.vendor_id });
    return err(new Error("vendor_id is required"));
  }
  const insertPayload = {
    ...payload,
    is_available: payload.is_available ?? true,
  };
  try {
    console.log("[services.createService] insert payload:", { vendor_id: insertPayload.vendor_id, name: insertPayload.name, is_available: insertPayload.is_available });
    const { data, error } = await supabase.from("services").insert(insertPayload).select().single();
    if (error) {
      console.error("[services.createService] insert error:", error.message, "code:", error.code, "details:", error.details);
      throw error;
    }
    console.log("[services.createService] inserted row id:", data?.id, "vendorId:", payload.vendor_id);
    return ok(data);
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : "Failed to create service";
    console.error("[services.createService] caught:", errMsg);
    return err(e instanceof Error ? e : new Error("Failed to create service"));
  }
}

export async function updateService(id: string, payload: Partial<ServiceRow>): Promise<ServiceResult<ServiceRow>> {
  if (!isValidId(id)) {
    console.log("[services.updateService] skip: invalid id", { id });
    return err(new Error("Service id is required"));
  }
  try {
    console.log("[services.updateService] update id:", id, "payload keys:", Object.keys(payload));
    const { data, error } = await supabase.from("services").update(payload).eq("id", id).select().single();
    if (error) {
      console.error("[services.updateService] error:", error.message, "code:", error.code);
      throw error;
    }
    console.log("[services.updateService] updated row id:", data?.id);
    return ok(data);
  } catch (e) {
    return err(e instanceof Error ? e : new Error("Failed to update service"));
  }
}

export async function deleteService(id: string): Promise<ServiceResult<void>> {
  if (!isValidId(id)) {
    console.log("[services.deleteService] skip: invalid id", { id });
    return err(new Error("Service id is required"));
  }
  try {
    const { error } = await supabase.from("services").delete().eq("id", id);
    console.log("[services.deleteService] error:", error?.message ?? null, "id:", id);
    if (error) throw error;
    return ok(undefined);
  } catch (e) {
    return err(e instanceof Error ? e : new Error("Failed to delete service"));
  }
}
