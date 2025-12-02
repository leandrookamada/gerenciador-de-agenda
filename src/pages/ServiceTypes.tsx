import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
     listServiceTypes,
     createServiceType,
     updateServiceType,
     deleteServiceType,
     ServiceType,
} from "@/integrations/supabase/scheduling";
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
import { Plus, Trash2, Edit, Clock } from "lucide-react";
import { toast } from "sonner";

// ID temporário para desenvolvimento (substituir por user.id depois)
const TEMP_PROFESSIONAL_ID = "00000000-0000-0000-0000-000000000000";

const ServiceTypes = () => {
     const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
     const [showForm, setShowForm] = useState(false);
     const [editingType, setEditingType] = useState<ServiceType | null>(null);
     const [loading, setLoading] = useState(false);

     const [formData, setFormData] = useState({
          name: "",
          duration_minutes: 30,
          description: "",
     });

     useEffect(() => {
          loadServiceTypes();
     }, []);

     const loadServiceTypes = async () => {
          try {
               const data = await listServiceTypes(TEMP_PROFESSIONAL_ID);
               setServiceTypes(data);
          } catch (error) {
               console.error("Erro ao carregar tipos de serviço:", error);
               toast.error("Erro ao carregar tipos de serviço");
          }
     };

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setLoading(true);

          try {
               if (editingType) {
                    await updateServiceType(editingType.id, formData);
                    toast.success("Tipo de serviço atualizado!");
               } else {
                    await createServiceType({
                         professional_id: TEMP_PROFESSIONAL_ID,
                         ...formData,
                    });
                    toast.success("Tipo de serviço criado!");
               }

               resetForm();
               loadServiceTypes();
          } catch (error: any) {
               console.error("Erro ao salvar tipo de serviço:", error);
               const errorMessage =
                    error?.message || "Erro ao salvar tipo de serviço";
               toast.error(errorMessage);

               // Mostrar dica se for erro de tabela não existente
               if (
                    errorMessage.includes("relation") ||
                    errorMessage.includes("does not exist")
               ) {
                    toast.error(
                         "A tabela service_types ainda não existe. Execute a migration no Supabase!",
                         {
                              duration: 5000,
                         }
                    );
               }
          } finally {
               setLoading(false);
          }
     };

     const handleEdit = (type: ServiceType) => {
          setEditingType(type);
          setFormData({
               name: type.name,
               duration_minutes: type.duration_minutes,
               description: type.description || "",
          });
          setShowForm(true);
     };

     const handleDelete = async (id: string) => {
          if (!confirm("Deseja realmente excluir este tipo de serviço?"))
               return;

          try {
               await deleteServiceType(id);
               toast.success("Tipo de serviço excluído!");
               loadServiceTypes();
          } catch (error) {
               console.error("Erro ao excluir tipo de serviço:", error);
               toast.error("Erro ao excluir tipo de serviço");
          }
     };

     const resetForm = () => {
          setFormData({ name: "", duration_minutes: 30, description: "" });
          setEditingType(null);
          setShowForm(false);
     };

     return (
          <DashboardLayout>
               <div className="space-y-6">
                    <div className="flex items-center justify-between">
                         <div>
                              <h2 className="text-3xl font-bold">
                                   Tipos de Serviço
                              </h2>
                              <p className="text-muted-foreground">
                                   Defina os tipos de serviço que você oferece
                              </p>
                         </div>
                         <Button onClick={() => setShowForm(!showForm)}>
                              <Plus className="w-4 h-4 mr-2" />
                              Novo Tipo
                         </Button>
                    </div>

                    {showForm && (
                         <Card>
                              <CardHeader>
                                   <CardTitle>
                                        {editingType
                                             ? "Editar Tipo de Serviço"
                                             : "Novo Tipo de Serviço"}
                                   </CardTitle>
                                   <CardDescription>
                                        Defina o nome e duração padrão para este
                                        tipo de atendimento
                                   </CardDescription>
                              </CardHeader>
                              <CardContent>
                                   <form
                                        onSubmit={handleSubmit}
                                        className="space-y-4"
                                   >
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                             <div className="space-y-2 md:col-span-2">
                                                  <Label htmlFor="name">
                                                       Nome do Serviço
                                                  </Label>
                                                  <Input
                                                       id="name"
                                                       placeholder="Ex: Consulta, Retorno, Avaliação"
                                                       value={formData.name}
                                                       onChange={(e) =>
                                                            setFormData({
                                                                 ...formData,
                                                                 name: e.target
                                                                      .value,
                                                            })
                                                       }
                                                       required
                                                  />
                                             </div>
                                             <div className="space-y-2">
                                                  <Label htmlFor="duration">
                                                       Duração (minutos)
                                                  </Label>
                                                  <Input
                                                       id="duration"
                                                       type="number"
                                                       min="5"
                                                       step="5"
                                                       value={
                                                            formData.duration_minutes
                                                       }
                                                       onChange={(e) =>
                                                            setFormData({
                                                                 ...formData,
                                                                 duration_minutes:
                                                                      Number(
                                                                           e
                                                                                .target
                                                                                .value
                                                                      ),
                                                            })
                                                       }
                                                       required
                                                  />
                                             </div>
                                        </div>
                                        <div className="space-y-2">
                                             <Label htmlFor="description">
                                                  Descrição (opcional)
                                             </Label>
                                             <Textarea
                                                  id="description"
                                                  placeholder="Detalhes sobre este tipo de serviço"
                                                  value={formData.description}
                                                  onChange={(e) =>
                                                       setFormData({
                                                            ...formData,
                                                            description:
                                                                 e.target.value,
                                                       })
                                                  }
                                                  rows={2}
                                             />
                                        </div>
                                        <div className="flex gap-2">
                                             <Button
                                                  type="submit"
                                                  disabled={loading}
                                             >
                                                  {loading
                                                       ? "Salvando..."
                                                       : editingType
                                                       ? "Atualizar"
                                                       : "Criar"}
                                             </Button>
                                             <Button
                                                  type="button"
                                                  variant="outline"
                                                  onClick={resetForm}
                                             >
                                                  Cancelar
                                             </Button>
                                        </div>
                                   </form>
                              </CardContent>
                         </Card>
                    )}

                    {serviceTypes.length === 0 ? (
                         <Card>
                              <CardContent className="flex flex-col items-center justify-center py-12">
                                   <Clock className="w-12 h-12 text-muted-foreground mb-4" />
                                   <h3 className="text-lg font-semibold mb-2">
                                        Nenhum tipo de serviço cadastrado
                                   </h3>
                                   <p className="text-sm text-muted-foreground mb-4 text-center">
                                        Crie tipos de serviço para poder liberar
                                        horários depois
                                   </p>
                                   <Button onClick={() => setShowForm(true)}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Criar Primeiro Tipo
                                   </Button>
                              </CardContent>
                         </Card>
                    ) : (
                         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                              {serviceTypes.map((type) => (
                                   <Card key={type.id}>
                                        <CardHeader className="pb-3">
                                             <div className="flex items-start justify-between">
                                                  <div>
                                                       <CardTitle className="text-lg">
                                                            {type.name}
                                                       </CardTitle>
                                                       <CardDescription className="flex items-center gap-1 mt-1">
                                                            <Clock className="w-3 h-3" />
                                                            {
                                                                 type.duration_minutes
                                                            }{" "}
                                                            minutos
                                                       </CardDescription>
                                                  </div>
                                                  <div className="flex gap-1">
                                                       <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                 handleEdit(
                                                                      type
                                                                 )
                                                            }
                                                       >
                                                            <Edit className="w-4 h-4" />
                                                       </Button>
                                                       <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                 handleDelete(
                                                                      type.id
                                                                 )
                                                            }
                                                       >
                                                            <Trash2 className="w-4 h-4" />
                                                       </Button>
                                                  </div>
                                             </div>
                                        </CardHeader>
                                        {type.description && (
                                             <CardContent className="pt-0">
                                                  <p className="text-sm text-muted-foreground">
                                                       {type.description}
                                                  </p>
                                             </CardContent>
                                        )}
                                   </Card>
                              ))}
                         </div>
                    )}
               </div>
          </DashboardLayout>
     );
};

export default ServiceTypes;
