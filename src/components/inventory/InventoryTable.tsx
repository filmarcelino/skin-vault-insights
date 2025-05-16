
import { InventoryItem, SellData } from "@/types/skin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InventoryTableActions } from "./InventoryTableActions";
import { formatPrice } from "@/utils/format-utils";

export interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onSell: (itemId: string, sellData: SellData) => void;
  onDuplicate: (item: InventoryItem) => void;
  onViewDetails: (item: InventoryItem) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  onEdit,
  onDelete,
  onSell,
  onDuplicate,
  onViewDetails,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Wear</TableHead>
          <TableHead>Acquired</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow 
            key={item.inventoryId}
            className="cursor-pointer hover:bg-secondary/40"
            onClick={() => onViewDetails(item)}
          >
            <TableCell>
              <div className="flex items-center gap-2">
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="h-8 w-8 object-contain"
                    onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
                  />
                )}
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.weapon}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>{item.wear || "Not specified"}</TableCell>
            <TableCell>
              {new Date(item.acquiredDate).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              {formatPrice(item.currentPrice || item.price || 0)}
            </TableCell>
            <TableCell>
              <InventoryTableActions
                item={item}
                onEdit={() => onEdit(item)}
                onDuplicate={() => onDuplicate(item)}
                onRemove={() => onDelete(item)}
                onSell={(sellData: SellData) => {
                  if (item.inventoryId) {
                    onSell(item.inventoryId, sellData);
                  }
                }}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
