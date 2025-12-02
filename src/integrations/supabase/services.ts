import { supabase } from "@/integrations/supabase/client";

export type ServiceRow = {
     id: string;
     schedule_id: string;
     name: string;
     description: string | null;
     duration_minutes: number | null;
     price: string | null;
     is_active: boolean;
     created_at: string;
     updated_at: string;
};

export type ServiceInsert = {
     schedule_id: string;
     name: string;
     description?: string | null;
     duration_minutes?: number | null;
     price?: string | null;
     is_active?: boolean;
};

// Note: the generated Database types don't include `services` yet, so we cast table name to `any`
// to avoid TypeScript errors while keeping local runtime typing via ServiceRow.
export async function listServicesBySchedule(scheduleId: string) {
     const resp = await (supabase as any)
          .from("services")
          .select("*")
          .eq("schedule_id", scheduleId)
          .order("created_at", { ascending: true });
     const { data, error } = resp as { data: ServiceRow[] | null; error: any };
     if (error) throw error;
     return data ?? [];
}

export async function createService(payload: ServiceInsert) {
     const resp = await (supabase as any)
          .from("services")
          .insert(payload)
          .select()
          .single();
     const { data, error } = resp as { data: ServiceRow | null; error: any };
     if (error) throw error;
     return data as ServiceRow;
}

export async function updateService(
     id: string,
     payload: Partial<ServiceInsert>
) {
     const resp = await (supabase as any)
          .from("services")
          .update(payload)
          .eq("id", id)
          .select()
          .single();
     const { data, error } = resp as { data: ServiceRow | null; error: any };
     if (error) throw error;
     return data as ServiceRow;
}

export async function deleteService(id: string) {
     const resp = await (supabase as any)
          .from("services")
          .delete()
          .eq("id", id);
     const { error } = resp as { error: any };
     if (error) throw error;
     return true;
}
