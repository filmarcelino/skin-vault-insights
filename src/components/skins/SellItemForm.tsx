
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InventoryItem, SellData } from "@/types/skin";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface SellItemFormProps {
  inventoryItem: InventoryItem;
  onSubmit: (sellData: SellData) => void;
}

export function SellItemForm({ inventoryItem, onSubmit }: SellItemFormProps) {
  const [price, setPrice] = useState("");
  const [marketplace, setMarketplace] = useState("Steam Market");
  const [feePercentage, setFeePercentage] = useState("13");
  const { currency } = useCurrency();
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price) return;
    
    // Create sell data
    const sellData: SellData = {
      soldPrice: parseFloat(price),
      soldMarketplace: marketplace,
      soldFeePercentage: parseFloat(feePercentage),
      soldDate: new Date().toISOString(),
      soldCurrency: currency.code
    };
    
    onSubmit(sellData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 py-4 border-t">
      <h3 className="font-medium">{t("inventory.sellItem")}</h3>
      <div className="grid gap-4">
        <div className="grid grid-cols-3 gap-2 items-center">
          <Label htmlFor="price">{t("inventory.price")}</Label>
          <Input
            id="price"
            type="number"
            placeholder={t("inventory.enterSalePrice")}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="col-span-2"
            required
          />
        </div>
        
        <div className="grid grid-cols-3 gap-2 items-center">
          <Label htmlFor="marketplace">{t("inventory.marketplace")}</Label>
          <Select value={marketplace} onValueChange={setMarketplace}>
            <SelectTrigger id="marketplace" className="col-span-2">
              <SelectValue placeholder={t("inventory.selectMarketplace")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Steam Market">Steam Market</SelectItem>
              <SelectItem value="Skinport">Skinport</SelectItem>
              <SelectItem value="CS.Money">CS.Money</SelectItem>
              <SelectItem value="Buff163">Buff163</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-3 gap-2 items-center">
          <Label htmlFor="fee">{t("inventory.feePercentage")}</Label>
          <Input
            id="fee"
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="13"
            value={feePercentage}
            onChange={(e) => setFeePercentage(e.target.value)}
            className="col-span-2"
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={!price}>
          {t("inventory.confirmSale")}
        </Button>
      </div>
    </form>
  );
}
