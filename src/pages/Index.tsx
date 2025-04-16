
import { Layout } from "@/components/layout/layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { InsightsCard } from "@/components/dashboard/insights-card";
import { InventoryCard } from "@/components/dashboard/inventory-card";
import { ActivityItem } from "@/components/dashboard/activity-item";
import { ArrowUp, Boxes, DollarSign, ArrowDown, ArrowRightLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";

// Mock data (in a real app, this would come from an API)
const stats = {
  totalSkins: 76,
  totalValue: "$3,245",
  mostValuable: {
    weapon: "AK-47",
    skin: "Gold Arabesque",
    price: "$3,200"
  },
  mostRare: {
    weapon: "Karambit",
    skin: "Doppler Sapphire"
  }
};

const inventoryItems = [
  {
    weaponName: "AWP",
    skinName: "Neo-Noir",
    wear: "Field-Tested",
    price: "3,200",
    image: "https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0mvLwOq7c2G9SupUijOjAotyg3w2x_0ZkZ2rzd4OXdgRoYQuE8gDtyL_mg5K4tJ7XiSw0WqKv8kM"
  },
  {
    weaponName: "USP-S",
    skinName: "Cortex",
    wear: "Factory New",
    price: "45",
    image: "https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo6m1FBRp3_bGcjhQ09-jq5WYh8jyP7rQmGRu5Mx2gv2P8dSm2VK1_ERuYmmgd9eRcVA_NVyCqwS-k-m9jMO-7ZvOyCdj7HRw5GGdwUKgqkJpDw"
  },
  {
    weaponName: "Karambit",
    skinName: "Case Hardened",
    wear: "Well-Worn",
    price: "950",
    image: "https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20mvbmOL7VqX5B18N4hOz--YXygED6_BBlZGH7JoaSI1c_YVvTrle7xbvphZC5vMnJyXYysyQrsHndmUTln1gSOUQIActA"
  },
  {
    weaponName: "M4A4",
    skinName: "Desolate Space",
    wear: "Minimal Wear",
    price: "27",
    image: "https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJQJD_9W7m4WYg-X1P4Tdn2xZ_Pp9i_vG8MKsi1Cw-0E_N22iI4KVJAY2aAvW-VLrx-m-15TovJvLmydqvyRw5X7ZgVXp1milYhZm"
  }
];

const activityItems = [
  {
    type: "add" as const,
    weaponName: "AWP",
    skinName: "Desert Hydra",
    date: "Apr 20",
    price: "4,300",
    icon: <ArrowUp className="h-4 w-4" />
  },
  {
    type: "sell" as const,
    weaponName: "SSG 08",
    skinName: "Bloodshot",
    date: "Apr 17",
    price: "8.50",
    icon: <ArrowDown className="h-4 w-4" />
  },
  {
    type: "trade" as const,
    weaponName: "M4A1-S",
    skinName: "Cyrex",
    date: "Apr 15",
    icon: <ArrowRightLeft className="h-4 w-4" />
  },
  {
    type: "purchase" as const,
    weaponName: "Desert Eagle",
    skinName: "Printstream",
    date: "Apr 12",
    price: "55",
    icon: <ShoppingCart className="h-4 w-4" />
  }
];

const Index = () => {
  return (
    <Layout>
      <div className="mb-6">
        <Search placeholder="Search for weapon, skin or rarity..." />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
        <StatsCard 
          title="Total Skins" 
          value={stats.totalSkins} 
          icon={<Boxes className="h-5 w-5" />}
          className="animate-fade-in" 
          style={{ animationDelay: "0.1s" }}
        />
        <StatsCard 
          title="Total Value" 
          value={stats.totalValue} 
          icon={<DollarSign className="h-5 w-5" />} 
          className="animate-fade-in" 
          style={{ animationDelay: "0.2s" }}
        />
        <StatsCard 
          title="Most Valuable" 
          value={`${stats.mostValuable.weapon} | ${stats.mostValuable.skin}`} 
          className="md:col-span-1 animate-fade-in" 
          style={{ animationDelay: "0.3s" }}
        />
      </div>
      
      <InsightsCard 
        message="Your inventory has increased in value by 7.4% since last week" 
        className="mt-6 animate-fade-in animate-pulse-glow"
        style={{ animationDelay: "0.4s" }}
      />
      
      <div className="mt-8 animate-fade-in" style={{ animationDelay: "0.5s" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Inventory</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {inventoryItems.map((item, index) => (
            <InventoryCard 
              key={index}
              weaponName={item.weaponName}
              skinName={item.skinName}
              wear={item.wear}
              price={item.price}
              image={item.image}
              className="animate-fade-in hover:scale-105 transition-transform duration-200"
              style={{ animationDelay: `${0.5 + (index * 0.1)}s` }}
            />
          ))}
        </div>
      </div>
      
      <div className="mt-8 animate-fade-in" style={{ animationDelay: "0.9s" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Activity</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            View All
          </Button>
        </div>
        
        <div className="cs-card divide-y divide-border/50">
          {activityItems.map((item, index) => (
            <ActivityItem 
              key={index}
              type={item.type}
              weaponName={item.weaponName}
              skinName={item.skinName}
              date={item.date}
              price={item.price}
              icon={item.icon}
              className={`${index === 0 ? "pt-0" : ""} hover:bg-secondary/30 transition-colors`}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
