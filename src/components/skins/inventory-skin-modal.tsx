
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { InventoryItem, SellData, Skin } from "@/types/skin";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { SkinDetailsCard } from "./skin-details-card";
import { SkinSellingForm } from "./skin-selling-form";
import { SkinAdditionalInfo } from "./skin-additional-info";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAddSkin } from "@/hooks/use-skins";

interface InventorySkinModalProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSellSkin?: (itemId: string, sellData: SellData) => void;
  onAddToInventory?: (skin: Skin) => Promise<InventoryItem | null>;
}

export function InventorySkinModal({
  item,
  open,
  onOpenChange,
  onSellSkin,
  onAddToInventory
}: InventorySkinModalProps) {
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();
  const addSkinMutation = useAddSkin();

  const handleAddToInventory = async () => {
    if (!item) return;

    try {
      console.log("Adding item to inventory from modal:", item);
      
      if (onAddToInventory) {
        const result = await onAddToInventory(item);
        if (result) {
          toast({
            title: "Skin Adicionada",
            description: `${item.weapon || ""} | ${item.name} foi adicionada ao seu inventário.`,
          });
          onOpenChange(false);
        } else {
          throw new Error("Failed to add skin to inventory");
        }
        return;
      }
      
      // Adicionar a skin ao inventário usando o hook de mutation
      addSkinMutation.mutate({
        skin: {
          id: item.id || `skin-${Date.now()}`,
          name: item.name,
          weapon: item.weapon || "Unknown",
          rarity: item.rarity,
          wear: item.wear,
          image: item.image,
          price: item.price || 0,
          floatValue: item.floatValue || 0,
          isStatTrak: item.isStatTrak || false,
          collection: item.collection,
        },
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
            description: `${item.weapon || ""} | ${item.name} foi adicionada ao seu inventário.`,
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
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {item && (
          <>
            <SkinDetailsCard item={item} />

            {!item.isInUserInventory && (onAddToInventory || addSkinMutation) && (
              <div className="mb-4">
                <Button 
                  onClick={handleAddToInventory} 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={addSkinMutation.isPending}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  {addSkinMutation.isPending ? "Adicionando..." : "Adicionar ao Inventário"}
                </Button>
              </div>
            )}

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

                  {/* Informações da coleção - Placeholder por enquanto */}
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
