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
  skin: InventoryItem | any;
  count?: number;
  onDuplicate?: (count: number) => void;
  selectedItem?: InventoryItem | null;
}

export const DuplicateSkinModal = ({
  open,
  onOpenChange,
  skin,
  count: externalCount = 1,
  onDuplicate,
  selectedItem
}: DuplicateSkinModalProps) => {
  // Use either selectedItem or skin prop for compatibility
  const itemToUse = selectedItem || skin;
  const [duplicateCount, setDuplicateCount] = useState(externalCount);
  const { formatPrice } = useCurrency();
  
  // Reset count when modal opens with new item
  useEffect(() => {
    if (open) {
      setDuplicateCount(externalCount);
    }
  }, [open, itemToUse, externalCount]);

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(duplicateCount);
    }
  };

  // Função para gerar o gradiente de cor baseado na raridade
  const getBackgroundGradient = () => {
    if (!itemToUse?.rarity) return {};
    
    const rarityGradients: Record<string, string> = {
      'Consumer Grade': 'linear-gradient(135deg, #8E9196 0%, #6a6d71 100%)',
      'Industrial Grade': 'linear-gradient(135deg, #5E7D9A 0%, #455d72 100%)',
      'Mil-Spec Grade': 'linear-gradient(135deg, #4A6D7C 0%, #37515c 100%)',
      'Restricted': 'linear-gradient(135deg, #6E5AB0 0%, #524283 100%)',
      'Classified': 'linear-gradient(135deg, #8A4E9E 0%, #673976 100%)',
      'Covert': 'linear-gradient(135deg, #9A4A4A 0%, #733737 100%)',
      'Contraband': 'linear-gradient(135deg, #B8A246 0%, #8a7934 100%)',
      '★ Rare Special Item': 'linear-gradient(135deg, #A69D7E 0%, #7d765e 100%)',
      'Comum': 'linear-gradient(135deg, #8E9196 0%, #6a6d71 100%)',
      'Pouco Comum': 'linear-gradient(135deg, #5E7D9A 0%, #455d72 100%)',
      'Militar': 'linear-gradient(135deg, #4A6D7C 0%, #37515c 100%)',
      'Restrita': 'linear-gradient(135deg, #6E5AB0 0%, #524283 100%)',
      'Classificada': 'linear-gradient(135deg, #8A4E9E 0%, #673976 100%)',
      'Secreta': 'linear-gradient(135deg, #9A4A4A 0%, #733737 100%)',
      'Contrabando': 'linear-gradient(135deg, #B8A246 0%, #8a7934 100%)',
      'Especial Rara': 'linear-gradient(135deg, #A69D7E 0%, #7d765e 100%)',
    };

    return {
      background: rarityGradients[itemToUse.rarity] || 'linear-gradient(135deg, #8E9196 0%, #6a6d71 100%)',
    };
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
        
        {itemToUse && (
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-4">
              <div 
                className="h-24 w-24 flex-shrink-0 rounded-md overflow-hidden p-3"
                style={getBackgroundGradient()}
              >
                {itemToUse.image && (
                  <img 
                    src={itemToUse.image} 
                    alt={itemToUse.name} 
                    className="h-full w-full object-contain"
                  />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white text-lg">{itemToUse.name}</h3>
                <p className="text-sm text-gray-300">{itemToUse.weapon}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {itemToUse.wear && (
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded">
                      {itemToUse.wear}
                    </span>
                  )}
                  {itemToUse.floatValue !== undefined && (
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded">
                      Float: {itemToUse.floatValue.toFixed(4)}
                    </span>
                  )}
                </div>
                {itemToUse.currentPrice !== undefined && (
                  <p className="text-sm font-semibold text-green-400 mt-2">
                    {formatPrice(itemToUse.currentPrice)}
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

              {itemToUse.currentPrice !== undefined && (
                <div className="mt-4">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex justify-between items-center text-sm text-gray-300">
                      <span>Preço por unidade:</span>
                      <span>{formatPrice(itemToUse.currentPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-semibold text-white mt-2">
                      <span>Valor total:</span>
                      <span className="text-green-400">{formatPrice(itemToUse.currentPrice * duplicateCount)}</span>
                    </div>
                  </div>
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
