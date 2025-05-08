
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SoldSkinsTable } from "@/components/inventory/SoldSkinsTable";
import { InventorySkinEditModal } from "@/components/skins/inventory-skin-edit-modal";

const Inventory = () => {
  const [search, setSearch] = useState("");
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [soldItems, setSoldItems] = useState<any[]>([]);
  const [loadingSold, setLoadingSold] = useState(true);
  const [editingSoldItem, setEditingSoldItem] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
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
  
  useEffect(() => {
    if (user) {
      loadSoldItems();
    }
  }, [user]);

  const loadSoldItems = async () => {
    setLoadingSold(true);
    try {
      // Consulta atualizada para buscar informações de compra dos itens vendidos
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('id, transaction_id, type, item_id, weapon_name, skin_name, date, price, notes, currency_code')
        .eq('user_id', user?.id)
        .eq('type', 'sell')
        .order('date', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // Para cada item vendido, buscar o valor de compra original
      if (transactions && transactions.length > 0) {
        const itemsWithPurchaseDetails = await Promise.all(
          transactions.map(async (transaction) => {
            // Buscamos nas transações do tipo "add" ou "purchase" para o mesmo item
            const { data: purchaseTransactions } = await supabase
              .from('transactions')
              .select('price, currency_code')
              .eq('user_id', user?.id)
              .eq('item_id', transaction.item_id)
              .in('type', ['add', 'purchase'])
              .order('date', { ascending: true })
              .limit(1);

            // Se encontramos alguma transação de compra, anexamos o valor
            if (purchaseTransactions && purchaseTransactions.length > 0) {
              return {
                ...transaction,
                purchase_price: purchaseTransactions[0].price,
                purchase_currency: purchaseTransactions[0].currency_code
              };
            }
            
            // Se não encontramos, verificamos na tabela de inventory
            const { data: inventoryItems } = await supabase
              .from('inventory')
              .select('purchase_price')
              .eq('inventory_id', transaction.item_id)
              .limit(1);
              
            if (inventoryItems && inventoryItems.length > 0) {
              return {
                ...transaction,
                purchase_price: inventoryItems[0].purchase_price
              };
            }
            
            return transaction;
          })
        );
        
        setSoldItems(itemsWithPurchaseDetails || []);
      } else {
        setSoldItems([]);
      }
    } catch (error) {
      console.error('Erro ao carregar itens vendidos:', error);
      toast({
        title: "Erro ao Carregar",
        description: "Não foi possível carregar os itens vendidos.",
        variant: "destructive"
      });
    } finally {
      setLoadingSold(false);
    }
  };

  const handleRefreshInventory = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      await loadSoldItems();
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

  const handleEditSoldItem = (item: any) => {
    setEditingSoldItem(item);
    setIsEditModalOpen(true);
  };

  const handleUpdateSoldItem = async (updatedItem: any) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          price: updatedItem.price,
          notes: updatedItem.notes,
          date: updatedItem.date
        })
        .eq('id', updatedItem.id);
        
      if (error) throw error;
      
      toast({
        title: "Venda Atualizada",
        description: "As informações da venda foram atualizadas com sucesso."
      });
      
      loadSoldItems();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar venda:', error);
      toast({
        title: "Erro ao Atualizar",
        description: "Não foi possível atualizar as informações da venda.",
        variant: "destructive"
      });
    }
  };

  const handleItemClick = (item: InventoryItem) => {
    onEdit(item);
  };

  const filteredSoldItems = soldItems.filter(item =>
    (item.skin_name && item.skin_name.toLowerCase().includes(search.toLowerCase())) ||
    (item.weapon_name && item.weapon_name.toLowerCase().includes(search.toLowerCase()))
  );

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
      
      <Tabs defaultValue="current" className="mt-4">
        <TabsList>
          <TabsTrigger value="current">Itens Atuais</TabsTrigger>
          <TabsTrigger value="sold">Itens Vendidos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="pt-4">
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
        </TabsContent>
        
        <TabsContent value="sold" className="pt-4">
          <SoldSkinsTable
            items={filteredSoldItems}
            isLoading={loadingSold}
            onEdit={handleEditSoldItem}
          />
        </TabsContent>
      </Tabs>

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
      
      <InventorySkinEditModal
        item={editingSoldItem}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onUpdateSold={handleUpdateSoldItem}
      />
    </div>
  );
};

export default Inventory;
