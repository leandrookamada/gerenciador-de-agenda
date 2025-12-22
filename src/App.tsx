import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ServiceTypes from "./pages/ServiceTypes";
import TimeSlotManagement from "./pages/TimeSlotManagement";
import PublicBooking from "./pages/PublicBooking";
import MyBookings from "./pages/MyBookings";
import Bookings from "./pages/Bookings";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
     <QueryClientProvider client={queryClient}>
          <TooltipProvider>
               <Toaster />
               <Sonner />
               <BrowserRouter>
                    <Routes>
                         <Route path="/" element={<Dashboard />} />
                         <Route path="/dashboard" element={<Dashboard />} />
                         <Route
                              path="/service-types"
                              element={<ServiceTypes />}
                         />
                         <Route
                              path="/time-slots"
                              element={<TimeSlotManagement />}
                         />
                         <Route path="/bookings" element={<Bookings />} />
                         <Route path="/settings" element={<Settings />} />

                         {/* Página pública de agendamento para clientes */}
                         <Route path="/agendar" element={<PublicBooking />} />
                         <Route
                              path="/agendar/:professionalId"
                              element={<PublicBooking />}
                         />

                         {/* Página de gerenciamento de agendamentos do cliente */}
                         <Route
                              path="/meus-agendamentos"
                              element={<MyBookings />}
                         />

                         {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                         <Route path="*" element={<NotFound />} />
                    </Routes>
               </BrowserRouter>
          </TooltipProvider>
     </QueryClientProvider>
);

export default App;
