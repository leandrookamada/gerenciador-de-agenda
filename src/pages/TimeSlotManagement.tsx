import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
     listActiveServiceTypes,
     listTimeSlotsByDate,
     generateTimeSlots,
     deleteTimeSlotsByDate,
     ServiceType,
     TimeSlot,
} from "@/integrations/supabase/scheduling";
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
import { Calendar } from "@/components/ui/calendar";
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatDateLocal } from "@/lib/dateUtils";

// ID temporário para desenvolvimento
const TEMP_PROFESSIONAL_ID = "00000000-0000-0000-0000-000000000000";

const TimeSlotManagement = () => {
     const [selectedDate, setSelectedDate] = useState<Date | undefined>(
          new Date()
     );
     const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
     const [slots, setSlots] = useState<TimeSlot[]>([]);
     const [loading, setLoading] = useState(false);

     const [formData, setFormData] = useState({
          startTime: "09:00",
          endTime: "18:00",
          serviceTypeId: "",
     });

     useEffect(() => {
          loadServiceTypes();
     }, []);

     useEffect(() => {
          if (selectedDate) {
               loadSlots();
          }
     }, [selectedDate]);

     const loadServiceTypes = async () => {
          try {
               const data = await listActiveServiceTypes(TEMP_PROFESSIONAL_ID);
               setServiceTypes(data);
               if (data.length > 0) {
                    setFormData((prev) => ({
                         ...prev,
                         serviceTypeId: data[0].id,
                    }));
               }
          } catch (error) {
               console.error("Erro ao carregar tipos de serviço:", error);
               toast.error("Erro ao carregar tipos de serviço");
          }
     };

     const loadSlots = async () => {
          if (!selectedDate) return;

          try {
               const dateStr = formatDateLocal(selectedDate);
               const data = await listTimeSlotsByDate(
                    TEMP_PROFESSIONAL_ID,
                    dateStr
               );
               setSlots(data);
          } catch (error) {
               console.error("Erro ao carregar horários:", error);
               toast.error("Erro ao carregar horários");
          }
     };

     const handleGenerateSlots = async () => {
          if (!selectedDate || !formData.serviceTypeId) {
               toast.error("Selecione uma data e um tipo de serviço");
               return;
          }

          const selectedType = serviceTypes.find(
               (t) => t.id === formData.serviceTypeId
          );
          if (!selectedType) return;

          setLoading(true);

          try {
               const dateStr = formatDateLocal(selectedDate);

               const slotsCreated = await generateTimeSlots(
                    TEMP_PROFESSIONAL_ID,
                    dateStr,
                    formData.startTime,
                    formData.endTime,
                    selectedType.duration_minutes,
                    formData.serviceTypeId
               );

               if (slotsCreated > 0) {
                    toast.success(`${slotsCreated} horários criados!`);
               } else {
                    toast.info(
                         "Nenhum horário novo foi criado (já existem horários neste período)"
                    );
               }
               await loadSlots();
          } catch (error) {
               console.error("Erro ao gerar horários:", error);
               toast.error("Erro ao gerar horários");
          } finally {
               setLoading(false);
          }
     };

     const handleDeleteDaySlots = async () => {
          if (!selectedDate) return;
          if (!confirm("Deseja realmente excluir todos os horários deste dia?"))
               return;

          try {
               const dateStr = formatDateLocal(selectedDate);
               await deleteTimeSlotsByDate(TEMP_PROFESSIONAL_ID, dateStr);
               toast.success("Horários excluídos!");
               loadSlots();
          } catch (error) {
               console.error("Erro ao excluir horários:", error);
               toast.error("Erro ao excluir horários");
          }
     };

     const selectedServiceType = serviceTypes.find(
          (t) => t.id === formData.serviceTypeId
     );

     return (
          <DashboardLayout>
               <div className="space-y-6">
                    <div>
                         <h2 className="text-3xl font-bold">
                              Gerenciar Horários
                         </h2>
                         <p className="text-muted-foreground">
                              Selecione uma data e libere os horários
                              disponíveis
                         </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                         {/* Calendário */}
                         <Card>
                              <CardHeader>
                                   <CardTitle className="flex items-center gap-2">
                                        <CalendarIcon className="w-5 h-5" />
                                        Selecione a Data
                                   </CardTitle>
                              </CardHeader>
                              <CardContent className="flex justify-center">
                                   <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        locale={ptBR}
                                        className="rounded-md border"
                                   />
                              </CardContent>
                         </Card>

                         {/* Formulário para gerar horários */}
                         <Card>
                              <CardHeader>
                                   <CardTitle>Liberar Horários</CardTitle>
                                   <CardDescription>
                                        {selectedDate
                                             ? format(
                                                    selectedDate,
                                                    "dd 'de' MMMM 'de' yyyy",
                                                    { locale: ptBR }
                                               )
                                             : "Selecione uma data no calendário"}
                                   </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                   {serviceTypes.length === 0 ? (
                                        <div className="text-center py-8">
                                             <p className="text-sm text-muted-foreground mb-4">
                                                  Você precisa criar tipos de
                                                  serviço antes de liberar
                                                  horários
                                             </p>
                                             <Button
                                                  variant="outline"
                                                  onClick={() =>
                                                       (window.location.href =
                                                            "/service-types")
                                                  }
                                             >
                                                  Ir para Tipos de Serviço
                                             </Button>
                                        </div>
                                   ) : (
                                        <>
                                             <div className="space-y-2">
                                                  <Label htmlFor="service-type">
                                                       Tipo de Serviço
                                                  </Label>
                                                  <Select
                                                       value={
                                                            formData.serviceTypeId
                                                       }
                                                       onValueChange={(value) =>
                                                            setFormData({
                                                                 ...formData,
                                                                 serviceTypeId:
                                                                      value,
                                                            })
                                                       }
                                                  >
                                                       <SelectTrigger id="service-type">
                                                            <SelectValue placeholder="Selecione o tipo de serviço" />
                                                       </SelectTrigger>
                                                       <SelectContent>
                                                            {serviceTypes.map(
                                                                 (type) => (
                                                                      <SelectItem
                                                                           key={
                                                                                type.id
                                                                           }
                                                                           value={
                                                                                type.id
                                                                           }
                                                                      >
                                                                           {
                                                                                type.name
                                                                           }{" "}
                                                                           (
                                                                           {
                                                                                type.duration_minutes
                                                                           }{" "}
                                                                           min)
                                                                      </SelectItem>
                                                                 )
                                                            )}
                                                       </SelectContent>
                                                  </Select>
                                                  {selectedServiceType && (
                                                       <p className="text-xs text-muted-foreground">
                                                            Horários de{" "}
                                                            {
                                                                 selectedServiceType.duration_minutes
                                                            }{" "}
                                                            minutos serão
                                                            criados
                                                       </p>
                                                  )}
                                             </div>

                                             <div className="grid grid-cols-2 gap-4">
                                                  <div className="space-y-2">
                                                       <Label htmlFor="start-time">
                                                            Horário Inicial
                                                       </Label>
                                                       <Input
                                                            id="start-time"
                                                            type="time"
                                                            value={
                                                                 formData.startTime
                                                            }
                                                            onChange={(e) =>
                                                                 setFormData({
                                                                      ...formData,
                                                                      startTime:
                                                                           e
                                                                                .target
                                                                                .value,
                                                                 })
                                                            }
                                                       />
                                                  </div>
                                                  <div className="space-y-2">
                                                       <Label htmlFor="end-time">
                                                            Horário Final
                                                       </Label>
                                                       <Input
                                                            id="end-time"
                                                            type="time"
                                                            value={
                                                                 formData.endTime
                                                            }
                                                            onChange={(e) =>
                                                                 setFormData({
                                                                      ...formData,
                                                                      endTime: e
                                                                           .target
                                                                           .value,
                                                                 })
                                                            }
                                                       />
                                                  </div>
                                             </div>

                                             <Button
                                                  onClick={handleGenerateSlots}
                                                  disabled={
                                                       loading || !selectedDate
                                                  }
                                                  className="w-full"
                                             >
                                                  <Plus className="w-4 h-4 mr-2" />
                                                  {loading
                                                       ? "Gerando..."
                                                       : "Gerar Horários"}
                                             </Button>
                                        </>
                                   )}
                              </CardContent>
                         </Card>
                    </div>

                    {/* Lista de horários do dia */}
                    {selectedDate && (
                         <Card>
                              <CardHeader>
                                   <div className="flex items-center justify-between">
                                        <div>
                                             <CardTitle>
                                                  Horários Liberados
                                             </CardTitle>
                                             <CardDescription>
                                                  {format(
                                                       selectedDate,
                                                       "dd 'de' MMMM",
                                                       { locale: ptBR }
                                                  )}{" "}
                                                  - {slots.length} horário
                                                  {slots.length !== 1
                                                       ? "s"
                                                       : ""}
                                             </CardDescription>
                                        </div>
                                        {slots.length > 0 && (
                                             <Button
                                                  variant="destructive"
                                                  size="sm"
                                                  onClick={handleDeleteDaySlots}
                                             >
                                                  <Trash2 className="w-4 h-4 mr-2" />
                                                  Excluir Todos
                                             </Button>
                                        )}
                                   </div>
                              </CardHeader>
                              <CardContent>
                                   {slots.length === 0 ? (
                                        <div className="text-center py-8">
                                             <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                             <p className="text-sm text-muted-foreground">
                                                  Nenhum horário liberado para
                                                  esta data
                                             </p>
                                        </div>
                                   ) : (
                                        <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
                                             {slots.map((slot) => {
                                                  const serviceType =
                                                       serviceTypes.find(
                                                            (t) =>
                                                                 t.id ===
                                                                 slot.service_type_id
                                                       );
                                                  return (
                                                       <div
                                                            key={slot.id}
                                                            className={`p-3 border rounded-lg text-center ${
                                                                 slot.is_available
                                                                      ? "bg-green-50 border-green-200"
                                                                      : "bg-gray-50 border-gray-200 opacity-50"
                                                            }`}
                                                       >
                                                            <div className="font-semibold">
                                                                 {slot.start_time.substring(
                                                                      0,
                                                                      5
                                                                 )}{" "}
                                                                 -{" "}
                                                                 {slot.end_time.substring(
                                                                      0,
                                                                      5
                                                                 )}
                                                            </div>
                                                            {serviceType && (
                                                                 <div className="text-xs text-muted-foreground mt-1">
                                                                      {
                                                                           serviceType.name
                                                                      }
                                                                 </div>
                                                            )}
                                                            <div className="text-xs mt-1">
                                                                 {slot.is_available ? (
                                                                      <span className="text-green-600">
                                                                           Disponível
                                                                      </span>
                                                                 ) : (
                                                                      <span className="text-gray-600">
                                                                           Reservado
                                                                      </span>
                                                                 )}
                                                            </div>
                                                       </div>
                                                  );
                                             })}
                                        </div>
                                   )}
                              </CardContent>
                         </Card>
                    )}
               </div>
          </DashboardLayout>
     );
};

export default TimeSlotManagement;
