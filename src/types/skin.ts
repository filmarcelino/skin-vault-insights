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
  type?: SkinType; // Added this field
}

export type WeaponType = string;
export type RarityType = string;
export type SkinType = string;

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
  currency?: string; // Moeda usada na compra
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
  currency_code?: string;
}

export interface Transaction {
  id: string;
  type: 'add' | 'sell' | 'trade' | 'purchase' | 'remove';
  itemId: string;
  weaponName: string;
  skinName: string;
  date: string;
  price?: number | string;
  notes?: string;
  currency?: string; // Adicionada moeda da transação
  // Supabase fields mapping
  transaction_id?: string;
  item_id?: string;
  weapon_name?: string;
  skin_name?: string;
  currency_code?: string;
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
  soldDate?: string;  // Changed from date to soldDate
  soldPrice: number;  // Changed from soldPrice to soldPrice
  soldMarketplace: string;  // Changed from soldMarketplace to soldMarketplace
  soldFeePercentage: number;
  soldNotes?: string;  // Changed from notes to soldNotes
  profit?: number;
  soldCurrency?: string;  // Changed from currency to soldCurrency
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

// Interface para os dados de estatísticas do inventário
export interface InventoryStats {
  total_items: number;
  total_value: number;
  avg_price: number;
  value_change_30d: number;
  value_change_percentage_30d: number;
}

// Interface detalhada para análises mais avançadas
export interface DetailedInventoryStats {
  totalValue: number;
  profitLoss: number;
  itemCount: number;
  averageItemValue: number;
  valueChange30d: number;
  valueChangePercent: number;
  topRarities: Array<{name: string, count: number}>;
  recentTransactions: Array<{id: string, name: string, type: string, value: number, date: string}>;
}
