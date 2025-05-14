
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
  skin?: InventoryItem | Skin | any;
  mode?: 'view' | 'edit' | 'add';
  onSellSkin?: (itemId: string, sellData: SellData) => Promise<void>;
  onAddToInventory?: (skin: Skin) => Promise<InventoryItem | null>;
  item?: any; // Adding this prop to handle the error
}

export const InventorySkinModal: React.FC<InventorySkinModalProps> = ({
  open,
  onOpenChange,
  skin = {},
  mode = 'view',
  onSellSkin,
  onAddToInventory,
  item, // We'll use either item or skin
}) => {
  const [activeTab, setActiveTab] = useState("details");
  const { t } = useLanguage();
  
  // Use item if provided, otherwise use skin, and ensure it's never null or undefined
  const skinData = item || skin || {};
  
  // Add explicit check for isInUserInventory to avoid the null access error
  const isInUserInventory = skinData && skinData.isInUserInventory === true;

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

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
            {mode !== 'add' && (
              <TabsTrigger value="additional">{t('skins.additionalInfo')}</TabsTrigger>
            )}
            {mode !== 'add' && isInUserInventory && (
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
          {mode !== 'add' && (
            <TabsContent value="additional">
              <SkinAdditionalInfo item={skinData} />
            </TabsContent>
          )}
          {mode !== 'add' && isInUserInventory && (
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
