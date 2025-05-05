
import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Plus, LayoutGrid, LineChart, Settings, Search } from "lucide-react";

export const TopNav: FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Function to get page name based on current route
  const getPageName = (path: string) => {
    switch (path) {
      case "/dashboard":
        return "Dashboard";
      case "/search":
        return "Search Skins";
      case "/add":
        return "Add Skin";
      case "/inventory":
        return "Inventory";
      case "/analytics":
        return "Analytics";
      case "/settings":
        return "Settings";
      default:
        return "";
    }
  };

  const currentPageName = getPageName(location.pathname);
  
  const getLinkClass = (path: string) => {
    const baseClass = "flex items-center gap-1 px-2 sm:px-3 md:px-4 py-2 rounded-md transition-colors";
    return isActive(path)
      ? `${baseClass} bg-primary/10 text-primary font-medium`
      : `${baseClass} text-muted-foreground hover:bg-primary/5 hover:text-foreground`;
  };

  return (
    <nav className="border-b border-border/50 bg-background sticky top-16 z-30">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="flex items-center h-12">
          <div className="hidden md:block mr-4">
            <span className="font-medium text-sm">{currentPageName}</span>
          </div>
          
          <div className="flex items-center space-x-0.5 sm:space-x-1 overflow-x-auto scrollbar-hide w-full md:w-auto">
            <Link 
              to="/dashboard" 
              className={getLinkClass("/dashboard")}
              title="Dashboard"
            >
              <Home className="h-4 w-4" />
              <span className="text-[10px] sm:text-xs hidden xs:inline-block">Dashboard</span>
            </Link>
            <Link 
              to="/search" 
              className={getLinkClass("/search")}
              title="Search Skins"
            >
              <Search className="h-4 w-4" />
              <span className="text-[10px] sm:text-xs hidden xs:inline-block">Search</span>
            </Link>
            <Link 
              to="/add" 
              className={getLinkClass("/add")}
              title="Add Skin"
            >
              <Plus className="h-4 w-4" />
              <span className="text-[10px] sm:text-xs hidden xs:inline-block">Add</span>
            </Link>
            <Link 
              to="/inventory" 
              className={getLinkClass("/inventory")}
              title="Inventory"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="text-[10px] sm:text-xs hidden xs:inline-block">Inventory</span>
            </Link>
            <Link 
              to="/analytics" 
              className={getLinkClass("/analytics")}
              title="Analytics"
            >
              <LineChart className="h-4 w-4" />
              <span className="text-[10px] sm:text-xs hidden xs:inline-block">Analytics</span>
            </Link>
            <Link 
              to="/settings" 
              className={getLinkClass("/settings")}
              title="Settings"
            >
              <Settings className="h-4 w-4" />
              <span className="text-[10px] sm:text-xs hidden xs:inline-block">Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
