
import { FC } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/logo";
import { Home, Plus, LayoutGrid, LineChart, Settings, Search } from "lucide-react";

export const Sidebar: FC = () => {
  return (
    <div className="hidden md:flex flex-col h-screen w-16 border-r border-border/50 bg-sidebar-background fixed left-0 top-0">
      <div className="flex items-center justify-center h-16 border-b border-border/50">
        <Logo size="sm" />
      </div>
      
      <div className="flex flex-col items-center gap-6 py-6">
        <Link 
          to="/" 
          className="w-10 h-10 flex items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-primary transition-colors"
        >
          <Home className="h-5 w-5" />
        </Link>
        <Link 
          to="/search" 
          className="w-10 h-10 flex items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-primary transition-colors"
        >
          <Search className="h-5 w-5" />
        </Link>
        <Link 
          to="/add" 
          className="w-10 h-10 flex items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-primary transition-colors"
        >
          <Plus className="h-5 w-5" />
        </Link>
        <Link 
          to="/inventory" 
          className="w-10 h-10 flex items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-primary transition-colors"
        >
          <LayoutGrid className="h-5 w-5" />
        </Link>
        <Link 
          to="/analytics" 
          className="w-10 h-10 flex items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-primary transition-colors"
        >
          <LineChart className="h-5 w-5" />
        </Link>
      </div>
      
      <div className="mt-auto mb-6 flex flex-col items-center">
        <Link 
          to="/settings" 
          className="w-10 h-10 flex items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-primary transition-colors"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
};
