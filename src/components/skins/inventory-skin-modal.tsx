
import { useState } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogFooter, DialogClose, DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InventoryItem, SellData } from "@/types/skin";
import { X, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getTradeLockStatus } from "@/utils/skin-utils";
import { SkinDetailsCard } from "./skin-details-card";
import { SkinSellingForm } from "./skin-selling-form";
import { SkinAdditionalInfo } from "./skin-additional-info";

interface InventorySkinModalProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSellSkin?: (itemId: string, sellData: SellData) => void;
}

export const InventorySkinModal = ({ 
  item, open, onOpenChange, onSellSkin 
}: InventorySkinModalProps) => {
  const { toast } = useToast();
  const [isSellingMode, setIsSellingMode] = useState(false);

  // Check if the item is trade locked
  const { isLocked } = item ? getTradeLockStatus(item.tradeLockUntil) : { isLocked: false };

  const handleSellSkin = (itemId: string, sellData: SellData) => {
    if (!item || !onSellSkin) return;
    
    onSellSkin(itemId, sellData);
    
    toast({
      title: "Skin Sold",
      description: `${item.weapon || ""} | ${item.name} has been marked as sold.`,
    });

    setIsSellingMode(false);
    onOpenChange(false);
  };

  const resetSellForm = () => {
    setIsSellingMode(false);
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={(newState) => {
      onOpenChange(newState);
      if (!newState) resetSellForm();
    }}>
      <DialogContent 
        className="max-w-3xl max-h-[90vh] overflow-hidden p-0 animate-fade-in bg-[#1A1F2C] border-[#333] shadow-[0_0_15px_rgba(86,71,255,0.2)]"
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl flex justify-between items-center">
            <span className="text-[#8B5CF6]">
              {isSellingMode ? "Sell Skin" : "Skin Details"}
            </span>
            <DialogClose className="rounded-full p-2 hover:bg-[#333]">
              <X className="h-4 w-4" />
            </DialogClose>
          </DialogTitle>
          {isSellingMode && (
            <DialogDescription className="text-sm text-[#8A898C]">
              Record the sale details for this skin to track your profits and transaction history
            </DialogDescription>
          )}
        </DialogHeader>
        
        <ScrollArea className="flex-grow pr-4 pl-6 pt-4 pb-4 h-[calc(90vh-10rem)] scrollbar-none">
          <div className="py-4">
            {/* Skin Card with Rarity Colored Background */}
            <SkinDetailsCard item={item} />
            
            {/* Show either the selling form or additional info based on mode */}
            {isSellingMode ? (
              <SkinSellingForm 
                item={item} 
                onCancel={() => setIsSellingMode(false)}
                onSell={handleSellSkin}
              />
            ) : (
              <SkinAdditionalInfo item={item} />
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter className="p-6 pt-4 border-t border-[#333]">
          {isSellingMode ? (
            <></>
          ) : (
            <>
              <DialogClose asChild>
                <Button 
                  type="button" 
                  variant="outline"
                  className="border-[#333] hover:bg-[#333]"
                >
                  Close
                </Button>
              </DialogClose>
              <Button 
                type="button" 
                onClick={() => setIsSellingMode(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isLocked}
              >
                <DollarSign className="h-4 w-4 mr-1" />
                Sell Skin
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
