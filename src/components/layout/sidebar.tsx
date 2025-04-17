
import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/ui/logo";
import { Home, Plus, LayoutGrid, LineChart, Settings, Search } from "lucide-react";

export const Sidebar: FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getLinkClass = (path: string) => {
    const baseClass = "w-10 h-10 flex items-center justify-center rounded-md transition-colors";
    return isActive(path)
      ? `${baseClass} bg-sidebar-accent text-primary`
      : `${baseClass} text-muted-foreground hover:bg-sidebar-accent hover:text-primary`;
  };

  return (
    <div className="hidden md:flex flex-col h-screen w-16 border-r border-border/50 bg-sidebar-background fixed left-0 top-0">
      <div className="flex items-center justify-center h-16 border-b border-border/50">
        <Logo size="sm" variant="compact" />
      </div>
      
      <div className="flex flex-col items-center gap-6 py-6">
        <Link 
          to="/" 
          className={getLinkClass("/")}
          title="Home"
        >
          <Home className="h-5 w-5" />
        </Link>
        <Link 
          to="/search" 
          className={getLinkClass("/search")}
          title="Buscar Skins"
        >
          <Search className="h-5 w-5" />
        </Link>
        <Link 
          to="/add" 
          className={getLinkClass("/add")}
          title="Adicionar Skin"
        >
          <Plus className="h-5 w-5" />
        </Link>
        <Link 
          to="/inventory" 
          className={getLinkClass("/inventory")}
          title="Inventário"
        >
          <LayoutGrid className="h-5 w-5" />
        </Link>
        <Link 
          to="/analytics" 
          className={getLinkClass("/analytics")}
          title="Análises"
        >
          <LineChart className="h-5 w-5" />
        </Link>
      </div>
      
      <div className="mt-auto mb-6 flex flex-col items-center">
        <Link 
          to="/settings" 
          className={getLinkClass("/settings")}
          title="Configurações"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
};
