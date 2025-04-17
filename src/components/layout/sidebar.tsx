
import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Plus, LayoutGrid, LineChart, Settings, Search } from "lucide-react";

export const Sidebar: FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Function to get page name based on current route
  const getPageName = (path: string) => {
    switch (path) {
      case "/":
        return "Home";
      case "/search":
        return "Buscar Skins";
      case "/add":
        return "Adicionar Skin";
      case "/inventory":
        return "Inventário";
      case "/analytics":
        return "Análises";
      case "/settings":
        return "Configurações";
      default:
        return "";
    }
  };

  const currentPageName = getPageName(location.pathname);
  
  const getLinkClass = (path: string) => {
    const baseClass = "flex items-center rounded-md transition-colors";
    return isActive(path)
      ? `${baseClass} bg-sidebar-accent text-primary`
      : `${baseClass} text-muted-foreground hover:bg-sidebar-accent hover:text-primary`;
  };

  return (
    <div className="hidden md:flex flex-col h-screen w-16 border-r border-border/50 bg-sidebar-background fixed left-0 top-0 z-30">
      <div className="flex items-center justify-center h-16 border-b border-border/50">
        <h2 className="text-xs font-medium text-primary rotate-90">{currentPageName}</h2>
      </div>
      
      <div className="flex flex-col items-center gap-6 py-6">
        <Link 
          to="/" 
          className={getLinkClass("/")}
          title="Home"
        >
          <div className="w-full flex flex-col items-center justify-center py-2">
            <Home className="h-5 w-5" />
            <span className="mt-1 text-[10px]">Home</span>
          </div>
        </Link>
        <Link 
          to="/search" 
          className={getLinkClass("/search")}
          title="Buscar Skins"
        >
          <div className="w-full flex flex-col items-center justify-center py-2">
            <Search className="h-5 w-5" />
            <span className="mt-1 text-[10px]">Buscar</span>
          </div>
        </Link>
        <Link 
          to="/add" 
          className={getLinkClass("/add")}
          title="Adicionar Skin"
        >
          <div className="w-full flex flex-col items-center justify-center py-2">
            <Plus className="h-5 w-5" />
            <span className="mt-1 text-[10px]">Adicionar</span>
          </div>
        </Link>
        <Link 
          to="/inventory" 
          className={getLinkClass("/inventory")}
          title="Inventário"
        >
          <div className="w-full flex flex-col items-center justify-center py-2">
            <LayoutGrid className="h-5 w-5" />
            <span className="mt-1 text-[10px]">Inventário</span>
          </div>
        </Link>
        <Link 
          to="/analytics" 
          className={getLinkClass("/analytics")}
          title="Análises"
        >
          <div className="w-full flex flex-col items-center justify-center py-2">
            <LineChart className="h-5 w-5" />
            <span className="mt-1 text-[10px]">Análises</span>
          </div>
        </Link>
      </div>
      
      <div className="mt-auto mb-6 flex flex-col items-center">
        <Link 
          to="/settings" 
          className={getLinkClass("/settings")}
          title="Configurações"
        >
          <div className="w-full flex flex-col items-center justify-center py-2">
            <Settings className="h-5 w-5" />
            <span className="mt-1 text-[10px]">Configurações</span>
          </div>
        </Link>
      </div>
    </div>
  );
};
