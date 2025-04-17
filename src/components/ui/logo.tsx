
import { FC } from "react"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  className?: string;
  variant?: "default" | "compact" | "text-only";
}

export const Logo: FC<LogoProps> = ({ size = "md", className = "", variant = "default" }) => {
  const sizeClasses = {
    sm: "h-12",
    md: "h-16",
    lg: "h-24",
    xl: "h-32",
    "2xl": "h-48",
    "3xl": "h-64",
    "4xl": "h-80",
  };

  // Para o logo apenas texto, mostramos apenas o texto "CS SKIN VAULT"
  if (variant === "text-only") {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <span className="font-bold text-foreground">CS SKIN</span>
        <span className="font-bold text-primary">VAULT</span>
      </div>
    );
  }

  // Para o logo compacto, mostramos apenas o símbolo do logo
  if (variant === "compact") {
    return (
      <div className={`flex items-center ${className}`}>
        <img 
          src="/logo.png" 
          alt="CS Skin Vault Logo" 
          className={`${sizeClasses[size]} w-auto`} 
          style={{ objectFit: 'contain', objectPosition: 'left' }} 
        />
      </div>
    );
  }

  // Logo completo (default)
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src="/logo.png" 
        alt="CS Skin Vault Logo" 
        className={`${sizeClasses[size]} w-auto`} 
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
};
