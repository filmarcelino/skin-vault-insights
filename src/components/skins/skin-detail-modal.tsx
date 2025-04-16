
import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skin, SkinWear } from "@/types/skin";
import { Lock, X, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const WEAR_RANGES = [
  { name: "Factory New", min: 0.00, max: 0.07 },
  { name: "Minimal Wear", min: 0.07, max: 0.15 },
  { name: "Field-Tested", min: 0.15, max: 0.38 },
  { name: "Well-Worn", min: 0.38, max: 0.45 },
  { name: "Battle-Scarred", min: 0.45, max: 1.00 },
];

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble" },
];

const TRANSACTION_TYPES = [
  { value: "purchase", label: "Purchase" },
  { value: "trade", label: "Trade" },
  { value: "gift", label: "Gift" },
];

const MARKETPLACE_OPTIONS = [
  { value: "steam", label: "Steam Market" },
  { value: "buff163", label: "BUFF163" },
  { value: "skinport", label: "Skinport" },
  { value: "dmarket", label: "DMarket" },
  { value: "cs_money", label: "CS.MONEY" },
  { value: "other", label: "Other" },
];

interface SkinDetailModalProps {
  skin: Skin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSkin?: (skinData: any) => void;
}

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

const getWearFromFloat = (floatValue: number): SkinWear => {
  for (const range of WEAR_RANGES) {
    if (floatValue >= range.min && floatValue < range.max) {
      return range.name as SkinWear;
    }
  }
  // Handle edge case for Battle-Scarred at exactly 1.0
  if (floatValue === 1.0) {
    return "Battle-Scarred";
  }
  return "Factory New"; // Default
};

