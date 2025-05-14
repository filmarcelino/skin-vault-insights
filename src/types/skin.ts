export interface Skin {
  id: string;
  name: string;
  weapon: string;
  image: string;
  rarity: string;
  price: number;
  type?: string;
}

export interface InventoryItem extends Skin {
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
  rarity?: string;
  price?: number;
  purchase_price?: number;
  acquired_date?: string;
  is_in_user_inventory?: boolean;
  float_value?: number;
  is_stat_trak?: boolean;
  condition?: string;
  marketplace?: string;
  fee_percentage?: number;
  date_sold?: string;
  profit?: number;
}

export interface SkinFilter {
  search?: string;
  weapon?: string;
  rarity?: string;
  onlyUserInventory?: boolean;
}

// Update SellData type to include soldDate property
export interface SellData {
  soldPrice: number;
  soldMarketplace: string;
  soldFeePercentage: number;
  soldNotes?: string;
  soldDate?: string; // Add this for compatibility
}
