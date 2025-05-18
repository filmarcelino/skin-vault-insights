
import React from 'react';
import { Layout } from '@/components/layout/layout';
import { useInventoryActions } from '@/hooks/useInventoryActions';
import { InventorySkinModal } from '@/components/skins/inventory-skin-modal';
import { DuplicateSkinModal } from '@/components/inventory/DuplicateSkinModal';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SkinImageAnalyzer } from '@/components/SkinImageAnalyzer';
import { defaultSkin } from '@/utils/default-objects';
import { Skin } from '@/types/skin';

export default function AddSkin() {
  const navigate = useNavigate();
  
  // Use inventory actions hook but only destructure what we need and is available
  const {
    selectedItem,
    isModalOpen,
    duplicateModalOpen,
    selectedItemForDuplicate,
    duplicateCount,
    setIsModalOpen,
    handleViewDetails,
    handleCloseDuplicateModal,
    handleConfirmDuplicate,
    handleDuplicateCountChange
  } = useInventoryActions();
  
  // Create local handlers
  const handleClose = () => {
    setIsModalOpen(false);
  };
  
  const handleSkinDetected = (skin: any) => {
    console.log('Skin detected:', skin);
    setIsModalOpen(true);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/inventory')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Add New Skin</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="cs-card p-4">
            <h2 className="text-xl font-semibold mb-4">Manual Entry</h2>
            <InventorySkinModal 
              open={isModalOpen} 
              onOpenChange={handleClose}
              skin={selectedItem || defaultSkin}
              mode="add"
            />
            <Button 
              variant="default" 
              onClick={() => {
                setIsModalOpen(true);
              }}
            >
              Add Skin Manually
            </Button>
          </div>
          
          <div className="cs-card p-4">
            <h2 className="text-xl font-semibold mb-4">Image Recognition</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a screenshot or image of your skin to automatically identify and add it to your inventory.
            </p>
            
            <SkinImageAnalyzer />
          </div>
        </div>
      </div>
      
      <DuplicateSkinModal 
        open={duplicateModalOpen}
        onOpenChange={handleCloseDuplicateModal}
        skin={selectedItemForDuplicate || defaultSkin as Skin}
        count={duplicateCount || 1}
        onDuplicate={handleConfirmDuplicate}
      />
    </Layout>
  );
}
