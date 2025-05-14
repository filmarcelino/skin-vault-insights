
import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/layout';
import { SearchHeader } from '@/components/search/SearchHeader'; 
import { SearchResults } from '@/components/search/SearchResults';
import { FilterPanel } from '@/components/search/FilterPanel';
import { SearchPagination } from '@/components/search/SearchPagination';
import { PremiumCTA } from '@/components/search/PremiumCTA';
import { useSkins } from '@/hooks/use-skins';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { RarityType, SkinType, Skin, WeaponType } from '@/types/skin';
import { Loading } from '@/components/ui/loading';
import { skin_details } from '@/components/skins/skin-detail-modal';
import { useNavigate } from 'react-router-dom';
import { useInventoryActions } from '@/hooks/useInventoryActions';
import { InventorySkinModal } from '@/components/skins/inventory-skin-modal';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Search() {
  const { skins, loading, error } = useSkins();
  const { isSubscribed, isTrial } = useSubscription();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [filteredSkins, setFilteredSkins] = useState<Skin[]>([]);
  
  // Filters
  const [weaponFilter, setWeaponFilter] = useState<WeaponType | ''>('');
  const [rarityFilter, setRarityFilter] = useState<RarityType | ''>('');
  const [typeFilter, setTypeFilter] = useState<SkinType | ''>('');
  const [minPriceFilter, setMinPriceFilter] = useState<number | null>(null);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);

  const {
    selectedItem,
    isModalOpen,
    setIsModalOpen,
    setSelectedItem,
    handleViewDetails
  } = useInventoryActions();
  
  // Create handlers for onEdit, handleUpdate, onClose
  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  
  const handleUpdate = (updatedItem: any) => {
    console.log(`Updating item:`, updatedItem);
    setIsModalOpen(false);
    // Add your update logic here
  };
  
  const handleClose = () => {
    setIsModalOpen(false);
  };
  
  // Apply filters
  useEffect(() => {
    if (loading || !skins) return;
    
    let results = [...skins];
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(skin => 
        skin.name.toLowerCase().includes(query) || 
        skin.weapon?.toLowerCase().includes(query)
      );
    }
    
    // Apply weapon filter
    if (weaponFilter) {
      results = results.filter(skin => skin.weapon === weaponFilter);
    }
    
    // Apply rarity filter
    if (rarityFilter) {
      results = results.filter(skin => skin.rarity === rarityFilter);
    }
    
    // Apply type filter
    if (typeFilter) {
      results = results.filter(skin => skin.type === typeFilter);
    }
    
    // Apply price filters
    if (minPriceFilter !== null) {
      results = results.filter(skin => (skin.price || 0) >= (minPriceFilter || 0));
    }
    
    if (maxPriceFilter !== null) {
      results = results.filter(skin => (skin.price || 0) <= (maxPriceFilter || 0));
    }
    
    setFilteredSkins(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [skins, searchQuery, weaponFilter, rarityFilter, typeFilter, minPriceFilter, maxPriceFilter, loading]);
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSkins.slice(indexOfFirstItem, indexOfLastItem);
  
  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    setWeaponFilter('');
    setRarityFilter('');
    setTypeFilter('');
    setMinPriceFilter(null);
    setMaxPriceFilter(null);
    setSearchQuery('');
  };
  
  if (loading) return <Layout><Loading /></Layout>;
  
  if (error) return (
    <Layout>
      <div className="text-center p-6">
        <h2 className="text-xl font-bold text-red-500">{t("errors.loadingError")}</h2>
        <p className="text-muted-foreground">{t("errors.tryAgain")}</p>
        <button 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          onClick={() => window.location.reload()}
        >
          {t("common.refresh")}
        </button>
      </div>
    </Layout>
  );
  
  return (
    <Layout>
      <SearchHeader 
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        totalResults={filteredSkins.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <div>
          <FilterPanel 
            weaponFilter={weaponFilter}
            rarityFilter={rarityFilter}
            typeFilter={typeFilter}
            minPrice={minPriceFilter}
            maxPrice={maxPriceFilter}
            onWeaponFilterChange={setWeaponFilter}
            onRarityFilterChange={setRarityFilter}
            onTypeFilterChange={setTypeFilter}
            onMinPriceChange={setMinPriceFilter}
            onMaxPriceChange={setMaxPriceFilter}
            onResetFilters={handleResetFilters}
          />
          
          {!isSubscribed && !isTrial && (
            <div className="mt-6">
              <PremiumCTA />
            </div>
          )}
        </div>
        
        <div className="flex flex-col space-y-6">
          <SearchResults 
            skins={currentItems} 
            onAddToInventory={handleEdit}
            onViewDetails={handleViewDetails}
          />
          
          <SearchPagination 
            itemsPerPage={itemsPerPage}
            totalItems={filteredSkins.length}
            currentPage={currentPage}
            paginate={paginate}
          />
        </div>
      </div>
      
      <InventorySkinModal 
        isOpen={isModalOpen}
        onClose={handleClose}
        onSave={handleUpdate}
        skin={selectedItem}
        mode="add"
      />
    </Layout>
  );
}
