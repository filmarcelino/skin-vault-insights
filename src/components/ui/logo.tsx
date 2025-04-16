
import { FC } from "react"

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Logo: FC<LogoProps> = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        <img src="/logo.svg" alt="CS Skin Vault Logo" className="h-full w-full" />
      </div>
    </div>
  );
};