export const SkinDetailModal = ({ skin, open, onOpenChange, onAddSkin }: SkinDetailModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [floatValue, setFloatValue] = useState<string>("");
  const [wear, setWear] = useState<SkinWear>("Factory New");
  const [transactionType, setTransactionType] = useState<string>("purchase");
  const [purchasePrice, setPurchasePrice] = useState<string>("");
  const [currency, setCurrency] = useState<string>("USD");
  const [marketplace, setMarketplace] = useState<string>("steam");
  const [feePercentage, setFeePercentage] = useState<string>("0");
  const [estimatedValue, setEstimatedValue] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isStatTrak, setIsStatTrak] = useState<boolean>(false);
  const [tradeLockDays, setTradeLockDays] = useState<string>("0");
  
  // Reset form when skin changes
  useEffect(() => {
    if (skin) {
      setFloatValue(skin.min_float ? skin.min_float.toString() : "0");
      setWear(getWearFromFloat(skin.min_float || 0));
      setTransactionType("purchase");
      setPurchasePrice("");
      setCurrency("USD");
      setMarketplace("steam");
      setFeePercentage("0");
      setEstimatedValue("");
      setNotes("");
      setIsStatTrak(false);
      setTradeLockDays("7"); // Default to 7 days for fresh purchases
    }
  }, [skin]);
  
  // Update wear when float changes
  useEffect(() => {
    if (floatValue) {
      const floatNum = parseFloat(floatValue);
      if (!isNaN(floatNum)) {
        setWear(getWearFromFloat(floatNum));
      }
    }
  }, [floatValue]);
  
  const handleFloatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow valid float values between 0 and 1
    if (value === "" || (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0 && parseFloat(value) <= 1)) {
      setFloatValue(value);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!skin) return;
    
    // Calculate trade lock end date
    const tradeLockUntil = new Date();
    tradeLockUntil.setDate(tradeLockUntil.getDate() + parseInt(tradeLockDays || "0", 10));
    
    const skinData = {
      skinId: skin.id,
      name: skin.name,
      weapon: skin.weapon,
      rarity: skin.rarity,
      image: skin.image,
      wear,
      floatValue: parseFloat(floatValue || "0"),
      transactionType,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
      currency,
      marketplace,
      feePercentage: feePercentage ? parseFloat(feePercentage) : 0,
      estimatedValue: estimatedValue ? parseFloat(estimatedValue) : undefined,
      notes,
      isStatTrak,
      tradeLockDays: parseInt(tradeLockDays || "0", 10),
      tradeLockUntil: tradeLockDays !== "0" ? tradeLockUntil.toISOString() : undefined,
      acquiredDate: new Date().toISOString(),
    };
    
    if (onAddSkin) {
      onAddSkin(skinData);
    }
    
    toast({
      title: "Skin Added",
      description: `${skin.weapon || ""} | ${skin.name} has been added to your inventory.`,
    });
    
    onOpenChange(false);
    navigate("/inventory");
  };

  const collectionName = useMemo(() => {
    if (!skin) return "";
    if (skin.collections && skin.collections.length > 0) {
      return skin.collections[0].name;
    }
    if (skin.collection) {
      return skin.collection.name;
    }
    return "";
  }, [skin]);
  
  if (!skin) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 animate-fade-in">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl flex justify-between items-center">
            <span>Add Skin to Inventory</span>
            <DialogClose className="rounded-full p-2 hover:bg-secondary">
              <X className="h-4 w-4" />
            </DialogClose>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <ScrollArea className="flex-grow pr-4 pl-6 pt-4 pb-4 h-[calc(90vh-10rem)] scrollbar-none">
            <div className="py-4">
              {/* Skin Card with Rarity Colored Background - reduced size by 45% */}
              <div className={`flex flex-col md:flex-row gap-6 p-5 rounded-xl border-2 mb-6 transition-all shadow-sm ${getRarityColorClass(skin.rarity)}`}
                style={{ backgroundColor: `${getRarityColor(skin.rarity)}20` }}
              >
                <div className="w-full md:w-1/3 flex items-center justify-center">
                  {skin.image ? (
                    <img 
                      src={skin.image} 
                      alt={skin.name} 
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
                  <h3 className="text-xl font-semibold mb-2">
                    {skin.weapon ? `${skin.weapon} | ${skin.name}` : skin.name}
                  </h3>
                  
                  <div className="text-sm text-muted-foreground mb-4 space-y-2">
                    {skin.rarity && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: getRarityColor(skin.rarity) }}></div>
                        <span className="font-medium">Rarity:</span> {skin.rarity}
                      </div>
                    )}
                    
                    {collectionName && (
                      <div className="flex items-center">
                        <span className="font-medium mr-1">Collection:</span> {collectionName}
                      </div>
                    )}
                    
                    {skin.min_float !== undefined && skin.max_float !== undefined && (
                      <div className="flex items-center">
                        <span className="font-medium mr-1">Float Range:</span> {skin.min_float.toFixed(4)} - {skin.max_float.toFixed(4)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* StatTrak™ Option */}
                <div className="space-y-2 flex items-center space-x-2">
                  <Checkbox 
                    id="stattrak"
                    checked={isStatTrak}
                    onCheckedChange={(checked) => setIsStatTrak(checked === true)}
                    className="data-[state=checked]:bg-[#CF6A32] data-[state=checked]:border-[#CF6A32]"
                  />
                  <label
                    htmlFor="stattrak"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    <span className="text-[#CF6A32] font-semibold">StatTrak™</span> (Counts kills)
                  </label>
                </div>
                
                {/* Trade Lock */}
                <div className="space-y-2">
                  <Label htmlFor="trade-lock" className="flex items-center">
                    <Lock className="h-4 w-4 mr-1 text-yellow-500" />
                    Trade Lock (days)
                  </Label>
                  <div className="flex space-x-2 items-center">
                    <Input
                      id="trade-lock"
                      type="number"
                      min="0"
                      max="7"
                      value={tradeLockDays}
                      onChange={(e) => setTradeLockDays(e.target.value)}
                      className="w-20"
                    />
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Info className="h-3 w-3 mr-1" /> 
                      {tradeLockDays === "0" ? "No trade lock" : `Locked until ${new Date(new Date().getTime() + parseInt(tradeLockDays) * 24 * 60 * 60 * 1000).toLocaleDateString()}`}
                    </div>
                  </div>
                </div>

                {/* Float and Wear */}
                <div className="space-y-2">
                  <Label htmlFor="float-value">Float Value</Label>
                  <Input 
                    id="float-value"
                    type="text"
                    placeholder="0.0000"
                    value={floatValue}
                    onChange={handleFloatChange}
                    className="transition-all"
                  />
                  <p className="text-xs text-muted-foreground">
                    Float determines the visual wear of your skin
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Wear</Label>
                  <Input 
                    value={wear}
                    readOnly
                    className="bg-muted/30"
                  />
                </div>
                
                {/* Transaction Type */}
                <div className="space-y-2">
                  <Label htmlFor="transaction-type">Transaction Type</Label>
                  <Select
                    value={transactionType}
                    onValueChange={setTransactionType}
                  >
                    <SelectTrigger id="transaction-type">
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSACTION_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Purchase Price */}
                <div className="space-y-2">
                  <Label htmlFor="purchase-price">Purchase Price</Label>
                  <Input
                    id="purchase-price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                  />
                </div>
                
                {/* Currency */}
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={currency}
                    onValueChange={setCurrency}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(curr => (
                        <SelectItem key={curr.code} value={curr.code}>
                          {curr.symbol} {curr.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Marketplace */}
                <div className="space-y-2">
                  <Label htmlFor="marketplace">Purchase Location</Label>
                  <Select
                    value={marketplace}
                    onValueChange={setMarketplace}
                  >
                    <SelectTrigger id="marketplace">
                      <SelectValue placeholder="Select marketplace" />
                    </SelectTrigger>
                    <SelectContent>
                      {MARKETPLACE_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Fee Percentage */}
                <div className="space-y-2">
                  <Label htmlFor="fee-percentage">Fee Percentage (%)</Label>
                  <Input
                    id="fee-percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="0"
                    value={feePercentage}
                    onChange={(e) => setFeePercentage(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Marketplace fee (e.g., Steam: 13%, BUFF: 2.5%)
                  </p>
                </div>
                
                {/* Estimated Value */}
                <div className="space-y-2">
                  <Label htmlFor="estimated-value">Estimated Value</Label>
                  <Input
                    id="estimated-value"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Notes */}
              <div className="space-y-2 mt-6">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes about this skin..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter className="p-6 pt-4 border-t">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="gap-1">Add Skin</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
