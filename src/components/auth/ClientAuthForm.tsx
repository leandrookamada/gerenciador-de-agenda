import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
     Card,
     CardContent,
     CardDescription,
     CardHeader,
     CardTitle,
} from "@/components/ui/card";
import { User, Mail, Phone } from "lucide-react";
import { createOrUpdateClient } from "@/integrations/supabase/scheduling";
import { toast } from "sonner";

interface ClientAuthFormProps {
     onSuccess: (client: any) => void;
     showPhone?: boolean;
}

export default function ClientAuthForm({
     onSuccess,
     showPhone = false,
}: ClientAuthFormProps) {
     const [loading, setLoading] = useState(false);
     const [formData, setFormData] = useState({
          name: "",
          email: "",
          phone: "",
     });

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();

          // Validações
          if (!formData.name.trim()) {
               toast.error("Por favor, informe seu nome");
               return;
          }

          if (!formData.email.trim()) {
               toast.error("Por favor, informe seu email");
               return;
          }

          // Validação básica de email
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData.email)) {
               toast.error("Por favor, informe um email válido");
               return;
          }

          setLoading(true);

          try {
               const client = await createOrUpdateClient({
                    name: formData.name.trim(),
                    email: formData.email.trim().toLowerCase(),
                    phone: formData.phone.trim() || null,
               });

               toast.success(
                    "Bem-vindo(a)! Agora você pode fazer seu agendamento."
               );
               onSuccess(client);
          } catch (error) {
               console.error("Erro ao criar/atualizar cliente:", error);
               toast.error("Erro ao processar seus dados. Tente novamente.");
          } finally {
               setLoading(false);
          }
     };

     return (
          <Card className="w-full max-w-md mx-auto">
               <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                         <User className="w-5 h-5" />
                         Identificação
                    </CardTitle>
                    <CardDescription>
                         Para fazer um agendamento, precisamos que você se
                         identifique
                    </CardDescription>
               </CardHeader>
               <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                         <div className="space-y-2">
                              <Label htmlFor="name">Nome completo *</Label>
                              <div className="relative">
                                   <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                   <Input
                                        id="name"
                                        type="text"
                                        placeholder="Seu nome completo"
                                        className="pl-10"
                                        value={formData.name}
                                        onChange={(e) =>
                                             setFormData({
                                                  ...formData,
                                                  name: e.target.value,
                                             })
                                        }
                                        required
                                   />
                              </div>
                         </div>

                         <div className="space-y-2">
                              <Label htmlFor="email">Email *</Label>
                              <div className="relative">
                                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                   <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        className="pl-10"
                                        value={formData.email}
                                        onChange={(e) =>
                                             setFormData({
                                                  ...formData,
                                                  email: e.target.value,
                                             })
                                        }
                                        required
                                   />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                   Utilizaremos seu email para identificação
                              </p>
                         </div>

                         {showPhone && (
                              <div className="space-y-2">
                                   <Label htmlFor="phone">Telefone</Label>
                                   <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                             id="phone"
                                             type="tel"
                                             placeholder="(00) 00000-0000"
                                             className="pl-10"
                                             value={formData.phone}
                                             onChange={(e) =>
                                                  setFormData({
                                                       ...formData,
                                                       phone: e.target.value,
                                                  })
                                             }
                                        />
                                   </div>
                              </div>
                         )}

                         <Button
                              type="submit"
                              className="w-full"
                              disabled={loading}
                         >
                              {loading ? "Processando..." : "Continuar"}
                         </Button>

                         <p className="text-xs text-center text-muted-foreground">
                              Ao continuar, você poderá gerenciar seus
                              agendamentos
                         </p>
                    </form>
               </CardContent>
          </Card>
     );
}
