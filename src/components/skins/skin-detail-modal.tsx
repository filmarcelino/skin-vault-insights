import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skin, SkinWear } from "@/types/skin";
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
      return "bg-[rgba(176,195,217,0.08)] border-[#B0C3D9]";
    case "industrial grade":
    case "light blue":
      return "bg-[rgba(94,152,217,0.08)] border-[#5E98D9]";
    case "mil-spec grade":
    case "blue":
      return "bg-[rgba(75,105,255,0.08)] border-[#4B69FF]";
    case "restricted":
    case "purple":
      return "bg-[rgba(136,71,255,0.08)] border-[#8847FF]";
    case "classified":
    case "pink":
      return "bg-[rgba(211,44,230,0.08)] border-[#D32CE6]";
    case "covert":
    case "red":
      return "bg-[rgba(235,75,75,0.08)] border-[#EB4B4B]";
    case "contraband":
    case "gold":
      return "bg-[rgba(255,215,0,0.08)] border-[#FFD700]";
    case "extraordinary":
    case "rare special":
    case "knife":
    case "glove":
      return "bg-[rgba(255,249,155,0.08)] border-[#FFF99B]";
    default:
      return "";
  }
};

const getWearFromFloat = (floatValue: number): SkinWear => {
  for (const range of WEAR_RANGES) {
    if (floatValue >= range.min && floatValue < range.max) {
      return range.name as SkinWear;
    }
  }
  if (floatValue === 1.00) {
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
  
  useEffect(() => {
    if (skin) {
      setFloatValue(skin.min_float ? skin.min_float.toString() : "0");
      setWear("Factory New");
      setTransactionType("purchase");
      setPurchasePrice("");
      setCurrency("USD");
      setMarketplace("steam");
      setFeePercentage("0");
      setEstimatedValue("");
      setNotes("");
    }
  }, [skin]);
  
  useEffect(() => {
    if (floatValue) {
      const floatNum = parseFloat(floatValue);
      if (!isNaN(floatNum) && floatNum >= 0 && floatNum <= 1) {
        setWear(getWearFromFloat(floatNum));
      }
    }
  }, [floatValue]);
  
  const handleFloatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0 && parseFloat(value) <= 1)) {
      setFloatValue(value);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!skin) return;
    
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
          <DialogTitle className="text-2xl">
            <span>Add Skin to Inventory</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="max-h-[calc(90vh-12rem)] px-6 py-4">
            <ScrollArea className="h-full pr-4">
              <div className={`flex flex-col md:flex-row gap-6 p-5 rounded-xl border-2 mb-6 transition-all shadow-sm ${getRarityColorClass(skin.rarity)}`}>
                <div className="w-full md:w-1/3 flex items-center justify-center">
                  {skin.image ? (
                    <img 
                      src={skin.image} 
                      alt={skin.name} 
                      className="max-h-48 max-w-full object-contain"
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
                        <div className="w-3 h-3 rounded-full mr-2" style={{ 
                          backgroundColor: skin.rarity.toLowerCase().includes("consumer") ? "#B0C3D9" : 
                                         skin.rarity.toLowerCase().includes("industrial") ? "#5E98D9" :
                                         skin.rarity.toLowerCase().includes("mil-spec") ? "#4B69FF" :
                                         skin.rarity.toLowerCase().includes("restricted") ? "#8847FF" :
                                         skin.rarity.toLowerCase().includes("classified") ? "#D32CE6" :
                                         skin.rarity.toLowerCase().includes("covert") ? "#EB4B4B" :
                                         skin.rarity.toLowerCase().includes("contraband") ? "#FFD700" :
                                         skin.rarity.toLowerCase().includes("extraordinary") || 
                                         skin.rarity.toLowerCase().includes("rare") || 
                                         skin.rarity.toLowerCase().includes("knife") || 
                                         skin.rarity.toLowerCase().includes("glove") ? "#FFF99B" : "#888888"
                        }}></div>
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
            </ScrollArea>
          </div>
          
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
