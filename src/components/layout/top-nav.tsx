
import { FC } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const TopNav: FC = () => {
  const { user } = useAuth();

  return (
    <div className="bg-card border-b sticky top-16 z-30">
      <div className="container mx-auto flex items-center overflow-x-auto">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? "border-primary text-primary"
                : "border-transparent hover:border-primary/30 hover:text-primary/80"
            }`
          }
        >
          Início
        </NavLink>
        
        <NavLink
          to="/learn"
          className={({ isActive }) =>
            `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? "border-primary text-primary"
                : "border-transparent hover:border-primary/30 hover:text-primary/80"
            }`
          }
        >
          Aprenda
        </NavLink>
        
        {user && (
          <>
            <NavLink
              to="/inventory"
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent hover:border-primary/30 hover:text-primary/80"
                }`
              }
            >
              Inventário
            </NavLink>
            
            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent hover:border-primary/30 hover:text-primary/80"
                }`
              }
            >
              Análise
            </NavLink>
            
            <NavLink
              to="/add-skin"
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent hover:border-primary/30 hover:text-primary/80"
                }`
              }
            >
              Adicionar Skin
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
};
