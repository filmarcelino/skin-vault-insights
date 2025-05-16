
import { useEffect, useState } from "react";
import { addSkinToInventory, updateInventoryItem } from "@/services/inventory";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ModalMode, Skin, SkinWear, InventoryItem } from "@/types/skin";
import { useInvalidateInventory } from "@/hooks/use-skins";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SkinSellingForm } from "@/components/skins/skin-selling-form";
import { toast } from "sonner";

// Available skin wear types
const WEAR_TYPES: SkinWear[] = [
  "Factory New",
  "Minimal Wear",
  "Field-Tested",
  "Well-Worn",
  "Battle-Scarred"
];

// Props for the InventorySkinModal component
interface InventorySkinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skin: Skin | InventoryItem;
  mode?: ModalMode;
}

// Type guard to check if the skin is an InventoryItem
const isInventoryItem = (item: Skin | InventoryItem): item is InventoryItem => {
  return 'inventoryId' in item && !!item.inventoryId;
};

export function InventorySkinModal({ open, onOpenChange, skin, mode = "view" }: InventorySkinModalProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const invalidateInventory = useInvalidateInventory();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for form values
  const [purchasePrice, setPurchasePrice] = useState<number>(skin.purchasePrice || skin.price || 0);
  const [marketplace, setMarketplace] = useState<string>(skin.marketplace || "Steam Market");
  const [feePercentage, setFeePercentage] = useState<number>(skin.feePercentage || 13);
  const [isStatTrak, setIsStatTrak] = useState<boolean>(skin.isStatTrak || false);
  const [floatValue, setFloatValue] = useState<number | undefined>(skin.floatValue);
  const [wear, setWear] = useState<SkinWear>((skin.wear as SkinWear) || "Factory New");
  const [notes, setNotes] = useState<string>(skin.notes || "");

  // Update form values when skin changes
  useEffect(() => {
    if (skin) {
      setPurchasePrice(skin.purchasePrice || skin.price || 0);
      setMarketplace(skin.marketplace || "Steam Market");
      setFeePercentage(skin.feePercentage || 13);
      setIsStatTrak(skin.isStatTrak || false);
      setFloatValue(skin.floatValue);
      setWear((skin.wear as SkinWear) || "Factory New");
      setNotes(skin.notes || "");
    }
  }, [skin]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!user) {
      toast.error(t("auth.login_required"));
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "add") {
        // Fixed: Only pass the expected parameters
        const result = await addSkinToInventory({
          userId: user.id, 
          skin: skin, 
          options: {
            purchasePrice,
            marketplace,
            feePercentage,
            notes,
            isStatTrak,
            floatValue,
            wear
          }
        });

        if (result.success) {
          toast.success(t("inventory.skin_added"), {
            description: t("inventory.skin_added_description", { name: skin.name })
          });
          invalidateInventory();
          onOpenChange(false);
        } else {
          toast.error(t("inventory.add_error"), {
            description: result.error?.message || t("common.unexpected_error")
          });
        }
      } 
      else if (mode === "edit" && isInventoryItem(skin)) {
        // Fixed: Only pass the expected parameters
        const result = await updateInventoryItem({
          itemId: skin.inventoryId,
          updates: {
            ...skin,
            purchasePrice,
            marketplace,
            feePercentage,
            notes,
            isStatTrak,
            floatValue,
            wear
          }
        });

        if (result.success) {
          toast.success(t("inventory.skin_updated"), {
            description: t("inventory.skin_updated_description", { name: skin.name })
          });
          invalidateInventory();
          onOpenChange(false);
        } else {
          toast.error(t("inventory.update_error"), {
            description: result.error?.message || t("common.unexpected_error")
          });
        }
      }
    } catch (error) {
      console.error("Error in InventorySkinModal:", error);
      toast.error(t("common.unexpected_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" && t("inventory.add_skin")}
            {mode === "edit" && t("inventory.edit_skin")}
            {mode === "view" && t("inventory.skin_details")}
            {mode === "sell" && t("inventory.sell_skin")}
          </DialogTitle>
        </DialogHeader>

        {mode === "sell" && isInventoryItem(skin) ? (
          <SkinSellingForm 
            skin={skin} 
          />
        ) : (
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-20 h-20 bg-black/20 rounded-sm flex items-center justify-center">
                {skin?.image ? (
                  <img 
                    src={skin.image} 
                    alt={skin.name} 
                    className="max-w-full max-h-full object-contain p-1"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">No image</span>
                )}
              </div>
              <div>
                <h3 className="font-medium text-lg">{skin.name}</h3>
                <p className="text-muted-foreground text-sm">{skin.weapon}</p>
                <p className={`text-xs inline-block px-1.5 py-0.5 rounded ${skin.rarity === "Covert" ? "bg-red-500/20 text-red-500" : 
                  skin.rarity === "Classified" ? "bg-pink-500/20 text-pink-500" :
                  skin.rarity === "Restricted" ? "bg-purple-500/20 text-purple-500" :
                  skin.rarity === "Mil-Spec Grade" ? "bg-blue-500/20 text-blue-500" :
                  "bg-gray-500/20 text-gray-500"}`}>
                  {skin.rarity}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-3">
              <div>
                <Label htmlFor="purchasePrice">{t("inventory.purchase_price")}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="purchasePrice"
                    type="number"
                    className="pl-7"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    disabled={mode === "view"}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="marketplace">{t("inventory.marketplace")}</Label>
                <Input
                  id="marketplace"
                  value={marketplace}
                  onChange={(e) => setMarketplace(e.target.value)}
                  disabled={mode === "view"}
                />
              </div>

              <div>
                <Label htmlFor="feePercentage">{t("inventory.fee_percentage")}</Label>
                <div className="relative">
                  <Input
                    id="feePercentage"
                    type="number"
                    className="pr-7"
                    value={feePercentage}
                    onChange={(e) => setFeePercentage(Number(e.target.value))}
                    disabled={mode === "view"}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="wear">{t("inventory.wear")}</Label>
                  <Select
                    value={wear}
                    onValueChange={(value) => setWear(value as SkinWear)}
                    disabled={mode === "view"}
                  >
                    <SelectTrigger id="wear">
                      <SelectValue placeholder={t("inventory.select_wear")} />
                    </SelectTrigger>
                    <SelectContent>
                      {WEAR_TYPES.map((wearType) => (
                        <SelectItem key={wearType} value={wearType}>
                          {wearType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="floatValue">{t("inventory.float_value")}</Label>
                  <Input
                    id="floatValue"
                    type="number"
                    step="0.0001"
                    min="0"
                    max="1"
                    value={floatValue === undefined ? "" : floatValue}
                    onChange={(e) => setFloatValue(e.target.value ? Number(e.target.value) : undefined)}
                    disabled={mode === "view"}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isStatTrak"
                  checked={isStatTrak}
                  onCheckedChange={(checked) => setIsStatTrak(checked === true)}
                  disabled={mode === "view"}
                />
                <Label htmlFor="isStatTrak">{t("inventory.stat_trak")}</Label>
              </div>

              <div>
                <Label htmlFor="notes">{t("inventory.notes")}</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={mode === "view"}
                  className="h-20"
                />
              </div>
            </div>

            {mode !== "view" && (
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  {t("common.cancel")}
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? t("common.submitting") : mode === "add" ? t("common.add") : t("common.update")}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
