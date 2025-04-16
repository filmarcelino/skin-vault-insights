
export interface Skin {
  id: string;
  name: string;
  description?: string;
  weapon?: string;
  category?: string;
  rarity?: string;
  image?: string;
  wear?: string;
  min_float?: number;
  max_float?: number;
  price?: number;
  collection?: {
    id?: string;
    name: string;
    description?: string;
    image?: string;
  };
}

export interface InventoryItem extends Skin {
  inventoryId: string;
  acquiredDate: string;
  purchasePrice?: number;
  currentPrice?: number;
}

export type SkinWear = 'Factory New' | 'Minimal Wear' | 'Field-Tested' | 'Well-Worn' | 'Battle-Scarred';

export interface SkinCollection {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

export interface SkinFilter {
  weapon?: string;
  category?: string;
  rarity?: string;
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}
