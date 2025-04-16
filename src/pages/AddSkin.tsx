
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useAddSkin, useWeapons } from "@/hooks/use-skins";
import { Skin } from "@/types/skin";
import { useToast } from "@/hooks/use-toast";
import { SkinDetailModal } from "@/components/skins/skin-detail-modal";
import { InventoryCard } from "@/components/dashboard/inventory-card";

const AddSkin = () => {
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { data: weapons = [] } = useWeapons();
  const addSkinMutation = useAddSkin();
  
  const handleAddSkin = async (skinData: any) => {
    try {
      console.log("Adding skin with data:", skinData);
      
      // Ensure we have a valid ID
      const skinId = skinData.skinId || `skin-${Date.now()}`;
      
      // Sanitize data to avoid undefined values
      const cleanSkin = {
        id: skinId,
        name: skinData.name || "Unknown Skin",
        weapon: skinData.weapon || "Unknown",
        rarity: skinData.rarity || "",
        image: skinData.image || "",
        price: skinData.estimatedValue || skinData.purchasePrice || 0,
        floatValue: parseFloat(skinData.floatValue || "0"),
        isStatTrak: !!skinData.isStatTrak,
        wear: skinData.wear || "",
      };
      
      const cleanPurchaseInfo = {
        purchasePrice: skinData.purchasePrice || 0,
        marketplace: skinData.marketplace || "Steam Market",
        feePercentage: skinData.feePercentage || 0,
        notes: skinData.notes || ""
      };
      
      console.log("Cleaned skin data:", cleanSkin);
      console.log("Cleaned purchase info:", cleanPurchaseInfo);
      
      // Adicionar a skin ao inventário
      addSkinMutation.mutate({
        skin: cleanSkin,
        purchaseInfo: cleanPurchaseInfo
      }, {
        onSuccess: () => {
          // Mostrar mensagem de sucesso
          toast({
            title: "Skin Adicionada",
            description: `${cleanSkin.weapon} | ${cleanSkin.name} foi adicionada ao seu inventário.`,
          });
          
          // Resetar formulário e navegar de volta para o inventário
          setSelectedSkin(null);
          navigate("/inventory");
        },
        onError: (error) => {
          console.error("Error adding skin:", error);
          toast({
            title: "Erro",
            description: "Falha ao adicionar skin ao inventário",
            variant: "destructive"
          });
        }
      });
    } catch (error) {
      console.error("Error adding skin:", error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar skin ao inventário",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Adicionar Skin ao Inventário</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {weapons.map((weapon) => (
          <Card
            key={typeof weapon === 'object' ? (weapon.id || weapon.name) : weapon}
            className="p-4 cursor-pointer hover:bg-accent transition-colors"
            onClick={() => {
              setSelectedSkin({
                id: `new-skin-${Date.now()}`,
                name: "",
                weapon: typeof weapon === 'object' ? weapon.name : weapon,
                rarity: "",
                image: typeof weapon === 'object' ? weapon.image || "" : "",
              });
              setModalOpen(true);
            }}
          >
            <div className="flex items-center space-x-4">
              {typeof weapon === 'object' && weapon.image ? (
                <img 
                  src={weapon.image} 
                  alt={typeof weapon === 'object' ? weapon.name : weapon} 
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <div className="w-16 h-16 bg-muted flex items-center justify-center rounded">
                  <span className="text-xs text-muted-foreground">No image</span>
                </div>
              )}
              <div>
                <h3 className="font-medium">{typeof weapon === 'object' ? weapon.name : weapon}</h3>
                <p className="text-sm text-muted-foreground">
                  Clique para adicionar
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Modal de detalhes da skin */}
      <SkinDetailModal 
        skin={selectedSkin}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAddSkin={handleAddSkin}
      />
    </div>
  );
};

export default AddSkin;
