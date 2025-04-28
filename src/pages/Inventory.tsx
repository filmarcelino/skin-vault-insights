
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
import { InventoryGrid } from "@/components/inventory/InventoryGrid";
import { DuplicateSkinModal } from "@/components/inventory/DuplicateSkinModal";
import { useInventoryActions } from "@/hooks/useInventoryActions";
import { ViewToggle } from "@/components/ui/view-toggle";

const Inventory = () => {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const { data: inventory, isLoading, refetch } = useInventory();
  const invalidateInventory = useInvalidateInventory();

  const {
    selectedItem,
    isModalOpen,
    duplicateModalOpen,
    selectedItemForDuplicate,
    setIsModalOpen,
    setDuplicateModalOpen,
    onEdit,
    onDuplicate,
    onRemove,
    onSell,
    handleSell,
    handleAddToInventory,
    handleDuplicate,
    onClose,
  } = useInventoryActions();

  useEffect(() => {
    if (inventory) {
      const filtered = inventory.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
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

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Meu Inventário
        </h1>
        <Button 
          onClick={handleRefreshInventory}
          disabled={isRefreshing}
          size="sm"
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Atualizando...' : 'Atualizar Inventário'}
        </Button>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Input
            type="search"
            placeholder="Buscar skin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <ViewToggle view={view} onChange={setView} />
        </div>
        <CurrencySelector />
      </div>

      {view === "list" ? (
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
        onAddToInventory={handleAddToInventory}
      />
    </div>
  );
};

export default Inventory;
