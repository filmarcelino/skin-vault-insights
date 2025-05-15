
import React, { useState, useEffect } from 'react';
import { useSkins } from '@/hooks/use-skins';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { InventorySection } from '@/components/dashboard/inventory-section';
import { SearchSection } from '@/components/dashboard/search-section';
import { ActivitySection } from '@/components/dashboard/activity-section';
import { useInventoryActions } from '@/hooks/useInventoryActions';
import { InventorySkinModal } from '@/components/skins/inventory-skin-modal';
import { SkinDetailModal } from '@/components/skins/skin-detail-modal';
import { useViewMode } from '@/hooks/useViewMode';
import { useInventoryFilter } from '@/hooks/useInventoryFilter';
import { useTransactions } from '@/hooks/useTransactions';
import { useCurrency } from '@/contexts/CurrencyContext';
import { InventoryItem, Skin, Transaction } from '@/types/skin';
import { Loading } from "@/components/ui/loading";
import { defaultSkin } from '@/utils/default-objects';

export default function Index() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const { viewMode, setViewMode } = useViewMode("grid");
  const { formatPrice } = useCurrency();

  // Fetch inventory data
  const { data: userInventory = [], isLoading: isLoadingInventory } = useSkins({ onlyUserInventory: true });
  
  // Fetch all skins for search
  const { data: allSkins = [], isLoading: isLoadingSkins } = useSkins();
  
  // Fix the transaction loading by providing a proper initial value
  const { data: transactions = [], isLoading: isTransactionsLoading } = useTransactions();
  
  const { 
    handleAddToInventory, 
    handleViewDetails, 
    selectedItem,
    isModalOpen,
    setIsModalOpen
  } = useInventoryActions();

  const {
    searchQuery: inventorySearchQuery,
    setSearchQuery: setInventorySearchQuery,
    weaponFilter,
    setWeaponFilter,
    rarityFilter,
    setRarityFilter,
    sortMethod,
    setSortMethod,
    handleSearchChange,
    filterItems
  } = useInventoryFilter(userInventory as InventoryItem[]);

  // Calculate inventory statistics
  const inventoryStats = React.useMemo(() => {
    if (userInventory?.length === 0) return { totalValue: formatPrice(0) };
    
    const totalValue = userInventory.reduce((acc, item: any) => 
      acc + (item.currentPrice || item.price || 0), 0);
      
    return { totalValue: formatPrice(totalValue) };
  }, [userInventory, formatPrice]);

  // Filter the inventory based on the current filters
  const filteredInventory = React.useMemo(() => {
    return filterItems(userInventory as InventoryItem[] || []);
  }, [filterItems, userInventory]);

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
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle skin click in search section
  const handleSkinClick = (skin: Skin) => {
    setSelectedSkin(skin);
    setIsDetailModalOpen(true);
  };

  // Handle skin click in inventory section (view details)
  const handleInventorySkinClick = (item: InventoryItem) => {
    handleViewDetails(item);
  };

  // Add a debug log to check component load
  useEffect(() => {
    console.log("Dashboard ready");
  }, []);

  return (
    <div className="space-y-6 pb-8">
      {/* Tab navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="pb-6">
        <TabsList className="w-full">
          <TabsTrigger value="inventory" className="w-1/2">
            My Inventory
          </TabsTrigger>
          <TabsTrigger value="search" className="w-1/2">
            Search Skins
          </TabsTrigger>
        </TabsList>
          
        {/* Search input */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={activeTab === 'inventory' ? "Filter inventory..." : "Search for skins..."}
              className="pl-8"
              value={activeTab === 'inventory' ? inventorySearchQuery : searchQuery}
              onChange={activeTab === 'inventory' ? handleSearchChange : handleSearchInputChange}
            />
          </div>
        </div>

        {/* Tab content */}
        <TabsContent value="inventory" className="mt-6">
          <InventorySection 
            searchQuery={inventorySearchQuery}
            onSearchChange={handleSearchChange}
            weaponFilter={weaponFilter}
            setWeaponFilter={setWeaponFilter}
            rarityFilter={rarityFilter}
            setRarityFilter={setRarityFilter}
            sortMethod={sortMethod}
            setSortMethod={setSortMethod}
            viewMode={viewMode}
            isLoading={isLoadingInventory}
            filteredInventory={filteredInventory}
            userInventory={userInventory as InventoryItem[]}
            inventoryStats={inventoryStats}
            handleSkinClick={handleInventorySkinClick}
          />
        </TabsContent>
          
        <TabsContent value="search" className="mt-6">
          <SearchSection 
            viewMode={viewMode}
            isSkinsLoading={isLoadingSkins}
            skins={filteredSkins as Skin[]}
            searchQuery={searchQuery}
            handleSkinClick={handleSkinClick}
          />
        </TabsContent>
      </Tabs>
      
      {/* Activity Section with proper typing */}
      <ActivitySection 
        isLoading={isTransactionsLoading}
        transactions={transactions as Transaction[]}
      />
      
      {/* Skin detail modal for search items */}
      <SkinDetailModal 
        skin={selectedSkin}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        onAddSkin={handleAddToInventory}
      />
      
      {/* Skin modal for inventory items */}
      <InventorySkinModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        skin={selectedItem || defaultSkin as Skin}
        mode={selectedItem?.sellMode ? 'sell' : (selectedItem?.isInUserInventory ? 'edit' : 'add')}
      />
    </div>
  );
}
