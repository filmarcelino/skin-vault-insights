
import { Search } from "@/components/ui/search";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentTab: "inventory" | "allSkins";
  onTabChange: (value: string) => void;
}

export const SearchHeader = ({
  searchQuery,
  onSearchChange,
  currentTab,
  onTabChange
}: SearchHeaderProps) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4">
      <Search 
        placeholder="Buscar por arma, skin ou raridade..." 
        onChange={onSearchChange}
        value={searchQuery}
        className="flex-1"
      />
      <div className="flex items-center gap-2">
        <Tabs value={currentTab} onValueChange={onTabChange} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="inventory">Meu Inventário</TabsTrigger>
            <TabsTrigger value="allSkins">Todas as Skins</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
