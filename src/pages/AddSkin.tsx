
import React, { useState } from 'react';
import { useInventoryActions } from '@/hooks/useInventoryActions';
import { InventorySkinModal } from '@/components/skins/inventory-skin-modal';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { defaultSkin } from '@/utils/default-objects';
import { Skin } from '@/types/skin';
import { Search } from '@/components/ui/search';
import { useSkins } from '@/hooks/use-skins';
import { SkinDetailModal } from '@/components/skins/skin-detail-modal';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AddSkin() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Fetch all skins for search
  const { data: allSkins = [], isLoading } = useSkins();
  
  const { handleAddToInventory } = useInventoryActions();
  
  // Filter skins based on searchQuery
  const filteredSkins = React.useMemo(() => {
    if (!searchQuery) return [];
    
    return allSkins.filter(skin => {
      const fullName = `${skin.weapon || ""} ${skin.name || ""}`.toLowerCase();
      const search = searchQuery.toLowerCase();
      return fullName.includes(search);
    }).slice(0, 20); // Limit results
  }, [searchQuery, allSkins]);
  
  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };
  
  // Handle skin click
  const handleSkinClick = (skin: Skin) => {
    setSelectedSkin(skin);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/inventory')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{t("inventory.add")}</h1>
        </div>
      </div>
      
      <div className="w-full max-w-xl mx-auto">
        <Search 
          placeholder={t("search.placeholder") || "Search for a skin..."}
          value={searchQuery}
          onSearch={handleSearchChange}
          className="mb-6"
        />
        
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        ) : filteredSkins.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredSkins.map((skin) => (
              <div 
                key={skin.id}
                className="cs-card p-2 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handleSkinClick(skin)}
              >
                <div className="aspect-square bg-black/20 rounded-sm mb-2 flex items-center justify-center">
                  {skin.image ? (
                    <img 
                      src={skin.image} 
                      alt={skin.name} 
                      className="max-h-full max-w-full object-contain p-1"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">No image</span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium line-clamp-1">{skin.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{skin.weapon}</p>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t("search.noResults")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("search.tryDifferent")}</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("search.enterQuery")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("search.searchByName")}</p>
          </div>
        )}
      </div>
      
      <SkinDetailModal 
        skin={selectedSkin}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        onAddSkin={handleAddToInventory}
      />
    </div>
  );
}
