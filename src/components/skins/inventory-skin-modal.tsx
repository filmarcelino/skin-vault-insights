
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InventoryItem, ModalMode, Skin } from "@/types/skin";
import { SkinSellingForm } from "@/components/skins/skin-selling-form";
import { useLanguage } from "@/contexts/LanguageContext";

interface InventorySkinModalProps {
  skin: Skin | InventoryItem;
  mode?: ModalMode; // Use the ModalMode type here
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSellSkin?: (itemId: string, sellData: any) => void;
}

export function InventorySkinModal({
  skin,
  mode = "add",
  open,
  onOpenChange,
  onSellSkin,
}: InventorySkinModalProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  // Set dialog title based on mode
  let title = t("inventory.addSkin");
  if (mode === "edit") title = t("inventory.editSkin");
  if (mode === "view") title = t("inventory.viewSkin");
  if (mode === "sell") title = t("inventory.sellSkin");

  // Set dialog description based on mode
  let description = t("inventory.addSkinDesc");
  if (mode === "edit") description = t("inventory.editSkinDesc");
  if (mode === "view") description = t("inventory.viewSkinDesc");
  if (mode === "sell") description = t("inventory.sellSkinDesc");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {mode === "sell" && (
            <SkinSellingForm 
              skin={skin as InventoryItem} 
              onSellSkin={onSellSkin} 
              onCancel={() => onOpenChange && onOpenChange(false)} 
            />
          )}
          {mode !== "sell" && (
            <p>View/Edit/Add form would go here</p>
          )}
        </div>

        {mode !== "sell" && (
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange && onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button 
              type="submit"
              disabled={isLoading} 
              onClick={() => onOpenChange && onOpenChange(false)}
            >
              {isLoading ? (
                <>{t("common.saving")}</>
              ) : (
                <>{t("common.save")}</>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
