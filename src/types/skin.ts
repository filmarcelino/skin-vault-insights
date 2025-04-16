
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
  isInUserInventory: boolean; // Flag to indicate if the skin belongs to user's inventory
}

export interface Transaction {
  id: string;
  type: 'add' | 'sell' | 'trade' | 'purchase';
  itemId: string;
  weaponName: string;
  skinName: string;
  date: string;
  price?: number | string;
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
  onlyUserInventory?: boolean; // New filter to show only user's inventory
}

export interface SellData {
  soldDate: string;
  soldPrice: number;
  soldMarketplace: string;
  soldFeePercentage: number;
  soldNotes?: string;
  profit?: number;
}
