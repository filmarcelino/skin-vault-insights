
import React from "react";
import { useCurrency, CURRENCIES } from "@/contexts/CurrencyContext";
import { DollarSign } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export const CurrencySelector: React.FC = () => {
  const { currency, setCurrency, isLoading } = useCurrency();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1 px-2 border-border/40">
          <DollarSign className="h-4 w-4" />
          <span>{currency.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover border-border z-50">
        {CURRENCIES.map((curr) => (
          <DropdownMenuItem 
            key={curr.code}
            onClick={() => setCurrency(curr)}
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
