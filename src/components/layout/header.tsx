
import { FC } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/logo";
import { ArrowRight } from "lucide-react";

export const Header: FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <div className="flex flex-col items-start">
            <div className="text-xl font-bold text-foreground">
              <span className="cs-gradient-text">CS</span> Skin Vault
            </div>
            <div className="text-xs text-muted-foreground">Clutch Studio's</div>
          </div>
        </div>
        
        <Link 
          to="#" 
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Clutch Studio's <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </header>
  );
};
