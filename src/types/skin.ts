export interface Skin {
  id: string;
  name: string;
  weapon: string;
  image: string;
  rarity: string;
  price: number;
  type?: string;
  wear?: string;
  isStatTrak?: boolean;
  min_float?: number;
  max_float?: number;
  collections?: SkinCollection[];
  collection?: SkinCollection;
  category?: string;
  floatValue?: number; // Added to match usage in use-skin-image-analysis.ts
}

export interface SkinCollection {
  id: string;
  name: string;
  description: string;
  image?: string;
}

export interface InventoryItem {
  inventoryId: string;
  acquiredDate: string;
  purchasePrice: number;
  currentPrice?: number;
  tradeLockDays?: number;
  tradeLockUntil?: string;
  isStatTrak?: boolean;
  wear?: string;
  floatValue?: number;
  notes?: string;
  userId?: string;
  isInUserInventory?: boolean;
  skin_id?: string;
  skin_name?: string;
  weapon_name?: string;
  image_url?: string;
  rarity: string;
  price?: number;
  purchase_price?: number;
  acquired_date?: string;
  is_in_user_inventory?: boolean;
  float_value?: number;
  is_stat_trak?: boolean;
  condition?: string;
  marketplace?: string;
  fee_percentage?: number;
  feePercentage?: number;
  date_sold?: string;
  profit?: number;
  currency?: string;
  // Sales related properties
  sold_price?: number;
  sold_marketplace?: string;
  sold_fee_percentage?: number;
  // Also include Skin properties
  id: string;
  name: string;
  weapon: string;
  image: string;
  type?: string;
  category?: string;
}

export interface SkinFilter {
  search?: string;
  weapon?: string;
  rarity?: string;
  onlyUserInventory?: boolean;
  category?: string;
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
}

// Define the SellData type with profit property
export interface SellData {
  soldPrice: number;
  soldMarketplace: string;
  soldFeePercentage: number;
  soldNotes?: string;
  soldDate?: string;
  profit?: number;
  soldCurrency?: string;
}

// Define SkinWear type
export type SkinWear = 'Factory New' | 'Minimal Wear' | 'Field-Tested' | 'Well-Worn' | 'Battle-Scarred';

// Define Transaction type
export interface Transaction {
  id: string;
  type: 'add' | 'sell' | 'trade' | 'buy';
  weaponName: string;
  skinName: string;
  date: string;
  price: number;
  notes?: string;
  itemId: string;
  currency?: string;
  userId: string;
}

// Define LockStatus type with isLocked, daysLeft, and tradeLockDate fields
export interface LockStatus {
  isLocked: boolean;
  daysLeft: number;
  tradeLockDate?: string;
}
