
import React from "react";
import { Button } from "@/components/ui/button";
import { InventoryCard } from "@/components/dashboard/inventory-card";
import { InventoryListItem } from "@/components/dashboard/inventory-list-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Skin } from "@/types/skin";
import { useNavigate } from "react-router-dom";

interface SearchSectionProps {
  viewMode: 'grid' | 'list';
  isSkinsLoading: boolean;
  skins: Skin[] | null;
  searchQuery: string;
  handleSkinClick: (skin: Skin) => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  viewMode,
  isSkinsLoading,
  skins,
  searchQuery,
  handleSkinClick,
}) => {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Search Results</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/search')}
          className="text-primary border-primary hover:bg-primary/10"
        >
          Advanced Search
        </Button>
      </div>
      
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {isSkinsLoading ? (
            Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="cs-card p-2 flex flex-col">
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="w-full h-16 mb-1" />
                <div className="flex items-center justify-between mt-auto">
                  <Skeleton className="h-2.5 w-12" />
                  <Skeleton className="h-2.5 w-10" />
                </div>
              </div>
            ))
          ) : skins && skins.length > 0 ? (
            skins.map((skin, index) => (
              <InventoryCard 
                key={skin.id}
                weaponName={skin.weapon || "Unknown"}
                skinName={skin.name}
                wear={skin.wear || skin.rarity || "Unknown"}
                price={skin.price?.toString() || "N/A"}
                image={skin.image}
                rarity={skin.rarity}
                isStatTrak={skin.isStatTrak}
                tradeLockDays={0}
                className="animate-fade-in transition-transform duration-200"
                style={{ animationDelay: `${0.5 + (index * 0.05)}s` }}
                onClick={() => handleSkinClick(skin)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              {searchQuery.length > 0 ? (
                <>No skins found matching "{searchQuery}". Try adjusting your search.</>
              ) : (
                <>Enter a search term to find skins.</>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 border rounded-md divide-y divide-border/50">
          {isSkinsLoading ? (
            Array.from({ length: 10 }).map((_, index) => (
              <div key={`skeleton-list-search-${index}`} className="p-3 flex items-center gap-3">
                <Skeleton className="h-12 w-12 shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-12 shrink-0" />
              </div>
            ))
          ) : skins && skins.length > 0 ? (
            skins.map((skin, index) => (
              <InventoryListItem 
                key={skin.id}
                weaponName={skin.weapon || "Unknown"}
                skinName={skin.name}
                wear={skin.wear || skin.rarity || "Unknown"}
                price={skin.price?.toString() || "N/A"}
                image={skin.image}
                rarity={skin.rarity}
                isStatTrak={skin.isStatTrak}
                tradeLockDays={0}
                className="animate-fade-in"
                style={{ animationDelay: `${0.5 + (index * 0.05)}s` }}
                onClick={() => handleSkinClick(skin)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery.length > 0 ? (
                <>No skins found matching "{searchQuery}". Try adjusting your search.</>
              ) : (
                <>Enter a search term to find skins.</>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
