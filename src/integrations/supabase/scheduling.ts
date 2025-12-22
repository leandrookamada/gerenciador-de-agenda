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

export async function markSlotAsAvailable(slotId: string) {
     const resp = await (supabase as any)
          .from("time_slots")
          .update({ is_available: true })
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

// ===== BOOKINGS =====
export type Booking = {
     id: string;
     professional_id: string;
     service_type_id: string | null;
     time_slot_id: string | null;
     patient_name: string;
     patient_phone: string;
     patient_email: string | null;
     notes: string | null;
     status: "confirmed" | "cancelled" | "completed";
     created_at: string;
     updated_at: string;
};

export type BookingWithDetails = Booking & {
     service_type?: ServiceType;
     time_slot?: TimeSlot;
};

export async function listBookings(
     professionalId: string,
     filters?: {
          status?: string;
          startDate?: string;
          endDate?: string;
     }
) {
     let query = (supabase as any)
          .from("bookings")
          .select(
               `
               *,
               service_type:service_types(*),
               time_slot:time_slots(*)
          `
          )
          .eq("professional_id", professionalId);

     if (filters?.status) {
          query = query.eq("status", filters.status);
     }

     if (filters?.startDate && filters?.endDate) {
          query = query
               .gte("time_slot.slot_date", filters.startDate)
               .lte("time_slot.slot_date", filters.endDate);
     }

     const resp = await query.order("created_at", { ascending: false });
     const { data, error } = resp as {
          data: BookingWithDetails[] | null;
          error: any;
     };
     if (error) throw error;
     return data ?? [];
}

export async function cancelBooking(bookingId: string) {
     // 1. Atualizar status do booking
     const { data: booking, error: bookingError } = await (supabase as any)
          .from("bookings")
          .update({ status: "cancelled" })
          .eq("id", bookingId)
          .select()
          .single();

     if (bookingError) throw bookingError;

     // 2. Liberar o slot novamente
     if (booking.time_slot_id) {
          await markSlotAsAvailable(booking.time_slot_id);
     }

     return booking as Booking;
}

// ===== CLIENTS =====
export type Client = {
     id: string;
     email: string;
     name: string;
     phone: string | null;
     created_at: string;
     updated_at: string;
};

export type ClientInsert = {
     email: string;
     name: string;
     phone?: string | null;
};

export async function findClientByEmail(email: string) {
     const resp = await (supabase as any)
          .from("clients")
          .select("*")
          .eq("email", email)
          .single();
     const { data, error } = resp as { data: Client | null; error: any };
     if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
     return data;
}

export async function createClient(payload: ClientInsert) {
     const resp = await (supabase as any)
          .from("clients")
          .insert(payload)
          .select()
          .single();
     const { data, error } = resp as { data: Client | null; error: any };
     if (error) throw error;
     return data as Client;
}

export async function createOrUpdateClient(
     payload: ClientInsert
): Promise<Client> {
     // Tentar encontrar cliente existente
     const existing = await findClientByEmail(payload.email);

     if (existing) {
          // Atualizar nome e telefone se fornecidos
          const updates: Partial<ClientInsert> = {};
          if (payload.name) updates.name = payload.name;
          if (payload.phone) updates.phone = payload.phone;

          if (Object.keys(updates).length > 0) {
               const resp = await (supabase as any)
                    .from("clients")
                    .update(updates)
                    .eq("id", existing.id)
                    .select()
                    .single();
               const { data, error } = resp as {
                    data: Client | null;
                    error: any;
               };
               if (error) throw error;
               return data as Client;
          }
          return existing;
     }

     // Criar novo cliente
     return createClient(payload);
}

export async function listClientBookings(clientId: string) {
     const resp = await (supabase as any)
          .from("bookings")
          .select(
               `
               *,
               service_type:service_types(*),
               time_slot:time_slots(*)
          `
          )
          .eq("client_id", clientId)
          .order("created_at", { ascending: false });
     const { data, error } = resp as {
          data: BookingWithDetails[] | null;
          error: any;
     };
     if (error) throw error;
     return data ?? [];
}

export async function updateBookingTimeSlot(
     bookingId: string,
     newTimeSlotId: string
) {
     // 1. Obter o booking atual
     const { data: currentBooking, error: fetchError } = await (supabase as any)
          .from("bookings")
          .select("*")
          .eq("id", bookingId)
          .single();

     if (fetchError) throw fetchError;

     // 2. Liberar o slot antigo
     if (currentBooking.time_slot_id) {
          await markSlotAsAvailable(currentBooking.time_slot_id);
     }

     // 3. Marcar o novo slot como ocupado
     await markSlotAsBooked(newTimeSlotId);

     // 4. Atualizar o booking
     const resp = await (supabase as any)
          .from("bookings")
          .update({ time_slot_id: newTimeSlotId })
          .eq("id", bookingId)
          .select()
          .single();

     const { data, error } = resp as { data: Booking | null; error: any };
     if (error) throw error;
     return data as Booking;
}
