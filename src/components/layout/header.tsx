
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useLanguage } from "@/contexts/LanguageContext";
import { LogOut, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";

export function Header() {
  const { user, signOut, session, profile } = useAuth();
  const { isSubscribed, isTrial, trialDaysRemaining } = useSubscription();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      toast.success(t("auth.logout_success"), {
        description: t("auth.logout_success_description")
      });
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(t("auth.logout_error"), {
        description: t("auth.logout_error_description")
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogin = () => {
    navigate("/auth");
  };
  
  const userName = profile?.username || user?.email?.split('@')[0] || '';

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo variant="image-and-text" size="md" />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            {user && session ? (
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

                {/* User info with name */}
                <div className="hidden sm:flex items-center gap-2 mr-2">
                  <span className="text-sm font-medium">{userName}</span>
                </div>
                
                <Link to="/profile">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url || undefined} />
                    <AvatarFallback>
                      {userName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="hidden sm:flex"
                  title={t("auth.logout")}
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  <span className="sr-only">{t("auth.logout")}</span>
                </Button>
              </>
            ) : (
              <Button variant="secondary" onClick={handleLogin}>
                {t("auth.login")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
