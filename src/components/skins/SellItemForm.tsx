
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InventoryItem, SellData } from "@/types/skin";

interface SellItemFormProps {
  inventoryItem: InventoryItem;
  onSubmit: (sellData: SellData) => void;
}

export function SellItemForm({ inventoryItem, onSubmit }: SellItemFormProps) {
  const [price, setPrice] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price) return;
    
    // Create minimal sell data
    const sellData: SellData = {
      soldPrice: parseFloat(price),
      soldMarketplace: "Steam Market",
      soldFeePercentage: 13,
      soldDate: new Date().toISOString()
    };
    
    onSubmit(sellData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 py-4 border-t">
      <h3 className="font-medium">Quick Sell</h3>
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Sale price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Button type="submit" disabled={!price}>
          Sell Item
        </Button>
      </div>
    </form>
  );
}
