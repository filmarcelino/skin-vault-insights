
import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/layout';
import { SearchHeader } from '@/components/search/SearchHeader'; 
import { SearchResults } from '@/components/search/SearchResults';
import { FilterPanel } from '@/components/search/FilterPanel';
import { SearchPagination } from '@/components/search/SearchPagination';
import { PremiumCTA } from '@/components/search/PremiumCTA';
import { useSkins } from '@/hooks/use-skins';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Skin } from '@/types/skin';
import { Loading } from '@/components/ui/loading';
import { useNavigate } from 'react-router-dom';
import { useInventoryActions } from '@/hooks/useInventoryActions';
import { InventorySkinModal } from '@/components/skins/inventory-skin-modal';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Search() {
  // Use the useSkins hook but destructure properly
  const { data: skins, isLoading: loading, error } = useSkins();
  const { isSubscribed, isTrial } = useSubscription();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [filteredSkins, setFilteredSkins] = useState<Skin[]>([]);
  
  // Filters
  const [weaponFilter, setWeaponFilter] = useState<string>('');
  const [rarityFilter, setRarityFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [minPriceFilter, setMinPriceFilter] = useState<number | null>(null);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);

  const { selectedItem, isModalOpen, setIsModalOpen, handleViewDetails } = useInventoryActions();
  
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
  
  // Add handlers for components' props
  const handleAddToInventory = (item: any) => {
    console.log('Add to inventory:', item);
    setIsModalOpen(true);
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
      />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <div>
          <FilterPanel 
            weaponFilter={weaponFilter}
            rarityFilter={rarityFilter}
            minPrice={minPriceFilter}
            maxPrice={maxPriceFilter}
            onWeaponFilterChange={setWeaponFilter}
            onRarityFilterChange={setRarityFilter}
            onResetFilters={handleResetFilters}
            onMinPriceChange={setMinPriceFilter}
            onMaxPriceChange={setMaxPriceFilter}
          />
          
          {!isSubscribed && !isTrial && (
            <div className="mt-6">
              <PremiumCTA />
            </div>
          )}
        </div>
        
        <div className="flex flex-col space-y-6">
          <SearchResults 
            items={currentItems} 
            onAddToInventory={handleAddToInventory}
            onViewDetails={handleViewDetails}
            totalItems={filteredSkins.length}
          />
          
          <SearchPagination 
            totalPages={Math.ceil(filteredSkins.length / itemsPerPage)}
            currentPage={currentPage}
            onPageChange={paginate}
          />
        </div>
      </div>
      
      <InventorySkinModal 
        open={isModalOpen} 
        onOpenChange={handleClose}
        skin={selectedItem || {}}
        mode="add"
      />
    </Layout>
  );
}
