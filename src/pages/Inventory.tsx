import { useState } from "react";
import { useInventory, useRemoveSkin } from "@/hooks/use-skins";
import { InventoryCard } from "@/components/dashboard/inventory-card";
import { InventorySkinModal } from "@/components/skins/inventory-skin-modal";
import { InventoryItem, SellData } from "@/types/skin";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/hooks/use-toast";
import { Search } from "@/components/ui/search";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 8;

const Inventory = () => {
  const { data: inventoryItems = [], isLoading, error } = useInventory();
  const [selectedSkin, setSelectedSkin] = useState<InventoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const removeSkinMutation = useRemoveSkin();

  const handleSkinClick = (skin: InventoryItem) => {
    setSelectedSkin(skin);
    setIsModalOpen(true);
  };

  const handleSellSkin = (itemId: string, sellData: SellData) => {
    // Implementation will be added later in a separate feature
    console.log("Selling skin:", itemId, sellData);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on new search
    
    if (!value.trim()) {
      setFilteredItems([]);
      return;
    }
    
    const searchTerms = value.toLowerCase().trim().split(/\s+/);
    
    // Filtro mais tolerante usando termos parciais
    const filtered = inventoryItems.filter(item => {
      const nameMatch = item.name ? searchTerms.some(term => item.name.toLowerCase().includes(term)) : false;
      const weaponMatch = item.weapon ? searchTerms.some(term => item.weapon.toLowerCase().includes(term)) : false;
      const rarityMatch = item.rarity ? searchTerms.some(term => item.rarity.toLowerCase().includes(term)) : false;
      
      return nameMatch || weaponMatch || rarityMatch;
    });
    
    setFilteredItems(filtered);
  };

  const handleRemoveSkin = (itemId: string) => {
    removeSkinMutation.mutate(itemId, {
      onSuccess: () => {
        toast({
          title: "Skin removida",
          description: "A skin foi removida do seu inventário com sucesso."
        });
        setIsModalOpen(false);
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Erro ao remover skin",
          description: "Não foi possível remover a skin do seu inventário."
        });
      }
    });
  };

  // Pagination logic
  const displayItems = searchQuery ? filteredItems : inventoryItems;
  const totalPages = Math.ceil(displayItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = displayItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading inventory: {error.message}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Seu Inventário de Skins</h1>
      
      <div className="mb-6">
        <Search 
          placeholder="Pesquisar arma, skin, raridade..."
          onSearch={handleSearch}
          debounceTime={300}
        />
      </div>
      
      {paginatedItems.length === 0 ? (
        <div className="text-center py-10 border border-dashed rounded-lg">
          {searchQuery ? (
            <p className="text-muted-foreground mb-4">
              Nenhuma skin encontrada com o termo "{searchQuery}".
            </p>
          ) : (
            <>
              <p className="text-muted-foreground mb-4">
                Seu inventário está vazio.
              </p>
              <a 
                href="/add" 
                className="text-primary hover:underline"
              >
                Adicione sua primeira skin aqui!
              </a>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {paginatedItems.map((skin, index) => (
              <InventoryCard
                key={skin.inventoryId || `skin-${index}`}
                weaponName={skin.weapon || "Unknown"}
                skinName={skin.name}
                wear={skin.wear || ""}
                price={skin.currentPrice?.toString() || skin.price?.toString() || "N/A"}
                image={skin.image}
                rarity={skin.rarity}
                isStatTrak={skin.isStatTrak}
                tradeLockDays={skin.tradeLockDays}
                tradeLockUntil={skin.tradeLockUntil}
                className="animate-fade-in hover:scale-105 transition-transform duration-200"
                style={{
                  animationDelay: `${0.1 + index * 0.05}s`,
                }}
                onClick={() => handleSkinClick(skin)}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {displayItems.length > ITEMS_PER_PAGE && (
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
                    // For simplicity, show up to 5 page links
                    let pageNumber: number;
                    
                    if (totalPages <= 5) {
                      // If we have 5 or fewer pages, show all of them
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      // If we're at the beginning, show pages 1-5
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      // If we're at the end, show the last 5 pages
                      pageNumber = totalPages - 4 + i;
                    } else {
                      // Otherwise, show 2 pages before and 2 after the current page
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

      {selectedSkin && (
        <InventorySkinModal
          item={selectedSkin}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSellSkin={handleSellSkin}
        />
      )}
    </div>
  );
};

export default Inventory;
