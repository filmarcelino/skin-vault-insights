
import React, { useEffect, useState, useCallback } from 'react';
import { SearchHeader } from '@/components/search/SearchHeader'; 
import { SearchResults } from '@/components/search/SearchResults';
import { FilterPanel } from '@/components/search/FilterPanel';
import { SearchPagination } from '@/components/search/SearchPagination';
import { PremiumCTA } from '@/components/search/PremiumCTA';
import { useSkins } from '@/hooks/use-skins';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Skin } from '@/types/skin';
import { Loading } from '@/components/ui/loading';
import { useInventoryActions } from '@/hooks/useInventoryActions';
import { InventorySkinModal } from '@/components/skins/inventory-skin-modal';
import { useLanguage } from '@/contexts/LanguageContext';
import { defaultSkin } from '@/utils/default-objects';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function Search() {
  console.log("Search page loading");

  // Use the useSkins hook but destructure properly
  const { data: allSkins, isLoading: loading, error, refetch } = useSkins();
  const { isSubscribed, isTrial } = useSubscription();
  const { t } = useLanguage();
  const { selectedItem, isModalOpen, setIsModalOpen, handleViewDetails, handleAddToInventory } = useInventoryActions();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [filteredSkins, setFilteredSkins] = useState<Skin[]>([]);
  const [filterCount, setFilterCount] = useState(0);
  
  // Filters
  const [weaponFilter, setWeaponFilter] = useState<string>("all");
  const [rarityFilter, setRarityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [collectionFilter, setCollectionFilter] = useState<string>("all");
  const [minPriceFilter, setMinPriceFilter] = useState<number | null>(null);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);
  
  const handleClose = () => {
    setIsModalOpen(false);
  };
  
  // Get unique weapons, rarities, categories and collections for filter dropdowns
  const getUniqueOptions = useCallback(() => {
    if (!allSkins || !Array.isArray(allSkins)) return { weapons: [], rarities: [], categories: [], collections: [] };
    
    const weapons = [...new Set(allSkins.map(skin => skin.weapon).filter(Boolean))];
    const rarities = [...new Set(allSkins.map(skin => skin.rarity).filter(Boolean))];
    const categories = [...new Set(allSkins.map(skin => skin.category).filter(Boolean))];
    
    // Handle collections safely - first check if the skin has collections property
    const collections = [...new Set(
      allSkins
        .filter(skin => 'collections' in skin && skin.collections && Array.isArray(skin.collections) && skin.collections.length > 0)
        .map(skin => {
          if ('collections' in skin && skin.collections && Array.isArray(skin.collections)) {
            return skin.collections[0]?.name;
          }
          return null;
        })
        .filter(Boolean)
    )];
    
    return { weapons, rarities, categories, collections };
  }, [allSkins]);
  
  // Apply filters
  const applyFilters = useCallback(() => {
    if (loading || !allSkins || !Array.isArray(allSkins)) return;
    
    console.log("Applying filters:", { 
      searchQuery, 
      weaponFilter, 
      rarityFilter,
      categoryFilter,
      collectionFilter,
      minPriceFilter,
      maxPriceFilter 
    });
    
    let results = [...allSkins] as Skin[];
    let activeFilterCount = 0;
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(skin => 
        (skin.name?.toLowerCase().includes(query) || 
        skin.weapon?.toLowerCase().includes(query))
      );
      activeFilterCount++;
    }
    
    // Apply weapon filter
    if (weaponFilter && weaponFilter !== "all") {
      results = results.filter(skin => skin.weapon === weaponFilter);
      activeFilterCount++;
    }
    
    // Apply rarity filter
    if (rarityFilter && rarityFilter !== "all") {
      results = results.filter(skin => skin.rarity === rarityFilter);
      activeFilterCount++;
    }
    
    // Apply category filter
    if (categoryFilter && categoryFilter !== "all") {
      results = results.filter(skin => skin.category === categoryFilter);
      activeFilterCount++;
    }
    
    // Apply collection filter - safely check if collections exists
    if (collectionFilter && collectionFilter !== "all") {
      results = results.filter(skin => {
        if ('collections' in skin && skin.collections && Array.isArray(skin.collections)) {
          return skin.collections.some(collection => collection.name === collectionFilter);
        }
        return false;
      });
      activeFilterCount++;
    }
    
    // Apply price filters
    if (minPriceFilter !== null && !isNaN(minPriceFilter)) {
      results = results.filter(skin => (skin.price || 0) >= (minPriceFilter || 0));
      activeFilterCount++;
    }
    
    if (maxPriceFilter !== null && !isNaN(maxPriceFilter)) {
      results = results.filter(skin => (skin.price || 0) <= (maxPriceFilter || 0));
      activeFilterCount++;
    }
    
    setFilterCount(activeFilterCount);
    setFilteredSkins(results);
    setCurrentPage(1); // Reset to first page when filters change
    
    console.log(`Applied ${activeFilterCount} filters. Found ${results.length} matches.`);
  }, [
    allSkins, 
    loading, 
    searchQuery, 
    weaponFilter, 
    rarityFilter, 
    categoryFilter,
    collectionFilter,
    minPriceFilter, 
    maxPriceFilter
  ]);
  
  // Run filter whenever any filter criteria or data changes
  useEffect(() => {
    applyFilters();
  }, [
    applyFilters,
    allSkins, 
    searchQuery, 
    weaponFilter, 
    rarityFilter, 
    categoryFilter,
    collectionFilter,
    minPriceFilter, 
    maxPriceFilter
  ]);
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSkins.slice(indexOfFirstItem, indexOfLastItem);
  
  // Change page
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // Scroll to top when changing pages
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    setWeaponFilter("all");
    setRarityFilter("all");
    setCategoryFilter("all");
    setCollectionFilter("all");
    setMinPriceFilter(null);
    setMaxPriceFilter(null);
    setSearchQuery('');
  };
  
  const { weapons, rarities, categories, collections } = getUniqueOptions();
  
  // Try to refetch data if there was an error
  useEffect(() => {
    if (error) {
      console.error("Error loading skins data:", error);
    }
  }, [error]);

  useEffect(() => {
    console.log("Search loaded");
  }, []);
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loading size="lg" />
        <p className="mt-4 text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>{t("errors.loadingError")}</AlertTitle>
          <AlertDescription className="mt-2">
            {t("errors.couldNotLoadSkins")}
            <button 
              className="block mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md"
              onClick={() => refetch()}
            >
              {t("common.tryAgain")}
            </button>
          </AlertDescription>
        </Alert>
        
        <div className="mt-8 text-center">
          <h2 className="text-xl font-bold">{t("search.noSkinsAvailable")}</h2>
          <p className="text-muted-foreground mt-2">{t("search.tryReloading")}</p>
        </div>
      </div>
    );
  }
  
  if (!allSkins || !Array.isArray(allSkins)) {
    return (
      <div className="text-center p-6">
        <h2 className="text-xl font-bold text-red-500">{t("errors.invalidData")}</h2>
        <p className="text-muted-foreground">{t("errors.contactSupport")}</p>
      </div>
    );
  }
  
  return (
    <>
      <SearchHeader 
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <div>
          <FilterPanel 
            weaponFilter={weaponFilter}
            rarityFilter={rarityFilter}
            categoryFilter={categoryFilter}
            collectionFilter={collectionFilter}
            minPrice={minPriceFilter}
            maxPrice={maxPriceFilter}
            onWeaponFilterChange={setWeaponFilter}
            onRarityFilterChange={setRarityFilter}
            onCategoryFilterChange={setCategoryFilter}
            onCollectionFilterChange={setCollectionFilter}
            onResetFilters={handleResetFilters}
            onMinPriceChange={setMinPriceFilter}
            onMaxPriceChange={setMaxPriceFilter}
            activeFilterCount={filterCount}
            availableWeapons={weapons}
            availableRarities={rarities}
            availableCategories={categories}
            availableCollections={collections}
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
          
          {filteredSkins.length > itemsPerPage && (
            <SearchPagination 
              totalPages={Math.ceil(filteredSkins.length / itemsPerPage)}
              currentPage={currentPage}
              onPageChange={paginate}
            />
          )}
        </div>
      </div>
      
      <InventorySkinModal 
        open={isModalOpen} 
        onOpenChange={handleClose}
        skin={selectedItem || defaultSkin as Skin}
        mode={selectedItem?.sellMode ? 'sell' : (selectedItem?.isInUserInventory ? 'edit' : 'add')}
      />
    </>
  );
}
