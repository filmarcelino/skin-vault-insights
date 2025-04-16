
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { InventoryItem, SellData, Skin } from "@/types/skin";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { SkinDetailsCard } from "./skin-details-card";
import { SkinSellingForm } from "./skin-selling-form";
import { SkinAdditionalInfo } from "./skin-additional-info";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InventorySkinModalProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSellSkin?: (itemId: string, sellData: SellData) => void;
  onAddToInventory?: (skin: Skin) => InventoryItem | null;
}

export function InventorySkinModal({
  item,
  open,
  onOpenChange,
  onSellSkin,
  onAddToInventory
}: InventorySkinModalProps) {
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();

  const handleAddToInventory = () => {
    if (!item || !onAddToInventory) return;

    const newItem = onAddToInventory(item);
    if (newItem) {
      onOpenChange(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {item && (
          <>
            <SkinDetailsCard item={item} />

            {!item.isInUserInventory && onAddToInventory && (
              <div className="mb-4">
                <Button 
                  onClick={handleAddToInventory} 
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add to My Inventory
                </Button>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                {item.isInUserInventory && onSellSkin && (
                  <TabsTrigger value="sell" className="flex-1">Sell</TabsTrigger>
                )}
                <TabsTrigger value="notes" className="flex-1">Notes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="py-4">
                <div className="space-y-6">
                  {/* Price History - Placeholder for now */}
                  <div className="p-4 rounded-md border border-[#333] bg-[#221F26]/30">
                    <h3 className="font-medium mb-2 text-[#8B5CF6]">Price History</h3>
                    <div className="h-24 flex items-center justify-center text-[#8A898C] text-sm">
                      Price history charts will be available soon.
                    </div>
                  </div>

                  {/* Collection Info - Placeholder for now */}
                  {item.collection && (
                    <div className="p-4 rounded-md border border-[#333] bg-[#221F26]/30">
                      <h3 className="font-medium mb-2 text-[#8B5CF6]">Collection</h3>
                      <div className="text-sm text-[#8A898C]">
                        This skin is part of {item.collection.name || "Unknown Collection"}
                      </div>
                    </div>
                  )}

                  {/* Float Value Info */}
                  <div className="p-4 rounded-md border border-[#333] bg-[#221F26]/30">
                    <h3 className="font-medium mb-2 text-[#8B5CF6]">Float Value</h3>
                    <div className="text-sm text-[#8A898C]">
                      {item.floatValue ? (
                        <>
                          <p>Current Float: {item.floatValue.toFixed(8)}</p>
                          <p>Float Range: {item.min_float?.toFixed(8) || "Unknown"} - {item.max_float?.toFixed(8) || "Unknown"}</p>
                        </>
                      ) : (
                        <p>Float value information not available.</p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {item.isInUserInventory && onSellSkin && (
                <TabsContent value="sell" className="py-4">
                  <SkinSellingForm 
                    item={item} 
                    onSell={onSellSkin} 
                    onCancel={() => setActiveTab("details")} 
                  />
                </TabsContent>
              )}

              <TabsContent value="notes" className="py-4">
                <SkinAdditionalInfo item={item} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
