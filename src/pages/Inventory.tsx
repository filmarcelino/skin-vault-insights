
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInventory, useInvalidateInventory } from "@/hooks/use-skins";
import { InventorySkinModal } from "@/components/skins/inventory-skin-modal";
import { InventoryItem } from "@/types/skin";
import { CurrencySelector } from "@/components/ui/currency-selector";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { DuplicateSkinModal } from "@/components/inventory/DuplicateSkinModal";
import { useInventoryActions } from "@/hooks/useInventoryActions";
import { InventoryGrid } from "@/components/inventory/InventoryGrid";
import { ViewToggle } from "@/components/ui/view-toggle";

const Inventory = () => {
  const [search, setSearch] = useState("");
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const { toast } = useToast();
  const { data: inventory, isLoading, refetch } = useInventory();
  const invalidateInventory = useInvalidateInventory();

  const {
    selectedItem,
    isModalOpen,
    duplicateModalOpen,
    selectedItemForDuplicate,
    duplicateCount,
    setIsModalOpen,
    setDuplicateModalOpen,
    setDuplicateCount,
    onEdit,
    onDuplicate,
    onRemove,
    onSell,
    handleUpdate,
    handleSell,
    handleAddToInventory,
    handleDuplicate,
    onClose,
    onViewDetails,
  } = useInventoryActions();

  useEffect(() => {
    if (inventory) {
      const filtered = inventory.filter((item) =>
        item.name?.toLowerCase().includes(search.toLowerCase()) || 
        item.weapon?.toLowerCase().includes(search.toLowerCase()) ||
        (item.rarity && item.rarity.toLowerCase().includes(search.toLowerCase()))
      );
      setFilteredInventory(filtered);
    }
  }, [inventory, search]);

  const handleRefreshInventory = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Inventário Atualizado",
        description: "Seu inventário foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao atualizar inventário:", error);
      toast({
        title: "Erro ao Atualizar",
        description: "Não foi possível atualizar o inventário.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Lidar com clique no item da lista ou card para abrir modal de edição
  const handleItemClick = (item: InventoryItem) => {
    onEdit(item);
  };

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cs2-gold to-cs2-gold-light bg-clip-text text-transparent">
          Meu Inventário
        </h1>
        <Button 
          onClick={handleRefreshInventory}
          disabled={isRefreshing}
          size="sm"
          variant="cs2Outline"
          className="gap-2 whitespace-nowrap"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Atualizando...' : 'Atualizar Inventário'}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4">
        <div className="flex flex-1 items-center gap-4">
          <Input
            type="search"
            placeholder="Buscar skin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <CurrencySelector />
          <ViewToggle
            view={viewMode}
            onChange={setViewMode}
          />
        </div>
      </div>

      {viewMode === 'list' ? (
        <InventoryTable
          isLoading={isLoading}
          inventory={filteredInventory}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onRemove={onRemove}
          onSell={onSell}
        />
      ) : (
        <InventoryGrid
          isLoading={isLoading}
          inventory={filteredInventory}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onRemove={onRemove}
          onSell={onSell}
        />
      )}

      <DuplicateSkinModal
        open={duplicateModalOpen}
        onOpenChange={setDuplicateModalOpen}
        onDuplicate={handleDuplicate}
        selectedItem={selectedItemForDuplicate}
      />

      <InventorySkinModal
        item={selectedItem}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSellSkin={handleSell}
        onUpdateSkin={handleUpdate}
        onAddToInventory={handleAddToInventory}
        onClose={onClose}
      />
    </div>
  );
};

export default Inventory;
