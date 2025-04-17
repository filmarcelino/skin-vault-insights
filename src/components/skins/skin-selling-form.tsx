
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
import { useSellSkin } from "@/hooks/use-skins";
import { useCurrency, CURRENCIES } from "@/contexts/CurrencyContext";

interface SkinSellingFormProps {
  item: InventoryItem;
  onCancel: () => void;
  onSell: (itemId: string, sellData: SellData) => void;
}

export const SkinSellingForm = ({ item, onCancel, onSell }: SkinSellingFormProps) => {
  const [soldPrice, setSoldPrice] = useState("");
  const [soldCurrency, setSoldCurrency] = useState(() => {
    // Use a moeda atual do sistema como padrão
    return CURRENCIES.find(c => c.code === localStorage.getItem("selectedCurrency"))?.code || "USD";
  });
  const [soldMarketplace, setSoldMarketplace] = useState("steam");
  const [soldFeePercentage, setSoldFeePercentage] = useState("0");
  const [soldNotes, setSoldNotes] = useState("");
  
  const sellSkinMutation = useSellSkin();
  const { currency, formatPrice, convertPrice, formatWithCurrency } = useCurrency();

  // Determinar a moeda original de compra
  const purchaseCurrency = item.currency || "USD";
  
  const handleSellSkin = () => {
    if (!item || !soldPrice) return;

    const price = parseFloat(soldPrice);
    const fee = parseFloat(soldFeePercentage) || 0;
    
    // Converter para USD antes de calcular o lucro
    // Se a moeda de venda não é USD, convertemos para USD
    const soldCurrencyObj = CURRENCIES.find(c => c.code === soldCurrency) || CURRENCIES[0];
    const priceInUSD = price / soldCurrencyObj.rate;
    
    // O preço de compra já deve estar em USD no banco de dados
    const purchasePrice = item.purchasePrice || 0;
    const netProfit = calculateProfit(priceInUSD.toString(), soldFeePercentage, purchasePrice);

    const sellData: SellData = {
      soldDate: new Date().toISOString(),
      soldPrice: priceInUSD, // Salvamos em USD
      soldCurrency: soldCurrency, // Guardamos a moeda usada na venda
      soldMarketplace,
      soldFeePercentage: fee,
      soldNotes,
      profit: netProfit
    };

    sellSkinMutation.mutate({ 
      itemId: item.inventoryId, 
      sellData 
    }, {
      onSuccess: () => onSell(item.inventoryId, sellData)
    });
  };

  const calculateDisplayProfit = () => {
    if (!soldPrice || item.purchasePrice === undefined) return 0;
    
    // Converter o preço de venda para USD
    const soldCurrencyObj = CURRENCIES.find(c => c.code === soldCurrency) || CURRENCIES[0];
    const priceInUSD = parseFloat(soldPrice) / soldCurrencyObj.rate;
    
    // Calcular a taxa
    const feePercentage = parseFloat(soldFeePercentage) || 0;
    const feeAmount = priceInUSD * (feePercentage / 100);
    
    // Calcular o lucro (em USD)
    const netProfit = priceInUSD - feeAmount - item.purchasePrice;
    
    // Converter de volta para a moeda atual de exibição
    return netProfit * currency.rate;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[#8B5CF6]">Detalhes da Venda</h3>
      
      {/* Informação sobre a compra original */}
      {item.purchasePrice !== undefined && (
        <div className="p-3 rounded-md bg-opacity-10 bg-blue-900 border border-blue-800">
          <p className="text-sm text-muted-foreground">
            Comprado por {formatWithCurrency(item.purchasePrice, purchaseCurrency)} {purchaseCurrency !== "USD" && `(${formatPrice(item.purchasePrice)})`}
          </p>
        </div>
      )}
      
      {/* Formulário de Venda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Preço de Venda */}
        <div className="space-y-2">
          <Label htmlFor="sold-price" className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1 text-green-500" />
            Preço de Venda
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
        
        {/* Moeda */}
        <div className="space-y-2">
          <Label htmlFor="sold-currency">Moeda</Label>
          <Select
            value={soldCurrency}
            onValueChange={setSoldCurrency}
          >
            <SelectTrigger id="sold-currency" className="border-[#333] bg-[#221F26]/50">
              <SelectValue placeholder="Selecione a moeda" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1F2C] border-[#333]">
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
          <Label htmlFor="sold-marketplace">Marketplace</Label>
          <Select
            value={soldMarketplace}
            onValueChange={setSoldMarketplace}
          >
            <SelectTrigger id="sold-marketplace" className="border-[#333] bg-[#221F26]/50">
              <SelectValue placeholder="Selecione o marketplace" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1F2C] border-[#333]">
              {MARKETPLACE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Percentual de Taxa */}
        <div className="space-y-2">
          <Label htmlFor="sold-fee-percentage">Percentual de Taxa (%)</Label>
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

        {/* Cálculo de Lucro */}
        {soldPrice && item.purchasePrice !== undefined && (
          <div className="md:col-span-2 p-4 rounded-md bg-opacity-10 bg-green-900 border border-green-800">
            <h4 className="font-medium mb-2 text-green-500 flex items-center">
              <ArrowUp className="h-4 w-4 mr-1" /> Cálculo de Lucro
            </h4>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Preço de Venda:</div>
              <div className="text-right">
                {formatWithCurrency(parseFloat(soldPrice), soldCurrency)}
                {soldCurrency !== currency.code && ` (${formatPrice(parseFloat(soldPrice) / (CURRENCIES.find(c => c.code === soldCurrency)?.rate || 1))})`}
              </div>
              
              <div>Taxa do Marketplace ({parseFloat(soldFeePercentage) || 0}%):</div>
              <div className="text-right text-red-400">
                -{formatWithCurrency((parseFloat(soldPrice) * (parseFloat(soldFeePercentage) || 0) / 100), soldCurrency)}
              </div>
              
              <div>Preço de Compra:</div>
              <div className="text-right text-red-400">
                -{formatPrice(item.purchasePrice)}
              </div>
              
              <div className="font-bold border-t border-green-800 pt-1">Lucro Líquido:</div>
              <div className="font-bold border-t border-green-800 pt-1 text-right" 
                   style={{ color: calculateDisplayProfit() >= 0 ? "#10B981" : "#EF4444" }}>
                {formatPrice(calculateDisplayProfit())}
              </div>
            </div>
          </div>
        )}
        
        {/* Observações */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="sold-notes">Observações</Label>
          <Textarea
            id="sold-notes"
            placeholder="Adicione observações sobre esta venda..."
            value={soldNotes}
            onChange={(e) => setSoldNotes(e.target.value)}
            className="min-h-[80px] border-[#333] bg-[#221F26]/50"
          />
        </div>
      </div>

      {/* Ações do Formulário */}
      <div className="flex justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="border-[#333] hover:bg-[#333]"
          disabled={sellSkinMutation.isPending}
        >
          Cancelar
        </Button>
        <Button 
          type="button" 
          onClick={handleSellSkin}
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={!soldPrice || sellSkinMutation.isPending}
        >
          <DollarSign className="h-4 w-4 mr-1" />
          {sellSkinMutation.isPending ? "Processando..." : "Concluir Venda"}
        </Button>
      </div>
    </div>
  );
};
