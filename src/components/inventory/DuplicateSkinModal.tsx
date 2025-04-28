
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InventoryItem } from "@/types/skin";
import { Copy, Minus, Plus } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface DuplicateSkinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDuplicate: (count: number) => void;
  selectedItem: InventoryItem | null;
}

export const DuplicateSkinModal = ({
  open,
  onOpenChange,
  onDuplicate,
  selectedItem,
}: DuplicateSkinModalProps) => {
  const [duplicateCount, setDuplicateCount] = useState(1);
  const { formatPrice } = useCurrency();
  
  // Reset count when modal opens with new item
  useEffect(() => {
    if (open) {
      setDuplicateCount(1);
    }
  }, [open, selectedItem]);

  const handleDuplicate = () => {
    onDuplicate(duplicateCount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#1A1F2C] border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Copy className="h-5 w-5 text-primary" />
            <span>Duplicar Skin</span>
          </DialogTitle>
        </DialogHeader>
        
        {selectedItem && (
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-4">
              <div 
                className="h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-gradient-to-b from-gray-700 to-gray-900 p-2"
                style={{
                  background: selectedItem.rarity ? 
                    `linear-gradient(135deg, #1e293b 0%, ${getRarityColorBg(selectedItem.rarity)} 100%)` : 
                    'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                }}
              >
                {selectedItem.image && (
                  <img 
                    src={selectedItem.image} 
                    alt={selectedItem.name} 
                    className="h-full w-full object-contain"
                  />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">{selectedItem.name}</h3>
                <p className="text-sm text-gray-300">{selectedItem.weapon}</p>
                {selectedItem.currentPrice !== undefined && (
                  <p className="text-sm font-semibold text-green-400 mt-1">
                    {formatPrice(selectedItem.currentPrice)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="pt-2">
              <Label htmlFor="duplicate-count" className="text-sm font-medium text-gray-300 mb-2 block">
                Quantidade de cópias
              </Label>
              <div className="flex items-center justify-center gap-3 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-md bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
                  onClick={() => setDuplicateCount(Math.max(1, duplicateCount - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="duplicate-count"
                  type="number"
                  min="1"
                  max="10"
                  value={duplicateCount}
                  onChange={(e) => setDuplicateCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="text-center w-20 bg-gray-800 border-gray-600 text-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-md bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
                  onClick={() => setDuplicateCount(Math.min(10, duplicateCount + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {selectedItem.currentPrice !== undefined && (
                <div className="mt-4 text-center text-sm text-gray-300">
                  Valor total: <span className="text-green-400 font-semibold">{formatPrice(selectedItem.currentPrice * duplicateCount)}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        <DialogFooter className="flex sm:justify-between">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDuplicate} 
            className="bg-primary hover:bg-primary/90 gap-2"
          >
            <Copy className="h-4 w-4" />
            Duplicar {duplicateCount} {duplicateCount === 1 ? "cópia" : "cópias"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Função auxiliar para obter a cor de fundo por raridade
function getRarityColorBg(rarity: string): string {
  const rarityColors: Record<string, string> = {
    'Consumer Grade': '#8E9196',
    'Industrial Grade': '#5E7D9A',
    'Mil-Spec Grade': '#4A6D7C',
    'Restricted': '#6E5AB0',
    'Classified': '#8A4E9E',
    'Covert': '#9A4A4A',
    'Contraband': '#B8A246',
    '★ Rare Special Item': '#A69D7E',
    'Comum': '#8E9196',
    'Pouco Comum': '#5E7D9A',
    'Militar': '#4A6D7C',
    'Restrita': '#6E5AB0',
    'Classificada': '#8A4E9E',
    'Secreta': '#9A4A4A',
    'Contrabando': '#B8A246',
    'Especial Rara': '#A69D7E',
    'Extraordinary': '#A69D7E',
  };
  
  return rarityColors[rarity] || '#8E9196';
}
