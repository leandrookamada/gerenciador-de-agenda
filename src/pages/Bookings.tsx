import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
     listBookings,
     cancelBooking,
     BookingWithDetails,
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
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
     Calendar,
     Clock,
     User,
     Phone,
     Mail,
     X,
     CheckCircle,
     AlertCircle,
     MessageCircle,
     CalendarDays,
     List,
} from "lucide-react";
import { toast } from "sonner";
import { format, isSameDay, startOfDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { openWhatsApp } from "@/lib/whatsapp";
import { formatDateLocal, parseDateLocal } from "@/lib/dateUtils";

const TEMP_PROFESSIONAL_ID = "00000000-0000-0000-0000-000000000000";

const statusMap = {
     confirmed: {
          label: "Confirmado",
          color: "bg-green-100 text-green-800",
          icon: CheckCircle,
     },
     cancelled: {
          label: "Cancelado",
          color: "bg-red-100 text-red-800",
          icon: X,
     },
     completed: {
          label: "Concluído",
          color: "bg-blue-100 text-blue-800",
          icon: CheckCircle,
     },
};

const Bookings = () => {
     const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
     const [loading, setLoading] = useState(true);
     const [statusFilter, setStatusFilter] = useState<string>("all");
     const [selectedDate, setSelectedDate] = useState<Date>(new Date());
     const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

     useEffect(() => {
          loadBookings();
     }, [statusFilter]);

     const loadBookings = async () => {
          setLoading(true);
          try {
               const filters: any = {};
               if (statusFilter !== "all") {
                    filters.status = statusFilter;
               }

               const data = await listBookings(TEMP_PROFESSIONAL_ID, filters);
               setBookings(data);
          } catch (error) {
               console.error("Erro ao carregar agendamentos:", error);
               toast.error("Erro ao carregar agendamentos");
          } finally {
               setLoading(false);
          }
     };

     const handleCancelBooking = async (
          bookingId: string,
          patientName: string
     ) => {
          if (
               !confirm(
                    `Deseja realmente cancelar o agendamento de ${patientName}?`
               )
          )
               return;

          try {
               await cancelBooking(bookingId);
               toast.success("Agendamento cancelado e horário liberado!");
               loadBookings();
          } catch (error) {
               console.error("Erro ao cancelar agendamento:", error);
               toast.error("Erro ao cancelar agendamento");
          }
     };

     const handleSendWhatsApp = (booking: BookingWithDetails) => {
          const message = `Olá ${booking.patient_name}! Tudo bem?\n\nEntrando em contato sobre seu agendamento.`;
          openWhatsApp(booking.patient_phone, message);
     };

     const upcomingBookings = bookings.filter(
          (b) => b.status === "confirmed" && b.time_slot?.slot_date
     );

     const pastBookings = bookings.filter(
          (b) =>
               b.status === "cancelled" ||
               b.status === "completed" ||
               (b.time_slot?.slot_date &&
                    new Date(b.time_slot.slot_date) < new Date())
     );

     // Agrupar agendamentos por dia
     const bookingsByDate = bookings.reduce((acc, booking) => {
          if (booking.time_slot?.slot_date) {
               const date = booking.time_slot.slot_date;
               if (!acc[date]) {
                    acc[date] = [];
               }
               acc[date].push(booking);
          }
          return acc;
     }, {} as Record<string, BookingWithDetails[]>);

     // Ordenar agendamentos de cada dia por horário
     Object.keys(bookingsByDate).forEach((date) => {
          bookingsByDate[date].sort((a, b) => {
               const timeA = a.time_slot?.start_time || "";
               const timeB = b.time_slot?.start_time || "";
               return timeA.localeCompare(timeB);
          });
     });

     // Filtrar agendamentos do dia selecionado
     const selectedDateStr = formatDateLocal(selectedDate);
     const bookingsOnSelectedDate = bookingsByDate[selectedDateStr] || [];

     // Obter datas com agendamentos para destacar no calendário
     const datesWithBookings = Object.keys(bookingsByDate).map((date) =>
          parseDateLocal(date)
     );

     // Renderizar um card de agendamento
     const renderBookingCard = (
          booking: BookingWithDetails,
          showDate = false
     ) => {
          const status = statusMap[booking.status];
          const StatusIcon = status.icon;

          return (
               <Card
                    key={booking.id}
                    className="hover:shadow-md transition-shadow"
               >
                    <CardHeader className="pb-3">
                         <div className="flex items-start justify-between">
                              <div className="space-y-1 flex-1">
                                   <CardTitle className="flex items-center gap-2 text-lg">
                                        <User className="w-5 h-5" />
                                        {booking.patient_name}
                                   </CardTitle>
                                   <CardDescription className="flex flex-wrap items-center gap-3">
                                        {showDate && booking.time_slot && (
                                             <span className="flex items-center gap-1">
                                                  <Calendar className="w-4 h-4" />
                                                  {format(
                                                       parseDateLocal(
                                                            booking.time_slot
                                                                 .slot_date
                                                       ),
                                                       "dd/MM/yyyy",
                                                       { locale: ptBR }
                                                  )}
                                             </span>
                                        )}
                                        {booking.time_slot && (
                                             <span className="flex items-center gap-1 font-semibold text-primary">
                                                  <Clock className="w-4 h-4" />
                                                  {booking.time_slot.start_time.substring(
                                                       0,
                                                       5
                                                  )}
                                             </span>
                                        )}
                                        {booking.service_type && (
                                             <span className="text-xs">
                                                  {booking.service_type.name}
                                             </span>
                                        )}
                                   </CardDescription>
                              </div>
                              <div className="flex items-center gap-2">
                                   <Badge
                                        className={status.color}
                                        variant="secondary"
                                   >
                                        <StatusIcon className="w-3 h-3 mr-1" />
                                        {status.label}
                                   </Badge>
                              </div>
                         </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                         <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                   <Phone className="w-4 h-4 text-muted-foreground" />
                                   <span>{booking.patient_phone}</span>
                              </div>
                              {booking.patient_email && (
                                   <div className="flex items-center gap-2 text-sm">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        <span>{booking.patient_email}</span>
                                   </div>
                              )}
                              {booking.notes && (
                                   <div className="text-sm text-muted-foreground pt-2 border-t">
                                        <span className="font-medium">
                                             Obs:
                                        </span>{" "}
                                        {booking.notes}
                                   </div>
                              )}
                              <div className="flex gap-2 pt-2">
                                   <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                             handleSendWhatsApp(booking)
                                        }
                                        className="gap-2"
                                   >
                                        <MessageCircle className="w-4 h-4" />
                                        WhatsApp
                                   </Button>
                                   {booking.status === "confirmed" && (
                                        <Button
                                             variant="outline"
                                             size="sm"
                                             onClick={() =>
                                                  handleCancelBooking(
                                                       booking.id,
                                                       booking.patient_name
                                                  )
                                             }
                                             className="gap-2 text-destructive hover:text-destructive"
                                        >
                                             <X className="w-4 h-4" />
                                             Cancelar
                                        </Button>
                                   )}
                              </div>
                         </div>
                    </CardContent>
               </Card>
          );
     };

     return (
          <DashboardLayout>
               <div className="space-y-6">
                    <div className="flex items-center justify-between">
                         <div>
                              <h2 className="text-3xl font-bold">
                                   Agendamentos
                              </h2>
                              <p className="text-muted-foreground">
                                   Visualize e gerencie seus agendamentos
                              </p>
                         </div>

                         <div className="flex gap-2 items-center">
                              <Select
                                   value={statusFilter}
                                   onValueChange={setStatusFilter}
                              >
                                   <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filtrar por status" />
                                   </SelectTrigger>
                                   <SelectContent>
                                        <SelectItem value="all">
                                             Todos
                                        </SelectItem>
                                        <SelectItem value="confirmed">
                                             Confirmados
                                        </SelectItem>
                                        <SelectItem value="cancelled">
                                             Cancelados
                                        </SelectItem>
                                        <SelectItem value="completed">
                                             Concluídos
                                        </SelectItem>
                                   </SelectContent>
                              </Select>
                         </div>
                    </div>

                    {/* Estatísticas rápidas */}
                    <div className="grid gap-4 md:grid-cols-3">
                         <Card>
                              <CardHeader className="pb-3">
                                   <CardTitle className="text-sm font-medium">
                                        Próximos Agendamentos
                                   </CardTitle>
                              </CardHeader>
                              <CardContent>
                                   <div className="text-2xl font-bold">
                                        {upcomingBookings.length}
                                   </div>
                              </CardContent>
                         </Card>
                         <Card>
                              <CardHeader className="pb-3">
                                   <CardTitle className="text-sm font-medium">
                                        Total de Agendamentos
                                   </CardTitle>
                              </CardHeader>
                              <CardContent>
                                   <div className="text-2xl font-bold">
                                        {bookings.length}
                                   </div>
                              </CardContent>
                         </Card>
                         <Card>
                              <CardHeader className="pb-3">
                                   <CardTitle className="text-sm font-medium">
                                        Cancelados
                                   </CardTitle>
                              </CardHeader>
                              <CardContent>
                                   <div className="text-2xl font-bold">
                                        {
                                             bookings.filter(
                                                  (b) =>
                                                       b.status === "cancelled"
                                             ).length
                                        }
                                   </div>
                              </CardContent>
                         </Card>
                    </div>

                    {/* Tabs para alternar entre visualizações */}
                    <Tabs
                         value={viewMode}
                         onValueChange={(v) =>
                              setViewMode(v as "calendar" | "list")
                         }
                    >
                         <TabsList>
                              <TabsTrigger value="calendar" className="gap-2">
                                   <CalendarDays className="w-4 h-4" />
                                   Por Dia
                              </TabsTrigger>
                              <TabsTrigger value="list" className="gap-2">
                                   <List className="w-4 h-4" />
                                   Lista Completa
                              </TabsTrigger>
                         </TabsList>

                         {/* Visualização por Calendário/Dia */}
                         <TabsContent value="calendar" className="space-y-4">
                              {loading ? (
                                   <Card>
                                        <CardContent className="py-12 text-center">
                                             <p className="text-muted-foreground">
                                                  Carregando agendamentos...
                                             </p>
                                        </CardContent>
                                   </Card>
                              ) : bookings.length === 0 ? (
                                   <Card>
                                        <CardContent className="py-12 text-center">
                                             <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                             <h3 className="text-lg font-semibold mb-2">
                                                  Nenhum agendamento encontrado
                                             </h3>
                                             <p className="text-sm text-muted-foreground">
                                                  Quando clientes agendarem
                                                  horários, eles aparecerão aqui
                                             </p>
                                        </CardContent>
                                   </Card>
                              ) : (
                                   <div className="grid md:grid-cols-[350px_1fr] gap-6">
                                        {/* Calendário */}
                                        <Card>
                                             <CardHeader>
                                                  <CardTitle className="text-lg">
                                                       Selecione um dia
                                                  </CardTitle>
                                                  <CardDescription>
                                                       Dias com agendamentos
                                                       estão destacados
                                                  </CardDescription>
                                             </CardHeader>
                                             <CardContent>
                                                  <CalendarComponent
                                                       mode="single"
                                                       selected={selectedDate}
                                                       onSelect={(date) =>
                                                            date &&
                                                            setSelectedDate(
                                                                 date
                                                            )
                                                       }
                                                       locale={ptBR}
                                                       className="rounded-md border"
                                                       modifiers={{
                                                            booked: datesWithBookings,
                                                       }}
                                                       modifiersStyles={{
                                                            booked: {
                                                                 fontWeight:
                                                                      "bold",
                                                                 textDecoration:
                                                                      "underline",
                                                            },
                                                       }}
                                                  />
                                             </CardContent>
                                        </Card>

                                        {/* Agendamentos do dia selecionado */}
                                        <div>
                                             <Card>
                                                  <CardHeader>
                                                       <CardTitle className="flex items-center gap-2">
                                                            <Calendar className="w-5 h-5" />
                                                            {format(
                                                                 selectedDate,
                                                                 "EEEE, dd 'de' MMMM 'de' yyyy",
                                                                 {
                                                                      locale: ptBR,
                                                                 }
                                                            )}
                                                       </CardTitle>
                                                       <CardDescription>
                                                            {bookingsOnSelectedDate.length ===
                                                            0
                                                                 ? "Nenhum agendamento neste dia"
                                                                 : `${bookingsOnSelectedDate.length} agendamento(s)`}
                                                       </CardDescription>
                                                  </CardHeader>
                                                  <CardContent>
                                                       {bookingsOnSelectedDate.length ===
                                                       0 ? (
                                                            <div className="text-center py-8">
                                                                 <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                                                 <p className="text-muted-foreground">
                                                                      Nenhum
                                                                      agendamento
                                                                      para este
                                                                      dia
                                                                 </p>
                                                            </div>
                                                       ) : (
                                                            <div className="space-y-3">
                                                                 {bookingsOnSelectedDate.map(
                                                                      (
                                                                           booking
                                                                      ) =>
                                                                           renderBookingCard(
                                                                                booking,
                                                                                false
                                                                           )
                                                                 )}
                                                            </div>
                                                       )}
                                                  </CardContent>
                                             </Card>
                                        </div>
                                   </div>
                              )}
                         </TabsContent>

                         {/* Visualização em Lista */}
                         <TabsContent value="list" className="space-y-4">
                              {loading ? (
                                   <Card>
                                        <CardContent className="py-12 text-center">
                                             <p className="text-muted-foreground">
                                                  Carregando agendamentos...
                                             </p>
                                        </CardContent>
                                   </Card>
                              ) : bookings.length === 0 ? (
                                   <Card>
                                        <CardContent className="py-12 text-center">
                                             <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                             <h3 className="text-lg font-semibold mb-2">
                                                  Nenhum agendamento encontrado
                                             </h3>
                                             <p className="text-sm text-muted-foreground">
                                                  Quando clientes agendarem
                                                  horários, eles aparecerão aqui
                                             </p>
                                        </CardContent>
                                   </Card>
                              ) : (
                                   <div className="space-y-4">
                                        {bookings.map((booking) =>
                                             renderBookingCard(booking, true)
                                        )}
                                   </div>
                              )}
                         </TabsContent>
                    </Tabs>
               </div>
          </DashboardLayout>
     );
};

export default Bookings;
