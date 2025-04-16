
import { useState } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogFooter, DialogClose, DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { InventoryItem, SellData } from "@/types/skin";
import { 
  X, DollarSign, Calendar, Tag, 
  Lock, Info, ArrowUp, TrendingUp 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface InventorySkinModalProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSellSkin?: (itemId: string, sellData: SellData) => void;
}

const MARKETPLACE_OPTIONS = [
  { value: "steam", label: "Steam Market" },
  { value: "buff163", label: "BUFF163" },
  { value: "skinport", label: "Skinport" },
  { value: "dmarket", label: "DMarket" },
  { value: "cs_money", label: "CS.MONEY" },
  { value: "other", label: "Other" },
];

const getRarityColorClass = (rarity?: string) => {
  if (!rarity) return "";
  
  switch (rarity.toLowerCase()) {
    case "consumer grade":
    case "white":
      return "bg-[rgba(176,195,217,0.2)] border-[#B0C3D9]";
    case "industrial grade":
    case "light blue":
      return "bg-[rgba(94,152,217,0.2)] border-[#5E98D9]";
    case "mil-spec grade":
    case "blue":
      return "bg-[rgba(75,105,255,0.2)] border-[#4B69FF]";
    case "restricted":
    case "purple":
      return "bg-[rgba(136,71,255,0.2)] border-[#8847FF]";
    case "classified":
    case "pink":
      return "bg-[rgba(211,44,230,0.2)] border-[#D32CE6]";
    case "covert":
    case "red":
      return "bg-[rgba(235,75,75,0.2)] border-[#EB4B4B]";
    case "contraband":
    case "gold":
      return "bg-[rgba(255,215,0,0.2)] border-[#FFD700]";
    case "extraordinary":
    case "rare special":
    case "knife":
    case "glove":
      return "bg-[rgba(255,249,155,0.2)] border-[#FFF99B]";
    default:
      return "";
  }
};

const getRarityColor = (rarity?: string) => {
  if (!rarity) return "#888888";
  
  switch (rarity.toLowerCase()) {
    case "consumer grade":
    case "white":
      return "#B0C3D9";
    case "industrial grade":
    case "light blue":
      return "#5E98D9";
    case "mil-spec grade":
    case "blue":
      return "#4B69FF";
    case "restricted":
    case "purple":
      return "#8847FF";
    case "classified":
    case "pink":
      return "#D32CE6";
    case "covert":
    case "red":
      return "#EB4B4B";
    case "contraband":
    case "gold":
      return "#FFD700";
    case "extraordinary":
    case "rare special":
    case "knife":
    case "glove":
      return "#FFF99B";
    default:
      return "#888888";
  }
};

