
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "@/components/ui/search";
import { useSearchSkins, useInventory, useWeapons, useAddSkin } from "@/hooks/use-skins";
import { Skin, InventoryItem } from "@/types/skin";
import { useToast } from "@/hooks/use-toast";
import { SkinDetailModal } from "@/components/skins/skin-detail-modal";
import { InventoryCard } from "@/components/dashboard/inventory-card";
import { SkinImageAnalyzer } from "@/components/SkinImageAnalyzer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useInventoryActions } from "@/hooks/useInventoryActions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SkinListItem } from "@/components/inventory/SkinListItem";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

// Definindo o número de itens por página
const ITEMS_PER_PAGE = 8;

const AddSkin = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [shouldRecordTransaction, setShouldRecordTransaction] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const { data: searchResults = [], isLoading: isSearching } = useSearchSkins(searchQuery);
  const { data: weapons = [] } = useWeapons();
  const { data: inventoryItems = [] } = useInventory();
  const addSkinMutation = useAddSkin();
  
  const {
    onEdit,
    onDuplicate,
    onRemove,
    onSell,
    selectedItem,
    isModalOpen,
    setIsModalOpen,
    handleSell,
    handleUpdate
  } = useInventoryActions();
  
  // Cálculo da paginação
  const totalPages = Math.max(1, Math.ceil(searchResults.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedResults = searchResults.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset para a primeira página ao fazer uma nova pesquisa
  };

  const handleSelectSkin = (skin: Skin) => {
    setSelectedSkin(skin);
    setModalOpen(true);
  };
  
  const handleAddSkin = async (skinData: any) => {
    try {
      console.log("Adding skin with data:", skinData);
      
      // Ensure we have a valid ID
      const skinId = skinData.skinId || `skin-${Date.now()}`;
      
      // Sanitize data to avoid undefined values
      const cleanSkin = {
        id: skinId,
        name: skinData.name || "Unknown Skin",
        weapon: skinData.weapon || "Unknown",
        rarity: skinData.rarity || "",
        image: skinData.image || "",
        price: skinData.estimatedValue || skinData.purchasePrice || 0,
        floatValue: parseFloat(skinData.floatValue || "0"),
        isStatTrak: !!skinData.isStatTrak,
        wear: skinData.wear || "",
      };
      
      const cleanPurchaseInfo = {
        purchasePrice: skinData.purchasePrice || 0,
        marketplace: skinData.marketplace || "Steam Market",
        feePercentage: skinData.feePercentage || 0,
        notes: skinData.notes || "",
        currency: skinData.currency || "USD"
      };
      
      console.log("Cleaned skin data:", cleanSkin);
      console.log("Cleaned purchase info:", cleanPurchaseInfo);
      
      // Adicionar a skin ao inventário
      addSkinMutation.mutate({
        skin: cleanSkin,
        purchaseInfo: cleanPurchaseInfo
      }, {
        onSuccess: () => {
          // Mostrar mensagem de sucesso
          toast({
            title: "Skin Adicionada",
            description: `${cleanSkin.weapon} | ${cleanSkin.name} foi adicionada ao seu inventário.`,
          });
          
          // Resetar formulário e navegar de volta para o inventário
          setSelectedSkin(null);
        },
        onError: (error) => {
          console.error("Error adding skin:", error);
          toast({
            title: "Erro",
            description: "Falha ao adicionar skin ao inventário",
            variant: "destructive"
          });
        }
      });
    } catch (error) {
      console.error("Error adding skin:", error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar skin ao inventário",
        variant: "destructive"
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;
    
    try {
      // Se não deve registrar como transação, passa false como segundo argumento
      onRemove(itemToDelete);
      toast({
        title: "Skin removida",
        description: "A skin foi removida do seu inventário",
      });
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover a skin",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteClick = (inventoryId: string) => {
    setItemToDelete(inventoryId);
    setDeleteDialogOpen(true);
  };
  
  const handleItemClick = (item: InventoryItem) => {
    onEdit(item);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Adicionar Skin ao Inventário</h1>
      
      {isMobile && (
        <div className="mb-6">
          <SkinImageAnalyzer />
        </div>
      )}
      
      <div className="mb-6">
        <Search 
          placeholder="Busque uma skin pelo nome ou arma..." 
          onSearch={handleSearch}
        />
      </div>
      
      {isSearching && searchQuery.length > 2 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Buscando skins...</p>
        </div>
      )}
      
      {searchQuery.length > 2 && !isSearching && searchResults.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhuma skin encontrada com "{searchQuery}"</p>
        </div>
      )}
      
      {searchResults.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {paginatedResults.map((skin) => (
              <div 
                key={skin.id || `temp-${skin.name}`}
                onClick={() => handleSelectSkin(skin)}
                className="cursor-pointer transition-all hover:scale-[1.02]"
              >
                <InventoryCard
                  weaponName={skin.weapon || ""}
                  skinName={skin.name}
                  image={skin.image}
                  rarity={skin.rarity}
                  className={selectedSkin?.id === skin.id ? 'ring-2 ring-primary' : ''}
                />
              </div>
            ))}
          </div>
          
          {/* Paginação - mostrar sempre que houver resultados */}
          {searchResults.length > 0 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    let pageNumber: number;
                    
                    if (totalPages <= 5) {
                      // Se tivermos 5 ou menos páginas, mostrar todas
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      // Se estivermos no início, mostrar páginas 1-5
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      // Se estivermos no final, mostrar as últimas 5 páginas
                      pageNumber = totalPages - 4 + i;
                    } else {
                      // Caso contrário, mostrar 2 páginas antes e 2 depois da atual
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink 
                          onClick={() => handlePageChange(pageNumber)}
                          isActive={pageNumber === currentPage}
                          className="cursor-pointer"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
      
      {/* Seção do Inventário Atual */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Seu Inventário Atual</h2>
        <div className="space-y-3">
          {inventoryItems.map((item) => (
            <SkinListItem
              key={item.inventoryId}
              item={item}
              onEdit={() => onEdit(item)}
              onDuplicate={() => onDuplicate(item)}
              onRemove={(id) => handleDeleteClick(id)}
              isFavorite={false}
              showMetadata={true}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </div>
        
        {inventoryItems.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Seu inventário está vazio</p>
          </div>
        )}
      </div>
      
      <SkinDetailModal 
        skin={selectedSkin}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAddSkin={handleAddSkin}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedItem.weapon} | {selectedItem.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-center p-4 bg-black/10 rounded-lg">
                  <img 
                    src={selectedItem.image} 
                    alt={selectedItem.name} 
                    className="max-h-36 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
                <div className="flex justify-between gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleSell(selectedItem.inventoryId, {
                      soldPrice: selectedItem.currentPrice || 0,
                      soldMarketplace: "Steam Market",
                      soldFeePercentage: 0,
                      soldCurrency: "USD"
                    })}
                  >
                    Vender
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => handleDeleteClick(selectedItem.inventoryId)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação para exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta skin do seu inventário?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Excluir</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddSkin;
