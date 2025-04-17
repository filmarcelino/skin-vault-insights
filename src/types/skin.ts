
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
  floatValue?: number;
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
  isInUserInventory: boolean;
  // Supabase fields mapping
  inventory_id?: string; 
  skin_id?: string;
  acquired_date?: string;
  purchase_price?: number;
  current_price?: number;
  fee_percentage?: number;
  float_value?: number;
  is_stat_trak?: boolean;
  trade_lock_days?: number;
  trade_lock_until?: string;
  is_in_user_inventory?: boolean;
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
  // Supabase fields mapping
  transaction_id?: string;
  item_id?: string;
  weapon_name?: string;
  skin_name?: string;
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
  onlyUserInventory?: boolean;
}

export interface SellData {
  soldDate: string;
  soldPrice: number;
  soldMarketplace: string;
  soldFeePercentage: number;
  soldNotes?: string;
  profit?: number;
}

export interface PriceHistoryItem {
  id: string;
  skin_id: string;
  inventory_id?: string | null;
  user_id: string;
  price: number;
  price_date: string;
  marketplace?: string | null;
  wear?: string | null;
  created_at: string;
}
