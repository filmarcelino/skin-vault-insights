
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InventoryItem, Skin, SellData, ModalMode } from "@/types/skin";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { addSkinToInventory, updateInventoryItem, markItemAsSold } from "@/services/inventory";
import { formatDate } from "@/utils/format-utils";

export interface InventorySkinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skin?: Skin;
  mode?: ModalMode;
}

export const InventorySkinModal: React.FC<InventorySkinModalProps> = ({
  open,
  onOpenChange,
  skin,
  mode = "view",
}) => {
  const { user } = useAuth();
  const { formatPrice, currency } = useCurrency();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [purchasePrice, setPurchasePrice] = useState(skin?.price || 0);
  const [acquiredDate, setAcquiredDate] = useState(skin?.acquiredDate || new Date().toISOString().split('T')[0]);
  const [marketplace, setMarketplace] = useState(skin?.marketplace || "Steam Market");
  const [feePercentage, setFeePercentage] = useState(skin?.feePercentage || 15);
  const [isStatTrak, setIsStatTrak] = useState(skin?.isStatTrak || false);
  const [wear, setWear] = useState(skin?.wear || "Factory New");
  const [floatValue, setFloatValue] = useState<number | undefined>(skin?.floatValue);
  const [notes, setNotes] = useState(skin?.notes || "");
  const [tradeLockDays, setTradeLockDays] = useState(skin?.tradeLockDays || 0);
  
  // Sell form state
  const [soldPrice, setSoldPrice] = useState(0);
  const [soldMarketplace, setSoldMarketplace] = useState("Steam Market");
  const [soldFeePercentage, setSoldFeePercentage] = useState(15);
  const [soldDate, setSoldDate] = useState(new Date().toISOString().split('T')[0]);
  const [soldNotes, setSoldNotes] = useState("");
  
  // Calculate fees and profit for sale
  const calculateSaleDetails = () => {
    const origPrice = (skin?.purchasePrice || purchasePrice || 0);
    const salePrice = soldPrice;
    const marketplaceFee = salePrice * (soldFeePercentage / 100);
    const netProceeds = salePrice - marketplaceFee;
    const profit = netProceeds - origPrice;
    
    return {
      originalPrice: origPrice,
      salePrice,
      marketplaceFee,
      netProceeds,
      profit
    };
  };
  
  // Available wear conditions
  const wearConditions = [
    "Factory New",
    "Minimal Wear",
    "Field-Tested",
    "Well-Worn",
    "Battle-Scarred"
  ];
  
  // Available marketplaces
  const marketplaces = [
    "Steam Market",
    "Skinport",
    "DMarket",
    "BitSkins",
    "CS.MONEY",
    "SkinBaron",
    "Buff163",
    "Other"
  ];
  
  const handleSave = async () => {
    if (!user) {
      toast.error(t("auth.login_required"));
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (mode === "add" && skin) {
        // Add new skin to inventory
        const result = await addSkinToInventory(user.id, skin, {
          purchasePrice,
          acquiredDate,
          marketplace,
          feePercentage,
          isStatTrak,
          wear,
          floatValue,
          notes,
          tradeLockDays,
          currencyCode: currency.code
        });
        
        if (result.success) {
          toast.success(t("inventory.item_added"), {
            description: t("inventory.item_added_description", {
              name: skin.name
            })
          });
          
          // Refresh inventory data
          queryClient.invalidateQueries({ queryKey: ["userInventory"] });
          onOpenChange(false);
        } else {
          toast.error(t("inventory.add_error"), {
            description: result.error?.message || t("common.unexpected_error")
          });
        }
      } else if (mode === "edit" && skin) {
        // Update existing inventory item
        const inventoryItem = skin as InventoryItem;
        
        const result = await updateInventoryItem(user.id, inventoryItem, {
          purchasePrice,
          marketplace,
          feePercentage,
          isStatTrak,
          wear,
          floatValue,
          notes,
          tradeLockDays
        });
        
        if (result.success) {
          toast.success(t("inventory.item_updated"), {
            description: t("inventory.item_updated_description", {
              name: skin.name
            })
          });
          
          // Refresh inventory data
          queryClient.invalidateQueries({ queryKey: ["userInventory"] });
          onOpenChange(false);
        } else {
          toast.error(t("inventory.update_error"), {
            description: result.error?.message || t("common.unexpected_error")
          });
        }
      } else if (mode === "sell" && skin) {
        // Mark item as sold
        const inventoryItem = skin as InventoryItem;
        
        const sellData: SellData = {
          soldPrice,
          soldMarketplace,
          soldFeePercentage,
          soldDate: new Date(soldDate).toISOString(),
          soldNotes,
          profit: calculateSaleDetails().profit,
          soldCurrency: currency.code
        };
        
        const result = await markItemAsSold(user.id, inventoryItem.inventoryId, sellData);
        
        if (result.success) {
          toast.success(t("inventory.item_sold"), {
            description: t("inventory.item_sold_description", {
              price: formatPrice(soldPrice)
            })
          });
          
          // Refresh inventory and transactions data
          queryClient.invalidateQueries({ queryKey: ["userInventory"] });
          queryClient.invalidateQueries({ queryKey: ["transactions"] });
          onOpenChange(false);
        } else {
          toast.error(t("inventory.sell_error"), {
            description: result.error?.message || t("common.unexpected_error")
          });
        }
      }
    } catch (error) {
      console.error("Error saving inventory item:", error);
      toast.error(t("inventory.action_error"), {
        description: t("common.unexpected_error")
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!skin) {
    return null;
  }
  
  // Render form based on mode
  const renderForm = () => {
    // View mode - just display information
    if (mode === "view") {
      return (
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <Label className="text-muted-foreground">{t("skin.purchase_price")}</Label>
              <div className="font-medium">{formatPrice(skin.purchasePrice || 0)}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("skin.current_price")}</Label>
              <div className="font-medium">{formatPrice(skin.price || 0)}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("skin.acquired_date")}</Label>
              <div className="font-medium">{formatDate(skin.acquiredDate || new Date().toISOString())}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("skin.marketplace")}</Label>
              <div className="font-medium">{skin.marketplace || "Steam Market"}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("skin.wear")}</Label>
              <div className="font-medium">{skin.wear || "Factory New"}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("skin.float_value")}</Label>
              <div className="font-medium">{skin.floatValue || "N/A"}</div>
            </div>
          </div>
          
          {skin.notes && (
            <div>
              <Label className="text-muted-foreground">{t("skin.notes")}</Label>
              <div className="font-medium whitespace-pre-line">{skin.notes}</div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.close")}
            </Button>
          </div>
        </div>
      );
    }
    
    // Add or Edit mode - similar forms
    if (mode === "add" || mode === "edit") {
      return (
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="purchasePrice">{t("skin.purchase_price")}</Label>
              <Input
                id="purchasePrice"
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(parseFloat(e.target.value))}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="acquiredDate">{t("skin.acquired_date")}</Label>
              <Input
                id="acquiredDate"
                type="date"
                value={acquiredDate.split('T')[0]}
                onChange={(e) => setAcquiredDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="marketplace">{t("skin.marketplace")}</Label>
              <Select value={marketplace} onValueChange={setMarketplace}>
                <SelectTrigger>
                  <SelectValue placeholder={t("skin.select_marketplace")} />
                </SelectTrigger>
                <SelectContent>
                  {marketplaces.map((marketplace) => (
                    <SelectItem key={marketplace} value={marketplace}>
                      {marketplace}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="feePercentage">{t("skin.fee_percentage")}</Label>
              <Input
                id="feePercentage"
                type="number"
                value={feePercentage}
                onChange={(e) => setFeePercentage(parseFloat(e.target.value))}
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="wear">{t("skin.wear")}</Label>
              <Select value={wear} onValueChange={setWear}>
                <SelectTrigger>
                  <SelectValue placeholder={t("skin.select_wear")} />
                </SelectTrigger>
                <SelectContent>
                  {wearConditions.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="floatValue">{t("skin.float_value")}</Label>
              <Input
                id="floatValue"
                type="number"
                value={floatValue || ""}
                onChange={(e) => setFloatValue(e.target.value ? parseFloat(e.target.value) : undefined)}
                min="0"
                max="1"
                step="0.0001"
                placeholder="0.0000"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isStatTrak"
                checked={isStatTrak}
                onCheckedChange={(checked) => setIsStatTrak(!!checked)}
              />
              <Label htmlFor="isStatTrak" className="cursor-pointer">
                {t("skin.stat_trak")}
              </Label>
            </div>
            <div>
              <Label htmlFor="tradeLockDays">{t("skin.trade_lock_days")}</Label>
              <Input
                id="tradeLockDays"
                type="number"
                value={tradeLockDays}
                onChange={(e) => setTradeLockDays(parseInt(e.target.value))}
                min="0"
                max="30"
                step="1"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">{t("skin.notes")}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("skin.notes_placeholder")}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? t("common.saving") : t("common.save")}
            </Button>
          </div>
        </div>
      );
    }
    
    // Sell mode
    if (mode === "sell") {
      const { originalPrice, salePrice, marketplaceFee, netProceeds, profit } = calculateSaleDetails();
      
      return (
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="soldPrice">{t("skin.sale_price")}</Label>
              <Input
                id="soldPrice"
                type="number"
                value={soldPrice}
                onChange={(e) => setSoldPrice(parseFloat(e.target.value))}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="soldDate">{t("skin.sold_date")}</Label>
              <Input
                id="soldDate"
                type="date"
                value={soldDate}
                onChange={(e) => setSoldDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="soldMarketplace">{t("skin.marketplace")}</Label>
              <Select value={soldMarketplace} onValueChange={setSoldMarketplace}>
                <SelectTrigger>
                  <SelectValue placeholder={t("skin.select_marketplace")} />
                </SelectTrigger>
                <SelectContent>
                  {marketplaces.map((marketplace) => (
                    <SelectItem key={marketplace} value={marketplace}>
                      {marketplace}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="soldFeePercentage">{t("skin.fee_percentage")}</Label>
              <Input
                id="soldFeePercentage"
                type="number"
                value={soldFeePercentage}
                onChange={(e) => setSoldFeePercentage(parseFloat(e.target.value))}
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="soldNotes">{t("skin.notes")}</Label>
            <Textarea
              id="soldNotes"
              value={soldNotes}
              onChange={(e) => setSoldNotes(e.target.value)}
              placeholder={t("skin.sale_notes_placeholder")}
              rows={2}
            />
          </div>
          
          <div className="mt-2 border rounded-md bg-muted/50 p-3 space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("skin.purchase_price")}</span>
              <span>{formatPrice(originalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("skin.sale_price")}</span>
              <span>{formatPrice(salePrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("skin.marketplace_fee")}</span>
              <span>-{formatPrice(marketplaceFee)}</span>
            </div>
            <div className="flex justify-between font-medium border-t pt-1 mt-1">
              <span>{t("skin.net_proceeds")}</span>
              <span>{formatPrice(netProceeds)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>{t("skin.profit")}</span>
              <span className={profit >= 0 ? "text-green-500" : "text-red-500"}>
                {profit >= 0 ? "+" : ""}{formatPrice(profit)}
              </span>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? t("common.processing") : t("inventory.confirm_sell")}
            </Button>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "view" ? skin.name : 
             mode === "add" ? t("inventory.add_to_inventory", { name: skin.name }) : 
             mode === "edit" ? t("inventory.edit_item", { name: skin.name }) : 
             mode === "sell" ? t("inventory.sell_item", { name: skin.name }) : ""
            }
          </DialogTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            {skin.weapon} | {skin.wear || skin.rarity}
            {skin.isStatTrak && <span className="ml-1 text-amber-500">★ StatTrak™</span>}
          </div>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative bg-secondary rounded-md w-full sm:w-32 h-32 flex-shrink-0">
            <img
              src={skin.image}
              alt={skin.name}
              className="absolute inset-0 w-full h-full object-contain p-2"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-skin.png";
              }}
            />
          </div>
          <div className="flex-1">{renderForm()}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
