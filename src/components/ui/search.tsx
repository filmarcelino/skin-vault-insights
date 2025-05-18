
import { FC, useState, useEffect } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  initialValue?: string;
  debounceTime?: number;
  className?: string;
}

export const Search: FC<SearchProps> = ({
  placeholder = "Search for a skin...",
  onSearch,
  onChange,
  value,
  initialValue = "",
  debounceTime = 300,
  className = "",
}) => {
  const [internalValue, setValue] = useState(initialValue);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (value !== undefined) {
      setValue(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // If value prop is not provided, manage state internally
    if (value === undefined) {
      setValue(newValue);
    }
    
    // Call onChange prop if provided
    if (onChange) {
      onChange(e);
    }
    
    if (onSearch) {
      // Clear any existing timeout
      if (debounceTimeout) clearTimeout(debounceTimeout);
      
      // Set a new timeout
      const timeout = setTimeout(() => {
        onSearch(newValue);
      }, debounceTime);
      
      setDebounceTimeout(timeout);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(value !== undefined ? value : internalValue);
  };

  const handleClear = () => {
    if (value === undefined) {
      setValue("");
    }
    
    if (onSearch) {
      onSearch("");
    }
    
    if (onChange && value === undefined) {
      onChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value !== undefined ? value : internalValue}
        onChange={handleChange}
        className="pl-9 pr-10 bg-secondary/50"
      />
      {(value || internalValue) && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Limpar pesquisa</span>
        </Button>
      )}
    </form>
  );
};
