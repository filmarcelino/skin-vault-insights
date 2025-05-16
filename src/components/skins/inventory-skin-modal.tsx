import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { InventoryItem, SellData } from '@/types/skin';
import { formatPrice } from '@/utils/format-utils';
import { toast } from "@/components/ui/sonner"
import { removeInventoryItem, markItemAsSold } from '@/services/inventory';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SellItemForm } from './SellItemForm';

interface InventorySkinModalProps {
  inventoryItem: InventoryItem;
  children: React.ReactNode;
  onClose: () => void;
}

export function InventorySkinModal({ inventoryItem, children, onClose }: InventorySkinModalProps) {
  const [open, setOpen] = useState(false);
  const { currency } = useCurrency();

  const handleSellItem = async (sellData: SellData) => {
    if (!inventoryItem?.inventoryId) return;
    
    try {
      await markItemAsSold(inventoryItem.inventoryId, sellData);
      toast.success("Item marked as sold!");
      onClose();
    } catch (error) {
      console.error("Error selling item:", error);
      toast.error("Failed to mark item as sold");
    }
  };

  const handleDeleteItem = async () => {
    if (!inventoryItem?.inventoryId) return;
    
    try {
      await removeInventoryItem(inventoryItem.inventoryId);
      toast.success("Item removed from inventory!");
      onClose();
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item from inventory");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{inventoryItem.name}</DialogTitle>
          <DialogDescription>
            {inventoryItem.weapon} - {inventoryItem.skin}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center">
            <img 
              src={inventoryItem.image} 
              alt={inventoryItem.name} 
              className="h-32 w-32 object-contain rounded-md"
              onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="wear">Wear</Label>
            <Input id="wear" value={inventoryItem.wear || "Not specified"} className="col-span-3" disabled />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price">Price ({currency})</Label>
            <Input id="price" value={formatPrice(inventoryItem.currentPrice || inventoryItem.price || 0)} className="col-span-3" disabled />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="acquired">Acquired</Label>
            <Input id="acquired" value={new Date(inventoryItem.acquiredDate).toLocaleDateString()} className="col-span-3" disabled />
          </div>
        </div>
        <SellItemForm inventoryItem={inventoryItem} onSubmit={handleSellItem} />
        <div className="flex justify-end">
          <Button variant="destructive" onClick={handleDeleteItem}>Delete</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
