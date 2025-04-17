
import { FC } from "react"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  className?: string;
  variant?: "text-only" | "icon-only" | "default"; // Updated to include the variants needed by sidebar
}

export const Logo: FC<LogoProps> = ({ size = "md", className = "", variant = "text-only" }) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="font-bold text-foreground">CS SKIN</span>
      <span className="font-bold text-primary">VAULT</span>
    </div>
  );
};
