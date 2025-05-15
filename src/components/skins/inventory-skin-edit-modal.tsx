
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface InventorySkinEditModalProps {
  item: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateSold: (updatedItem: any) => void;
}

export function InventorySkinEditModal({
  item,
  open,
  onOpenChange,
  onUpdateSold
}: InventorySkinEditModalProps) {
  const [soldDate, setSoldDate] = useState<string>("");
  const [soldPrice, setSoldPrice] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const { formatPrice, currency } = useCurrency();
  const { t } = useLanguage();
  
  useEffect(() => {
    if (item) {
      const date = item.date ? new Date(item.date) : new Date();
      setSoldDate(date.toISOString().split('T')[0]);
      setSoldPrice(item.price?.toString() || "0");
      setNotes(item.notes || "");
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    const updatedItem = {
      ...item,
      date: new Date(soldDate).toISOString(),
      price: parseFloat(soldPrice),
      notes
    };

    onUpdateSold(updatedItem);
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('inventory.editSaleDetails')}</DialogTitle>
          <DialogDescription>
            {`${item.weapon_name || ''} | ${item.skin_name || 'Skin'}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="soldDate">{t('inventory.saleDate')}</Label>
              <Input
                id="soldDate"
                type="date"
                value={soldDate}
                onChange={(e) => setSoldDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="soldPrice">{t('inventory.salePrice')} ({currency.symbol})</Label>
              <Input
                id="soldPrice"
                type="number"
                step="0.01"
                min="0"
                value={soldPrice}
                onChange={(e) => setSoldPrice(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('common.notes')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('inventory.additionalSaleDetails')}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">
              {t('common.saveChanges')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
