
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InventoryItem, SellData } from '@/types/skin';
import { formatPrice } from '@/utils/format-utils';
import { toast } from "sonner";
import { removeInventoryItem, markItemAsSold } from '@/services/inventory';
import { useCurrency } from '@/contexts/CurrencyContext';
import { SellItemForm } from './SellItemForm';
import { useLanguage } from '@/contexts/LanguageContext';

interface InventorySkinModalProps {
  inventoryItem: InventoryItem;
  children: React.ReactNode;
  onClose: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function InventorySkinModal({ 
  inventoryItem, 
  children, 
  onClose,
  open: controlledOpen,
  onOpenChange: setControlledOpen
}: InventorySkinModalProps) {
  const [open, setOpen] = useState(controlledOpen !== undefined ? controlledOpen : false);
  const { currency } = useCurrency();
  const { t } = useLanguage();

  // Respect controlled or uncontrolled state
  const handleOpenChange = (newOpen: boolean) => {
    if (setControlledOpen) {
      setControlledOpen(newOpen);
    } else {
      setOpen(newOpen);
    }
    if (!newOpen) onClose();
  };

  const handleSellItem = async (sellData: SellData) => {
    if (!inventoryItem?.inventoryId) return;
    
    try {
      await markItemAsSold({ inventoryId: inventoryItem.inventoryId, sellData });
      toast.success(t("inventory.itemSold"));
      onClose();
    } catch (error) {
      console.error("Error selling item:", error);
      toast.error(t("errors.sellItemFailed"));
    }
  };

  const handleDeleteItem = async () => {
    if (!inventoryItem?.inventoryId) return;
    
    try {
      await removeInventoryItem({ inventoryId: inventoryItem.inventoryId });
      toast.success(t("inventory.itemRemoved"));
      onClose();
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error(t("errors.removeItemFailed"));
    }
  };

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : open;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{inventoryItem.name}</DialogTitle>
          <DialogDescription>
            {inventoryItem.weapon} - {inventoryItem.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center">
            <img 
              src={inventoryItem.image} 
              alt={inventoryItem.name} 
              className="h-32 w-32 object-contain rounded-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="wear">{t("inventory.wear")}</Label>
            <Input id="wear" value={inventoryItem.wear || t("inventory.notSpecified")} className="col-span-3" disabled />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price">{t("inventory.price")}</Label>
            <Input id="price" value={formatPrice(inventoryItem.currentPrice || inventoryItem.price || 0)} className="col-span-3" disabled />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="acquired">{t("inventory.acquired")}</Label>
            <Input id="acquired" value={new Date(inventoryItem.acquiredDate).toLocaleDateString()} className="col-span-3" disabled />
          </div>
        </div>
        <SellItemForm inventoryItem={inventoryItem} onSubmit={handleSellItem} />
        <div className="flex justify-end">
          <Button variant="destructive" onClick={handleDeleteItem}>{t("common.delete")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
