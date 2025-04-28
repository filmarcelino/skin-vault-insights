
import { useState } from "react";
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
import { Copy } from "lucide-react";

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

  const handleDuplicate = () => {
    onDuplicate(duplicateCount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-primary" />
            <span>Duplicar Skin</span>
          </DialogTitle>
        </DialogHeader>
        
        {selectedItem && (
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-card">
                {selectedItem.image && (
                  <img 
                    src={selectedItem.image} 
                    alt={selectedItem.name} 
                    className="h-full w-full object-contain"
                  />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{selectedItem.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedItem.weapon}</p>
              </div>
            </div>
            
            <div>
              <Label htmlFor="duplicate-count" className="text-sm font-medium">
                Quantidade de cópias
              </Label>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setDuplicateCount(Math.max(1, duplicateCount - 1))}
                >
                  -
                </Button>
                <Input
                  id="duplicate-count"
                  type="number"
                  min="1"
                  max="10"
                  value={duplicateCount}
                  onChange={(e) => setDuplicateCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setDuplicateCount(Math.min(10, duplicateCount + 1))}
                >
                  +
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter className="flex sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDuplicate} className="gap-2">
            <Copy className="h-4 w-4" />
            Duplicar {duplicateCount} {duplicateCount === 1 ? "cópia" : "cópias"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
