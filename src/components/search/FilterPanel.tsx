
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FilterPanelProps {
  weaponFilter?: string;
  rarityFilter?: string;
  categoryFilter?: string;
  collectionFilter?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  onWeaponFilterChange?: (value: string) => void;
  onRarityFilterChange?: (value: string) => void;
  onCategoryFilterChange?: (value: string) => void;
  onCollectionFilterChange?: (value: string) => void;
  onResetFilters?: () => void;
  onMinPriceChange?: (value: number | null) => void;
  onMaxPriceChange?: (value: number | null) => void;
  activeFilterCount?: number;
  availableWeapons?: string[];
  availableRarities?: string[];
  availableCategories?: string[];
  availableCollections?: string[];
}

export const FilterPanel = ({
  weaponFilter = 'all',
  rarityFilter = 'all',
  categoryFilter = 'all',
  collectionFilter = 'all',
  minPrice = null,
  maxPrice = null,
  onWeaponFilterChange,
  onRarityFilterChange,
  onCategoryFilterChange,
  onCollectionFilterChange,
  onResetFilters,
  onMinPriceChange,
  onMaxPriceChange,
  activeFilterCount = 0,
  availableWeapons = [],
  availableRarities = [],
  availableCategories = [],
  availableCollections = []
}: FilterPanelProps) => {
  const { t } = useLanguage();
  const [minPriceInput, setMinPriceInput] = useState<string>(minPrice !== null ? minPrice.toString() : '');
  const [maxPriceInput, setMaxPriceInput] = useState<string>(maxPrice !== null ? maxPrice.toString() : '');
  
  // Handle min price change
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMinPriceInput(value);
    
    // Delay updating the actual filter to avoid too many updates
    const numValue = value === '' ? null : parseFloat(value);
    if (onMinPriceChange) {
      onMinPriceChange(numValue);
    }
  };
  
  // Handle max price change
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxPriceInput(value);
    
    // Delay updating the actual filter to avoid too many updates
    const numValue = value === '' ? null : parseFloat(value);
    if (onMaxPriceChange) {
      onMaxPriceChange(numValue);
    }
  };
  
  // Default weapon and rarity options if none provided
  const defaultWeapons = ['AK-47', 'AWP', 'M4A4', 'USP-S', 'Glock-18', 'Desert Eagle'];
  const defaultRarities = ['Consumer Grade', 'Industrial Grade', 'Mil-Spec Grade', 'Restricted', 'Classified', 'Covert'];
  const defaultCategories = ['Normal', 'StatTrak™', 'Souvenir', 'Knife', 'Gloves'];
  
  // Use provided lists or defaults
  const weapons = availableWeapons.length > 0 ? availableWeapons : defaultWeapons;
  const rarities = availableRarities.length > 0 ? availableRarities : defaultRarities;
  const categories = availableCategories.length > 0 ? availableCategories : defaultCategories;
  const collections = availableCollections;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t("search.filters")}
            {activeFilterCount > 0 && (
              <Badge className="ml-2" variant="secondary">{activeFilterCount}</Badge>
            )}
          </CardTitle>
          {onResetFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onResetFilters}
              className="h-8"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              {t("search.clear")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weapon filter */}
        <div className="space-y-2">
          <Label htmlFor="weapon-filter">{t("search.weapon")}</Label>
          <Select
            value={weaponFilter}
            onValueChange={(value) => onWeaponFilterChange && onWeaponFilterChange(value)}
          >
            <SelectTrigger id="weapon-filter">
              <SelectValue placeholder={t("search.allWeapons")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("search.allWeapons")}</SelectItem>
              {weapons.map((weapon) => (
                <SelectItem key={weapon} value={weapon}>{weapon}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Rarity filter */}
        <div className="space-y-2">
          <Label htmlFor="rarity-filter">{t("search.rarity")}</Label>
          <Select
            value={rarityFilter}
            onValueChange={(value) => onRarityFilterChange && onRarityFilterChange(value)}
          >
            <SelectTrigger id="rarity-filter">
              <SelectValue placeholder={t("search.allRarities")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("search.allRarities")}</SelectItem>
              {rarities.map((rarity) => (
                <SelectItem key={rarity} value={rarity}>{rarity}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Category filter */}
        {onCategoryFilterChange && (
          <div className="space-y-2">
            <Label htmlFor="category-filter">{t("search.category")}</Label>
            <Select
              value={categoryFilter}
              onValueChange={(value) => onCategoryFilterChange(value)}
            >
              <SelectTrigger id="category-filter">
                <SelectValue placeholder={t("search.allCategories")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("search.allCategories")}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Collection filter */}
        {onCollectionFilterChange && collections.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="collection-filter">{t("search.collection")}</Label>
            <Select
              value={collectionFilter}
              onValueChange={(value) => onCollectionFilterChange(value)}
            >
              <SelectTrigger id="collection-filter">
                <SelectValue placeholder={t("search.allCollections")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("search.allCollections")}</SelectItem>
                {collections.map((collection) => (
                  <SelectItem key={collection} value={collection}>{collection}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Price range filters */}
        <div className="space-y-2">
          <Label>{t("search.priceRange")}</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="min-price" className="text-xs text-muted-foreground">Min</Label>
              <Input
                id="min-price"
                type="number"
                min="0"
                placeholder="0"
                value={minPriceInput}
                onChange={handleMinPriceChange}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="max-price" className="text-xs text-muted-foreground">Max</Label>
              <Input
                id="max-price"
                type="number"
                min="0"
                placeholder="∞"
                value={maxPriceInput}
                onChange={handleMaxPriceChange}
                className="h-9"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
