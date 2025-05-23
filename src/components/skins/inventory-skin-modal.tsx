
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skin, InventoryItem } from "@/types/skin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkinDetailsCard } from "./skin-details-card";
import { SkinSellingForm } from "./skin-selling-form";
import { SkinAdditionalInfo } from "./skin-additional-info";
import { useLanguage } from "@/contexts/LanguageContext";
import { defaultSkin, defaultInventoryItem } from "@/utils/default-objects";

export interface InventorySkinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skin?: InventoryItem | Skin | null;
  mode?: 'view' | 'edit' | 'add';
  onSellSkin?: (itemId: string, sellData: any) => Promise<void>;
  onAddToInventory?: (skin: Skin) => Promise<InventoryItem | null>;
  item?: InventoryItem | Skin | null;
}

export const InventorySkinModal: React.FC<InventorySkinModalProps> = ({
  open,
  onOpenChange,
  skin = null,
  mode = 'view',
  onSellSkin,
  onAddToInventory,
  item = null,
}) => {
  const [activeTab, setActiveTab] = useState("details");
  const { t } = useLanguage();
  
  // Use item if provided, otherwise use skin, and ensure we always have a valid default
  const skinData = item || skin || (mode === 'add' ? defaultSkin : defaultInventoryItem);
  
  // Debug log to help identify issues
  console.log("InventorySkinModal skinData:", skinData);
  
  // Safely check for isInUserInventory with better type handling
  const isInUserInventory = 'isInUserInventory' in skinData ? 
    Boolean(skinData.isInUserInventory) : false;

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  // Add extra safety check - if there's no valid data, don't render tabs that need data
  const canShowAdditionalInfo = mode !== 'add' && skinData && Object.keys(skinData).length > 0;
  const canShowSellTab = mode !== 'add' && isInUserInventory;
  
  // Debug
  console.log("Modal tabs state:", { 
    canShowAdditionalInfo, 
    canShowSellTab, 
    isInUserInventory,
    mode
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'add' ? t('skins.addToInventory') : 
             mode === 'edit' ? t('skins.editSkin') : 
             t('skins.skinDetails')}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">{t('skins.details')}</TabsTrigger>
            {canShowAdditionalInfo && (
              <TabsTrigger value="additional">{t('skins.additionalInfo')}</TabsTrigger>
            )}
            {canShowSellTab && (
              <TabsTrigger value="sell">{t('skins.sell')}</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="details">
            <SkinDetailsCard 
              item={skinData} 
              mode={mode} 
              onAddToInventory={onAddToInventory} 
            />
          </TabsContent>
          
          {canShowAdditionalInfo && (
            <TabsContent value="additional">
              <SkinAdditionalInfo item={skinData} />
            </TabsContent>
          )}
          
          {canShowSellTab && (
            <TabsContent value="sell">
              <SkinSellingForm 
                item={skinData as InventoryItem} 
                onSellSkin={onSellSkin} 
                onCancel={() => setActiveTab("details")}
              />
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
