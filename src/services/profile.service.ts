import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";
import { ok, err, type ServiceResult } from "./errors";

function isValidId(id: string | undefined | null): id is string {
  return typeof id === "string" && id.trim().length > 0;
}

export type Profile = Tables<"profiles">;
export type ProfileUpdate = TablesUpdate<"profiles">;

export async function getProfile(userId: string): Promise<ServiceResult<Profile | null>> {
  if (!isValidId(userId)) {
    console.log("[profile.getProfile] skip: invalid userId", { userId });
    return ok(null);
  }
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  console.log("[profile.getProfile] data:", !!data, "error:", error?.message ?? null, "userId:", userId);
  if (error) return err(error);
  return ok(data);
}

export async function updateProfile(
  userId: string,
  payload: ProfileUpdate
): Promise<ServiceResult<Profile>> {
  if (!isValidId(userId)) {
    console.log("[profile.updateProfile] skip: invalid userId", { userId });
    return err(new Error("user id is required"));
  }
  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select()
    .single();
  console.log("[profile.updateProfile] data:", !!data, "error:", error?.message ?? null, "userId:", userId);
  if (error) return err(error);
  return ok(data);
}
