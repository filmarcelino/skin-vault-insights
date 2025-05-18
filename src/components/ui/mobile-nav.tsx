
import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Plus, LayoutGrid, Search, MoreHorizontal } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const MobileNav: FC = () => {
  const location = useLocation();
  const { t } = useLanguage();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getLinkClass = (path: string) => {
    const baseClass = "flex flex-col items-center justify-center w-full h-full";
    return isActive(path)
      ? `${baseClass} text-primary`
      : `${baseClass} text-muted-foreground hover:text-primary`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 md:hidden">
      <div className="flex items-center justify-around h-16">
        <Link to="/" className={getLinkClass("/")}>
          <Home className="h-5 w-5" />
          <span className="text-[10px] mt-1">{t("common.home")}</span>
        </Link>
        <Link to="/add" className={getLinkClass("/add")}>
          <Plus className="h-5 w-5" />
          <span className="text-[10px] mt-1">{t("common.add")}</span>
        </Link>
        <Link to="/inventory" className={getLinkClass("/inventory")}>
          <LayoutGrid className="h-5 w-5" />
          <span className="text-[10px] mt-1">{t("inventory.title")}</span>
        </Link>
        <Link to="/more" className={getLinkClass("/more")}>
          <MoreHorizontal className="h-5 w-5" />
          <span className="text-[10px] mt-1">{t("common.more")}</span>
        </Link>
      </div>
    </div>
  );
}
