
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
import { useLanguage } from "@/contexts/LanguageContext";

interface SkinSellingFormProps {
  item?: InventoryItem | null;
  skin?: InventoryItem | null;
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
  const { t } = useLanguage();
  // Use item if it exists, otherwise use skin, ensure it's never null
  const skinData = item || skin || {} as InventoryItem;
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
    // Safely check if purchasePrice exists with type guard
    const purchasePrice = 'purchasePrice' in skinData ? 
      typeof skinData.purchasePrice === 'number' ? skinData.purchasePrice : 0 : 0;
    
    if (!soldPrice || !purchasePrice) return 0;
    
    // Safely get currency with type guard
    const skinCurrency = 'currency' in skinData ? 
      typeof skinData.currency === 'string' ? skinData.currency : "USD" : "USD";
    
    // Converter preço de venda para USD para comparação
    const soldPriceInUSD = soldCurrency === "USD" 
      ? parseFloat(soldPrice) 
      : convertPrice(parseFloat(soldPrice), soldCurrency);
    
    // Converter preço de compra para USD para comparação
    const purchasePriceInUSD = skinCurrency === "USD" 
      ? purchasePrice 
      : convertPrice(purchasePrice, skinCurrency);
    
    return soldPriceInUSD - purchasePriceInUSD;
  };

  const profit = calculateProfit();
  const purchasePrice = 'purchasePrice' in skinData ? 
    typeof skinData.purchasePrice === 'number' ? skinData.purchasePrice : 0 : 0;
    
  const profitPercentage = purchasePrice ? (profit / purchasePrice) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Safely get the inventory ID for the item
    const itemId = skinData.inventoryId || skinData.id;
    
    if (!soldPrice || !itemId) return;
    
    const sellData: SellData = {
      soldDate: soldDate.toISOString(),
      soldPrice: parseFloat(soldPrice),
      soldMarketplace,
      soldFeePercentage: parseFloat(soldFeePercentage || "0"),
      soldNotes,
      profit,
      soldCurrency
    };
    
    console.log("Selling skin with data:", { itemId, sellData });
    onSellSkin(itemId, sellData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sold-date">{t('inventory.dateOfSale')}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
                id="sold-date"
                type="button"
              >
                {soldDate ? format(soldDate, "dd/MM/yyyy") : <span>{t('common.selectDate')}</span>}
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
              <SelectValue placeholder={t('inventory.selectMarketplace')} />
            </SelectTrigger>
            <SelectContent>
              {MARKETPLACE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sold-price">{t('inventory.salePrice')}</Label>
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
          <Label htmlFor="sold-currency">{t('common.currency')}</Label>
          <Select
            value={soldCurrency}
            onValueChange={setSoldCurrency}
          >
            <SelectTrigger id="sold-currency">
              <SelectValue placeholder={t('common.selectCurrency')} />
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
          <Label htmlFor="fee-percentage">{t('inventory.marketplaceFee')}</Label>
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
            <Label>{t('inventory.estimatedProfitLoss')}</Label>
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
        <Label htmlFor="notes">{t('inventory.saleNotes')}</Label>
        <Textarea
          id="notes"
          placeholder={t('inventory.addSaleNotes')}
          value={soldNotes}
          onChange={(e) => setSoldNotes(e.target.value)}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" variant="default">
          {t('inventory.confirmSale')}
        </Button>
      </div>
    </form>
  );
}
