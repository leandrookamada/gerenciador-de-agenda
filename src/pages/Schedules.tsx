import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import ServiceForm from "@/components/schedule/ServiceForm";
import {
     listServicesBySchedule,
     deleteService,
} from "@/integrations/supabase/services";
import { Button } from "@/components/ui/button";
import {
     Card,
     CardContent,
     CardDescription,
     CardHeader,
     CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Clock, Calendar } from "lucide-react";
import { toast } from "sonner";

const Schedules = () => {
     const [schedules, setSchedules] = useState<any[]>([]);
     const [services, setServices] = useState<Record<string, any[]>>({});
     const [showNewScheduleForm, setShowNewScheduleForm] = useState(false);
     const [newSchedule, setNewSchedule] = useState({
          name: "",
          duration_minutes: 30,
          description: "",
     });

     const loadServices = async (scheduleId: string) => {
          try {
               const data = await listServicesBySchedule(scheduleId);
               setServices((s) => ({ ...s, [scheduleId]: data }));
          } catch (error) {
               console.error("Erro ao carregar serviços:", error);
               toast.error("Erro ao carregar serviços");
          }
     };

     const handleCreateSchedule = async (e: React.FormEvent) => {
          e.preventDefault();
          try {
               // Temporariamente usando um ID fixo de profissional para desenvolvimento
               // TODO: substituir por user.id quando autenticação estiver ativa
               const { data, error } = await supabase
                    .from("schedules")
                    .insert({
                         professional_id:
                              "00000000-0000-0000-0000-000000000000", // ID temporário
                         name: newSchedule.name,
                         duration_minutes: newSchedule.duration_minutes,
                         description: newSchedule.description,
                         is_active: true,
                    })
                    .select()
                    .single();

               if (error) throw error;

               setSchedules([...schedules, data]);
               setNewSchedule({
                    name: "",
                    duration_minutes: 30,
                    description: "",
               });
               setShowNewScheduleForm(false);
               toast.success("Agenda criada com sucesso!");
          } catch (error) {
               console.error("Erro ao criar agenda:", error);
               toast.error("Erro ao criar agenda");
          }
     };

     const handleDeleteService = async (
          serviceId: string,
          scheduleId: string
     ) => {
          if (!confirm("Deseja realmente excluir este serviço?")) return;

          try {
               await deleteService(serviceId);
               setServices((s) => ({
                    ...s,
                    [scheduleId]: s[scheduleId].filter(
                         (svc) => svc.id !== serviceId
                    ),
               }));
               toast.success("Serviço excluído com sucesso!");
          } catch (error) {
               console.error("Erro ao excluir serviço:", error);
               toast.error("Erro ao excluir serviço");
          }
     };

     return (
          <DashboardLayout>
               <div className="space-y-6">
                    <div className="flex items-center justify-between">
                         <div>
                              <h2 className="text-3xl font-bold">Agendas</h2>
                              <p className="text-muted-foreground">
                                   Gerencie suas agendas, horários e serviços
                              </p>
                         </div>
                         <Button
                              onClick={() =>
                                   setShowNewScheduleForm(!showNewScheduleForm)
                              }
                         >
                              <Plus className="w-4 h-4 mr-2" />
                              Nova Agenda
                         </Button>
                    </div>

                    {showNewScheduleForm && (
                         <Card>
                              <CardHeader>
                                   <CardTitle>Criar Nova Agenda</CardTitle>
                                   <CardDescription>
                                        Defina o nome e duração padrão dos
                                        atendimentos
                                   </CardDescription>
                              </CardHeader>
                              <CardContent>
                                   <form
                                        onSubmit={handleCreateSchedule}
                                        className="space-y-4"
                                   >
                                        <div className="space-y-2">
                                             <Label htmlFor="name">
                                                  Nome da Agenda
                                             </Label>
                                             <Input
                                                  id="name"
                                                  placeholder="Ex: Consultas Gerais"
                                                  value={newSchedule.name}
                                                  onChange={(e) =>
                                                       setNewSchedule({
                                                            ...newSchedule,
                                                            name: e.target
                                                                 .value,
                                                       })
                                                  }
                                                  required
                                             />
                                        </div>
                                        <div className="space-y-2">
                                             <Label htmlFor="duration">
                                                  Duração Padrão (minutos)
                                             </Label>
                                             <Input
                                                  id="duration"
                                                  type="number"
                                                  min="5"
                                                  step="5"
                                                  value={
                                                       newSchedule.duration_minutes
                                                  }
                                                  onChange={(e) =>
                                                       setNewSchedule({
                                                            ...newSchedule,
                                                            duration_minutes:
                                                                 Number(
                                                                      e.target
                                                                           .value
                                                                 ),
                                                       })
                                                  }
                                                  required
                                             />
                                        </div>
                                        <div className="space-y-2">
                                             <Label htmlFor="description">
                                                  Descrição (opcional)
                                             </Label>
                                             <Input
                                                  id="description"
                                                  placeholder="Breve descrição da agenda"
                                                  value={
                                                       newSchedule.description
                                                  }
                                                  onChange={(e) =>
                                                       setNewSchedule({
                                                            ...newSchedule,
                                                            description:
                                                                 e.target.value,
                                                       })
                                                  }
                                             />
                                        </div>
                                        <div className="flex gap-2">
                                             <Button type="submit">
                                                  Criar Agenda
                                             </Button>
                                             <Button
                                                  type="button"
                                                  variant="outline"
                                                  onClick={() =>
                                                       setShowNewScheduleForm(
                                                            false
                                                       )
                                                  }
                                             >
                                                  Cancelar
                                             </Button>
                                        </div>
                                   </form>
                              </CardContent>
                         </Card>
                    )}

                    {schedules.length === 0 ? (
                         <Card>
                              <CardContent className="flex flex-col items-center justify-center py-12">
                                   <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                                   <h3 className="text-lg font-semibold mb-2">
                                        Nenhuma agenda criada
                                   </h3>
                                   <p className="text-sm text-muted-foreground mb-4">
                                        Comece criando sua primeira agenda de
                                        atendimento
                                   </p>
                                   <Button
                                        onClick={() =>
                                             setShowNewScheduleForm(true)
                                        }
                                   >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Criar Primeira Agenda
                                   </Button>
                              </CardContent>
                         </Card>
                    ) : (
                         <div className="grid gap-4">
                              {schedules.map((sch) => (
                                   <Card key={sch.id}>
                                        <CardHeader>
                                             <div className="flex items-center justify-between">
                                                  <div className="flex items-center gap-2">
                                                       <Calendar className="w-5 h-5 text-primary" />
                                                       <div>
                                                            <CardTitle>
                                                                 {sch.name}
                                                            </CardTitle>
                                                            <CardDescription className="flex items-center gap-1 mt-1">
                                                                 <Clock className="w-3 h-3" />
                                                                 Duração padrão:{" "}
                                                                 {
                                                                      sch.duration_minutes
                                                                 }{" "}
                                                                 minutos
                                                            </CardDescription>
                                                       </div>
                                                  </div>
                                                  <Button
                                                       variant="outline"
                                                       size="sm"
                                                       onClick={() =>
                                                            loadServices(sch.id)
                                                       }
                                                  >
                                                       Carregar Serviços
                                                  </Button>
                                             </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                             {/* Lista de Serviços */}
                                             <div>
                                                  <h4 className="font-semibold mb-3">
                                                       Serviços Disponíveis
                                                  </h4>
                                                  {(services[sch.id] ?? [])
                                                       .length === 0 ? (
                                                       <p className="text-sm text-muted-foreground italic">
                                                            Nenhum serviço
                                                            cadastrado ainda
                                                       </p>
                                                  ) : (
                                                       <div className="space-y-2">
                                                            {(
                                                                 services[
                                                                      sch.id
                                                                 ] ?? []
                                                            ).map((svc) => (
                                                                 <div
                                                                      key={
                                                                           svc.id
                                                                      }
                                                                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                                                 >
                                                                      <div>
                                                                           <div className="font-medium">
                                                                                {
                                                                                     svc.name
                                                                                }
                                                                           </div>
                                                                           <div className="text-sm text-muted-foreground">
                                                                                {svc.duration_minutes ??
                                                                                     sch.duration_minutes}{" "}
                                                                                min
                                                                                {svc.price &&
                                                                                     ` • R$ ${svc.price}`}
                                                                           </div>
                                                                      </div>
                                                                      <Button
                                                                           variant="ghost"
                                                                           size="sm"
                                                                           onClick={() =>
                                                                                handleDeleteService(
                                                                                     svc.id,
                                                                                     sch.id
                                                                                )
                                                                           }
                                                                      >
                                                                           <Trash2 className="w-4 h-4" />
                                                                      </Button>
                                                                 </div>
                                                            ))}
                                                       </div>
                                                  )}
                                             </div>

                                             {/* Formulário de Novo Serviço */}
                                             <div>
                                                  <h4 className="font-semibold mb-3">
                                                       Adicionar Novo Serviço
                                                  </h4>
                                                  <ServiceForm
                                                       scheduleId={sch.id}
                                                       onSaved={(s) => {
                                                            setServices(
                                                                 (cur) => ({
                                                                      ...cur,
                                                                      [sch.id]:
                                                                           [
                                                                                ...(cur[
                                                                                     sch
                                                                                          .id
                                                                                ] ??
                                                                                     []),
                                                                                s,
                                                                           ],
                                                                 })
                                                            );
                                                            toast.success(
                                                                 "Serviço criado com sucesso!"
                                                            );
                                                       }}
                                                  />
                                             </div>
                                        </CardContent>
                                   </Card>
                              ))}
                         </div>
                    )}
               </div>
          </DashboardLayout>
     );
};

export default Schedules;
