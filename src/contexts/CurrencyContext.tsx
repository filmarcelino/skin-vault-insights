
import React, { createContext, useState, useContext, useEffect } from "react";

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Taxa de conversão em relação ao USD
}

export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar", rate: 1 },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", rate: 5.1 },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", rate: 7.25 },
  { code: "RUB", symbol: "₽", name: "Russian Ruble", rate: 91.5 },
  { code: "EUR", symbol: "€", name: "Euro", rate: 0.91 },
  { code: "GBP", symbol: "£", name: "British Pound", rate: 0.78 },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (amount: number | undefined) => string;
  convertPrice: (amount: number | undefined, fromCurrency?: string) => number;
  getOriginalPrice: (amount: number | undefined, toCurrency?: string) => number;
  formatWithCurrency: (amount: number | undefined, currencyCode?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>(() => {
    // Tentar recuperar a moeda salva no localStorage
    const savedCurrency = localStorage.getItem("selectedCurrency");
    return savedCurrency 
      ? CURRENCIES.find(c => c.code === savedCurrency) || CURRENCIES[0]
      : CURRENCIES[0]; // USD como padrão
  });

  // Salvar a moeda selecionada no localStorage
  useEffect(() => {
    localStorage.setItem("selectedCurrency", currency.code);
  }, [currency]);

  // Função para formatar preços na moeda atual
  const formatPrice = (amount: number | undefined): string => {
    if (amount === undefined) return `${currency.symbol}0.00`;
    
    const convertedAmount = (amount * currency.rate);
    return `${currency.symbol}${convertedAmount.toFixed(2)}`;
  };

  // Função para converter preços para a moeda atual
  const convertPrice = (amount: number | undefined, fromCurrency?: string): number => {
    if (amount === undefined) return 0;

    // Se fromCurrency é especificado, primeiro convertemos para USD, depois para a moeda atual
    if (fromCurrency && fromCurrency !== "USD") {
      const fromCurrencyObj = CURRENCIES.find(c => c.code === fromCurrency);
      if (fromCurrencyObj) {
        // Converter para USD primeiro
        const amountInUSD = amount / fromCurrencyObj.rate;
        // Depois para moeda atual
        return parseFloat((amountInUSD * currency.rate).toFixed(2));
      }
    }

    return parseFloat((amount * currency.rate).toFixed(2));
  };

  // Função para obter o preço na moeda original (converte da moeda atual para a moeda desejada)
  const getOriginalPrice = (amount: number | undefined, toCurrency: string = "USD"): number => {
    if (amount === undefined) return 0;

    // Primeiro convertemos para USD
    const amountInUSD = amount / currency.rate;
    
    // Se a moeda alvo for USD, retornamos o valor
    if (toCurrency === "USD") return parseFloat(amountInUSD.toFixed(2));

    // Caso contrário, convertemos de USD para a moeda alvo
    const toCurrencyObj = CURRENCIES.find(c => c.code === toCurrency);
    if (toCurrencyObj) {
      return parseFloat((amountInUSD * toCurrencyObj.rate).toFixed(2));
    }
    
    // Fallback para USD se a moeda não for encontrada
    return parseFloat(amountInUSD.toFixed(2));
  };

  // Função para formatar um preço em uma moeda específica
  const formatWithCurrency = (amount: number | undefined, currencyCode?: string): string => {
    if (amount === undefined) return `$0.00`;
    
    if (!currencyCode) {
      return formatPrice(amount);
    }

    const specificCurrency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
    const convertedAmount = getOriginalPrice(amount, currencyCode);
    
    return `${specificCurrency.symbol}${convertedAmount.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency, 
      formatPrice, 
      convertPrice,
      getOriginalPrice,
      formatWithCurrency
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
