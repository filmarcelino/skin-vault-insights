
import { FC } from "react"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  className?: string;
  variant?: "text-only" | "icon-only" | "default";
}

export const Logo: FC<LogoProps> = ({ size = "md", className = "", variant = "text-only" }) => {
  // Size mappings
  const sizeClasses = {
    "sm": "text-sm",
    "md": "text-md",
    "lg": "text-lg",
    "xl": "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl"
  };
  
  return (
    <div className={`flex items-center gap-1 ${sizeClasses[size]} ${className} cursor-pointer transition-all hover:opacity-80`}>
      <span className="font-bold text-[#F0F0F0]">CS SKIN</span>
      <span className="font-bold text-[#FFCC00]">VAULT</span>
      
      {variant === "icon-only" && (
        <svg className="w-6 h-6 ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 7L13 3L5 7L13 11L21 7ZM21 7V17L13 21M5 7V17L13 21" stroke="#FFCC00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );
};
