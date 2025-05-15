
import React from "react";
import { Button } from "@/components/ui/button";
import { ActivityItem } from "@/components/dashboard/activity-item";
import { ArrowUp, ArrowDown, ArrowRightLeft, ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Transaction } from "@/types/skin";

interface ActivitySectionProps {
  isLoading: boolean;
  transactions: Transaction[];
}

export const ActivitySection: React.FC<ActivitySectionProps> = ({
  isLoading,
  transactions,
}) => {
  return (
    <div className="mt-8 animate-fade-in" style={{ animationDelay: "0.9s" }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Recent Activity</h2>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          View All
        </Button>
      </div>
      
      <div className="cs-card divide-y divide-border/50">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={`trans-skeleton-${idx}`} className={`p-4 flex items-center gap-3`}>
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))
        ) : transactions && transactions.length > 0 ? (
          transactions.slice(0, 5).map((item, index) => (
            <ActivityItem 
              key={item.id}
              type={item.type}
              weaponName={item.weaponName}
              skinName={item.skinName}
              date={item.date}
              price={item.price?.toString()}
              icon={
                item.type === 'add' ? <ArrowUp className="h-4 w-4" /> :
                item.type === 'sell' ? <ArrowDown className="h-4 w-4" /> :
                item.type === 'trade' ? <ArrowRightLeft className="h-4 w-4" /> :
                <ShoppingCart className="h-4 w-4" />
              }
              className={`${index === 0 ? "pt-0" : ""} hover:bg-secondary/30 transition-colors`}
            />
          ))
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            No transaction history yet. Add skins to your inventory to see activity here.
          </div>
        )}
      </div>
    </div>
  );
};
