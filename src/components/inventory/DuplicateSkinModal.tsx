
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Duplicar Skin</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="duplicate-count">Quantidade de cópias</Label>
          <Input
            id="duplicate-count"
            type="number"
            min="1"
            max="10"
            value={duplicateCount}
            onChange={(e) => setDuplicateCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
            className="mt-2"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDuplicate}>
            Duplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
