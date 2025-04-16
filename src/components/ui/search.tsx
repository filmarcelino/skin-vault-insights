
import { FC, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  initialValue?: string;
  debounceTime?: number;
}

export const Search: FC<SearchProps> = ({
  placeholder = "Search for a skin...",
  onSearch,
  initialValue = "",
  debounceTime = 300,
}) => {
  const [value, setValue] = useState(initialValue);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
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
    if (onSearch) onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="pl-9 bg-secondary/50"
      />
    </form>
  );
};
