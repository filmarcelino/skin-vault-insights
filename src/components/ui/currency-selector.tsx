
import React from "react";
import { useCurrency, CURRENCIES } from "@/contexts/CurrencyContext";
import { DollarSign, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const CurrencySelector: React.FC<{
  onlySymbol?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}> = ({ 
  onlySymbol = false, 
  variant = "outline", 
  size = "sm", 
  className = "" 
}) => {
  const { currency, setCurrency, isLoading } = useCurrency();
  const { toast } = useToast();

  const handleCurrencyChange = (newCurrency: typeof CURRENCIES[0]) => {
    setCurrency(newCurrency);
    toast({
      title: "Moeda alterada",
      description: `Os valores agora serão exibidos em ${newCurrency.code} (${newCurrency.name})`,
      duration: 3000,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={`h-8 gap-1 px-2 border-border/40 ${className}`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <DollarSign className="h-4 w-4" />
          )}
          {onlySymbol ? (
            <span>{currency.symbol}</span>
          ) : (
            <span>{currency.code}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover border-border z-50">
        {CURRENCIES.map((curr) => (
          <DropdownMenuItem 
            key={curr.code}
            onClick={() => handleCurrencyChange(curr)}
            className={`flex items-center gap-2 cursor-pointer ${
              currency.code === curr.code ? "bg-accent" : ""
            }`}
          >
            <span className="font-medium">{curr.symbol}</span>
            <span>{curr.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
