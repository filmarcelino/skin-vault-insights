
import { Search } from "@/components/ui/search";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select";
import { useFilteredCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface InventoryFilter {
  id: string;
  label: string;
  value: string;
}

export interface InventoryFilterBarProps {
  filters: InventoryFilter[];
  onFilterChange: (filterId: string, value: string) => void;
  onClearFilters: () => void;
}

export const InventoryFilterBar = ({
  filters,
  onFilterChange,
  onClearFilters
}: InventoryFilterBarProps) => {
  const { weaponTypes, rarityTypes } = useFilteredCategories();
  const { t } = useLanguage();
  
  // Find filters by ID, with fallbacks to prevent undefined errors
  const searchFilter = filters?.find(f => f.id === "search")?.value || "";
  const weaponFilter = filters?.find(f => f.id === "weapon")?.value || "all";
  const rarityFilter = filters?.find(f => f.id === "rarity")?.value || "all";
  const sortMethod = filters?.find(f => f.id === "sort")?.value || "price_desc";
  
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <Search 
        placeholder={t("inventory.searchPlaceholder")}
        value={searchFilter}
        onChange={(e) => onFilterChange("search", e.target.value)}
        className="flex-1"
      />
      <div className="flex flex-wrap gap-2">
        <Select value={weaponFilter} onValueChange={(value) => onFilterChange("weapon", value)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t('filters.weaponType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.allWeapons')}</SelectItem>
            {weaponTypes.map(weapon => (
              <SelectItem key={weapon} value={weapon || "unknown"}>{weapon || "Unknown"}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={rarityFilter} onValueChange={(value) => onFilterChange("rarity", value)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t('filters.rarity')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.allRarities')}</SelectItem>
            {rarityTypes.map(rarity => (
              <SelectItem key={rarity} value={rarity || "unknown"}>{rarity || "Unknown"}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={sortMethod} onValueChange={(value) => onFilterChange("sort", value)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('filters.sortBy')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price_desc">{t('filters.highestValue')}</SelectItem>
            <SelectItem value="price_asc">{t('filters.lowestValue')}</SelectItem>
            <SelectItem value="name_asc">{t('filters.nameAZ')}</SelectItem>
            <SelectItem value="name_desc">{t('filters.nameZA')}</SelectItem>
            <SelectItem value="date_desc">{t('filters.newest')}</SelectItem>
            <SelectItem value="date_asc">{t('filters.oldest')}</SelectItem>
          </SelectContent>
        </Select>
        
        {filters && filters.some(f => f.value && f.value !== "all") && (
          <Button variant="outline" size="sm" onClick={onClearFilters} className="gap-1">
            <X className="h-4 w-4" />
            {t('filters.clear')}
          </Button>
        )}
      </div>
    </div>
  );
};
