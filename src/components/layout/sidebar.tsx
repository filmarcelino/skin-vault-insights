
import { FC } from "react";
import { NavLink } from "react-router-dom";
import { Logo } from "@/components/ui/logo";
import { useIsMobile } from "@/hooks/use-mobile"; // Fixed import name
import {
  Home,
  Plus,
  LayoutGrid,
  Settings,
  MoreHorizontal,
  LineChart,
  Search,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
}

export const Sidebar: FC<SidebarProps> = ({ collapsed }) => {
  const isMobile = useIsMobile();
  
  const getLinkClass = (isActive: boolean) => {
    return `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
      isActive
        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
    }`;
  };
  
  const getNameClass = () => {
    return `transition-all duration-300 ${
      collapsed ? "opacity-0 max-w-0 hidden" : "opacity-100 max-w-full"
    }`;
  };

  // Se for mobile não mostrar a sidebar
  if (isMobile) return null;

  return (
    <div className="h-screen w-[var(--sidebar-width)] border-r border-sidebar-border bg-sidebar transition-all fixed left-0 top-0 z-30">
      <div className="flex h-16 items-center px-4">
        <Logo size="sm" variant="text-only" /> {/* Fixed variant to match available options */}
      </div>
      
      <div className="px-2 py-2">
        <nav className="space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) => getLinkClass(isActive)}
            title="Início"
          >
            <Home className="h-5 w-5" />
            <span className={getNameClass()}>Início</span>
          </NavLink>
          
          <NavLink
            to="/inventory"
            className={({ isActive }) => getLinkClass(isActive)}
            title="Inventário"
          >
            <LayoutGrid className="h-5 w-5" />
            <span className={getNameClass()}>Inventário</span>
          </NavLink>
          
          <NavLink
            to="/add"
            className={({ isActive }) => getLinkClass(isActive)}
            title="Adicionar Skin"
          >
            <Plus className="h-5 w-5" />
            <span className={getNameClass()}>Adicionar Skin</span>
          </NavLink>
          
          <NavLink
            to="/analytics"
            className={({ isActive }) => getLinkClass(isActive)}
            title="Analytics"
          >
            <LineChart className="h-5 w-5" />
            <span className={getNameClass()}>Analytics</span>
          </NavLink>
          
          <NavLink
            to="/search"
            className={({ isActive }) => getLinkClass(isActive)}
            title="Buscar"
          >
            <Search className="h-5 w-5" />
            <span className={getNameClass()}>Buscar</span>
          </NavLink>
          
          <div className="pt-3">
            <div className="border-t border-sidebar-border/50 my-2" />
          </div>
          
          <NavLink
            to="/settings"
            className={({ isActive }) => getLinkClass(isActive)}
            title="Configurações"
          >
            <Settings className="h-5 w-5" />
            <span className={getNameClass()}>Configurações</span>
          </NavLink>
          
          <NavLink
            to="/more"
            className={({ isActive }) => getLinkClass(isActive)}
            title="Mais"
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className={getNameClass()}>Mais</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
};
