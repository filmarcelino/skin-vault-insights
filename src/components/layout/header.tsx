
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { MobileNav } from "@/components/ui/mobile-nav";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useLanguage } from "@/contexts/LanguageContext";
import { Bell, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export function Header() {
  const { user, signOut } = useAuth();
  const { isSubscribed, isTrial, trialDaysRemaining } = useSubscription();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };
  
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo variant="image-and-text" size="md" />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            {user ? (
              <>
                {/* Subscription Badge */}
                {isSubscribed && (
                  <span className="hidden sm:inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-500/20 text-green-500 border-green-500/20">
                    {t("subscription.premium")}
                  </span>
                )}
                {isTrial && (
                  <span className="hidden sm:inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-500/20 text-blue-500 border-blue-500/20">
                    {t("subscription.trial")}: {trialDaysRemaining} {t("subscription.days")}
                  </span>
                )}
                <Link to="/profile">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url || undefined} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="hidden sm:flex"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Logout</span>
                </Button>
              </>
            ) : (
              <Button variant="secondary" onClick={() => navigate("/auth")}>
                {t("auth.login")}
              </Button>
            )}
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
