import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
     listActiveServiceTypes,
     listAvailableSlots,
     markSlotAsBooked,
     ServiceType,
     TimeSlot,
} from "@/integrations/supabase/scheduling";
import { supabase } from "@/integrations/supabase/client";
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
import { Textarea } from "@/components/ui/textarea";
import {
     Calendar,
     Clock,
     User,
     Mail,
     Phone,
     MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { format, addDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
     openWhatsApp,
     getClientConfirmationMessage,
     getProfessionalNotificationMessage,
} from "@/lib/whatsapp";

// Por enquanto, usando ID fixo. Depois virá da URL: /agendar/:professionalId
const TEMP_PROFESSIONAL_ID = "00000000-0000-0000-0000-000000000000";

const PublicBooking = () => {
     const { professionalId } = useParams<{ professionalId?: string }>();
     const [searchParams] = useSearchParams();
     const profId = professionalId || TEMP_PROFESSIONAL_ID;
     const tipoParam = searchParams.get("tipo");

     const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
     const [selectedServiceType, setSelectedServiceType] = useState<string>("");
     const [slots, setSlots] = useState<TimeSlot[]>([]);
     const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
     const [loading, setLoading] = useState(false);

     const [formData, setFormData] = useState({
          patientName: "",
          patientPhone: "",
          patientEmail: "",
          notes: "",
     });

     useEffect(() => {
          loadServiceTypes();
     }, []);

     useEffect(() => {
          if (selectedServiceType) {
               loadAvailableSlots();
          }
     }, [selectedServiceType]);

     const loadServiceTypes = async () => {
          try {
               const data = await listActiveServiceTypes(profId);
               setServiceTypes(data);

               // Se veio com parâmetro "tipo" na URL, pré-selecionar
               if (tipoParam && data.find((t) => t.id === tipoParam)) {
                    setSelectedServiceType(tipoParam);
               }
          } catch (error) {
               console.error("Erro ao carregar tipos de serviço:", error);
               toast.error("Erro ao carregar tipos de serviço");
          }
     };

     const loadAvailableSlots = async () => {
          try {
               const startDate = format(startOfDay(new Date()), "yyyy-MM-dd");
               const endDate = format(addDays(new Date(), 30), "yyyy-MM-dd");

               const data = await listAvailableSlots(
                    profId,
                    startDate,
                    endDate
               );

               // Filtrar slots do tipo de serviço selecionado ou sem tipo definido
               const filtered = data.filter(
                    (slot) =>
                         !slot.service_type_id ||
                         slot.service_type_id === selectedServiceType
               );

               setSlots(filtered);
          } catch (error) {
               console.error("Erro ao carregar horários:", error);
               toast.error("Erro ao carregar horários disponíveis");
          }
     };

     const handleBooking = async (e: React.FormEvent) => {
          e.preventDefault();
          if (!selectedSlot) {
               toast.error("Selecione um horário");
               return;
          }

          setLoading(true);

          try {
               // 1. Marcar slot como ocupado
               await markSlotAsBooked(selectedSlot.id);

               // 2. Criar agendamento
               const { error } = await (supabase as any)
                    .from("bookings")
                    .insert({
                         professional_id: profId,
                         service_type_id: selectedServiceType,
                         time_slot_id: selectedSlot.id,
                         patient_name: formData.patientName,
                         patient_phone: formData.patientPhone,
                         patient_email: formData.patientEmail || null,
                         notes: formData.notes || null,
                         status: "confirmed",
                    });

               if (error) throw error;

               // 3. Preparar dados para mensagens WhatsApp
               const selectedType = serviceTypes.find(
                    (t) => t.id === selectedServiceType
               );
               const dateFormatted = format(
                    new Date(selectedSlot.slot_date),
                    "dd/MM/yyyy",
                    { locale: ptBR }
               );
               const timeFormatted = selectedSlot.start_time.substring(0, 5);

               // 4. Enviar confirmação para o cliente via WhatsApp
               const clientMessage = getClientConfirmationMessage({
                    patientName: formData.patientName,
                    serviceName: selectedType?.name || "Atendimento",
                    date: dateFormatted,
                    time: timeFormatted,
               });

               toast.success("Agendamento realizado com sucesso!", {
                    action: {
                         label: "Abrir WhatsApp",
                         onClick: () =>
                              openWhatsApp(
                                   formData.patientPhone,
                                   clientMessage
                              ),
                    },
                    duration: 10000,
               });

               // 5. Notificar o profissional
               const professionalPhone =
                    localStorage.getItem("professional_phone");
               if (professionalPhone) {
                    const professionalMessage =
                         getProfessionalNotificationMessage({
                              patientName: formData.patientName,
                              patientPhone: formData.patientPhone,
                              serviceName: selectedType?.name || "Atendimento",
                              date: dateFormatted,
                              time: timeFormatted,
                         });

                    // Abrir WhatsApp do profissional em outra aba
                    setTimeout(() => {
                         openWhatsApp(professionalPhone, professionalMessage);
                    }, 2000);
               }

               // 6. Abrir WhatsApp do cliente com confirmação
               setTimeout(() => {
                    openWhatsApp(formData.patientPhone, clientMessage);
               }, 1000);

               // Resetar formulário
               setFormData({
                    patientName: "",
                    patientPhone: "",
                    patientEmail: "",
                    notes: "",
               });
               setSelectedSlot(null);
               loadAvailableSlots();
          } catch (error) {
               console.error("Erro ao realizar agendamento:", error);
               toast.error("Erro ao realizar agendamento");
          } finally {
               setLoading(false);
          }
     };

     // Agrupar slots por data
     const slotsByDate = slots.reduce((acc, slot) => {
          if (!acc[slot.slot_date]) {
               acc[slot.slot_date] = [];
          }
          acc[slot.slot_date].push(slot);
          return acc;
     }, {} as Record<string, TimeSlot[]>);

     const selectedType = serviceTypes.find(
          (t) => t.id === selectedServiceType
     );

     return (
          <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-success/5">
               <div className="container mx-auto px-4 py-8 max-w-4xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                         <h1 className="text-4xl font-bold mb-2">
                              Agendar Atendimento
                         </h1>
                         <p className="text-muted-foreground">
                              Selecione o tipo de serviço e escolha um horário
                              disponível
                         </p>
                    </div>

                    {/* Seleção de tipo de serviço */}
                    <Card className="mb-6">
                         <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                   <Clock className="w-5 h-5" />
                                   Tipo de Serviço
                              </CardTitle>
                              <CardDescription>
                                   Escolha o tipo de atendimento desejado
                              </CardDescription>
                         </CardHeader>
                         <CardContent>
                              {serviceTypes.length === 0 ? (
                                   <p className="text-center text-muted-foreground py-4">
                                        Nenhum serviço disponível no momento
                                   </p>
                              ) : (
                                   <div className="grid gap-3 md:grid-cols-2">
                                        {serviceTypes.map((type) => (
                                             <div
                                                  key={type.id}
                                                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                       selectedServiceType ===
                                                       type.id
                                                            ? "border-primary bg-primary/5"
                                                            : "border-border hover:border-primary/50"
                                                  }`}
                                                  onClick={() =>
                                                       setSelectedServiceType(
                                                            type.id
                                                       )
                                                  }
                                             >
                                                  <div className="font-semibold">
                                                       {type.name}
                                                  </div>
                                                  <div className="text-sm text-muted-foreground mt-1">
                                                       Duração:{" "}
                                                       {type.duration_minutes}{" "}
                                                       minutos
                                                  </div>
                                                  {type.description && (
                                                       <div className="text-xs text-muted-foreground mt-2">
                                                            {type.description}
                                                       </div>
                                                  )}
                                             </div>
                                        ))}
                                   </div>
                              )}
                         </CardContent>
                    </Card>

                    {/* Horários disponíveis */}
                    {selectedServiceType && (
                         <Card className="mb-6">
                              <CardHeader>
                                   <CardTitle className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5" />
                                        Horários Disponíveis
                                   </CardTitle>
                                   <CardDescription>
                                        {selectedType
                                             ? `${selectedType.name} - ${selectedType.duration_minutes} minutos`
                                             : ""}
                                   </CardDescription>
                              </CardHeader>
                              <CardContent>
                                   {Object.keys(slotsByDate).length === 0 ? (
                                        <div className="text-center py-8">
                                             <p className="text-muted-foreground">
                                                  Nenhum horário disponível para
                                                  este serviço
                                             </p>
                                        </div>
                                   ) : (
                                        <div className="space-y-6">
                                             {Object.entries(slotsByDate).map(
                                                  ([date, daySlots]) => (
                                                       <div key={date}>
                                                            <h3 className="font-semibold mb-3">
                                                                 {format(
                                                                      new Date(
                                                                           date
                                                                      ),
                                                                      "EEEE, dd 'de' MMMM",
                                                                      {
                                                                           locale: ptBR,
                                                                      }
                                                                 )}
                                                            </h3>
                                                            <div className="grid gap-2 md:grid-cols-4">
                                                                 {daySlots.map(
                                                                      (
                                                                           slot
                                                                      ) => (
                                                                           <Button
                                                                                key={
                                                                                     slot.id
                                                                                }
                                                                                variant={
                                                                                     selectedSlot?.id ===
                                                                                     slot.id
                                                                                          ? "default"
                                                                                          : "outline"
                                                                                }
                                                                                className="w-full"
                                                                                onClick={() =>
                                                                                     setSelectedSlot(
                                                                                          slot
                                                                                     )
                                                                                }
                                                                           >
                                                                                {slot.start_time.substring(
                                                                                     0,
                                                                                     5
                                                                                )}
                                                                           </Button>
                                                                      )
                                                                 )}
                                                            </div>
                                                       </div>
                                                  )
                                             )}
                                        </div>
                                   )}
                              </CardContent>
                         </Card>
                    )}

                    {/* Formulário de dados do paciente */}
                    {selectedSlot && (
                         <Card>
                              <CardHeader>
                                   <CardTitle className="flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        Seus Dados
                                   </CardTitle>
                                   <CardDescription>
                                        Horário selecionado:{" "}
                                        {format(
                                             new Date(selectedSlot.slot_date),
                                             "dd/MM/yyyy",
                                             { locale: ptBR }
                                        )}{" "}
                                        às{" "}
                                        {selectedSlot.start_time.substring(
                                             0,
                                             5
                                        )}
                                   </CardDescription>
                              </CardHeader>
                              <CardContent>
                                   <form
                                        onSubmit={handleBooking}
                                        className="space-y-4"
                                   >
                                        <div className="space-y-2">
                                             <Label htmlFor="name">
                                                  Nome Completo *
                                             </Label>
                                             <Input
                                                  id="name"
                                                  placeholder="Seu nome"
                                                  value={formData.patientName}
                                                  onChange={(e) =>
                                                       setFormData({
                                                            ...formData,
                                                            patientName:
                                                                 e.target.value,
                                                       })
                                                  }
                                                  required
                                             />
                                        </div>

                                        <div className="space-y-2">
                                             <Label htmlFor="phone">
                                                  Telefone *
                                             </Label>
                                             <Input
                                                  id="phone"
                                                  type="tel"
                                                  placeholder="(00) 00000-0000"
                                                  value={formData.patientPhone}
                                                  onChange={(e) =>
                                                       setFormData({
                                                            ...formData,
                                                            patientPhone:
                                                                 e.target.value,
                                                       })
                                                  }
                                                  required
                                             />
                                        </div>

                                        <div className="space-y-2">
                                             <Label htmlFor="email">
                                                  E-mail (opcional)
                                             </Label>
                                             <Input
                                                  id="email"
                                                  type="email"
                                                  placeholder="seu@email.com"
                                                  value={formData.patientEmail}
                                                  onChange={(e) =>
                                                       setFormData({
                                                            ...formData,
                                                            patientEmail:
                                                                 e.target.value,
                                                       })
                                                  }
                                             />
                                        </div>

                                        <div className="space-y-2">
                                             <Label htmlFor="notes">
                                                  Observações (opcional)
                                             </Label>
                                             <Textarea
                                                  id="notes"
                                                  placeholder="Alguma informação adicional"
                                                  value={formData.notes}
                                                  onChange={(e) =>
                                                       setFormData({
                                                            ...formData,
                                                            notes: e.target
                                                                 .value,
                                                       })
                                                  }
                                                  rows={3}
                                             />
                                        </div>

                                        <Button
                                             type="submit"
                                             disabled={loading}
                                             className="w-full"
                                             size="lg"
                                        >
                                             {loading
                                                  ? "Agendando..."
                                                  : "Confirmar Agendamento"}
                                        </Button>
                                   </form>
                              </CardContent>
                         </Card>
                    )}
               </div>
          </div>
     );
};

export default PublicBooking;
