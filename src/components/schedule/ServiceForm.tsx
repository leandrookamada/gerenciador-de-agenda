import { useState } from "react";
import { createService, updateService } from "@/integrations/supabase/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Props {
     scheduleId: string;
     existing?: any;
     onSaved?: (service: any) => void;
}

export default function ServiceForm({ scheduleId, existing, onSaved }: Props) {
     const [name, setName] = useState(existing?.name ?? "");
     const [duration, setDuration] = useState<string | number | null>(
          existing?.duration_minutes ?? ""
     );
     const [price, setPrice] = useState(existing?.price ?? "");
     const [loading, setLoading] = useState(false);

     const isEdit = Boolean(existing?.id);

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setLoading(true);
          try {
               const payload = {
                    schedule_id: scheduleId,
                    name,
                    duration_minutes: duration ? Number(duration) : null,
                    price: price || null,
                    is_active: true,
               };

               const result = isEdit
                    ? await updateService(existing.id, payload)
                    : await createService(payload);

               onSaved?.(result);

               if (!isEdit) {
                    setName("");
                    setDuration("");
                    setPrice("");
               }
          } catch (err) {
               console.error(err);
               toast.error("Erro ao salvar serviço");
          } finally {
               setLoading(false);
          }
     };

     return (
          <form onSubmit={handleSubmit} className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-2">
                         <Label htmlFor="service-name">Nome do Serviço</Label>
                         <Input
                              id="service-name"
                              placeholder="Ex: Consulta de Rotina"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                         />
                    </div>
                    <div className="space-y-2">
                         <Label htmlFor="service-duration">Duração (min)</Label>
                         <Input
                              id="service-duration"
                              type="number"
                              min="5"
                              step="5"
                              placeholder="30"
                              value={duration}
                              onChange={(e) => setDuration(e.target.value)}
                         />
                    </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                         <Label htmlFor="service-price">Preço (R$)</Label>
                         <Input
                              id="service-price"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="150.00"
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                         />
                    </div>
                    <div className="flex items-end md:col-span-2">
                         <Button
                              type="submit"
                              disabled={loading}
                              className="w-full md:w-auto"
                         >
                              {loading
                                   ? "Salvando..."
                                   : isEdit
                                   ? "Atualizar Serviço"
                                   : "Adicionar Serviço"}
                         </Button>
                    </div>
               </div>
          </form>
     );
}
