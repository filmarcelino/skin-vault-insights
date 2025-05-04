
import { Skeleton } from "@/components/ui/skeleton";
import { Skin, InventoryItem } from "@/types/skin";
import { SkinListItem } from "@/components/inventory/SkinListItem";

interface SearchResultsProps {
  isLoading: boolean;
  paginatedSkins: (Skin | InventoryItem)[];
  itemsPerPage: number;
  searchQuery: string;
  weaponFilter: string;
  rarityFilter: string;
  currentTab: "inventory" | "allSkins";
  totalItems: number;
  handleSkinClick: (skin: Skin | InventoryItem) => void;
}

export const SearchResults = ({
  isLoading,
  paginatedSkins,
  itemsPerPage,
  searchQuery,
  weaponFilter,
  rarityFilter,
  currentTab,
  totalItems,
  handleSkinClick
}: SearchResultsProps) => {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">
          {currentTab === "inventory" ? "My Inventory" : "All Skins"}
        </h2>
        <div className="text-sm text-muted-foreground">
          {totalItems} {totalItems === 1 ? "item" : "items"} found
        </div>
      </div>

      <div className="flex flex-col gap-1.5 rounded-md">
        {isLoading ? (
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
    </div>
  );
};
