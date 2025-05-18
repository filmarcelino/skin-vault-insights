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
  const { toast: useToastToast } = useToast();
  const currencyUpdater = useCurrencyUpdate();

  console.log("AuthProvider rendering. isLoading:", isLoading, "user:", user?.email);

  useEffect(() => {
    console.log("AuthProvider useEffect running");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, "user:", newSession?.user?.email);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          // Defer profile fetching to avoid potential deadlocks
          setTimeout(() => {
            fetchProfile(newSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Got current session:", currentSession?.user?.email);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      }
      
      setIsLoading(false);
    }).catch(error => {
      console.error("Error getting session:", error);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }
      
      if (data) {
        console.log("Profile fetched:", data);
        setProfile(data as UserProfile);
        
        // Atualizar a moeda preferida do usuário no CurrencyContext
        if (currencyUpdater && data.preferred_currency) {
          const currency = CURRENCIES.find(c => c.code === data.preferred_currency);
          if (currency) {
            currencyUpdater.setCurrency(currency);
          }
        }
      }
    } catch (error) {
      console.error("Exception fetching profile:", error);
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
    
    try {
      const response = await supabase.auth.signInWithPassword({ 
        email, 
        password
      });
      
      if (response.error) {
        toast("Error signing in", {
          description: response.error.message,
        });
        return { error: response.error, data: null };
      } else if (response.data.session) {
        toast("Successfully signed in", {
          description: "Welcome back!"
        });
        return { error: null, data: response.data.session };
      }
      
      return { error: new Error("Unknown error"), data: null };
    } catch (error) {
      console.error("Sign in error:", error);
      toast("Error signing in", {
        description: "An unexpected error occurred. Please try again."
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
        toast("Error creating account", {
          description: authResponse.error.message
        });
        return { error: authResponse.error, data: null };
      } else if (authResponse.data.session) {
        // Create a trial subscription for the new user
        if (authResponse.data.user) {
          await createTrialSubscription(authResponse.data.user.id, data.email);
        }
        
        toast("Account created successfully", {
          description: "Welcome to CS Skin Vault!"
        });
        return { error: null, data: authResponse.data.session };
      }
      
      return { error: new Error("Unknown error"), data: null };
    } catch (error) {
      console.error("Sign up error:", error);
      toast("Error creating account", {
        description: "An unexpected error occurred. Please try again."
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
        toast("Error sending email", {
          description: response.error.message
        });
      } else {
        toast("Email sent", {
          description: "Check your inbox to reset your password."
        });
      }
      
      return response;
    } catch (error) {
      console.error("Reset password error:", error);
      toast("Error resetting password", {
        description: "An unexpected error occurred. Please try again."
      });
      return { error: error as Error, data: null };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error("No user logged in"), data: null };
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
        toast("Error updating profile", {
          description: error.message
        });
        return { error, data: null };
      }
      
      setProfile(updatedProfile as UserProfile);
      toast("Profile updated", {
        description: "Your profile was updated successfully."
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
      toast("Error updating profile", {
        description: "An unexpected error occurred. Please try again."
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
