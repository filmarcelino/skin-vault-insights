import { useState, useEffect } from "react";
import { Search } from "@/components/ui/search";
import { ViewToggle } from "@/components/ui/view-toggle";
import { useSkins, useCategories } from "@/hooks/use-skins";
import { SkinListItem } from "@/components/inventory/SkinListItem";
import { SkinCard } from "@/components/inventory/SkinCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { InventorySkinModal } from "@/components/skins/inventory-skin-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Filter } from "lucide-react";
import { addSkinToInventory } from "@/services/inventory";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Skin, InventoryItem } from "@/types/skin";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const itemsPerPageOptions = [10, 25, 50, 100];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkin, setSelectedSkin] = useState<Skin | InventoryItem | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<"inventory" | "allSkins">("inventory");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [weaponFilter, setWeaponFilter] = useState("");
  const [rarityFilter, setRarityFilter] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Fetch skins data
  const { data: skins, isLoading: isSkinsLoading, error: skinsError } = useSkins({
    search: searchQuery.length > 2 ? searchQuery : undefined,
    onlyUserInventory: currentTab === "inventory",
    weapon: weaponFilter || undefined,
    rarity: rarityFilter || undefined
  });

  // Fetch categories for filtering options
  const { data: categories } = useCategories();

  // Extract unique weapon types and rarities from categories
  const weaponTypes = categories?.filter(cat => {
    if (typeof cat === 'object' && cat !== null && 'type' in cat) {
      return cat.type === 'weapon';
    }
    return false;
  }).map(cat => {
    if (typeof cat === 'object' && cat !== null && 'name' in cat) {
      return cat.name as string;
    }
    return '';
  }).filter(name => name !== '') || [];
  
  const rarityTypes = categories?.filter(cat => {
    if (typeof cat === 'object' && cat !== null && 'type' in cat) {
      return cat.type === 'rarity';
    }
    return false;
  }).map(cat => {
    if (typeof cat === 'object' && cat !== null && 'name' in cat) {
      return cat.name as string;
    }
    return '';
  }).filter(name => name !== '') || [];
  
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
  }, [searchQuery, currentTab, weaponFilter, rarityFilter, itemsPerPage]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSkinClick = (skin: Skin | InventoryItem) => {
    setSelectedSkin(skin);
    setDetailModalOpen(true);
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
        title: "Skin Added",
        description: `${skin.weapon} | ${skin.name} was added to your inventory.`,
      });
      
      return newItem;
    } catch (err) {
      console.error("Error adding skin:", err);
      toast({
        title: "Error",
        description: "Failed to add skin to inventory",
        variant: "destructive"
      });
      return null;
    }
  };

  const PremiumCTA = () => {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-sm my-4 animate-fade-in">
        <CardContent className="flex flex-col md:flex-row items-center justify-between p-6">
          <div className="space-y-2 mb-4 md:mb-0">
            <h3 className="flex items-center text-lg font-bold">
              <Crown className="h-5 w-5 mr-2 text-primary" />
              Upgrade to CS Skin Vault Premium
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Get unlimited skins, advanced analytics, and priority support. Start with a 3-day free trial.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/subscription')}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            Get Premium
          </Button>
        </CardContent>
      </Card>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    // Display up to 5 page numbers, with ellipsis if needed
    const pageNumbers: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      if (currentPage > 3) {
        pageNumbers.push("...");
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pageNumbers.push("...");
      }
      
      pageNumbers.push(totalPages);
    }

    return (
      <Pagination className="my-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {pageNumbers.map((page, index) => (
            <PaginationItem key={index}>
              {typeof page === "number" ? (
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </PaginationLink>
              ) : (
                <span className="px-2">...</span>
              )}
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <Search 
          placeholder="Search for weapon, skin or rarity..." 
          onChange={handleSearchChange}
          value={searchQuery}
          className="flex-1"
        />
        <div className="flex items-center gap-2">
          <ViewToggle 
            view={viewMode}
            onChange={setViewMode}
          />
          <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as "inventory" | "allSkins")} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="inventory">My Inventory</TabsTrigger>
              <TabsTrigger value="allSkins">All Skins</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex gap-2 items-center flex-1">
          <Select value={weaponFilter} onValueChange={setWeaponFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Weapon Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Weapons</SelectItem>
              {weaponTypes.map(weapon => (
                <SelectItem key={weapon} value={weapon}>{weapon}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={rarityFilter} onValueChange={setRarityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rarity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Rarities</SelectItem>
              {rarityTypes.map(rarity => (
                <SelectItem key={rarity} value={rarity}>{rarity}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" className="h-10 w-10">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        {currentTab === "allSkins" && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Items per page:</span>
            <Select 
              value={itemsPerPage.toString()} 
              onValueChange={(val) => setItemsPerPage(Number(val))}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="25" />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map(option => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <PremiumCTA />

      <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {currentTab === "inventory" ? "My Inventory" : "All Skins"}
          </h2>
          <div className="text-sm text-muted-foreground">
            {totalItems} {totalItems === 1 ? "item" : "items"} found
          </div>
        </div>

        {skinsError && (
          <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400">
            Error loading skin data. Please try again later.
          </div>
        )}

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {isSkinsLoading ? (
              Array.from({ length: itemsPerPage }).map((_, idx) => (
                <div key={`skeleton-${idx}`} className="cs-card p-2">
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                  <div className="w-full h-16 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                  <div className="flex justify-between mt-1">
                    <div className="h-2.5 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-2.5 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))
            ) : paginatedSkins.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                {searchQuery.length > 0 || weaponFilter || rarityFilter ? (
                  <>No skins found matching your criteria. Try adjusting your filters.</>
                ) : currentTab === "inventory" ? (
                  <>Your inventory is empty.</>
                ) : (
                  <>No skins available.</>
                )}
              </div>
            ) : (
              paginatedSkins.map((skin) => {
                // Convert Skin to InventoryItem if needed
                const itemToUse: InventoryItem = 'inventoryId' in skin 
                  ? skin as InventoryItem 
                  : {
                      ...skin,
                      inventoryId: `demo-${skin.id}`,
                      acquiredDate: new Date().toISOString(),
                      purchasePrice: skin.price || 0,
                      currentPrice: skin.price,
                      tradeLockDays: 0,
                      isStatTrak: false,
                      isInUserInventory: false
                    };
                    
                return (
                  <SkinCard 
                    key={itemToUse.inventoryId}
                    item={itemToUse}
                    showMetadata={true}
                    onClick={() => handleSkinClick(skin)}
                    className="animate-fade-in hover:scale-105 transition-transform duration-200"
                  />
                );
              })
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 rounded-md">
            {isSkinsLoading ? (
              Array.from({ length: itemsPerPage }).map((_, idx) => (
                <div key={`skeleton-list-${idx}`} className="p-3 flex items-center gap-3">
                  <Skeleton className="h-12 w-12 shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-12 shrink-0" />
                </div>
              ))
            ) : paginatedSkins.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery.length > 0 || weaponFilter || rarityFilter ? (
                  <>No skins found matching your criteria. Try adjusting your filters.</>
                ) : currentTab === "inventory" ? (
                  <>Your inventory is empty.</>
                ) : (
                  <>No skins available.</>
                )}
              </div>
            ) : (
              paginatedSkins.map((skin) => {
                // Convert Skin to InventoryItem if needed
                const itemToUse: InventoryItem = 'inventoryId' in skin 
                  ? skin as InventoryItem 
                  : {
                      ...skin,
                      inventoryId: `demo-${skin.id}`,
                      acquiredDate: new Date().toISOString(),
                      purchasePrice: skin.price || 0,
                      currentPrice: skin.price,
                      tradeLockDays: 0,
                      isStatTrak: false,
                      isInUserInventory: false
                    };
                
                return (
                  <SkinListItem 
                    key={itemToUse.inventoryId}
                    item={itemToUse}
                    showMetadata={true}
                    onClick={() => handleSkinClick(skin)}
                    className="animate-fade-in"
                  />
                );
              })
            )}
          </div>
        )}
        
        {currentTab === "allSkins" && renderPagination()}
      </div>

      <InventorySkinModal
        item={selectedSkin as InventoryItem}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onAddToInventory={handleAddToInventory}
      />
    </>
  );
}
