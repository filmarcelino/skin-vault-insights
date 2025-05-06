
import { Filter, Sliders } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

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
  onPriceFilterChange?: (min?: number, max?: number) => void;
  minPrice?: number;
  maxPrice?: number;
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
  currentTab,
  onPriceFilterChange,
  minPrice,
  maxPrice
}: FilterPanelProps) => {
  const [minPriceInput, setMinPriceInput] = useState<string>(minPrice?.toString() || '');
  const [maxPriceInput, setMaxPriceInput] = useState<string>(maxPrice?.toString() || '');
  const [isPricePopoverOpen, setIsPricePopoverOpen] = useState(false);

  // Atualizar inputs quando os props mudarem
  useEffect(() => {
    setMinPriceInput(minPrice?.toString() || '');
    setMaxPriceInput(maxPrice?.toString() || '');
  }, [minPrice, maxPrice]);

  const handleApplyPriceFilter = () => {
    if (onPriceFilterChange) {
      const min = minPriceInput ? Number(minPriceInput) : undefined;
      const max = maxPriceInput ? Number(maxPriceInput) : undefined;
      onPriceFilterChange(min, max);
      setIsPricePopoverOpen(false);
    }
  };

  const handleClearPriceFilter = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    if (onPriceFilterChange) {
      onPriceFilterChange(undefined, undefined);
    }
    setIsPricePopoverOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <div className="flex flex-wrap gap-2 items-center flex-1">
        <Select value={weaponFilter} onValueChange={setWeaponFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo de Arma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas Armas</SelectItem>
            {weaponTypes.map(weapon => (
              <SelectItem key={weapon} value={weapon}>{weapon}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={rarityFilter} onValueChange={setRarityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Raridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas Raridades</SelectItem>
            {rarityTypes.map(rarity => (
              <SelectItem key={rarity} value={rarity}>{rarity}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover open={isPricePopoverOpen} onOpenChange={setIsPricePopoverOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className={`h-10 w-10 ${(minPrice !== undefined || maxPrice !== undefined) ? 'border-primary' : ''}`}
            >
              <Sliders className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Filtro de Preço</h4>
                <p className="text-sm text-muted-foreground">
                  Defina um intervalo de preço para filtrar as skins.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="minPrice">Preço Mínimo</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    placeholder="Min"
                    value={minPriceInput}
                    onChange={e => setMinPriceInput(e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="maxPrice">Preço Máximo</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    placeholder="Max"
                    value={maxPriceInput}
                    onChange={e => setMaxPriceInput(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={handleClearPriceFilter}>
                  Limpar
                </Button>
                <Button size="sm" onClick={handleApplyPriceFilter}>
                  Aplicar
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button variant="outline" size="icon" className="h-10 w-10">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      
      {currentTab === "allSkins" && setItemsPerPage && itemsPerPage && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Items por página:</span>
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
