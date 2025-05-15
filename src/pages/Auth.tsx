
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

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  fullName: z.string().min(3, "Full name is required"),
  email: z.string().email("Invalid email"),
  city: z.string().optional(),
  country: z.string().optional(),
  preferredCurrency: z.enum(["USD", "BRL", "RUB", "CNY", "EUR", "GBP"]),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const Auth = () => {
  const { user, signIn, signUp, resetPassword, isLoading, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.state?.tab === "register" ? "register" : "login"
  );
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log("Auth component rendering. User:", user, "isLoading:", isLoading, "Session:", session ? "Present" : "None");

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
          setAuthError("Email ou senha incorretos. Tente novamente.");
        } else if (error.message.includes("Email not confirmed")) {
          setAuthError("Por favor, confirme seu email antes de entrar.");
        } else {
          setAuthError(error.message);
        }
      } else {
        console.log("Login successful");
        toast.success("Login bem-sucedido", {
          description: "Bem-vindo de volta!"
        });
        
        // Navigate to the intended destination or dashboard
        const destination = location.state?.from || "/dashboard";
        navigate(destination, { replace: true });
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      setAuthError("Ocorreu um erro inesperado. Tente novamente mais tarde.");
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
          setAuthError("Este email já está registrado. Tente fazer login.");
        } else {
          setAuthError(error.message);
        }
      } else {
        console.log("Registration successful");
        toast.success("Conta criada com sucesso", {
          description: "Bem-vindo ao CS Skin Vault!"
        });
        
        // Navigate to dashboard or intended destination
        const destination = location.state?.from || "/dashboard";
        navigate(destination, { replace: true });
      }
    } catch (err) {
      console.error("Unexpected registration error:", err);
      setAuthError("Ocorreu um erro inesperado. Tente novamente mais tarde.");
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
        toast.success("Email de recuperação enviado", {
          description: "Verifique sua caixa de entrada para redefinir sua senha."
        });
        loginForm.setValue("email", data.email);
        setActiveTab("login");
      }
    } catch (err) {
      console.error("Unexpected password reset error:", err);
      setAuthError("Ocorreu um erro inesperado. Tente novamente mais tarde.");
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
              ? "Digite seu email para recuperar sua senha" 
              : activeTab === "login" 
                ? "Entre na sua conta" 
                : "Crie uma nova conta"}
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="seu.email@exemplo.com" {...field} />
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
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting || isLoading}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : "Enviar link de recuperação"}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Cadastro</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="seu.email@exemplo.com" {...field} />
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
                          <FormLabel>Senha</FormLabel>
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
                              Lembrar-me
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
                        Esqueceu a senha?
                      </Button>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : "Entrar"}
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
                            <FormLabel>Nome de usuário</FormLabel>
                            <FormControl>
                              <Input placeholder="username" {...field} />
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
                            <FormLabel>Nome completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome Sobrenome" {...field} />
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="seu.email@exemplo.com" {...field} />
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
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input placeholder="Cidade" {...field} />
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
                            <FormLabel>País</FormLabel>
                            <FormControl>
                              <Input placeholder="País" {...field} />
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
                          <FormLabel>Moeda preferida</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma moeda" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD (Dólar Americano)</SelectItem>
                              <SelectItem value="BRL">BRL (Real Brasileiro)</SelectItem>
                              <SelectItem value="RUB">RUB (Rublo Russo)</SelectItem>
                              <SelectItem value="CNY">CNY (Yuan Chinês)</SelectItem>
                              <SelectItem value="EUR">EUR (Euro)</SelectItem>
                              <SelectItem value="GBP">GBP (Libra Esterlina)</SelectItem>
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
                          <FormLabel>Senha</FormLabel>
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
                          <FormLabel>Confirmar senha</FormLabel>
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
                        Novas contas recebem automaticamente 7 dias de teste Premium!
                      </p>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registrando...
                        </>
                      ) : "Registrar"}
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
