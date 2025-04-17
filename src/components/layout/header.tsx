
import { FC } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/logo";
import { ArrowRight, User, LogOut, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CurrencySelector } from "@/components/ui/currency-selector";

export const Header: FC = () => {
  const { user, profile, signOut } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  const userInitials = profile ? getInitials(profile.username || profile.full_name) : "U";
  const displayName = profile?.username || profile?.full_name || user?.email || "User";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-2 md:ml-16">
          <Logo size="sm" variant="text-only" className="hidden md:block" />
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          <CurrencySelector />
          
          {user && (
            <Button variant="ghost" size="sm" asChild className="hidden md:flex items-center gap-1">
              <Link to="/subscription" className="text-primary">
                <Crown className="h-4 w-4 mr-1" />
                <span>Premium</span>
              </Link>
            </Button>
          )}
          
          <Link 
            to="https://clutch.studio" 
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Clutch Studio's <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-popover border-border" align="end" forceMount>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/subscription" className="cursor-pointer w-full">
                    <Crown className="mr-2 h-4 w-4" />
                    <span>Premium Subscription</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
