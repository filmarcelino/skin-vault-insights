
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "@/components/ui/search";
import { useSearchSkins, useWeapons } from "@/hooks/use-skins";
import { Skin } from "@/types/skin";
import { useToast } from "@/hooks/use-toast";
import { SkinDetailModal } from "@/components/skins/skin-detail-modal";

const AddSkin = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
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
    // Here we would normally save this to a backend, but for now let's just simulate it
    console.log("Adding skin:", skinData);
    
    toast({
      title: "Skin Added",
      description: `${skinData.weapon || ""} | ${skinData.name} has been added to your inventory.`,
    });
    
    // Reset form and navigate back to inventory
    setSelectedSkin(null);
    navigate("/inventory");
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
              className={`cs-card p-3 flex flex-col cursor-pointer transition-all ${selectedSkin?.id === skin.id ? 'ring-2 ring-primary' : 'hover:bg-secondary/50'}`}
              onClick={() => handleSelectSkin(skin)}
            >
              <div className="font-medium text-sm">
                {skin.weapon} | <span className="text-primary">{skin.name}</span>
              </div>
              {skin.image && (
                <div className="relative w-full h-24 my-2 flex items-center justify-center">
                  <img 
                    src={skin.image} 
                    alt={`${skin.weapon} ${skin.name}`}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
              )}
              <div className="flex items-center justify-between mt-auto">
                <div className="text-xs text-muted-foreground">{skin.rarity}</div>
              </div>
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
