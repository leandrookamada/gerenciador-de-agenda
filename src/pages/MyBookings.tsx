import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useClientAuth } from "@/hooks/useClientAuth";
import {
     listClientBookings,
     listAvailableSlots,
     cancelBooking,
     updateBookingTimeSlot,
     BookingWithDetails,
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
import {
     AlertDialog,
     AlertDialogAction,
     AlertDialogCancel,
     AlertDialogContent,
     AlertDialogDescription,
     AlertDialogFooter,
     AlertDialogHeader,
     AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogHeader,
     DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, LogOut, Trash2, Edit, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { format, addDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatDateLocal, parseDateLocal, addDaysLocal } from "@/lib/dateUtils";

const TEMP_PROFESSIONAL_ID = "00000000-0000-0000-0000-000000000000";

export default function MyBookings() {
     const navigate = useNavigate();
     const { client, logout, isLoading: authLoading } = useClientAuth();
     const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
     const [loading, setLoading] = useState(true);
     const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
     const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
     const [selectedBooking, setSelectedBooking] =
          useState<BookingWithDetails | null>(null);
     const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
     const [selectedNewSlot, setSelectedNewSlot] = useState<TimeSlot | null>(
          null
     );

     useEffect(() => {
          if (!authLoading && !client) {
               navigate("/agendar");
          }
     }, [client, authLoading, navigate]);

     useEffect(() => {
          if (client) {
               loadBookings();
          }
     }, [client]);

     const loadBookings = async () => {
          if (!client) return;

          try {
               setLoading(true);
               const data = await listClientBookings(client.id);
               setBookings(data);
          } catch (error) {
               console.error("Erro ao carregar agendamentos:", error);
               toast.error("Erro ao carregar seus agendamentos");
          } finally {
               setLoading(false);
          }
     };

     const loadAvailableSlotsForReschedule = async (
          booking: BookingWithDetails
     ) => {
          if (!booking.service_type_id) return;

          try {
               const startDate = formatDateLocal(new Date());
               const endDate = formatDateLocal(addDaysLocal(new Date(), 30));

               const slots = await listAvailableSlots(
                    TEMP_PROFESSIONAL_ID,
                    startDate,
                    endDate
               );

               // Filtrar slots do mesmo tipo de serviço
               const filtered = slots.filter(
                    (slot) => slot.service_type_id === booking.service_type_id
               );

               setAvailableSlots(filtered);
          } catch (error) {
               console.error("Erro ao carregar horários:", error);
               toast.error("Erro ao carregar horários disponíveis");
          }
     };

     const handleCancelBooking = async () => {
          if (!selectedBooking) return;

          try {
               await cancelBooking(selectedBooking.id);
               toast.success("Agendamento cancelado com sucesso");
               setCancelDialogOpen(false);
               setSelectedBooking(null);
               loadBookings();
          } catch (error) {
               console.error("Erro ao cancelar agendamento:", error);
               toast.error("Erro ao cancelar agendamento");
          }
     };

     const handleReschedule = async () => {
          if (!selectedBooking || !selectedNewSlot) return;

          try {
               await updateBookingTimeSlot(
                    selectedBooking.id,
                    selectedNewSlot.id
               );
               toast.success("Horário reagendado com sucesso!");
               setRescheduleDialogOpen(false);
               setSelectedBooking(null);
               setSelectedNewSlot(null);
               loadBookings();
          } catch (error) {
               console.error("Erro ao reagendar:", error);
               toast.error("Erro ao reagendar horário");
          }
     };

     const handleLogout = () => {
          logout();
          navigate("/agendar");
          toast.success("Você saiu da sua conta");
     };

     const getStatusBadge = (status: string) => {
          switch (status) {
               case "confirmed":
                    return (
                         <Badge variant="default" className="bg-green-500">
                              Confirmado
                         </Badge>
                    );
               case "cancelled":
                    return <Badge variant="destructive">Cancelado</Badge>;
               case "completed":
                    return (
                         <Badge variant="secondary" className="bg-blue-500">
                              Concluído
                         </Badge>
                    );
               default:
                    return <Badge>{status}</Badge>;
          }
     };

     // Agrupar slots por data para reagendamento
     const slotsByDate = availableSlots.reduce((acc, slot) => {
          if (!acc[slot.slot_date]) {
               acc[slot.slot_date] = [];
          }
          acc[slot.slot_date].push(slot);
          return acc;
     }, {} as Record<string, TimeSlot[]>);

     if (authLoading || !client) {
          return (
               <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-success/5 flex items-center justify-center">
                    <p className="text-muted-foreground">Carregando...</p>
               </div>
          );
     }

     return (
          <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-success/5">
               <div className="container mx-auto px-4 py-8 max-w-4xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                         <div>
                              <h1 className="text-4xl font-bold mb-2">
                                   Meus Agendamentos
                              </h1>
                              <p className="text-muted-foreground">
                                   Olá, {client.name}
                              </p>
                         </div>
                         <Button
                              variant="outline"
                              onClick={handleLogout}
                              className="gap-2"
                         >
                              <LogOut className="w-4 h-4" />
                              Sair
                         </Button>
                    </div>

                    {/* Botão voltar para agendar */}
                    <Button
                         variant="outline"
                         onClick={() => navigate("/agendar")}
                         className="mb-6 gap-2"
                    >
                         <ArrowLeft className="w-4 h-4" />
                         Fazer novo agendamento
                    </Button>

                    {/* Lista de agendamentos */}
                    {loading ? (
                         <div className="text-center py-12">
                              <p className="text-muted-foreground">
                                   Carregando seus agendamentos...
                              </p>
                         </div>
                    ) : bookings.length === 0 ? (
                         <Card>
                              <CardContent className="text-center py-12">
                                   <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                   <p className="text-muted-foreground mb-4">
                                        Você ainda não tem agendamentos
                                   </p>
                                   <Button onClick={() => navigate("/agendar")}>
                                        Fazer primeiro agendamento
                                   </Button>
                              </CardContent>
                         </Card>
                    ) : (
                         <div className="space-y-4">
                              {bookings.map((booking) => (
                                   <Card key={booking.id}>
                                        <CardHeader>
                                             <div className="flex items-start justify-between">
                                                  <div>
                                                       <CardTitle className="flex items-center gap-2">
                                                            {booking
                                                                 .service_type
                                                                 ?.name ||
                                                                 "Atendimento"}
                                                       </CardTitle>
                                                       <CardDescription className="flex items-center gap-4 mt-2">
                                                            <span className="flex items-center gap-1">
                                                                 <Calendar className="w-4 h-4" />
                                                                 {booking.time_slot
                                                                      ? format(
                                                                             parseDateLocal(
                                                                                  booking
                                                                                       .time_slot
                                                                                       .slot_date
                                                                             ),
                                                                             "dd/MM/yyyy",
                                                                             {
                                                                                  locale: ptBR,
                                                                             }
                                                                        )
                                                                      : "Data não definida"}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                 <Clock className="w-4 h-4" />
                                                                 {booking.time_slot
                                                                      ? booking.time_slot.start_time.substring(
                                                                             0,
                                                                             5
                                                                        )
                                                                      : "Horário não definido"}
                                                            </span>
                                                       </CardDescription>
                                                  </div>
                                                  {getStatusBadge(
                                                       booking.status
                                                  )}
                                             </div>
                                        </CardHeader>
                                        <CardContent>
                                             {booking.notes && (
                                                  <p className="text-sm text-muted-foreground mb-4">
                                                       Observações:{" "}
                                                       {booking.notes}
                                                  </p>
                                             )}
                                             {booking.status ===
                                                  "confirmed" && (
                                                  <div className="flex gap-2">
                                                       <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                 setSelectedBooking(
                                                                      booking
                                                                 );
                                                                 loadAvailableSlotsForReschedule(
                                                                      booking
                                                                 );
                                                                 setRescheduleDialogOpen(
                                                                      true
                                                                 );
                                                            }}
                                                            className="gap-2"
                                                       >
                                                            <Edit className="w-4 h-4" />
                                                            Reagendar
                                                       </Button>
                                                       <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                 setSelectedBooking(
                                                                      booking
                                                                 );
                                                                 setCancelDialogOpen(
                                                                      true
                                                                 );
                                                            }}
                                                            className="gap-2 text-destructive hover:text-destructive"
                                                       >
                                                            <Trash2 className="w-4 h-4" />
                                                            Cancelar
                                                       </Button>
                                                  </div>
                                             )}
                                        </CardContent>
                                   </Card>
                              ))}
                         </div>
                    )}

                    {/* Dialog de cancelamento */}
                    <AlertDialog
                         open={cancelDialogOpen}
                         onOpenChange={setCancelDialogOpen}
                    >
                         <AlertDialogContent>
                              <AlertDialogHeader>
                                   <AlertDialogTitle>
                                        Cancelar agendamento
                                   </AlertDialogTitle>
                                   <AlertDialogDescription>
                                        Tem certeza que deseja cancelar este
                                        agendamento? Esta ação não pode ser
                                        desfeita.
                                   </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                   <AlertDialogCancel>
                                        Não, manter
                                   </AlertDialogCancel>
                                   <AlertDialogAction
                                        onClick={handleCancelBooking}
                                        className="bg-destructive hover:bg-destructive/90"
                                   >
                                        Sim, cancelar
                                   </AlertDialogAction>
                              </AlertDialogFooter>
                         </AlertDialogContent>
                    </AlertDialog>

                    {/* Dialog de reagendamento */}
                    <Dialog
                         open={rescheduleDialogOpen}
                         onOpenChange={setRescheduleDialogOpen}
                    >
                         <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                   <DialogTitle>
                                        Reagendar para outro horário
                                   </DialogTitle>
                                   <DialogDescription>
                                        Selecione um novo horário disponível
                                   </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4">
                                   {Object.keys(slotsByDate).length === 0 ? (
                                        <p className="text-center text-muted-foreground py-4">
                                             Nenhum horário disponível no
                                             momento
                                        </p>
                                   ) : (
                                        Object.entries(slotsByDate).map(
                                             ([date, slots]) => (
                                                  <div key={date}>
                                                       <h3 className="font-semibold mb-2">
                                                            {format(
                                                                 new Date(date),
                                                                 "EEEE, dd 'de' MMMM",
                                                                 {
                                                                      locale: ptBR,
                                                                 }
                                                            )}
                                                       </h3>
                                                       <div className="grid grid-cols-4 gap-2">
                                                            {slots.map(
                                                                 (slot) => (
                                                                      <Button
                                                                           key={
                                                                                slot.id
                                                                           }
                                                                           variant={
                                                                                selectedNewSlot?.id ===
                                                                                slot.id
                                                                                     ? "default"
                                                                                     : "outline"
                                                                           }
                                                                           size="sm"
                                                                           onClick={() =>
                                                                                setSelectedNewSlot(
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
                                        )
                                   )}
                              </div>

                              <div className="flex justify-end gap-2 mt-4">
                                   <Button
                                        variant="outline"
                                        onClick={() => {
                                             setRescheduleDialogOpen(false);
                                             setSelectedNewSlot(null);
                                        }}
                                   >
                                        Cancelar
                                   </Button>
                                   <Button
                                        onClick={handleReschedule}
                                        disabled={!selectedNewSlot}
                                   >
                                        Confirmar novo horário
                                   </Button>
                              </div>
                         </DialogContent>
                    </Dialog>
               </div>
          </div>
     );
}
