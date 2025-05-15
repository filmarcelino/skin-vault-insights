
import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Plus, LayoutGrid, LineChart, Settings, Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";

export const TopNav: FC = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Function to get page name based on current route
  const getPageName = (path: string) => {
    switch (path) {
      case "/dashboard":
        return t("dashboard.title");
      case "/search":
        return t("search.title");
      case "/add":
        return t("inventory.add");
      case "/inventory":
        return t("inventory.title");
      case "/analytics":
        return t("analytics.title");
      case "/settings":
        return t("settings.title");
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

  if (isMobile) {
    // For mobile, we won't render the top nav as we have the bottom nav
    return null;
  }

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
              title={t("dashboard.title")}
            >
              <Home className="h-4 w-4" />
              <span className="text-[10px] sm:text-xs hidden xs:inline-block">{t("dashboard.title")}</span>
            </Link>
            <Link 
              to="/search" 
              className={getLinkClass("/search")}
              title={t("search.title")}
            >
              <Search className="h-4 w-4" />
              <span className="text-[10px] sm:text-xs hidden xs:inline-block">{t("search.title")}</span>
            </Link>
            <Link 
              to="/add" 
              className={getLinkClass("/add")}
              title={t("inventory.add")}
            >
              <Plus className="h-4 w-4" />
              <span className="text-[10px] sm:text-xs hidden xs:inline-block">{t("inventory.add")}</span>
            </Link>
            <Link 
              to="/inventory" 
              className={getLinkClass("/inventory")}
              title={t("inventory.title")}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="text-[10px] sm:text-xs hidden xs:inline-block">{t("inventory.title")}</span>
            </Link>
            <Link 
              to="/analytics" 
              className={getLinkClass("/analytics")}
              title={t("analytics.title")}
            >
              <LineChart className="h-4 w-4" />
              <span className="text-[10px] sm:text-xs hidden xs:inline-block">{t("analytics.title")}</span>
            </Link>
            <Link 
              to="/settings" 
              className={getLinkClass("/settings")}
              title={t("settings.title")}
            >
              <Settings className="h-4 w-4" />
              <span className="text-[10px] sm:text-xs hidden xs:inline-block">{t("settings.title")}</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
