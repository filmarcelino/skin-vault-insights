
import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreVertical, Edit, Copy, Trash2, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  useInventory,
  useAddSkin,
  useRemoveSkin,
  useUpdateSkin,
  useSellSkin,
  useInvalidateInventory,
} from "@/hooks/use-skins";
import { InventorySkinModal } from "@/components/skins/inventory-skin-modal";
import { SellData, Skin, InventoryItem } from "@/types/skin";
import { CurrencySelector } from "@/components/ui/currency-selector";
import { useCurrency } from "@/contexts/CurrencyContext";

const Inventory = () => {
  const [search, setSearch] = useState("");
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const { data: inventory, isLoading, refetch } = useInventory();
  const addSkin = useAddSkin();
  const removeSkin = useRemoveSkin();
  const updateSkin = useUpdateSkin();
  const sellSkin = useSellSkin();
  const invalidateInventory = useInvalidateInventory();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (inventory) {
      const filtered = inventory.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredInventory(filtered);
    }
  }, [inventory, search]);

  const onEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const onDuplicate = (item: InventoryItem) => {
    toast({
      title: "Duplicar Skin",
      description: "Funcionalidade em desenvolvimento.",
    });
  };

  const onRemove = async (inventoryId: string) => {
    try {
      await removeSkin.mutateAsync(inventoryId);
      toast({
        title: "Skin Removida",
        description: "Skin removida do inventário com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao Remover",
        description: "Falha ao remover a skin do inventário.",
      });
    } finally {
      invalidateInventory();
    }
  };

  const onSell = (itemId: string, sellData: SellData) => {
    sellSkin.mutate({ itemId, sellData: sellData });
  };

  const handleUpdate = async (item: InventoryItem) => {
    try {
      await updateSkin.mutateAsync(item);
      toast({
        title: "Skin Atualizada",
        description: "Informações da skin atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao Atualizar",
        description: "Falha ao atualizar as informações da skin.",
      });
    } finally {
      invalidateInventory();
    }
  };

  const handleSell = (itemId: string, sellData: SellData) => {
    onSell(itemId, sellData);
    onClose();
    invalidateInventory();
  };

  const handleAddToInventory = async (skin: Skin): Promise<InventoryItem | null> => {
    try {
      const purchaseInfo = {
        purchasePrice: skin.price || 0,
        marketplace: "Steam Market",
        feePercentage: 0,
        notes: "Added from inventory",
        currency: "USD"
      };
      
      const newItem = await addSkin.mutateAsync({ skin, purchaseInfo });
      
      toast({
        title: "Skin Adicionada",
        description: `${skin.name} foi adicionada ao inventário.`,
      });
      
      invalidateInventory();
      return newItem;
    } catch (error) {
      console.error("Error adding skin:", error);
      toast({
        title: "Erro ao Adicionar",
        description: "Falha ao adicionar skin ao inventário.",
        variant: "destructive"
      });
      return null;
    }
  };

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

  const onClose = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
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
        <Input
          type="search"
          placeholder="Buscar skin..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <CurrencySelector />
      </div>

      <ScrollArea className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Imagem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Arma</TableHead>
              <TableHead>Raridade</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Carregando inventário...
                </TableCell>
              </TableRow>
            ) : filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Nenhuma skin encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((item) => (
                <TableRow key={item.inventoryId}>
                  <TableCell className="font-medium">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-auto rounded-md"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.weapon}</TableCell>
                  <TableCell>
                    <Badge>{item.rarity}</Badge>
                  </TableCell>
                  <TableCell>
                    {formatPrice(item.currentPrice || item.price || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDuplicate(item)}>
                          <Copy className="mr-2 h-4 w-4" />
                          <span>Duplicar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onRemove(item.inventoryId)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Remover</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>

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
