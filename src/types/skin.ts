
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
  isStatTrak?: boolean;
  tradeLockDays?: number;
  tradeLockUntil?: string;
  collection?: {
    id?: string;
    name: string;
    description?: string;
    image?: string;
  };
  collections?: {
    id?: string;
    name: string;
    description?: string;
    image?: string;
  }[];
}

export interface InventoryItem extends Skin {
  inventoryId: string;
  acquiredDate: string;
  purchasePrice?: number;
  currentPrice?: number;
  isStatTrak?: boolean;
  tradeLockDays?: number;
  tradeLockUntil?: string;
  marketplace?: string;
  feePercentage?: number;
  floatValue?: number;
  notes?: string;
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

export interface SellData {
  soldDate: string;
  soldPrice: number;
  soldMarketplace: string;
  soldFeePercentage: number;
  soldNotes?: string;
  profit?: number;
}