export const InventorySkinModal = ({ 
  item, open, onOpenChange, onSellSkin 
}: InventorySkinModalProps) => {
  const { toast } = useToast();
  const [isSellingMode, setIsSellingMode] = useState(false);
  const [soldPrice, setSoldPrice] = useState("");
  const [soldMarketplace, setSoldMarketplace] = useState("steam");
  const [soldFeePercentage, setSoldFeePercentage] = useState("0");
  const [soldNotes, setSoldNotes] = useState("");

  // Check if the item is trade locked
  const tradeLockDate = item?.tradeLockUntil ? new Date(item.tradeLockUntil) : null;
  const isLocked = tradeLockDate && tradeLockDate > new Date();
  const daysLeft = tradeLockDate 
    ? Math.ceil((tradeLockDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) 
    : 0;

  const acquiredDate = item?.acquiredDate 
    ? new Date(item.acquiredDate).toLocaleDateString() 
    : "Unknown";

  const handleSellSkin = () => {
    if (!item || !soldPrice) return;

    const price = parseFloat(soldPrice);
    const fee = parseFloat(soldFeePercentage) || 0;
    
    // Calculate profit
    const purchasePrice = item.purchasePrice || 0;
    const feeAmount = (price * fee) / 100;
    const netProfit = price - feeAmount - purchasePrice;

    const sellData: SellData = {
      soldDate: new Date().toISOString(),
      soldPrice: price,
      soldMarketplace,
      soldFeePercentage: fee,
      soldNotes,
      profit: netProfit
    };

    if (onSellSkin) {
      onSellSkin(item.inventoryId, sellData);
    }

    toast({
      title: "Skin Sold",
      description: `${item.weapon || ""} | ${item.name} has been marked as sold.`,
    });

    setIsSellingMode(false);
    onOpenChange(false);
  };

  const resetSellForm = () => {
    setIsSellingMode(false);
    setSoldPrice("");
    setSoldMarketplace("steam");
    setSoldFeePercentage("0");
    setSoldNotes("");
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={(newState) => {
      onOpenChange(newState);
      if (!newState) resetSellForm();
    }}>
      <DialogContent 
        className="max-w-3xl max-h-[90vh] overflow-hidden p-0 animate-fade-in bg-[#1A1F2C] border-[#333] shadow-[0_0_15px_rgba(86,71,255,0.2)]"
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl flex justify-between items-center">
            <span className="text-[#8B5CF6]">
              {isSellingMode ? "Sell Skin" : "Skin Details"}
            </span>
            <DialogClose className="rounded-full p-2 hover:bg-[#333]">
              <X className="h-4 w-4" />
            </DialogClose>
          </DialogTitle>
          {isSellingMode && (
            <DialogDescription className="text-sm text-[#8A898C]">
              Record the sale details for this skin to track your profits and transaction history
            </DialogDescription>
          )}
        </DialogHeader>
        
        <ScrollArea className="flex-grow pr-4 pl-6 pt-4 pb-4 h-[calc(90vh-10rem)] scrollbar-none">
          <div className="py-4">
            {/* Skin Card with Rarity Colored Background */}
            <div 
              className={`flex flex-col md:flex-row gap-6 p-5 rounded-xl border-2 mb-6 transition-all shadow-sm ${getRarityColorClass(item.rarity)}`}
              style={{ backgroundColor: `${getRarityColor(item.rarity)}20` }}
            >
              <div className="w-full md:w-1/3 flex items-center justify-center">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="max-h-[26.4rem] max-w-full object-contain scale-[0.55] transform-origin-center"
                    style={{ transform: 'scale(0.55)' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                ) : (
                  <div className="h-40 w-full flex items-center justify-center bg-muted/20 rounded-lg">
                    <span className="text-muted-foreground">No image available</span>
                  </div>
                )}
              </div>
              
              <div className="w-full md:w-2/3 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">
                    {item.isStatTrak && (
                      <span className="text-[#CF6A32] font-bold">StatTrak™ </span>
                    )}
                    {item.weapon ? `${item.weapon} | ${item.name}` : item.name}
                  </h3>
                </div>
                
                <div className="text-sm text-[#8A898C] mb-4 space-y-3">
                  {/* Trade Lock Status */}
                  {isLocked ? (
                    <div className="flex items-center text-yellow-500 bg-yellow-500/10 p-2 rounded-md">
                      <Lock className="h-4 w-4 mr-2" />
                      <span>
                        Trade Locked for {daysLeft} {daysLeft === 1 ? 'day' : 'days'} 
                        (until {tradeLockDate?.toLocaleDateString()})
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center text-green-500 bg-green-500/10 p-2 rounded-md">
                      <Info className="h-4 w-4 mr-2" />
                      <span>No Trade Lock - Available for trading</span>
                    </div>
                  )}

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {/* Rarity */}
                    {item.rarity && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: getRarityColor(item.rarity) }}></div>
                        <span className="font-medium">Rarity:</span> {item.rarity}
                      </div>
                    )}
                    
                    {/* Wear */}
                    {item.wear && (
                      <div className="flex items-center">
                        <Tag className="h-3 w-3 mr-2" />
                        <span className="font-medium">Wear:</span> {item.wear}
                      </div>
                    )}
                    
                    {/* Float */}
                    {item.floatValue !== undefined && (
                      <div className="flex items-center">
                        <span className="font-medium">Float:</span> {item.floatValue.toFixed(8)}
                      </div>
                    )}
                    
                    {/* Acquisition Date */}
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-2" />
                      <span className="font-medium">Acquired:</span> {acquiredDate}
                    </div>
                    
                    {/* Purchase Price */}
                    {item.purchasePrice !== undefined && (
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-2" />
                        <span className="font-medium">Purchase:</span> ${item.purchasePrice.toFixed(2)}
                      </div>
                    )}
                    
                    {/* Current Value */}
                    {item.currentPrice !== undefined && item.purchasePrice !== undefined && (
                      <div className="flex items-center">
                        <TrendingUp className="h-3 w-3 mr-2" />
                        <span className="font-medium">Current:</span> ${item.currentPrice.toFixed(2)}
                        {item.currentPrice > item.purchasePrice && (
                          <span className="ml-1 text-green-500 text-xs">
                            (+${(item.currentPrice - item.purchasePrice).toFixed(2)})
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Marketplace */}
                    {item.marketplace && (
                      <div className="flex items-center">
                        <span className="font-medium">Source:</span> {item.marketplace}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {isSellingMode ? (
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
              </div>
            ) : (
              <div className="space-y-6">
                {/* Additional Information & Notes */}
                <div className="p-4 rounded-md border border-[#333] bg-[#221F26]/30">
                  <h3 className="font-medium mb-2 text-[#8B5CF6]">Additional Information</h3>
                  <p className="text-sm text-[#8A898C]">
                    {item.notes || "No additional notes for this skin."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter className="p-6 pt-4 border-t border-[#333]">
          {isSellingMode ? (
            <>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsSellingMode(false)}
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
            </>
          ) : (
            <>
              <DialogClose asChild>
                <Button 
                  type="button" 
                  variant="outline"
                  className="border-[#333] hover:bg-[#333]"
                >
                  Close
                </Button>
              </DialogClose>
              <Button 
                type="button" 
                onClick={() => setIsSellingMode(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isLocked}
              >
                <DollarSign className="h-4 w-4 mr-1" />
                Sell Skin
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
