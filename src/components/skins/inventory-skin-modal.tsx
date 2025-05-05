
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { InventoryItem, SellData, Skin } from "@/types/skin";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { SkinDetailsCard } from "./skin-details-card";
import { SkinSellingForm } from "./skin-selling-form";
import { SkinAdditionalInfo } from "./skin-additional-info";
import { Button } from "../ui/button";
import { PlusCircle, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAddSkin, useRemoveSkin } from "@/hooks/use-skins";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "../ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { useForm } from "react-hook-form";

interface InventorySkinModalProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSellSkin?: (itemId: string, sellData: SellData) => void;
  onUpdateSkin?: (item: InventoryItem) => Promise<void>;
  onAddToInventory?: (skin: Skin) => Promise<InventoryItem | null>;
  onClose?: () => void;
}

export function InventorySkinModal({
  item,
  open,
  onOpenChange,
  onSellSkin,
  onUpdateSkin,
  onAddToInventory,
  onClose
}: InventorySkinModalProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [removalType, setRemovalType] = useState<'remove' | 'sell'>('remove');
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const addSkinMutation = useAddSkin();
  const removeSkinMutation = useRemoveSkin();
  
  // Criar form para edição
  const form = useForm<InventoryItem>({
    defaultValues: item || {}
  });
  
  // Atualizar form quando o item mudar
  useEffect(() => {
    if (item && !isEditing) {
      form.reset(item);
    }
  }, [item, form, isEditing]);

  const handleAddToInventory = async () => {
    if (!item) return;

    try {
      console.log("Adding item to inventory from modal:", item);
      
      // Prepare sanitized data
      const cleanSkin = {
        id: item.id || `skin-${Date.now()}`,
        name: item.name || "Unknown Skin",
        weapon: item.weapon || "Unknown",
        rarity: item.rarity || "",
        wear: item.wear || "",
        image: item.image || "",
        price: item.price || 0,
        floatValue: item.floatValue || 0,
        isStatTrak: !!item.isStatTrak,
        collection: item.collection ? {
          id: item.collection.id || "",
          name: item.collection.name || ""
        } : undefined,
      };
      
      if (onAddToInventory) {
        const result = await onAddToInventory(cleanSkin);
        if (result) {
          toast({
            title: "Skin Adicionada",
            description: `${cleanSkin.weapon} | ${cleanSkin.name} foi adicionada ao seu inventário.`,
          });
          onOpenChange(false);
        } else {
          throw new Error("Failed to add skin to inventory");
        }
        return;
      }
      
      // Adicionar a skin ao inventário usando o hook de mutation
      addSkinMutation.mutate({
        skin: cleanSkin,
        purchaseInfo: {
          purchasePrice: item.price || 0,
          marketplace: "Steam Market",
          feePercentage: 0,
          notes: ""
        }
      }, {
        onSuccess: () => {
          toast({
            title: "Skin Adicionada",
            description: `${cleanSkin.weapon} | ${cleanSkin.name} foi adicionada ao seu inventário.`,
          });
          onOpenChange(false);
        },
        onError: (error) => {
          console.error("Error adding skin from modal:", error);
          toast({
            title: "Erro",
            description: "Falha ao adicionar skin ao inventário",
            variant: "destructive"
          });
        }
      });
    } catch (error) {
      console.error("Error adding skin from modal:", error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar skin ao inventário",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSkin = () => {
    if (!item || !item.inventoryId) return;
    
    // Realizar operação com base no tipo de remoção selecionado
    removeSkinMutation.mutate(item.inventoryId, {
      onSuccess: () => {
        const message = removalType === 'remove' ? 
          "foi removida do seu inventário." : 
          "foi marcada como vendida.";
          
        toast({
          title: removalType === 'remove' ? "Skin Removida" : "Skin Vendida",
          description: `${item.weapon || ""} | ${item.name} ${message}`,
        });
        onOpenChange(false);
      },
      onError: (error) => {
        console.error("Error removing skin:", error);
        toast({
          title: "Erro",
          description: "Falha ao remover skin do inventário",
          variant: "destructive"
        });
      }
    });
    setIsDeleteDialogOpen(false);
  };

  const handleSell = (itemId: string, sellData: SellData) => {
    if (onSellSkin) {
      onSellSkin(itemId, sellData);
    }
    onOpenChange(false);
  };
  
  const handleSaveEdit = async (data: InventoryItem) => {
    if (!item || !onUpdateSkin) return;
    
    try {
      // Garantir que mantemos o ID correto
      const updatedItem = {
        ...data,
        inventoryId: item.inventoryId
      };
      
      await onUpdateSkin(updatedItem);
      toast({
        title: "Skin Atualizada",
        description: `${updatedItem.weapon} | ${updatedItem.name} foi atualizada com sucesso.`,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating skin:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar skin",
        variant: "destructive"
      });
    }
  };
  
  const handleCloseModal = () => {
    setIsEditing(false);
    if (onClose) onClose();
    else onOpenChange(false);
  };

  const renderEditForm = () => {
    if (!item) return null;
    
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSaveEdit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Skin</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da skin" {...field} value={field.value || ''} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="weapon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arma</FormLabel>
                <FormControl>
                  <Input placeholder="Tipo de arma" {...field} value={field.value || ''} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="wear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condição</FormLabel>
                <FormControl>
                  <Input placeholder="Condição da skin" {...field} value={field.value || ''} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="rarity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Raridade</FormLabel>
                <FormControl>
                  <Input placeholder="Raridade da skin" {...field} value={field.value || ''} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="floatValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Float</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.0001"
                    placeholder="Valor float" 
                    {...field} 
                    value={field.value?.toString() || '0'} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="currentPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço Atual</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="Preço atual" 
                    {...field} 
                    value={field.value?.toString() || '0'} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço de Compra</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="Preço de compra" 
                    {...field} 
                    value={field.value?.toString() || '0'} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">Salvar Alterações</Button>
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">Cancelar</Button>
          </div>
        </form>
      </Form>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {item && (
            <>
              {!isEditing ? (
                <SkinDetailsCard item={item} />
              ) : (
                <div className="p-4 border rounded-lg mb-4">
                  <h3 className="text-lg font-semibold mb-4">Editar Informações da Skin</h3>
                  {renderEditForm()}
                </div>
              )}

              {/* Action Buttons */}
              {!isEditing && (
                <div className="mb-4 flex gap-2">
                  {!item.isInUserInventory && (onAddToInventory || addSkinMutation) && (
                    <Button 
                      onClick={handleAddToInventory} 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={addSkinMutation.isPending}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      {addSkinMutation.isPending ? "Adicionando..." : "Adicionar ao Inventário"}
                    </Button>
                  )}
                  
                  {item.isInUserInventory && onUpdateSkin && (
                    <Button 
                      onClick={() => setIsEditing(true)} 
                      className="flex-1"
                      variant="outline"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Informações
                    </Button>
                  )}
                  
                  {item.isInUserInventory && (
                    <Button 
                      onClick={() => setIsDeleteDialogOpen(true)} 
                      variant="destructive"
                      className="flex-1"
                      disabled={removeSkinMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {removeSkinMutation.isPending ? "Removendo..." : "Remover do Inventário"}
                    </Button>
                  )}
                </div>
              )}

              {!isEditing && (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full">
                    <TabsTrigger value="details" className="flex-1">Detalhes</TabsTrigger>
                    {item.isInUserInventory && onSellSkin && (
                      <TabsTrigger value="sell" className="flex-1">Vender</TabsTrigger>
                    )}
                    <TabsTrigger value="notes" className="flex-1">Notas</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="py-4">
                    <div className="space-y-6">
                      {/* Histórico de preços - Placeholder por enquanto */}
                      <div className="p-4 rounded-md border border-[#333] bg-[#221F26]/30">
                        <h3 className="font-medium mb-2 text-[#8B5CF6]">Histórico de Preços</h3>
                        <div className="h-24 flex items-center justify-center text-[#8A898C] text-sm">
                          Gráficos de histórico de preços estarão disponíveis em breve.
                        </div>
                      </div>

                      {/* Informa��ões da coleção - Placeholder por enquanto */}
                      {item.collection && (
                        <div className="p-4 rounded-md border border-[#333] bg-[#221F26]/30">
                          <h3 className="font-medium mb-2 text-[#8B5CF6]">Coleção</h3>
                          <div className="text-sm text-[#8A898C]">
                            Esta skin faz parte de {item.collection.name || "Coleção Desconhecida"}
                          </div>
                        </div>
                      )}

                      {/* Informações do Float */}
                      <div className="p-4 rounded-md border border-[#333] bg-[#221F26]/30">
                        <h3 className="font-medium mb-2 text-[#8B5CF6]">Valor Float</h3>
                        <div className="text-sm text-[#8A898C]">
                          {item.floatValue ? (
                            <>
                              <p>Float Atual: {item.floatValue.toFixed(8)}</p>
                              <p>Faixa de Float: {item.min_float?.toFixed(8) || "Desconhecido"} - {item.max_float?.toFixed(8) || "Desconhecido"}</p>
                            </>
                          ) : (
                            <p>Informações do valor de float não disponíveis.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {item.isInUserInventory && onSellSkin && (
                    <TabsContent value="sell" className="py-4">
                      <SkinSellingForm 
                        item={item} 
                        onSell={onSellSkin} 
                        onCancel={() => setActiveTab("details")} 
                      />
                    </TabsContent>
                  )}

                  <TabsContent value="notes" className="py-4">
                    <SkinAdditionalInfo item={item} />
                  </TabsContent>
                </Tabs>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Como você deseja remover {item?.weapon} | {item?.name} do seu inventário?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <RadioGroup 
            value={removalType} 
            onValueChange={(value: 'remove' | 'sell') => setRemovalType(value)}
            className="my-4 space-y-2"
          >
            <div className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted/40">
              <RadioGroupItem value="remove" id="r1" />
              <Label htmlFor="r1" className="text-base cursor-pointer flex-1">
                <div className="font-medium">Apenas Remover</div>
                <div className="text-sm text-muted-foreground">
                  A skin será removida sem registrar venda ou lucro
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted/40">
              <RadioGroupItem value="sell" id="r2" />
              <Label htmlFor="r2" className="text-base cursor-pointer flex-1">
                <div className="font-medium">Marcar como Vendida</div>
                <div className="text-sm text-muted-foreground">
                  Registra uma transação de venda no histórico
                </div>
              </Label>
            </div>
          </RadioGroup>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSkin} className="bg-destructive text-destructive-foreground">
              {removalType === 'remove' ? 'Remover' : 'Remover e Registrar Venda'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
