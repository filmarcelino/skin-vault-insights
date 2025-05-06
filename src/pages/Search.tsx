
import { useState, useEffect } from "react";
import { useSkins } from "@/hooks/use-skins";
import { InventorySkinModal } from "@/components/skins/inventory-skin-modal";
import { useToast } from "@/hooks/use-toast";
import { addSkinToInventory } from "@/services/inventory";
import { Skin, InventoryItem } from "@/types/skin";

// Import refactored components
import { SearchHeader } from "@/components/search/SearchHeader";
import { FilterPanel } from "@/components/search/FilterPanel";
import { PremiumCTA } from "@/components/search/PremiumCTA";
import { SearchResults } from "@/components/search/SearchResults";
import { SearchPagination } from "@/components/search/SearchPagination";
import { useFilteredCategories } from "@/hooks/useCategories";
import { useInventoryActions } from "@/hooks/useInventoryActions";

const itemsPerPageOptions = [10, 25, 50, 100];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkin, setSelectedSkin] = useState<Skin | InventoryItem | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<"inventory" | "allSkins">("inventory");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [weaponFilter, setWeaponFilter] = useState("");
  const [rarityFilter, setRarityFilter] = useState("");
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const { toast } = useToast();

  // Hooks para gerenciar ações de inventário
  const inventoryActions = useInventoryActions();

  // Custom hook for filtered categories
  const { weaponTypes, rarityTypes } = useFilteredCategories();
  
  // Fetch skins data
  const { data: skins, isLoading: isSkinsLoading, error: skinsError } = useSkins({
    search: searchQuery.length > 2 ? searchQuery : undefined,
    onlyUserInventory: currentTab === "inventory",
    weapon: weaponFilter || undefined,
    rarity: rarityFilter || undefined,
    minPrice: minPrice,
    maxPrice: maxPrice
  });
  
  // Calculate pagination
  const totalItems = skins?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedSkins = skins?.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  ) || [];
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, currentTab, weaponFilter, rarityFilter, minPrice, maxPrice, itemsPerPage]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSkinClick = (skin: Skin | InventoryItem) => {
    // Verificar se é um item de inventário ou uma skin normal
    if ('inventoryId' in skin) {
      // É um item de inventário, abrir com as funcionalidades de edição
      inventoryActions.onEdit(skin as InventoryItem);
    } else {
      // É uma skin normal, abrir para adicionar ao inventário
      setSelectedSkin(skin);
      setDetailModalOpen(true);
    }
  };

  const handleTabChange = (value: string) => {
    setCurrentTab(value as "inventory" | "allSkins");
  };

  const handleAddToInventory = async (skin: Skin) => {
    try {
      const newItem = await addSkinToInventory(skin, {
        purchasePrice: skin.price || 0,
        marketplace: "Steam Market",
        feePercentage: 13,
        notes: "Added from search"
      });
      
      toast({
        title: "Skin Adicionada",
        description: `${skin.weapon || ""} | ${skin.name} foi adicionada ao inventário.`,
      });
      
      return newItem;
    } catch (err) {
      console.error("Error adding skin:", err);
      toast({
        title: "Erro",
        description: "Falha ao adicionar skin ao inventário",
        variant: "destructive"
      });
      return null;
    }
  };

  const handlePriceFilterChange = (min?: number, max?: number) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  return (
    <>
      <SearchHeader 
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        currentTab={currentTab}
        onTabChange={handleTabChange}
      />

      <FilterPanel
        weaponFilter={weaponFilter}
        rarityFilter={rarityFilter}
        setWeaponFilter={setWeaponFilter}
        setRarityFilter={setRarityFilter}
        weaponTypes={weaponTypes}
        rarityTypes={rarityTypes}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        itemsPerPageOptions={itemsPerPageOptions}
        currentTab={currentTab}
        onPriceFilterChange={handlePriceFilterChange}
        minPrice={minPrice}
        maxPrice={maxPrice}
      />
      
      <PremiumCTA />

      {skinsError && (
        <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400">
          Error loading skin data. Please try again later.
        </div>
      )}

      <SearchResults
        isLoading={isSkinsLoading}
        paginatedSkins={paginatedSkins}
        itemsPerPage={itemsPerPage}
        searchQuery={searchQuery}
        weaponFilter={weaponFilter}
        rarityFilter={rarityFilter}
        currentTab={currentTab}
        totalItems={totalItems}
        handleSkinClick={handleSkinClick}
      />
      
      <SearchPagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        show={totalPages > 1}
      />

      {/* Modal para adicionar nova skin */}
      <InventorySkinModal
        item={selectedSkin as InventoryItem}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onAddToInventory={handleAddToInventory}
      />

      {/* Modal para editar item existente */}
      <InventorySkinModal
        item={inventoryActions.selectedItem}
        open={inventoryActions.isModalOpen}
        onOpenChange={inventoryActions.setIsModalOpen}
        onSellSkin={inventoryActions.handleSell}
        onUpdateSkin={inventoryActions.handleUpdate}
        onClose={inventoryActions.onClose}
      />
    </>
  );
}
