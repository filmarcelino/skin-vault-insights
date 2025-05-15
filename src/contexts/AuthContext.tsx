
import React, { createContext, useContext, useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { CURRENCIES } from "@/contexts/CurrencyContext";

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  city?: string;
  country?: string;
  preferred_currency: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signUp: (data: {
    email: string;
    password: string;
    username: string;
    full_name: string;
    city?: string;
    country?: string;
    preferred_currency: string;
  }) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    error: Error | null;
    data: {} | null;
  }>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{
    error: Error | null;
    data: UserProfile | null;
  }>;
  refreshProfile: () => Promise<void>;
}

// Interface to resolve the circular dependency with CurrencyContext
export interface CurrencyUpdater {
  setCurrency: (currency: { code: string; symbol: string; name: string; rate: number }) => void;
}

// Context for currency updates
const CurrencyUpdateContext = createContext<CurrencyUpdater | null>(null);

export const CurrencyUpdateProvider = ({ children, updater }: { children: React.ReactNode; updater: CurrencyUpdater }) => {
  return (
    <CurrencyUpdateContext.Provider value={updater}>
      {children}
    </CurrencyUpdateContext.Provider>
  );
};

export const useCurrencyUpdate = () => {
  const context = useContext(CurrencyUpdateContext);
  return context;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<boolean>(false);
  const { toast: useToastToast } = useToast();
  const currencyUpdater = useCurrencyUpdate();

  console.log("AuthProvider rendering. isLoading:", isLoading, "user:", user?.email);

  // Initialize auth state and set up listeners
  useEffect(() => {
    console.log("AuthProvider useEffect running");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, "user:", newSession?.user?.email);
        
        // Update session and user state
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          // Defer profile fetching to avoid potential deadlocks
          setTimeout(() => {
            fetchProfile(newSession.user.id);
          }, 0);
        } else {
          setProfile(null);
          setProfileError(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Got current session:", currentSession?.user?.email);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        // Initial profile fetch for existing session
        fetchProfile(currentSession.user.id);
      }
      
      setIsLoading(false);
    }).catch(error => {
      console.error("Error getting session:", error);
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Enhanced profile fetching with retry capability
  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      setProfileError(false);
      
      // First, check if profile exists
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching profile:", error);
        setProfileError(true);
        
        // If profile not found, attempt to create one
        if (error.code === "PGRST116") {
          console.log("Profile not found, attempting to create one");
          await createMissingProfile(userId);
          return;
        }
        return;
      }
      
      if (data) {
        console.log("Profile fetched:", data);
        setProfile(data as UserProfile);
        
        // Update preferred currency
        if (currencyUpdater && data.preferred_currency) {
          const currency = CURRENCIES.find(c => c.code === data.preferred_currency);
          if (currency) {
            currencyUpdater.setCurrency(currency);
          }
        }
      } else {
        console.log("No profile data found, attempting to create one");
        await createMissingProfile(userId);
      }
    } catch (error) {
      console.error("Exception in fetchProfile:", error);
      setProfileError(true);
    }
  };

  // Function to create missing profile for existing users
  const createMissingProfile = async (userId: string) => {
    try {
      console.log("Creating missing profile for user:", userId);
      
      // Get user data
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        console.error("Error getting user data:", userError);
        return;
      }
      
      const user = userData.user;
      
      // Create profile with available data
      const profileData = {
        id: userId,
        username: user.user_metadata.username || `user_${userId.substring(0, 8)}`,
        full_name: user.user_metadata.full_name || 'User',
        email: user.email || '',
        city: user.user_metadata.city,
        country: user.user_metadata.country,
        preferred_currency: user.user_metadata.preferred_currency || 'USD',
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData)
        .select()
        .single();
        
      if (error) {
        console.error("Error creating profile:", error);
        toast.error("Falha ao criar perfil", {
          description: "Houve um problema ao configurar seu perfil. Por favor, tente novamente."
        });
        return;
      }
      
      console.log("Profile created successfully:", data);
      setProfile(data as UserProfile);
      toast.success("Perfil recuperado com sucesso", {
        description: "Seu perfil foi restaurado com todas suas informações."
      });
      
      // Update preferred currency
      if (currencyUpdater && data.preferred_currency) {
        const currency = CURRENCIES.find(c => c.code === data.preferred_currency);
        if (currency) {
          currencyUpdater.setCurrency(currency);
        }
      }
      
    } catch (error) {
      console.error("Exception in createMissingProfile:", error);
    }
  };

  const createTrialSubscription = async (userId: string, email: string) => {
    try {
      // Create a 7-day trial
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 7);
      
      const { error } = await supabase
        .from('subscribers')
        .upsert({
          user_id: userId,
          email: email,
          subscribed: true,
          is_trial: true,
          subscription_end: trialEnd.toISOString(),
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        
      if (error) {
        console.error("Error creating trial subscription:", error);
      } else {
        console.log("Trial subscription created successfully", { userId, trialEnd });
      }
    } catch (err) {
      console.error("Exception creating trial subscription:", err);
    }
  };

  const signIn = async (email: string, password: string, rememberMe: boolean) => {
    setIsLoading(true);
    setProfileError(false);
    
    try {
      const response = await supabase.auth.signInWithPassword({ 
        email, 
        password,
        options: {
          // Set proper persistence based on rememberMe flag
          persistSession: rememberMe
        }
      });
      
      if (response.error) {
        console.error("Sign in error:", response.error.message);
        toast("Erro ao fazer login", {
          description: response.error.message,
        });
        return { error: response.error, data: null };
      } else if (response.data.session) {
        toast("Login realizado com sucesso", {
          description: "Bem-vindo de volta!"
        });
        return { error: null, data: response.data.session };
      }
      
      return { error: new Error("Erro desconhecido"), data: null };
    } catch (error) {
      console.error("Sign in error:", error);
      toast("Erro ao fazer login", {
        description: "Ocorreu um erro inesperado. Por favor, tente novamente."
      });
      return { error: error as Error, data: null };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: {
    email: string;
    password: string;
    username: string;
    full_name: string;
    city?: string;
    country?: string;
    preferred_currency: string;
  }) => {
    setIsLoading(true);
    setProfileError(false);
    
    try {
      const authResponse = await supabase.auth.signUp({ 
        email: data.email, 
        password: data.password,
        options: {
          data: {
            username: data.username,
            full_name: data.full_name,
            city: data.city,
            country: data.country,
            preferred_currency: data.preferred_currency
          }
        }
      });
      
      if (authResponse.error) {
        toast("Erro ao criar conta", {
          description: authResponse.error.message
        });
        return { error: authResponse.error, data: null };
      } else if (authResponse.data.session) {
        // Create a trial subscription for the new user
        if (authResponse.data.user) {
          await createTrialSubscription(authResponse.data.user.id, data.email);
          
          // Only populate inventory for teste@teste.com (silently - no notification)
          if (data.email === "teste@teste.com") {
            try {
              const populateResponse = await supabase.functions.invoke('populate-inventory', {
                body: { userId: authResponse.data.user.id }
              });
              
              if (populateResponse.error) {
                console.error("Error populating inventory:", populateResponse.error);
              } else {
                console.log("Inventory successfully populated:", populateResponse.data);
              }
            } catch (populateError) {
              console.error("Exception populating inventory:", populateError);
            }
          }
        }
        
        toast("Conta criada com sucesso", {
          description: "Bem-vindo ao CS Skin Vault!"
        });
        return { error: null, data: authResponse.data.session };
      }
      
      return { error: new Error("Erro desconhecido"), data: null };
    } catch (error) {
      console.error("Sign up error:", error);
      toast("Erro ao criar conta", {
        description: "Ocorreu um erro inesperado. Por favor, tente novamente."
      });
      return { error: error as Error, data: null };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    
    try {
      await supabase.auth.signOut();
      setProfile(null);
      setProfileError(false);
      toast("Logout realizado", {
        description: "Você saiu da sua conta com sucesso."
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast("Erro ao sair", {
        description: "Ocorreu um erro ao tentar sair. Tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    
    try {
      const response = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (response.error) {
        toast("Erro ao enviar email", {
          description: response.error.message
        });
      } else {
        toast("Email enviado", {
          description: "Verifique sua caixa de entrada para redefinir sua senha."
        });
      }
      
      return response;
    } catch (error) {
      console.error("Reset password error:", error);
      toast("Erro ao redefinir senha", {
        description: "Ocorreu um erro inesperado. Por favor, tente novamente."
      });
      return { error: error as Error, data: null };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error("Nenhum usuário logado"), data: null };
    }
    
    setIsLoading(true);
    
    try {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)
        .select()
        .single();
        
      if (error) {
        toast("Erro ao atualizar perfil", {
          description: error.message
        });
        return { error, data: null };
      }
      
      setProfile(updatedProfile as UserProfile);
      toast("Perfil atualizado", {
        description: "Seu perfil foi atualizado com sucesso."
      });
      
      // Atualizar a moeda preferida se foi alterada
      if (data.preferred_currency && currencyUpdater) {
        const currency = CURRENCIES.find(c => c.code === data.preferred_currency);
        if (currency) {
          currencyUpdater.setCurrency(currency);
        }
      }
      
      return { error: null, data: updatedProfile as UserProfile };
    } catch (error) {
      console.error("Update profile error:", error);
      toast("Erro ao atualizar perfil", {
        description: "Ocorreu um erro inesperado. Por favor, tente novamente."
      });
      return { error: error as Error, data: null };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isLoading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updateProfile,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
