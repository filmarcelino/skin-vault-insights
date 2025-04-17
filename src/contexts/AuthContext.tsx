import React, { createContext, useContext, useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast: useToastToast } = useToast();

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
      console.log("Unsubscribing from auth state changes");
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
      }
    } catch (error) {
      console.error("Exception fetching profile:", error);
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
        toast({
          title: "Erro ao fazer login",
          description: response.error.message,
          variant: "destructive"
        });
        return { error: response.error, data: null };
      } else if (response.data.session) {
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo de volta!"
        });
        return { error: null, data: response.data.session };
      }
      
      return { error: new Error("Erro desconhecido"), data: null };
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Erro ao fazer login",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
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
        toast({
          title: "Erro ao criar conta",
          description: authResponse.error.message,
          variant: "destructive"
        });
        return { error: authResponse.error, data: null };
      } else if (authResponse.data.session) {
        toast({
          title: "Conta criada com sucesso",
          description: "Bem-vindo ao CS Skin Vault!"
        });
        return { error: null, data: authResponse.data.session };
      }
      
      return { error: new Error("Erro desconhecido"), data: null };
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Erro ao criar conta",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
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
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta com sucesso."
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Erro ao sair",
        description: "Ocorreu um erro ao tentar sair. Tente novamente.",
        variant: "destructive"
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
        toast({
          title: "Erro ao enviar e-mail",
          description: response.error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "E-mail enviado",
          description: "Verifique sua caixa de entrada para redefinir sua senha."
        });
      }
      
      return response;
    } catch (error) {
      console.error("Reset password error:", error);
      toast({
        title: "Erro ao redefinir senha",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
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
        toast({
          title: "Erro ao atualizar perfil",
          description: error.message,
          variant: "destructive"
        });
        return { error, data: null };
      }
      
      setProfile(updatedProfile as UserProfile);
      toast({
        title: "Perfil atualizado",
        description: "Seu perfil foi atualizado com sucesso."
      });
      
      return { error: null, data: updatedProfile as UserProfile };
    } catch (error) {
      console.error("Update profile error:", error);
      toast({
        title: "Erro ao atualizar perfil",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
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
