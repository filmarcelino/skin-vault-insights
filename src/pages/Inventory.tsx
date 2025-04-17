
import { useState } from "react";
import { useInventory, useRemoveSkin } from "@/hooks/use-skins";
import { InventoryCard } from "@/components/dashboard/inventory-card";
import { InventorySkinModal } from "@/components/skins/inventory-skin-modal";
import { InventoryItem, SellData } from "@/types/skin";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/hooks/use-toast";
import { Search } from "@/components/ui/search";
import { searchSkins } from "@/services/api";

const Inventory = () => {
  const { data: inventoryItems = [], isLoading, error } = useInventory();
  const [selectedSkin, setSelectedSkin] = useState<InventoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const { toast } = useToast();
  const removeSkinMutation = useRemoveSkin();

  const handleSkinClick = (skin: InventoryItem) => {
    setSelectedSkin(skin);
    setIsModalOpen(true);
  };

  const handleSellSkin = (itemId: string, sellData: SellData) => {
    // Implementation will be added later in a separate feature
    console.log("Selling skin:", itemId, sellData);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    
    if (!value.trim()) {
      setFilteredItems([]);
      return;
    }
    
    const searchTerms = value.toLowerCase().trim().split(/\s+/);
    
    // Filtro mais tolerante usando termos parciais
    const filtered = inventoryItems.filter(item => {
      const nameMatch = item.name ? searchTerms.some(term => item.name.toLowerCase().includes(term)) : false;
      const weaponMatch = item.weapon ? searchTerms.some(term => item.weapon.toLowerCase().includes(term)) : false;
      const rarityMatch = item.rarity ? searchTerms.some(term => item.rarity.toLowerCase().includes(term)) : false;
      
      return nameMatch || weaponMatch || rarityMatch;
    });
    
    setFilteredItems(filtered);
  };

  const handleRemoveSkin = (itemId: string) => {
    removeSkinMutation.mutate(itemId, {
      onSuccess: () => {
        toast({
          title: "Skin removida",
          description: "A skin foi removida do seu inventário com sucesso."
        });
        setIsModalOpen(false);
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Erro ao remover skin",
          description: "Não foi possível remover a skin do seu inventário."
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading inventory: {error.message}
      </div>
    );
  }

  const displayItems = searchQuery ? filteredItems : inventoryItems;

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Seu Inventário de Skins</h1>
      
      <div className="mb-6">
        <Search 
          placeholder="Pesquisar arma, skin, raridade..."
          onSearch={handleSearch}
          debounceTime={300}
        />
      </div>
      
      {displayItems.length === 0 ? (
        <div className="text-center py-10 border border-dashed rounded-lg">
          {searchQuery ? (
            <p className="text-muted-foreground mb-4">
              Nenhuma skin encontrada com o termo "{searchQuery}".
            </p>
          ) : (
            <>
              <p className="text-muted-foreground mb-4">
                Seu inventário está vazio.
              </p>
              <a 
                href="/add" 
                className="text-primary hover:underline"
              >
                Adicione sua primeira skin aqui!
              </a>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayItems.map((skin, index) => (
            <InventoryCard
              key={skin.inventoryId || `skin-${index}`}
              weaponName={skin.weapon || "Unknown"}
              skinName={skin.name}
              wear={skin.wear || ""}
              price={skin.currentPrice?.toString() || skin.price?.toString() || "N/A"}
              image={skin.image}
              rarity={skin.rarity}
              isStatTrak={skin.isStatTrak}
              tradeLockDays={skin.tradeLockDays}
              tradeLockUntil={skin.tradeLockUntil}
              className="animate-fade-in hover:scale-105 transition-transform duration-200"
              style={{
                animationDelay: `${0.1 + index * 0.05}s`,
              }}
              onClick={() => handleSkinClick(skin)}
            />
          ))}
        </div>
      )}

      {selectedSkin && (
        <InventorySkinModal
          item={selectedSkin}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSellSkin={handleSellSkin}
          onRemoveSkin={handleRemoveSkin}
        />
      )}
    </div>
  );
};

export default Inventory;
