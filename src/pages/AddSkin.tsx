
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "@/components/ui/search";
import { useSearchSkins, useWeapons, useAddSkin } from "@/hooks/use-skins";
import { Skin } from "@/types/skin";
import { useToast } from "@/hooks/use-toast";
import { SkinDetailModal } from "@/components/skins/skin-detail-modal";
import { InventoryCard } from "@/components/dashboard/inventory-card";
import { SkinImageAnalyzer } from "@/components/SkinImageAnalyzer";
import { useIsMobile } from "@/hooks/use-mobile";

const AddSkin = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const { data: searchResults = [], isLoading: isSearching } = useSearchSkins(searchQuery);
  const { data: weapons = [] } = useWeapons();
  const addSkinMutation = useAddSkin();
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSelectSkin = (skin: Skin) => {
    setSelectedSkin(skin);
    setModalOpen(true);
  };
  
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
      
      {isMobile && (
        <div className="mb-6">
          <SkinImageAnalyzer />
        </div>
      )}
      
      <div className="mb-6">
        <Search 
          placeholder="Busque uma skin pelo nome ou arma..." 
          onSearch={handleSearch}
        />
      </div>
      
      {isSearching && searchQuery.length > 2 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Buscando skins...</p>
        </div>
      )}
      
      {searchQuery.length > 2 && !isSearching && searchResults.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhuma skin encontrada com "{searchQuery}"</p>
        </div>
      )}
      
      {searchResults.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {searchResults.slice(0, 8).map((skin) => (
            <div 
              key={skin.id || `temp-${skin.name}`}
              onClick={() => handleSelectSkin(skin)}
              className="cursor-pointer transition-all hover:scale-[1.02]"
            >
              <InventoryCard
                weaponName={skin.weapon || ""}
                skinName={skin.name}
                image={skin.image}
                rarity={skin.rarity}
                className={selectedSkin?.id === skin.id ? 'ring-2 ring-primary' : ''}
              />
            </div>
          ))}
        </div>
      )}
      
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
