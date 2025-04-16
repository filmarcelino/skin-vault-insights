
import { InventoryItem, SellData } from "@/types/skin";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DollarSign, ArrowUp } from "lucide-react";
import { MARKETPLACE_OPTIONS, calculateProfit } from "@/utils/skin-utils";
import { useState } from "react";

interface SkinSellingFormProps {
  item: InventoryItem;
  onCancel: () => void;
  onSell: (itemId: string, sellData: SellData) => void;
}

export const SkinSellingForm = ({ item, onCancel, onSell }: SkinSellingFormProps) => {
  const [soldPrice, setSoldPrice] = useState("");
  const [soldMarketplace, setSoldMarketplace] = useState("steam");
  const [soldFeePercentage, setSoldFeePercentage] = useState("0");
  const [soldNotes, setSoldNotes] = useState("");

  const handleSellSkin = () => {
    if (!item || !soldPrice) return;

    const price = parseFloat(soldPrice);
    const fee = parseFloat(soldFeePercentage) || 0;
    
    // Calculate profit
    const purchasePrice = item.purchasePrice || 0;
    const netProfit = calculateProfit(soldPrice, soldFeePercentage, purchasePrice);

    const sellData: SellData = {
      soldDate: new Date().toISOString(),
      soldPrice: price,
      soldMarketplace,
      soldFeePercentage: fee,
      soldNotes,
      profit: netProfit
    };

    onSell(item.inventoryId, sellData);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[#8B5CF6]">Sale Details</h3>
      
      {/* Selling Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Sold Price */}
        <div className="space-y-2">
          <Label htmlFor="sold-price" className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1 text-green-500" />
            Sale Price
          </Label>
          <Input
            id="sold-price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={soldPrice}
            onChange={(e) => setSoldPrice(e.target.value)}
            className="border-[#333] bg-[#221F26]/50"
          />
        </div>
        
        {/* Marketplace */}
        <div className="space-y-2">
          <Label htmlFor="sold-marketplace">Marketplace</Label>
          <Select
            value={soldMarketplace}
            onValueChange={setSoldMarketplace}
          >
            <SelectTrigger id="sold-marketplace" className="border-[#333] bg-[#221F26]/50">
              <SelectValue placeholder="Select marketplace" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1F2C] border-[#333]">
              {MARKETPLACE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Fee Percentage */}
        <div className="space-y-2">
          <Label htmlFor="sold-fee-percentage">Fee Percentage (%)</Label>
          <Input
            id="sold-fee-percentage"
            type="number"
            min="0"
            max="100"
            step="0.1"
            placeholder="0"
            value={soldFeePercentage}
            onChange={(e) => setSoldFeePercentage(e.target.value)}
            className="border-[#333] bg-[#221F26]/50"
          />
        </div>

        {/* Profit Calculation */}
        {soldPrice && item.purchasePrice !== undefined && (
          <div className="md:col-span-2 p-4 rounded-md bg-opacity-10 bg-green-900 border border-green-800">
            <h4 className="font-medium mb-2 text-green-500 flex items-center">
              <ArrowUp className="h-4 w-4 mr-1" /> Profit Calculation
            </h4>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Sale Price:</div>
              <div className="text-right">${parseFloat(soldPrice).toFixed(2)}</div>
              
              <div>Marketplace Fee ({parseFloat(soldFeePercentage) || 0}%):</div>
              <div className="text-right text-red-400">
                -${(parseFloat(soldPrice) * (parseFloat(soldFeePercentage) || 0) / 100).toFixed(2)}
              </div>
              
              <div>Purchase Price:</div>
              <div className="text-right text-red-400">-${item.purchasePrice.toFixed(2)}</div>
              
              <div className="font-bold border-t border-green-800 pt-1">Net Profit:</div>
              <div className="font-bold border-t border-green-800 pt-1 text-right text-green-500">
                ${(
                  parseFloat(soldPrice) - 
                  (parseFloat(soldPrice) * (parseFloat(soldFeePercentage) || 0) / 100) - 
                  item.purchasePrice
                ).toFixed(2)}
              </div>
            </div>
          </div>
        )}
        
        {/* Notes */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="sold-notes">Notes</Label>
          <Textarea
            id="sold-notes"
            placeholder="Add any notes about this sale..."
            value={soldNotes}
            onChange={(e) => setSoldNotes(e.target.value)}
            className="min-h-[80px] border-[#333] bg-[#221F26]/50"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="border-[#333] hover:bg-[#333]"
        >
          Cancel
        </Button>
        <Button 
          type="button" 
          onClick={handleSellSkin}
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={!soldPrice}
        >
          <DollarSign className="h-4 w-4 mr-1" />
          Complete Sale
        </Button>
      </div>
    </div>
  );
};
