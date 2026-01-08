import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
     listActiveServiceTypes,
     listAvailableSlots,
     markSlotAsBooked,
     createBooking,
     ServiceType,
     TimeSlot,
} from "@/integrations/supabase/scheduling";
import { useClientAuth } from "@/hooks/useClientAuth";
import ClientAuthForm from "@/components/auth/ClientAuthForm";
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
     LogOut,
     CalendarCheck,
} from "lucide-react";
import { toast } from "sonner";
import { format, addDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
     openWhatsApp,
     getClientConfirmationMessage,
     getProfessionalNotificationMessage,
} from "@/lib/whatsapp";
import { formatDateLocal, parseDateLocal, addDaysLocal } from "@/lib/dateUtils";

// Por enquanto, usando ID fixo. Depois virá da URL: /agendar/:professionalId
const TEMP_PROFESSIONAL_ID = "00000000-0000-0000-0000-000000000000";

const PublicBooking = () => {
     const navigate = useNavigate();
     const { professionalId } = useParams<{ professionalId?: string }>();
     const [searchParams] = useSearchParams();
     const profId = professionalId || TEMP_PROFESSIONAL_ID;
     const tipoParam = searchParams.get("tipo");

     const { client, login, logout } = useClientAuth();

     const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
     const [selectedServiceType, setSelectedServiceType] = useState<string>("");
     const [slots, setSlots] = useState<TimeSlot[]>([]);
     const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
     const [loading, setLoading] = useState(false);

     const [formData, setFormData] = useState({
          patientPhone: "",
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
               const startDate = formatDateLocal(new Date());
               const endDate = formatDateLocal(addDaysLocal(new Date(), 30));

               const data = await listAvailableSlots(
                    profId,
                    startDate,
                    endDate
               );

               // Filtrar APENAS slots do tipo de serviço selecionado
               const filtered = data.filter(
                    (slot) => slot.service_type_id === selectedServiceType
               );

               setSlots(filtered);
          } catch (error) {
               console.error("Erro ao carregar horários:", error);
               toast.error("Erro ao carregar horários disponíveis");
          }
     };

     const handleBooking = async (e: React.FormEvent) => {
          e.preventDefault();
          if (!selectedSlot || !client) {
               toast.error("Selecione um horário e faça login");
               return;
          }

          setLoading(true);

          try {
               // 1. Marcar slot como ocupado
               await markSlotAsBooked(selectedSlot.id);

               // 2. Criar agendamento usando a função do scheduling.ts
               await createBooking({
                    professional_id: profId,
                    service_type_id: selectedServiceType,
                    time_slot_id: selectedSlot.id,
                    client_id: client.id,
                    patient_name: client.name,
                    patient_phone: formData.patientPhone || client.phone || "",
                    patient_email: client.email,
                    notes: formData.notes || null,
                    status: "confirmed",
               });

               // 3. Preparar dados para mensagens WhatsApp
               const selectedType = serviceTypes.find(
                    (t) => t.id === selectedServiceType
               );
               const dateFormatted = format(
                    parseDateLocal(selectedSlot.slot_date),
                    "dd/MM/yyyy",
                    { locale: ptBR }
               );
               const timeFormatted = selectedSlot.start_time.substring(0, 5);

               // 4. Notificar APENAS o profissional via WhatsApp
               const professionalPhone =
                    localStorage.getItem("professional_phone");

               if (professionalPhone) {
                    const professionalMessage =
                         getProfessionalNotificationMessage({
                              patientName: client.name,
                              patientPhone:
                                   formData.patientPhone || client.phone || "",
                              serviceName: selectedType?.name || "Atendimento",
                              date: dateFormatted,
                              time: timeFormatted,
                         });

                    // Abrir WhatsApp do PROFISSIONAL para ele ver a notificação
                    setTimeout(() => {
                         openWhatsApp(professionalPhone, professionalMessage);
                    }, 500);

                    toast.success(
                         "Agendamento realizado! O profissional será notificado via WhatsApp.",
                         {
                              duration: 5000,
                         }
                    );
               } else {
                    toast.success("Agendamento realizado com sucesso!", {
                         description:
                              "O profissional entrará em contato para confirmar.",
                         duration: 5000,
                    });
               }

               // Resetar formulário
               setFormData({
                    patientPhone: "",
                    notes: "",
               });
               setSelectedSlot(null);
               loadAvailableSlots();

               // Redirecionar para Meus Agendamentos após 2 segundos
               setTimeout(() => {
                    navigate("/meus-agendamentos");
               }, 2000);
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
                    <div className="flex items-center justify-between mb-8">
                         <div className="text-center flex-1">
                              <h1 className="text-4xl font-bold mb-2">
                                   Agendar Atendimento
                              </h1>
                              <p className="text-muted-foreground">
                                   {client
                                        ? `Olá, ${client.name}!`
                                        : "Selecione o tipo de serviço e escolha um horário"}
                              </p>
                         </div>
                         {client && (
                              <div className="flex gap-2">
                                   <Button
                                        variant="outline"
                                        onClick={() =>
                                             navigate("/meus-agendamentos")
                                        }
                                        className="gap-2"
                                   >
                                        <CalendarCheck className="w-4 h-4" />
                                        Meus Agendamentos
                                   </Button>
                                   <Button
                                        variant="outline"
                                        onClick={logout}
                                        className="gap-2"
                                   >
                                        <LogOut className="w-4 h-4" />
                                        Sair
                                   </Button>
                              </div>
                         )}
                    </div>

                    {/* Formulário de autenticação do cliente */}
                    {!client ? (
                         <ClientAuthForm onSuccess={login} showPhone={true} />
                    ) : (
                         <>
                              {/* Seleção de tipo de serviço - oculta se tipo vier da URL */}
                              {!tipoParam && (
                                   <Card className="mb-6">
                                        <CardHeader>
                                             <CardTitle className="flex items-center gap-2">
                                                  <Clock className="w-5 h-5" />
                                                  Tipo de Serviço
                                             </CardTitle>
                                             <CardDescription>
                                                  Escolha o tipo de atendimento
                                                  desejado
                                             </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                             {serviceTypes.length === 0 ? (
                                                  <p className="text-center text-muted-foreground py-4">
                                                       Nenhum serviço disponível
                                                       no momento
                                                  </p>
                                             ) : (
                                                  <div className="grid gap-3 md:grid-cols-2">
                                                       {serviceTypes.map(
                                                            (type) => (
                                                                 <div
                                                                      key={
                                                                           type.id
                                                                      }
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
                                                                           {
                                                                                type.name
                                                                           }
                                                                      </div>
                                                                      <div className="text-sm text-muted-foreground mt-1">
                                                                           Duração:{" "}
                                                                           {
                                                                                type.duration_minutes
                                                                           }{" "}
                                                                           minutos
                                                                      </div>
                                                                      {type.description && (
                                                                           <div className="text-xs text-muted-foreground mt-2">
                                                                                {
                                                                                     type.description
                                                                                }
                                                                           </div>
                                                                      )}
                                                                 </div>
                                                            )
                                                       )}
                                                  </div>
                                             )}
                                        </CardContent>
                                   </Card>
                              )}

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
                                             {Object.keys(slotsByDate)
                                                  .length === 0 ? (
                                                  <div className="text-center py-8">
                                                       <p className="text-muted-foreground">
                                                            Nenhum horário
                                                            disponível para este
                                                            serviço
                                                       </p>
                                                  </div>
                                             ) : (
                                                  <div className="space-y-6">
                                                       {Object.entries(
                                                            slotsByDate
                                                       ).map(
                                                            ([
                                                                 date,
                                                                 daySlots,
                                                            ]) => (
                                                                 <div
                                                                      key={date}
                                                                 >
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

                              {/* Formulário de dados adicionais */}
                              {selectedSlot && (
                                   <Card>
                                        <CardHeader>
                                             <CardTitle className="flex items-center gap-2">
                                                  <User className="w-5 h-5" />
                                                  Confirmar Agendamento
                                             </CardTitle>
                                             <CardDescription>
                                                  Horário selecionado:{" "}
                                                  {format(
                                                       new Date(
                                                            selectedSlot.slot_date
                                                       ),
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
                                                       <Label>Nome</Label>
                                                       <Input
                                                            value={client.name}
                                                            disabled
                                                            className="bg-muted"
                                                       />
                                                  </div>

                                                  <div className="space-y-2">
                                                       <Label>E-mail</Label>
                                                       <Input
                                                            value={client.email}
                                                            disabled
                                                            className="bg-muted"
                                                       />
                                                  </div>

                                                  <div className="space-y-2">
                                                       <Label htmlFor="phone">
                                                            Telefone{" "}
                                                            {client.phone
                                                                 ? "(opcional)"
                                                                 : "*"}
                                                       </Label>
                                                       <Input
                                                            id="phone"
                                                            type="tel"
                                                            placeholder="(00) 00000-0000"
                                                            value={
                                                                 formData.patientPhone
                                                            }
                                                            onChange={(e) =>
                                                                 setFormData({
                                                                      ...formData,
                                                                      patientPhone:
                                                                           e
                                                                                .target
                                                                                .value,
                                                                 })
                                                            }
                                                            required={
                                                                 !client.phone
                                                            }
                                                       />
                                                       {!client.phone && (
                                                            <p className="text-xs text-muted-foreground">
                                                                 Precisamos de
                                                                 um número de
                                                                 contato
                                                            </p>
                                                       )}
                                                  </div>

                                                  <div className="space-y-2">
                                                       <Label htmlFor="notes">
                                                            Observações
                                                            (opcional)
                                                       </Label>
                                                       <Textarea
                                                            id="notes"
                                                            placeholder="Alguma informação adicional"
                                                            value={
                                                                 formData.notes
                                                            }
                                                            onChange={(e) =>
                                                                 setFormData({
                                                                      ...formData,
                                                                      notes: e
                                                                           .target
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
                         </>
                    )}
               </div>
          </div>
     );
};

export default PublicBooking;
