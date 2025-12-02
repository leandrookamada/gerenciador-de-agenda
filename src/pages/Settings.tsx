import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
import { Settings, Save } from "lucide-react";
import { toast } from "sonner";

const TEMP_PROFESSIONAL_ID = "00000000-0000-0000-0000-000000000000";
const STORAGE_KEY = "professional_phone";

const ProfessionalSettings = () => {
     const [phone, setPhone] = useState("");
     const [name, setName] = useState("");
     const [loading, setLoading] = useState(false);

     useEffect(() => {
          // Carregar telefone do localStorage
          const savedPhone = localStorage.getItem(STORAGE_KEY);
          const savedName = localStorage.getItem("professional_name");
          if (savedPhone) setPhone(savedPhone);
          if (savedName) setName(savedName);
     }, []);

     const handleSave = () => {
          setLoading(true);
          try {
               localStorage.setItem(STORAGE_KEY, phone);
               localStorage.setItem("professional_name", name);
               toast.success("Configurações salvas!");
          } catch (error) {
               toast.error("Erro ao salvar configurações");
          } finally {
               setLoading(false);
          }
     };

     return (
          <DashboardLayout>
               <div className="space-y-6 max-w-2xl">
                    <div>
                         <h2 className="text-3xl font-bold">Configurações</h2>
                         <p className="text-muted-foreground">
                              Configure suas informações para receber
                              notificações
                         </p>
                    </div>

                    <Card>
                         <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                   <Settings className="w-5 h-5" />
                                   Informações do Profissional
                              </CardTitle>
                              <CardDescription>
                                   Essas informações serão usadas para
                                   notificações de novos agendamentos
                              </CardDescription>
                         </CardHeader>
                         <CardContent className="space-y-4">
                              <div className="space-y-2">
                                   <Label htmlFor="name">Nome</Label>
                                   <Input
                                        id="name"
                                        placeholder="Seu nome completo"
                                        value={name}
                                        onChange={(e) =>
                                             setName(e.target.value)
                                        }
                                   />
                              </div>

                              <div className="space-y-2">
                                   <Label htmlFor="phone">
                                        Telefone WhatsApp (com DDD)
                                   </Label>
                                   <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="(00) 00000-0000"
                                        value={phone}
                                        onChange={(e) =>
                                             setPhone(e.target.value)
                                        }
                                   />
                                   <p className="text-xs text-muted-foreground">
                                        Este número será usado para receber
                                        notificações sobre novos agendamentos
                                   </p>
                              </div>

                              <Button
                                   onClick={handleSave}
                                   disabled={loading || !phone}
                                   className="w-full"
                              >
                                   <Save className="w-4 h-4 mr-2" />
                                   {loading
                                        ? "Salvando..."
                                        : "Salvar Configurações"}
                              </Button>
                         </CardContent>
                    </Card>
               </div>
          </DashboardLayout>
     );
};

export default ProfessionalSettings;
