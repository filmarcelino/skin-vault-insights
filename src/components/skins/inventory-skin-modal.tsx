
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skin, InventoryItem, SellData } from "@/types/skin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkinDetailsCard } from "./skin-details-card";
import { SkinSellingForm } from "./skin-selling-form";
import { SkinAdditionalInfo } from "./skin-additional-info";
import { useLanguage } from "@/contexts/LanguageContext";

export interface InventorySkinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skin?: InventoryItem | Skin | null;
  mode?: 'view' | 'edit' | 'add';
  onSellSkin?: (itemId: string, sellData: SellData) => Promise<void>;
  onAddToInventory?: (skin: Skin) => Promise<InventoryItem | null>;
  item?: InventoryItem | Skin | null; // Added type definition
}

export const InventorySkinModal: React.FC<InventorySkinModalProps> = ({
  open,
  onOpenChange,
  skin = null,
  mode = 'view',
  onSellSkin,
  onAddToInventory,
  item = null, // Initialize with null
}) => {
  const [activeTab, setActiveTab] = useState("details");
  const { t } = useLanguage();
  
  // Use item if provided, otherwise use skin, ensure it's never undefined
  const skinData = item || skin || {};
  
  // Add explicit null check for isInUserInventory
  const isInUserInventory = skinData && 
    typeof skinData === 'object' && 
    'isInUserInventory' in skinData ? 
    skinData.isInUserInventory === true : false;

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  // Add extra safety check - if there's no valid data, don't render tabs that need data
  const canShowAdditionalInfo = mode !== 'add' && skinData && Object.keys(skinData).length > 0;
  const canShowSellTab = mode !== 'add' && isInUserInventory;

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
                item={skinData} 
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
