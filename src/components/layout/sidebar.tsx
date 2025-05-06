
import {
  BarChart3,
  Briefcase,
  LayoutDashboard,
  List,
  Search,
  Settings,
  User,
  Plus,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const sidebarItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      variant: "default",
    },
    {
      title: "Inventário",
      icon: Briefcase,
      href: "/inventory",
      variant: "ghost",
    },
    {
      title: "Buscar",
      icon: Search,
      href: "/search",
      variant: "ghost",
    },
    {
      title: "Análise",
      icon: BarChart3,
      href: "/analytics",
      variant: "ghost",
    },
    {
      title: "Adicionar Skin",
      icon: Plus,
      href: "/add",
      variant: "ghost",
    },
    {
      title: "Perfil",
      icon: User,
      href: "/profile",
      variant: "ghost",
    },
    {
      title: "Configurações",
      icon: Settings,
      href: "/settings",
      variant: "ghost",
    },
  ];

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {sidebarItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary/50",
              isActive
                ? "bg-secondary/50 text-foreground"
                : "text-muted-foreground",
              item.variant === "default" && "bg-secondary/50 text-foreground"
            )
          }
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </NavLink>
      ))}
    </div>
  );
}
