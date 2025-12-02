import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Users, Clock, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSchedules: 0,
    activeAppointments: 0,
    todayAppointments: 0,
    monthAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        // Total schedules
        const { count: schedulesCount } = await supabase
          .from("schedules")
          .select("*", { count: "exact", head: true })
          .eq("professional_id", user.id)
          .eq("is_active", true);

        // Today's appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const { count: todayCount } = await supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("professional_id", user.id)
          .gte("start_time", today.toISOString())
          .lt("start_time", tomorrow.toISOString())
          .neq("status", "cancelled");

        // Month appointments
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);

        const { count: monthCount } = await supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("professional_id", user.id)
          .gte("start_time", monthStart.toISOString())
          .lte("start_time", monthEnd.toISOString())
          .neq("status", "cancelled");

        // Active appointments (upcoming)
        const { count: activeCount } = await supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("professional_id", user.id)
          .gte("start_time", new Date().toISOString())
          .neq("status", "cancelled");

        setStats({
          totalSchedules: schedulesCount || 0,
          activeAppointments: activeCount || 0,
          todayAppointments: todayCount || 0,
          monthAppointments: monthCount || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const statCards = [
    {
      title: "Agendas Ativas",
      value: stats.totalSchedules,
      description: "Total de agendas configuradas",
      icon: Calendar,
      gradient: "from-primary to-primary/80",
    },
    {
      title: "Agendamentos Hoje",
      value: stats.todayAppointments,
      description: format(new Date(), "dd 'de' MMMM", { locale: ptBR }),
      icon: Clock,
      gradient: "from-success to-success/80",
    },
    {
      title: "Próximos Agendamentos",
      value: stats.activeAppointments,
      description: "Agendamentos futuros confirmados",
      icon: Users,
      gradient: "from-primary to-success",
    },
    {
      title: "Agendamentos no Mês",
      value: stats.monthAppointments,
      description: format(new Date(), "MMMM yyyy", { locale: ptBR }),
      icon: TrendingUp,
      gradient: "from-success to-primary",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral do seu sistema de agendamentos
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-3xl font-bold">{stat.value}</div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Bem-vindo ao MedSchedule</CardTitle>
            <CardDescription>
              Configure suas agendas e comece a receber agendamentos de pacientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Para começar, crie suas agendas de atendimento na seção "Agendas". 
              Defina horários, capacidade e regras de funcionamento. Seus pacientes 
              poderão fazer agendamentos através do link público da sua agenda.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
