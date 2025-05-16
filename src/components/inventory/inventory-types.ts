
import { InventoryItem, SellData } from "@/types/skin";

export interface InventoryTableProps {
  items: InventoryItem[];
  onViewDetails: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onSell: (itemId: string, sellData: SellData) => void;
  onDuplicate: (item: InventoryItem) => void;
}

export interface InventoryGridProps {
  items: InventoryItem[];
  onViewDetails: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onSell: (item: InventoryItem) => void;
  onDuplicate: (item: InventoryItem) => void;
}

export interface InventoryItemHandlers {
  handleViewDetails: (item: InventoryItem) => void;
  handleEdit: (item: InventoryItem) => void;
  handleDelete: (item: InventoryItem) => void;
  handleSell: (itemId: string, sellData: SellData) => void;
  handleDuplicate: (item: InventoryItem) => void;
}
