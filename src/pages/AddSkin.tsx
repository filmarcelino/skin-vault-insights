
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "@/components/ui/search";
import { useSearchSkins, useWeapons } from "@/hooks/use-skins";
import { Skin } from "@/types/skin";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

const AddSkinSchema = z.object({
  skinId: z.string().min(1, "Please select a skin"),
  wear: z.string().min(1, "Please select wear"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
});

const AddSkin = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { data: searchResults = [], isLoading: isSearching } = useSearchSkins(searchQuery);
  const { data: weapons = [] } = useWeapons();
  
  const form = useForm<z.infer<typeof AddSkinSchema>>({
    resolver: zodResolver(AddSkinSchema),
    defaultValues: {
      skinId: "",
      wear: "",
      price: 0,
    },
  });

  const onSubmit = (values: z.infer<typeof AddSkinSchema>) => {
    if (!selectedSkin) return;
    
    // Here we would normally save this to a backend, but for now let's just simulate it
    console.log("Adding skin:", { ...selectedSkin, ...values });
    
    toast({
      title: "Skin Added",
      description: `${selectedSkin.weapon} | ${selectedSkin.name} has been added to your inventory.`,
    });
    
    // Reset form and navigate back to inventory
    form.reset();
    setSelectedSkin(null);
    navigate("/inventory");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSelectSkin = (skin: Skin) => {
    setSelectedSkin(skin);
    form.setValue("skinId", skin.id);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Add Skin to Inventory</h1>
      
      <div className="mb-6">
        <Search 
          placeholder="Search for a skin by name or weapon..." 
          onSearch={handleSearch}
        />
      </div>
      
      {isSearching && searchQuery.length > 2 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Searching for skins...</p>
        </div>
      )}
      
      {searchQuery.length > 2 && !isSearching && searchResults.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No skins found matching "{searchQuery}"</p>
        </div>
      )}
      
      {searchResults.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {searchResults.slice(0, 8).map((skin) => (
            <div 
              key={skin.id} 
              className={`cs-card p-3 flex flex-col cursor-pointer transition-all ${selectedSkin?.id === skin.id ? 'ring-2 ring-primary' : 'hover:bg-secondary/50'}`}
              onClick={() => handleSelectSkin(skin)}
            >
              <div className="font-medium text-sm">
                {skin.weapon} | <span className="text-primary">{skin.name}</span>
              </div>
              {skin.image && (
                <div className="relative w-full h-24 my-2 flex items-center justify-center">
                  <img 
                    src={skin.image} 
                    alt={`${skin.weapon} ${skin.name}`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
              <div className="flex items-center justify-between mt-auto">
                <div className="text-xs text-muted-foreground">{skin.rarity}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedSkin && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="wear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skin Wear</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select wear condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Factory New">Factory New</SelectItem>
                      <SelectItem value="Minimal Wear">Minimal Wear</SelectItem>
                      <SelectItem value="Field-Tested">Field-Tested</SelectItem>
                      <SelectItem value="Well-Worn">Well-Worn</SelectItem>
                      <SelectItem value="Battle-Scarred">Battle-Scarred</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The condition of your skin affects its value.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Price ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter how much you paid for this skin.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => {
                setSelectedSkin(null);
                form.reset();
              }}>
                Cancel
              </Button>
              <Button type="submit">Add to Inventory</Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default AddSkin;
