
import React from 'react';
import { Layout } from '@/components/layout/layout';
import { useInventoryActions } from '@/hooks/useInventoryActions';
import { InventorySkinModal } from '@/components/skins/inventory-skin-modal';
import { DuplicateSkinModal } from '@/components/inventory/DuplicateSkinModal';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SkinImageAnalyzer } from '@/components/SkinImageAnalyzer';

export default function AddSkin() {
  const navigate = useNavigate();
  const {
    selectedItem,
    isModalOpen,
    duplicateModalOpen,
    selectedItemForDuplicate,
    duplicateCount,
    setIsModalOpen,
    setSelectedItem,
    setDuplicateModalOpen,
    setSelectedItemForDuplicate,
    setDuplicateCount,
    handleDuplicateCountChange,
    handleConfirmDuplicate,
    handleCloseDuplicateModal,
    handleViewDetails
  } = useInventoryActions();

  // Create handlers for onEdit, onDuplicate, onRemove, onSell, handleUpdate
  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDuplicate = (item: any) => {
    setSelectedItemForDuplicate(item);
    setDuplicateModalOpen(true);
  };
  
  const handleRemove = (id: string) => {
    console.log(`Removing item with ID: ${id}`);
    // Add your remove logic here
  };
  
  const handleSell = (item: any) => {
    console.log(`Selling item:`, item);
    // Add your sell logic here
  };
  
  const handleUpdate = (updatedItem: any) => {
    console.log(`Updating item:`, updatedItem);
    setIsModalOpen(false);
    // Add your update logic here
  };
  
  const handleClose = () => {
    setIsModalOpen(false);
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
              isOpen={isModalOpen} 
              onClose={handleClose}
              onSave={handleUpdate}
              skin={selectedItem}
              mode="add"
            />
            <Button 
              variant="default" 
              onClick={() => {
                setSelectedItem({} as any);
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
            
            <SkinImageAnalyzer onSkinDetected={(skin) => {
              setSelectedItem(skin);
              setIsModalOpen(true);
            }}/>
          </div>
        </div>
      </div>
      
      <DuplicateSkinModal 
        isOpen={duplicateModalOpen}
        onClose={handleCloseDuplicateModal}
        onConfirm={handleConfirmDuplicate}
        onCountChange={handleDuplicateCountChange}
        count={duplicateCount}
        skin={selectedItemForDuplicate}
      />
    </Layout>
  );
}
