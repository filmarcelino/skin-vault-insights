
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "@/components/ui/search";
import { useSearchSkins, useWeapons, useInvalidateInventory } from "@/hooks/use-skins";
import { Skin } from "@/types/skin";
import { useToast } from "@/hooks/use-toast";
import { SkinDetailModal } from "@/components/skins/skin-detail-modal";
import { InventoryCard } from "@/components/dashboard/inventory-card";
import { addSkinToInventory } from "@/services/inventory-service";

const AddSkin = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const invalidateInventory = useInvalidateInventory();
  
  const { data: searchResults = [], isLoading: isSearching } = useSearchSkins(searchQuery);
  const { data: weapons = [] } = useWeapons();
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSelectSkin = (skin: Skin) => {
    setSelectedSkin(skin);
    setModalOpen(true);
  };
  
  const handleAddSkin = (skinData: any) => {
    try {
      console.log("Adding skin with data:", skinData);
      
      // Add the skin to inventory
      addSkinToInventory({
        id: skinData.skinId,
        name: skinData.name,
        weapon: skinData.weapon,
        rarity: skinData.rarity,
        image: skinData.image,
        price: skinData.estimatedValue || skinData.purchasePrice,
      }, {
        purchasePrice: skinData.purchasePrice || 0,
        marketplace: skinData.marketplace || "Steam Market",
        feePercentage: skinData.feePercentage || 0,
        notes: skinData.notes || ""
      });
      
      // Force refresh inventory data
      invalidateInventory();
      
      // Show success toast
      toast({
        title: "Skin Added",
        description: `${skinData.weapon || ""} | ${skinData.name} has been added to your inventory.`,
      });
      
      // Reset form and navigate back to inventory
      setSelectedSkin(null);
      navigate("/inventory");
    } catch (error) {
      console.error("Error adding skin:", error);
      toast({
        title: "Error",
        description: "Failed to add skin to your inventory",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Add Skin to Inventory</h1>
      
      <div className="mb-6">
        <Search 
          placeholder="Search for a skin by name or weapon..." 
          onSearch={handleSearch}
        />
      </div>
      
      {isSearching && searchQuery.length > 2 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Searching for skins...</p>
        </div>
      )}
      
      {searchQuery.length > 2 && !isSearching && searchResults.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No skins found matching "{searchQuery}"</p>
        </div>
      )}
      
      {searchResults.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {searchResults.slice(0, 8).map((skin) => (
            <div 
              key={skin.id}
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
      
      {/* Skin Detail Modal */}
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
