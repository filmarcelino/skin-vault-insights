
import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number;
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
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const savedCurrency = localStorage.getItem("selectedCurrency");
    return savedCurrency 
      ? CURRENCIES.find(c => c.code === savedCurrency) || CURRENCIES[0]
      : CURRENCIES[0];
  });

  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const auth = useAuth();

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.functions.invoke('get-exchange-rates');
        
        if (error) throw error;
        
        if (data && data.rates) {
          setExchangeRates(data.rates);
          
          // Atualizar as taxas no array CURRENCIES
          CURRENCIES.forEach(curr => {
            curr.rate = data.rates[curr.code] || curr.rate;
          });
        }
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
        toast.error('Erro ao buscar taxas de câmbio. Usando taxas offline.');
        
        // Usar taxas de câmbio offline como fallback
        // Não fazer nada aqui, as taxas estáticas já estão definidas em CURRENCIES
      } finally {
        setIsLoading(false);
      }
    };

    // Buscar taxas ao iniciar e a cada hora
    fetchExchangeRates();
    const interval = setInterval(fetchExchangeRates, 3600000); // 1 hora

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedCurrency", currency.code);
  }, [currency]);

  const getExchangeRate = (fromCurrency: string = "USD", toCurrency: string = currency.code): number => {
    if (fromCurrency === toCurrency) return 1;
    
    // Se temos taxas da API, usar elas
    if (exchangeRates[fromCurrency] && exchangeRates[toCurrency]) {
      return exchangeRates[toCurrency] / exchangeRates[fromCurrency];
    }
    
    // Fallback para as taxas estáticas
    const fromRate = CURRENCIES.find(c => c.code === fromCurrency)?.rate || 1;
    const toRate = CURRENCIES.find(c => c.code === toCurrency)?.rate || 1;
    return toRate / fromRate;
  };

  const formatPrice = (amount: number | undefined): string => {
    if (amount === undefined) return `${currency.symbol}0.00`;
    
    const rate = getExchangeRate("USD", currency.code);
    const convertedAmount = amount * rate;
    return `${currency.symbol}${convertedAmount.toFixed(2)}`;
  };

  const convertPrice = (amount: number | undefined, fromCurrency: string = "USD"): number => {
    if (amount === undefined) return 0;
    
    const rate = getExchangeRate(fromCurrency, currency.code);
    return parseFloat((amount * rate).toFixed(2));
  };

  const getOriginalPrice = (amount: number | undefined, toCurrency: string = "USD"): number => {
    if (amount === undefined) return 0;
    
    const rate = getExchangeRate(currency.code, toCurrency);
    return parseFloat((amount * rate).toFixed(2));
  };

  const formatWithCurrency = (amount: number | undefined, currencyCode?: string): string => {
    if (amount === undefined) return `$0.00`;
    
    if (!currencyCode) {
      return formatPrice(amount);
    }

    const specificCurrency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
    const convertedAmount = getOriginalPrice(amount, currencyCode);
    
    return `${specificCurrency.symbol}${convertedAmount.toFixed(2)}`;
  };

  // Função unificada de setCurrency que atualiza o localStorage e o perfil do usuário
  const handleSetCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    
    // Se o usuário estiver logado, atualizar a preferência no perfil
    if (auth.user && auth.profile) {
      auth.updateProfile({
        preferred_currency: newCurrency.code
      }).catch(error => {
        console.error("Erro ao atualizar moeda preferida no perfil:", error);
      });
    }
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency: handleSetCurrency, 
      formatPrice, 
      convertPrice,
      getOriginalPrice,
      formatWithCurrency,
      isLoading
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
