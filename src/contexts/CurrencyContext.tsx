
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
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (amount: number | undefined) => string;
  convertPrice: (amount: number | undefined) => number;
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
  const convertPrice = (amount: number | undefined): number => {
    if (amount === undefined) return 0;
    return parseFloat((amount * currency.rate).toFixed(2));
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice }}>
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
