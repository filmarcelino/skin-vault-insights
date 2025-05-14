
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InventoryItem, SellData } from "@/types/skin";
import { useCurrency, CURRENCIES } from "@/contexts/CurrencyContext";
import { format } from "date-fns";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface SkinSellingFormProps {
  item?: InventoryItem;
  skin?: InventoryItem;
  onSellSkin?: (itemId: string, sellData: SellData) => void;
  onCancel?: () => void;
}

const MARKETPLACE_OPTIONS = [
  { value: "steam", label: "Steam Market" },
  { value: "buff163", label: "BUFF163" },
  { value: "skinport", label: "Skinport" },
  { value: "dmarket", label: "DMarket" },
  { value: "cs_money", label: "CS.MONEY" },
  { value: "other", label: "Other" },
];

export function SkinSellingForm({ item, skin, onSellSkin = () => {}, onCancel = () => {} }: SkinSellingFormProps) {
  // Use item if it exists, otherwise use skin
  const skinData = item || skin || {};
  const { currency, formatPrice, convertPrice } = useCurrency();
  
  // Estado para o formulário
  const [soldDate, setSoldDate] = useState<Date>(new Date());
  const [soldPrice, setSoldPrice] = useState<string>("");
  const [soldCurrency, setSoldCurrency] = useState<string>(currency.code);
  const [soldMarketplace, setSoldMarketplace] = useState<string>("steam");
  const [soldFeePercentage, setSoldFeePercentage] = useState<string>("13");
  const [soldNotes, setSoldNotes] = useState<string>("");

  // Calcular o lucro ou prejuízo (considerando as diferentes moedas)
  const calculateProfit = (): number => {
    if (!soldPrice || !skinData.purchasePrice) return 0;
    
    // Converter preço de venda para USD para comparação
    const soldPriceInUSD = soldCurrency === "USD" 
      ? parseFloat(soldPrice) 
      : convertPrice(parseFloat(soldPrice), soldCurrency);
    
    // Converter preço de compra para USD para comparação
    const purchasePriceInUSD = skinData.currency === "USD" 
      ? skinData.purchasePrice 
      : convertPrice(skinData.purchasePrice, skinData.currency || "USD");
    
    return soldPriceInUSD - purchasePriceInUSD;
  };

  const profit = calculateProfit();
  const profitPercentage = skinData.purchasePrice ? (profit / skinData.purchasePrice) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!soldPrice || !skinData.inventoryId) return;
    
    const sellData: SellData = {
      soldDate: soldDate.toISOString(),
      soldPrice: parseFloat(soldPrice),
      soldMarketplace,
      soldFeePercentage: parseFloat(soldFeePercentage || "0"),
      soldNotes,
      profit,
      soldCurrency
    };
    
    onSellSkin(skinData.inventoryId, sellData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sold-date">Data da venda</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
                id="sold-date"
                type="button"
              >
                {soldDate ? format(soldDate, "dd/MM/yyyy") : <span>Selecionar data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={soldDate}
                onSelect={d => d && setSoldDate(d)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="marketplace">Marketplace</Label>
          <Select
            value={soldMarketplace}
            onValueChange={setSoldMarketplace}
          >
            <SelectTrigger id="marketplace">
              <SelectValue placeholder="Selecione onde vendeu" />
            </SelectTrigger>
            <SelectContent>
              {MARKETPLACE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sold-price">Preço de venda</Label>
          <Input
            id="sold-price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={soldPrice}
            onChange={(e) => setSoldPrice(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sold-currency">Moeda</Label>
          <Select
            value={soldCurrency}
            onValueChange={setSoldCurrency}
          >
            <SelectTrigger id="sold-currency">
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
          <Label htmlFor="fee-percentage">Taxa do marketplace (%)</Label>
          <Input
            id="fee-percentage"
            type="number"
            min="0"
            max="100"
            step="0.1"
            placeholder="13"
            value={soldFeePercentage}
            onChange={(e) => setSoldFeePercentage(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Steam: 13%, BUFF: 2.5%, etc.
          </p>
        </div>
        
        {profit !== 0 && (
          <div className="space-y-2">
            <Label>Lucro/Perda estimado</Label>
            <div className={`p-2 border rounded ${profit > 0 ? 'bg-green-500/10 border-green-500/30' : profit < 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-muted/20'}`}>
              <p className={`font-medium ${profit > 0 ? 'text-green-500' : profit < 0 ? 'text-red-500' : ''}`}>
                {formatPrice(profit)}
                <span className="ml-2 text-xs">
                  ({profitPercentage > 0 ? '+' : ''}{profitPercentage.toFixed(2)}%)
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações sobre a venda</Label>
        <Textarea
          id="notes"
          placeholder="Adicione observações sobre esta venda..."
          value={soldNotes}
          onChange={(e) => setSoldNotes(e.target.value)}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="default">
          Confirmar Venda
        </Button>
      </div>
    </form>
  );
}
