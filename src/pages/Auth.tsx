
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/ui/logo";
import { toast } from "sonner";
import { CURRENCIES } from "@/contexts/CurrencyContext";
import { AlertCircle, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Auth = () => {
  const { user, signIn, signUp, resetPassword, isLoading, session } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.state?.tab === "register" ? "register" : "login"
  );
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log("Auth component rendering. User:", user, "isLoading:", isLoading, "Session:", session ? "Present" : "None");
  
  // Define form schemas with translations
  const loginSchema = z.object({
    email: z.string().email(t("validation.invalid_email")),
    password: z.string().min(6, t("validation.password_min_length")),
    rememberMe: z.boolean().default(false),
  });

  const registerSchema = z.object({
    username: z.string().min(3, t("validation.username_min_length")),
    fullName: z.string().min(3, t("validation.full_name_required")),
    email: z.string().email(t("validation.invalid_email")),
    city: z.string().optional(),
    country: z.string().optional(),
    preferredCurrency: z.enum(["USD", "BRL", "RUB", "CNY", "EUR", "GBP"]),
    password: z.string().min(6, t("validation.password_min_length")),
    confirmPassword: z.string().min(6, t("validation.password_min_length")),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("validation.passwords_dont_match"),
    path: ["confirmPassword"],
  });

  const resetPasswordSchema = z.object({
    email: z.string().email(t("validation.invalid_email")),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;
  type RegisterFormValues = z.infer<typeof registerSchema>;
  type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

  // Initialize forms
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true, // Default to remember me for better UX
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      city: "",
      country: "",
      preferredCurrency: "USD",
      password: "",
      confirmPassword: "",
    },
  });

  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    console.log("Auth useEffect triggered. User:", user);
    
    // Check if user is already authenticated
    if (user && session) {
      console.log("User is authenticated, navigating to dashboard");
      
      // Get the intended destination or fallback to dashboard
      const destination = location.state?.from || "/dashboard";
      navigate(destination);
    }
  }, [user, session, navigate, location.state?.from]);

  const handleLoginSubmit = async (data: LoginFormValues) => {
    console.log("Login attempt with:", data.email);
    setAuthError(null);
    setIsSubmitting(true);
    
    try {
      const { error } = await signIn(data.email, data.password, data.rememberMe);
      
      if (error) {
        console.error("Login error:", error);
        
        // Handle common error cases with friendly messages
        if (error.message.includes("Invalid login credentials")) {
          setAuthError(t("auth.invalid_credentials"));
        } else if (error.message.includes("Email not confirmed")) {
          setAuthError(t("auth.email_not_confirmed"));
        } else {
          setAuthError(error.message);
        }
      } else {
        console.log("Login successful");
        toast.success(t("auth.login_success"), {
          description: t("auth.welcome_back")
        });
        
        // Navigate to the intended destination or dashboard
        const destination = location.state?.from || "/dashboard";
        navigate(destination, { replace: true });
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      setAuthError(t("auth.unexpected_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (data: RegisterFormValues) => {
    console.log("Register attempt with:", data.email);
    setAuthError(null);
    setIsSubmitting(true);
    
    try {
      const { error } = await signUp({
        email: data.email,
        password: data.password,
        username: data.username,
        full_name: data.fullName,
        city: data.city,
        country: data.country,
        preferred_currency: data.preferredCurrency,
      });
      
      if (error) {
        console.error("Registration error:", error);
        
        // Handle common error cases with friendly messages
        if (error.message.includes("User already registered")) {
          setAuthError(t("auth.user_already_registered"));
        } else {
          setAuthError(error.message);
        }
      } else {
        console.log("Registration successful");
        toast.success(t("auth.signup_success"), {
          description: t("auth.welcome_message")
        });
        
        // Navigate to dashboard or intended destination
        const destination = location.state?.from || "/dashboard";
        navigate(destination, { replace: true });
      }
    } catch (err) {
      console.error("Unexpected registration error:", err);
      setAuthError(t("auth.unexpected_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (data: ResetPasswordFormValues) => {
    console.log("Password reset attempt for:", data.email);
    setAuthError(null);
    setIsSubmitting(true);
    
    try {
      const { error } = await resetPassword(data.email);
      
      if (error) {
        console.error("Password reset error:", error);
        setAuthError(error.message);
      } else {
        setShowResetPassword(false);
        toast.success(t("auth.reset_email_sent"), {
          description: t("auth.reset_email_check_inbox")
        });
        loginForm.setValue("email", data.email);
        setActiveTab("login");
      }
    } catch (err) {
      console.error("Unexpected password reset error:", err);
      setAuthError(t("auth.unexpected_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo size="md" />
          </div>
          <CardTitle className="text-2xl font-bold">
            <span className="cs-gradient-text">CS</span> Skin Vault
          </CardTitle>
          <CardDescription>
            {showResetPassword 
              ? t("auth.enter_email_recover") 
              : activeTab === "login" 
                ? t("auth.login_to_account") 
                : t("auth.create_new_account")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Display auth error if present */}
          {authError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-800 dark:text-red-300 p-3 rounded-md mb-4 flex items-start gap-2">
              <AlertCircle className="h-5 w-4 mt-0.5 flex-shrink-0" />
              <p>{authError}</p>
            </div>
          )}
          
          {showResetPassword ? (
            <Form {...resetPasswordForm}>
              <form onSubmit={resetPasswordForm.handleSubmit(handleResetPasswordSubmit)} className="space-y-4">
                <FormField
                  control={resetPasswordForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.email")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("auth.email_placeholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 justify-end mt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowResetPassword(false)}
                    disabled={isSubmitting}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit" disabled={isSubmitting || isLoading}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("auth.sending")}
                      </>
                    ) : t("auth.send_recovery_link")}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
                <TabsTrigger value="register">{t("auth.register")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("auth.email")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("auth.email_placeholder")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("auth.password")}</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="******" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center justify-between">
                      <FormField
                        control={loginForm.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                                id="rememberMe"
                              />
                            </FormControl>
                            <Label
                              htmlFor="rememberMe"
                              className="text-sm font-medium cursor-pointer"
                            >
                              {t("auth.remember_me")}
                            </Label>
                          </FormItem>
                        )}
                      />
                      
                      <Button
                        type="button"
                        variant="link"
                        className="text-sm"
                        onClick={() => setShowResetPassword(true)}
                        disabled={isSubmitting}
                      >
                        {t("auth.forgot_password")}
                      </Button>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("auth.logging_in")}
                        </>
                      ) : t("auth.login")}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("auth.username")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("auth.username_placeholder")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("auth.full_name")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("auth.full_name_placeholder")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("auth.email")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("auth.email_placeholder")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("auth.city")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("auth.city_placeholder")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("auth.country")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("auth.country_placeholder")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={registerForm.control}
                      name="preferredCurrency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("auth.preferred_currency")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("auth.select_currency")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD ({t("currencies.usd")})</SelectItem>
                              <SelectItem value="BRL">BRL ({t("currencies.brl")})</SelectItem>
                              <SelectItem value="RUB">RUB ({t("currencies.rub")})</SelectItem>
                              <SelectItem value="CNY">CNY ({t("currencies.cny")})</SelectItem>
                              <SelectItem value="EUR">EUR ({t("currencies.eur")})</SelectItem>
                              <SelectItem value="GBP">GBP ({t("currencies.gbp")})</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("auth.password")}</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="******" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("auth.confirm_password")}</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="******" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-3 text-sm text-blue-800 dark:text-blue-300">
                      <p className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                        {t("auth.trial_notice")}
                      </p>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("auth.registering")}
                        </>
                      ) : t("auth.register")}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
