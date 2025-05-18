import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FilterPanelProps {
  weaponFilter?: string;
  rarityFilter?: string;
  typeFilter?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  onWeaponFilterChange: (value: string) => void;
  onRarityFilterChange: (value: string) => void;
  onTypeFilterChange?: (value: string) => void;
  onMinPriceChange: (value: number | null) => void;
  onMaxPriceChange: (value: number | null) => void;
  onResetFilters: () => void;
}

export const FilterPanel = ({
  weaponFilter = "",
  rarityFilter = "",
  typeFilter = "",
  minPrice = null,
  maxPrice = null,
  onWeaponFilterChange,
  onRarityFilterChange,
  onTypeFilterChange,
  onMinPriceChange,
  onMaxPriceChange,
  onResetFilters
}: FilterPanelProps) => {
  // Add the weapon and rarity options
  const weapons = [
    { value: "", label: "All Weapons" },
    { value: "AK-47", label: "AK-47" },
    { value: "AWP", label: "AWP" },
    { value: "M4A4", label: "M4A4" },
    { value: "M4A1-S", label: "M4A1-S" },
    { value: "Desert Eagle", label: "Desert Eagle" },
    { value: "USP-S", label: "USP-S" },
    { value: "Glock-18", label: "Glock-18" },
    // Add more weapons as needed
  ];

  const rarities = [
    { value: "", label: "All Rarities" },
    { value: "Consumer Grade", label: "Consumer Grade" },
    { value: "Industrial Grade", label: "Industrial Grade" },
    { value: "Mil-Spec", label: "Mil-Spec" },
    { value: "Restricted", label: "Restricted" },
    { value: "Classified", label: "Classified" },
    { value: "Covert", label: "Covert" },
    { value: "Contraband", label: "Contraband" },
  ];

  const types = [
    { value: "", label: "All Types" },
    { value: "Normal", label: "Normal" },
    { value: "StatTrak", label: "StatTrak" },
    { value: "Souvenir", label: "Souvenir" },
  ];

  return (
    <div className="cs-card p-4 space-y-4">
      <h2 className="text-lg font-semibold">Filters</h2>
      <Separator />

      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-6 pr-4">
          <div className="space-y-3">
            <Label>Weapon</Label>
            <Select value={weaponFilter} onValueChange={onWeaponFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select weapon" />
              </SelectTrigger>
              <SelectContent>
                {weapons.map((weapon) => (
                  <SelectItem key={weapon.value} value={weapon.value}>
                    {weapon.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Rarity</Label>
            <Select value={rarityFilter} onValueChange={onRarityFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select rarity" />
              </SelectTrigger>
              <SelectContent>
                {rarities.map((rarity) => (
                  <SelectItem key={rarity.value} value={rarity.value}>
                    {rarity.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {onTypeFilterChange && (
            <div className="space-y-3">
              <Label>Type</Label>
              <Select 
                value={typeFilter} 
                onValueChange={onTypeFilterChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-3">
            <Label>Price Range</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder="Min"
                value={minPrice === null ? "" : minPrice}
                onChange={(e) => onMinPriceChange(e.target.value ? Number(e.target.value) : null)}
                min="0"
                className="w-full"
              />
              <span>to</span>
              <Input
                type="number"
                placeholder="Max"
                value={maxPrice === null ? "" : maxPrice}
                onChange={(e) => onMaxPriceChange(e.target.value ? Number(e.target.value) : null)}
                min="0"
                className="w-full"
              />
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full" 
            onClick={onResetFilters}
          >
            Reset Filters
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
};
