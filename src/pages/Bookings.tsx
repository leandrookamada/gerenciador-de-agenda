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
import {
     Calendar,
     Clock,
     User,
     Phone,
     Mail,
     X,
     CheckCircle,
     AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

                    {/* Lista de agendamentos */}
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
                                        Quando clientes agendarem horários, eles
                                        aparecerão aqui
                                   </p>
                              </CardContent>
                         </Card>
                    ) : (
                         <div className="space-y-4">
                              {bookings.map((booking) => {
                                   const status = statusMap[booking.status];
                                   const StatusIcon = status.icon;

                                   return (
                                        <Card key={booking.id}>
                                             <CardHeader>
                                                  <div className="flex items-start justify-between">
                                                       <div className="space-y-1">
                                                            <CardTitle className="flex items-center gap-2">
                                                                 <User className="w-5 h-5" />
                                                                 {
                                                                      booking.patient_name
                                                                 }
                                                            </CardTitle>
                                                            <CardDescription className="flex items-center gap-4">
                                                                 {booking.time_slot && (
                                                                      <>
                                                                           <span className="flex items-center gap-1">
                                                                                <Calendar className="w-4 h-4" />
                                                                                {format(
                                                                                     new Date(
                                                                                          booking.time_slot.slot_date
                                                                                     ),
                                                                                     "dd/MM/yyyy",
                                                                                     {
                                                                                          locale: ptBR,
                                                                                     }
                                                                                )}
                                                                           </span>
                                                                           <span className="flex items-center gap-1">
                                                                                <Clock className="w-4 h-4" />
                                                                                {booking.time_slot.start_time.substring(
                                                                                     0,
                                                                                     5
                                                                                )}
                                                                           </span>
                                                                      </>
                                                                 )}
                                                            </CardDescription>
                                                       </div>
                                                       <div className="flex items-center gap-2">
                                                            <Badge
                                                                 className={
                                                                      status.color
                                                                 }
                                                                 variant="secondary"
                                                            >
                                                                 <StatusIcon className="w-3 h-3 mr-1" />
                                                                 {status.label}
                                                            </Badge>
                                                            {booking.status ===
                                                                 "confirmed" && (
                                                                 <Button
                                                                      variant="ghost"
                                                                      size="sm"
                                                                      onClick={() =>
                                                                           handleCancelBooking(
                                                                                booking.id,
                                                                                booking.patient_name
                                                                           )
                                                                      }
                                                                 >
                                                                      <X className="w-4 h-4" />
                                                                 </Button>
                                                            )}
                                                       </div>
                                                  </div>
                                             </CardHeader>
                                             <CardContent>
                                                  <div className="grid gap-3 md:grid-cols-2">
                                                       <div className="space-y-2">
                                                            {booking.service_type && (
                                                                 <div className="flex items-center gap-2 text-sm">
                                                                      <Clock className="w-4 h-4 text-muted-foreground" />
                                                                      <span className="font-medium">
                                                                           Serviço:
                                                                      </span>
                                                                      <span>
                                                                           {
                                                                                booking
                                                                                     .service_type
                                                                                     .name
                                                                           }{" "}
                                                                           (
                                                                           {
                                                                                booking
                                                                                     .service_type
                                                                                     .duration_minutes
                                                                           }{" "}
                                                                           min)
                                                                      </span>
                                                                 </div>
                                                            )}
                                                            <div className="flex items-center gap-2 text-sm">
                                                                 <Phone className="w-4 h-4 text-muted-foreground" />
                                                                 <span className="font-medium">
                                                                      Telefone:
                                                                 </span>
                                                                 <span>
                                                                      {
                                                                           booking.patient_phone
                                                                      }
                                                                 </span>
                                                            </div>
                                                            {booking.patient_email && (
                                                                 <div className="flex items-center gap-2 text-sm">
                                                                      <Mail className="w-4 h-4 text-muted-foreground" />
                                                                      <span className="font-medium">
                                                                           E-mail:
                                                                      </span>
                                                                      <span>
                                                                           {
                                                                                booking.patient_email
                                                                           }
                                                                      </span>
                                                                 </div>
                                                            )}
                                                       </div>
                                                       {booking.notes && (
                                                            <div className="space-y-1">
                                                                 <p className="text-sm font-medium">
                                                                      Observações:
                                                                 </p>
                                                                 <p className="text-sm text-muted-foreground">
                                                                      {
                                                                           booking.notes
                                                                      }
                                                                 </p>
                                                            </div>
                                                       )}
                                                  </div>
                                             </CardContent>
                                        </Card>
                                   );
                              })}
                         </div>
                    )}
               </div>
          </DashboardLayout>
     );
};

export default Bookings;
