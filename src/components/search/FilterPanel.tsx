
import { Filter } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface FilterPanelProps {
  weaponFilter: string;
  rarityFilter: string;
  setWeaponFilter: (value: string) => void;
  setRarityFilter: (value: string) => void;
  weaponTypes: string[];
  rarityTypes: string[];
  itemsPerPage?: number;
  setItemsPerPage?: (value: number) => void;
  itemsPerPageOptions?: number[];
  currentTab: "inventory" | "allSkins";
}

export const FilterPanel = ({
  weaponFilter,
  rarityFilter,
  setWeaponFilter,
  setRarityFilter,
  weaponTypes,
  rarityTypes,
  itemsPerPage,
  setItemsPerPage,
  itemsPerPageOptions = [10, 25, 50, 100],
  currentTab
}: FilterPanelProps) => {
  return (
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
      
      {currentTab === "allSkins" && setItemsPerPage && itemsPerPage && (
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
  );
};
