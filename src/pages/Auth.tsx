
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/login-form";
import { SignUpForm } from "@/components/auth/signup-form";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/ui/logo";
import { Loading } from "@/components/ui/loading";
import { useLanguage } from "@/contexts/LanguageContext";

const Auth = () => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, session, authStatus } = useAuth();
  const { t } = useLanguage();
  
  // Check if there's a referrer in the URL
  const from = location.state?.from || "/dashboard";
  
  // Log auth state for debugging
  console.log("Auth page - auth state:", { 
    isAuthenticated, 
    authStatus,
    hasUser: !!user, 
    hasSession: !!session, 
    from 
  });
  
  // Handle redirection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("Auth page - user authenticated, redirecting to:", from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);
  
  // Show loading while auth status is being determined
  if (authStatus === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading size="lg" className="text-primary" />
        <span className="ml-2 text-muted-foreground">{t("auth.checkingStatus")}</span>
      </div>
    );
  }
  
  // If user is already authenticated but redirection hasn't happened yet
  if (isAuthenticated && user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading size="lg" className="text-primary" />
        <span className="ml-2 text-muted-foreground">{t("auth.redirecting")}</span>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center items-center">
          <Logo className="h-12 w-12 mb-2" />
          <h1 className="text-2xl font-semibold tracking-tight">
            {activeTab === "login" ? t("auth.welcomeBack") : t("auth.createAccount")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {activeTab === "login"
              ? t("auth.enterCredentialsLogin")
              : t("auth.enterCredentialsSignup")}
          </p>
        </div>

        <div className="grid gap-6">
          <Tabs 
            defaultValue="login" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
              <TabsTrigger value="register">{t("auth.register")}</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm redirectTo={from} />
            </TabsContent>
            <TabsContent value="register">
              <SignUpForm redirectTo={from} />
            </TabsContent>
          </Tabs>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {activeTab === "login" ? t("auth.orContinue") : t("auth.orRegister")}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            {/* Social login buttons would go here */}
          </div>
        </div>
        
        <p className="px-8 text-center text-sm text-muted-foreground">
          {t("auth.byClicking")}{" "}
          <a href="/terms" className="underline underline-offset-4 hover:text-primary">
            {t("auth.terms")}
          </a>{" "}
          {t("auth.and")}{" "}
          <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
            {t("auth.privacy")}
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default Auth;
