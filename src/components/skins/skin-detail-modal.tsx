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
import { Lock, X, Info, CopyPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useCurrency, CURRENCIES } from "@/contexts/CurrencyContext";
import { format, addDays, parseISO } from "date-fns";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const WEAR_RANGES = [
  { name: "Factory New", min: 0.00, max: 0.07 },
  { name: "Minimal Wear", min: 0.07, max: 0.15 },
  { name: "Field-Tested", min: 0.15, max: 0.38 },
  { name: "Well-Worn", min: 0.38, max: 0.45 },
  { name: "Battle-Scarred", min: 0.45, max: 1.00 },
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
  
  switch (rarity?.toLowerCase()) {
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
  
  switch (rarity?.toLowerCase()) {
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
  if (floatValue === 1.0) return "Battle-Scarred";
  return "Factory New";
};

export const SkinDetailModal = ({ skin, open, onOpenChange, onAddSkin }: SkinDetailModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currency, formatPrice } = useCurrency();

  const [addedAt, setAddedAt] = useState<Date>(new Date());
  const [purchaseDate, setPurchaseDate] = useState<Date>(new Date());
  const [floatValue, setFloatValue] = useState<string>("");
  const [wear, setWear] = useState<SkinWear>("Factory New");
  const [transactionType, setTransactionType] = useState<string>("purchase");
  const [purchasePrice, setPurchasePrice] = useState<string>("");
  const [selectedCurrency, setSelectedCurrency] = useState<string>(currency.code);
  const [marketplace, setMarketplace] = useState<string>("steam");
  const [feePercentage, setFeePercentage] = useState<string>("0");
  const [expectedSalePrice, setExpectedSalePrice] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isStatTrak, setIsStatTrak] = useState<boolean>(false);
  const [tradeLockDays, setTradeLockDays] = useState<string>("7");
  const [tradeLockUntil, setTradeLockUntil] = useState<Date>(addDays(new Date(), 7));
  const [duplicating, setDuplicating] = useState<boolean>(false);

  useEffect(() => {
    if (skin && !duplicating) {
      setAddedAt(new Date());
      setPurchaseDate(new Date());
      setFloatValue(skin.min_float ? skin.min_float.toString() : "0");
      setWear(getWearFromFloat(skin.min_float || 0));
      setTransactionType("purchase");
      setPurchasePrice("");
      setSelectedCurrency(currency.code);
      setMarketplace("steam");
      setFeePercentage("0");
      setExpectedSalePrice("");
      setNotes("");
      setIsStatTrak(false);
      setTradeLockDays("7");
      setTradeLockUntil(addDays(new Date(), 7));
    }
  }, [skin, currency, duplicating]);

  useEffect(() => {
    if (purchaseDate && tradeLockDays) {
      const tradeLockEnd = addDays(purchaseDate, parseInt(tradeLockDays || "0", 10));
      setTradeLockUntil(tradeLockEnd);
    }
  }, [purchaseDate, tradeLockDays]);

  useEffect(() => {
    if (floatValue) {
      const floatNum = parseFloat(floatValue);
      if (!isNaN(floatNum)) setWear(getWearFromFloat(floatNum));
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
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : 0,
      currency: selectedCurrency,
      originalCurrencyRate: CURRENCIES.find(c => c.code === selectedCurrency)?.rate || 1,
      marketplace,
      feePercentage: feePercentage ? parseFloat(feePercentage) : 0,
      estimatedValue: expectedSalePrice ? parseFloat(expectedSalePrice) : undefined,
      notes,
      isStatTrak,
      tradeLockDays: parseInt(tradeLockDays || "7", 10),
      tradeLockUntil: tradeLockUntil.toISOString(),
      acquiredDate: addedAt.toISOString(),
      purchaseDate: purchaseDate.toISOString()
    };

    if (onAddSkin) onAddSkin(skinData);

    toast({
      title: "Skin Adicionada",
      description: `${skin.weapon || ""} | ${skin.name} foi adicionada ao seu inventário.`,
    });

    onOpenChange(false);
    navigate("/inventory");
  };

  const handleDuplicate = () => {
    setDuplicating(true);
    setAddedAt(new Date());
    onOpenChange(true);
  };

  const collectionName = useMemo(() => {
    if (!skin) return "";
    if (skin.collections && skin.collections.length > 0) return skin.collections[0].name;
    if (skin.collection) return skin.collection.name;
    return "";
  }, [skin]);

  if (!skin) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 animate-fade-in">
        <DialogHeader className="p-6 pb-0 flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl flex justify-between items-center">
            <span>Adicionar Skin ao Inventário</span>
          </DialogTitle>
          <Button
            variant="outline"
            size="icon"
            className="ml-2"
            type="button"
            title="Duplicar Skin"
            onClick={handleDuplicate}
          >
            <CopyPlus className="w-4 h-4" />
          </Button>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <ScrollArea className="flex-grow pr-4 pl-6 pt-4 pb-4 h-[calc(90vh-10rem)] scrollbar-none">
            <div className="py-4">
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
                        <span className="font-medium">Raridade:</span> {skin.rarity}
                      </div>
                    )}
                    {collectionName && (
                      <div className="flex items-center">
                        <span className="font-medium mr-1">Coleção:</span> {collectionName}
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Data de adição</Label>
                  <Input
                    readOnly
                    value={format(addedAt, "dd/MM/yyyy")}
                    className="cursor-not-allowed bg-muted/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de compra</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                        type="button"
                      >
                        {purchaseDate ? format(purchaseDate, "dd/MM/yyyy") : <span>Selecionar data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={purchaseDate}
                        onSelect={d => d && setPurchaseDate(d)}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
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
                    <span className="text-[#CF6A32] font-semibold">StatTrak™</span> (Conta abates)
                  </label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="trade-lock" className="flex items-center">
                    <Lock className="h-4 w-4 mr-1 text-yellow-500" />
                    Trade Lock (dias)
                  </Label>
                  <div className="flex space-x-2 items-center">
                    <Input
                      id="trade-lock"
                      type="number"
                      min="0"
                      max="30"
                      value={tradeLockDays}
                      onChange={(e) => setTradeLockDays(e.target.value)}
                      className="w-20"
                    />
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Info className="h-3 w-3 mr-1" /> 
                      {`Bloqueio até ${format(tradeLockUntil, "dd/MM/yyyy")}`}
                    </div>
                  </div>
                </div>

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
                    O float determina o desgaste visual da sua skin
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
                  <Label htmlFor="transaction-type">Tipo de transação</Label>
                  <Select
                    value={transactionType}
                    onValueChange={setTransactionType}
                  >
                    <SelectTrigger id="transaction-type">
                      <SelectValue placeholder="Selecionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSACTION_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="purchase-price">Preço de compra</Label>
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
                  <Label htmlFor="currency">Moeda</Label>
                  <Select
                    value={selectedCurrency}
                    onValueChange={setSelectedCurrency}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Selecionar moeda" />
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
                  <Label htmlFor="marketplace">Local de compra</Label>
                  <Select
                    value={marketplace}
                    onValueChange={setMarketplace}
                  >
                    <SelectTrigger id="marketplace">
                      <SelectValue placeholder="Selecionar marketplace" />
                    </SelectTrigger>
                    <SelectContent>
                      {MARKETPLACE_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fee-percentage">Taxa (%)</Label>
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
                    Taxa do marketplace (Steam: 13%, BUFF: 2.5%...)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expected-sale-price">Preço de venda esperado</Label>
                  <Input
                    id="expected-sale-price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={expectedSalePrice}
                    onChange={(e) => setExpectedSalePrice(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2 mt-6">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Adicione observações sobre esta skin..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-6 pt-4 border-t">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" className="gap-1">Adicionar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
