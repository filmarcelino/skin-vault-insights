
import { FC } from "react";
import { Link } from "react-router-dom";
import { Home, Plus, LayoutGrid, MoreHorizontal } from "lucide-react";

export const MobileNav: FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 md:hidden">
      <div className="flex items-center justify-around h-16">
        <Link to="/" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-primary">
          <Home className="h-5 w-5" />
          <span className="text-[10px] mt-1">Home</span>
        </Link>
        <Link to="/add" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-primary">
          <Plus className="h-5 w-5" />
          <span className="text-[10px] mt-1">Add Skin</span>
        </Link>
        <Link to="/inventory" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-primary">
          <LayoutGrid className="h-5 w-5" />
          <span className="text-[10px] mt-1">Inventory</span>
        </Link>
        <Link to="/more" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-primary">
          <MoreHorizontal className="h-5 w-5" />
          <span className="text-[10px] mt-1">More</span>
        </Link>
      </div>
    </div>
  );
};
