import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
     Calendar,
     LogOut,
     Settings as SettingsIcon,
     LayoutDashboard,
     CalendarCheck,
     ClipboardList,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface DashboardLayoutProps {
     children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
     const { signOut, user } = useAuth();
     const location = useLocation();

     const navigation = [
          { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          {
               name: "Tipos de Serviço",
               href: "/service-types",
               icon: ClipboardList,
          },
          { name: "Gerenciar Horários", href: "/time-slots", icon: Calendar },
          { name: "Agendamentos", href: "/bookings", icon: CalendarCheck },
          { name: "Configurações", href: "/settings", icon: SettingsIcon },
     ];

     return (
          <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-success/5">
               {/* Header */}
               <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                    <div className="container mx-auto px-4 py-4">
                         <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                   <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-success shadow-lg">
                                        <Calendar className="w-6 h-6 text-white" />
                                   </div>
                                   <h1 className="text-2xl font-bold">
                                        MedSchedule
                                   </h1>
                              </div>

                              <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={signOut}
                              >
                                   <LogOut className="w-4 h-4 mr-2" />
                                   Sair
                              </Button>
                         </div>
                    </div>
               </header>

               {/* Navigation */}
               <nav className="border-b bg-card/30 backdrop-blur-sm">
                    <div className="container mx-auto px-4">
                         <div className="flex gap-1 overflow-x-auto">
                              {navigation.map((item) => {
                                   const isActive =
                                        location.pathname === item.href;
                                   return (
                                        <Link key={item.href} to={item.href}>
                                             <Button
                                                  variant={
                                                       isActive
                                                            ? "default"
                                                            : "ghost"
                                                  }
                                                  className="gap-2"
                                             >
                                                  <item.icon className="w-4 h-4" />
                                                  {item.name}
                                             </Button>
                                        </Link>
                                   );
                              })}
                         </div>
                    </div>
               </nav>

               {/* Main Content */}
               <main className="container mx-auto px-4 py-8">{children}</main>
          </div>
     );
}
