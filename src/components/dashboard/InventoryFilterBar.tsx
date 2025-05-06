
import { Search } from "@/components/ui/search";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select";
import { useFilteredCategories } from "@/hooks/useCategories";

interface InventoryFilterBarProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  weaponFilter: string;
  onWeaponFilterChange: (value: string) => void;
  rarityFilter: string;
  onRarityFilterChange: (value: string) => void;
  sortMethod: string;
  onSortMethodChange: (value: string) => void;
}

export const InventoryFilterBar = ({
  searchQuery,
  onSearchChange,
  weaponFilter,
  onWeaponFilterChange,
  rarityFilter,
  onRarityFilterChange,
  sortMethod,
  onSortMethodChange
}: InventoryFilterBarProps) => {
  const { weaponTypes, rarityTypes } = useFilteredCategories();
  
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <Search 
        placeholder="Buscar skin..." 
        value={searchQuery}
        onChange={onSearchChange}
        className="flex-1"
      />
      <div className="flex flex-wrap gap-2">
        <Select value={weaponFilter} onValueChange={onWeaponFilterChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Tipo de Arma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas Armas</SelectItem>
            {weaponTypes.map(weapon => (
              <SelectItem key={weapon} value={weapon}>{weapon}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={rarityFilter} onValueChange={onRarityFilterChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Raridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas Raridades</SelectItem>
            {rarityTypes.map(rarity => (
              <SelectItem key={rarity} value={rarity}>{rarity}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={sortMethod} onValueChange={onSortMethodChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price_desc">Maior Valor</SelectItem>
            <SelectItem value="price_asc">Menor Valor</SelectItem>
            <SelectItem value="name_asc">Nome (A-Z)</SelectItem>
            <SelectItem value="name_desc">Nome (Z-A)</SelectItem>
            <SelectItem value="date_desc">Mais Recente</SelectItem>
            <SelectItem value="date_asc">Mais Antigo</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
