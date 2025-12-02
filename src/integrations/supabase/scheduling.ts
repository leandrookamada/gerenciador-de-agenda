import { supabase } from "@/integrations/supabase/client";

// ===== SERVICE TYPES =====
export type ServiceType = {
     id: string;
     professional_id: string;
     name: string;
     duration_minutes: number;
     description: string | null;
     is_active: boolean;
     created_at: string;
     updated_at: string;
};

export type ServiceTypeInsert = {
     professional_id: string;
     name: string;
     duration_minutes: number;
     description?: string | null;
     is_active?: boolean;
};

export async function listServiceTypes(professionalId: string) {
     const resp = await (supabase as any)
          .from("service_types")
          .select("*")
          .eq("professional_id", professionalId)
          .order("name", { ascending: true });
     const { data, error } = resp as { data: ServiceType[] | null; error: any };
     if (error) throw error;
     return data ?? [];
}

export async function listActiveServiceTypes(professionalId: string) {
     const resp = await (supabase as any)
          .from("service_types")
          .select("*")
          .eq("professional_id", professionalId)
          .eq("is_active", true)
          .order("name", { ascending: true });
     const { data, error } = resp as { data: ServiceType[] | null; error: any };
     if (error) throw error;
     return data ?? [];
}

export async function createServiceType(payload: ServiceTypeInsert) {
     const resp = await (supabase as any)
          .from("service_types")
          .insert(payload)
          .select()
          .single();
     const { data, error } = resp as { data: ServiceType | null; error: any };
     if (error) throw error;
     return data as ServiceType;
}

export async function updateServiceType(
     id: string,
     payload: Partial<ServiceTypeInsert>
) {
     const resp = await (supabase as any)
          .from("service_types")
          .update(payload)
          .eq("id", id)
          .select()
          .single();
     const { data, error } = resp as { data: ServiceType | null; error: any };
     if (error) throw error;
     return data as ServiceType;
}

export async function deleteServiceType(id: string) {
     const resp = await (supabase as any)
          .from("service_types")
          .delete()
          .eq("id", id);
     const { error } = resp as { error: any };
     if (error) throw error;
     return true;
}

// ===== TIME SLOTS =====
export type TimeSlot = {
     id: string;
     professional_id: string;
     slot_date: string; // YYYY-MM-DD
     start_time: string; // HH:MM:SS
     end_time: string; // HH:MM:SS
     is_available: boolean;
     service_type_id: string | null;
     created_at: string;
     updated_at: string;
};

export type TimeSlotInsert = {
     professional_id: string;
     slot_date: string;
     start_time: string;
     end_time: string;
     service_type_id?: string | null;
     is_available?: boolean;
};

export async function listTimeSlotsByDate(
     professionalId: string,
     date: string
) {
     const resp = await (supabase as any)
          .from("time_slots")
          .select("*")
          .eq("professional_id", professionalId)
          .eq("slot_date", date)
          .order("start_time", { ascending: true });
     const { data, error } = resp as { data: TimeSlot[] | null; error: any };
     if (error) throw error;
     return data ?? [];
}

export async function listAvailableSlots(
     professionalId: string,
     startDate: string,
     endDate: string
) {
     const resp = await (supabase as any)
          .from("time_slots")
          .select("*")
          .eq("professional_id", professionalId)
          .eq("is_available", true)
          .gte("slot_date", startDate)
          .lte("slot_date", endDate)
          .order("slot_date", { ascending: true })
          .order("start_time", { ascending: true });
     const { data, error } = resp as { data: TimeSlot[] | null; error: any };
     if (error) throw error;
     return data ?? [];
}

export async function createTimeSlot(payload: TimeSlotInsert) {
     const resp = await (supabase as any)
          .from("time_slots")
          .insert(payload)
          .select()
          .single();
     const { data, error } = resp as { data: TimeSlot | null; error: any };
     if (error) throw error;
     return data as TimeSlot;
}

export async function createMultipleTimeSlots(slots: TimeSlotInsert[]) {
     const resp = await (supabase as any)
          .from("time_slots")
          .insert(slots)
          .select();
     const { data, error } = resp as { data: TimeSlot[] | null; error: any };
     if (error) throw error;
     return data ?? [];
}

export async function deleteTimeSlot(id: string) {
     const resp = await (supabase as any)
          .from("time_slots")
          .delete()
          .eq("id", id);
     const { error } = resp as { error: any };
     if (error) throw error;
     return true;
}

export async function deleteTimeSlotsByDate(
     professionalId: string,
     date: string
) {
     const resp = await (supabase as any)
          .from("time_slots")
          .delete()
          .eq("professional_id", professionalId)
          .eq("slot_date", date);
     const { error } = resp as { error: any };
     if (error) throw error;
     return true;
}

export async function markSlotAsBooked(slotId: string) {
     const resp = await (supabase as any)
          .from("time_slots")
          .update({ is_available: false })
          .eq("id", slotId)
          .select()
          .single();
     const { data, error } = resp as { data: TimeSlot | null; error: any };
     if (error) throw error;
     return data as TimeSlot;
}

// ===== HELPER: Generate slots automatically =====
export async function generateTimeSlots(
     professionalId: string,
     date: string,
     startTime: string,
     endTime: string,
     durationMinutes: number,
     serviceTypeId?: string | null
) {
     // Chama a função SQL generate_time_slots
     const resp = await (supabase as any).rpc("generate_time_slots", {
          p_professional_id: professionalId,
          p_slot_date: date,
          p_start_time: startTime,
          p_end_time: endTime,
          p_slot_duration_minutes: durationMinutes,
          p_service_type_id: serviceTypeId || null,
     });

     const { data, error } = resp as { data: number | null; error: any };
     if (error) throw error;
     return data ?? 0; // Retorna o número de slots criados
}
