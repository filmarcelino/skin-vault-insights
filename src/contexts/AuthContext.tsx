import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CURRENCIES } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";

// Debug flag - set to true for detailed console logs
const DEBUG_AUTH = true;

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
  inventory_populated?: boolean;
  is_admin?: boolean;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAuthLoading: boolean;
  isProfileLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  authStatus: AuthStatus;
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

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<boolean>(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const currencyUpdater = useCurrencyUpdate();
  const { t } = useLanguage();

  const logDebug = useCallback((...args: any[]) => {
    if (DEBUG_AUTH) {
      console.log(...args);
    }
  }, []);

  const isAuthenticated = Boolean(user && session);
  const isAdmin = Boolean(profile?.is_admin || (profile?.email === 'luisfelipemarcelino33@gmail.com'));

  logDebug("AuthProvider rendering. isAuthLoading:", isAuthLoading, "user:", user?.email);

  // Fetch profile function with memoization to prevent recreation on each render
  const fetchProfile = useCallback(async (userId: string) => {
    if (!userId) {
      logDebug("fetchProfile called with no userId");
      return;
    }
    
    try {
      logDebug("Fetching profile for user:", userId);
      setIsProfileLoading(true);
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
          logDebug("Profile not found, attempting to create one");
          await createMissingProfile(userId);
        }
        
        setIsProfileLoading(false);
        return;
      }
      
      if (data) {
        logDebug("Profile fetched:", data);
        setProfile(data as UserProfile);
        
        // Update preferred currency
        if (currencyUpdater && data.preferred_currency) {
          const currency = CURRENCIES.find(c => c.code === data.preferred_currency);
          if (currency) {
            currencyUpdater.setCurrency(currency);
          }
        }
      } else {
        logDebug("No profile data found, attempting to create one");
        await createMissingProfile(userId);
      }
    } catch (error) {
      console.error("Exception in fetchProfile:", error);
      setProfileError(true);
    } finally {
      setIsProfileLoading(false);
      logDebug("Profile loaded");
    }
  }, [currencyUpdater, logDebug]);

  // Create missing profile function with memoization
  const createMissingProfile = useCallback(async (userId: string) => {
    try {
      logDebug("Creating missing profile for user:", userId);
      
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
        toast.error(t("auth.profile_create_error"), {
          description: t("auth.profile_create_error_description")
        });
        return;
      }
      
      logDebug("Profile created successfully:", data);
      setProfile(data as UserProfile);
      toast.success(t("auth.profile_recovered"), {
        description: t("auth.profile_recovered_description")
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
  }, [currencyUpdater, t, logDebug]);

  const createTrialSubscription = useCallback(async (userId: string, email: string) => {
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
        logDebug("Trial subscription created successfully", { userId, trialEnd });
      }
    } catch (err) {
      console.error("Exception creating trial subscription:", err);
    }
  }, [logDebug]);

  // Initialize auth state and set up listeners
  useEffect(() => {
    logDebug("AuthProvider useEffect running (main auth initialization)");
    
    // Set up auth state listener FIRST to prevent missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        logDebug("Auth state changed:", event, "user:", newSession?.user?.email);
        
        // Update session and user state
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Don't fetch profile synchronously in the callback to avoid deadlocks
        if (newSession?.user) {
          // Prevent deadlock by using setTimeout
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
      logDebug("Got current session:", currentSession?.user?.email);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        // Initial profile fetch for existing session
        fetchProfile(currentSession.user.id);
      } else {
        setIsAuthLoading(false);
        setAuthStatus('unauthenticated');
      }
    }).catch(error => {
      console.error("Error getting session:", error);
      setIsAuthLoading(false);
      setAuthStatus('unauthenticated');
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
      logDebug("Auth event subscription unsubscribed");
    };
  }, []); // Empty dependencies to run only once

  // Update isAuthLoading when we have both user and profile data
  useEffect(() => {
    // If we have a user but are still loading the profile, keep isAuthLoading true
    if (user && isProfileLoading) {
      return;
    }
    
    // Otherwise we've finished loading auth
    setIsAuthLoading(false);
    
    // Update authStatus based on authentication state
    setAuthStatus(isAuthenticated ? 'authenticated' : 'unauthenticated');
    
    if (isAuthenticated) {
      logDebug("Auth loaded", { user: user?.email, isAdmin });
    }
  }, [user, isProfileLoading, isAuthenticated, isAdmin, logDebug]);

  const signIn = async (email: string, password: string, rememberMe: boolean) => {
    setIsAuthLoading(true);
    setProfileError(false);
    
    try {
      // Using the correct authentication method
      const response = await supabase.auth.signInWithPassword({ 
        email, 
        password
      });
      
      // Handle localStorage session persistence based on rememberMe flag
      if (response.data.session && rememberMe) {
        // Store session in localStorage if rememberMe is true
        localStorage.setItem('supabase-auth', JSON.stringify({
          timestamp: new Date().toISOString(),
          session: response.data.session
        }));
      }
      
      if (response.error) {
        console.error("Sign in error:", response.error.message);
        toast(t("auth.login_error"), {
          description: response.error.message,
        });
        return { error: response.error, data: null };
      } else if (response.data.session) {
        toast(t("auth.login_success"), {
          description: t("auth.welcome_back")
        });
        return { error: null, data: response.data.session };
      }
      
      return { error: new Error(t("auth.unknown_error")), data: null };
    } catch (error) {
      console.error("Sign in error:", error);
      toast(t("auth.login_error"), {
        description: t("auth.unexpected_error")
      });
      return { error: error as Error, data: null };
    } finally {
      // Auth loading state will be updated by the auth state change listener
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
    setIsAuthLoading(true);
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
        toast(t("auth.signup_error"), {
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
                logDebug("Inventory successfully populated:", populateResponse.data);
              }
            } catch (populateError) {
              console.error("Exception populating inventory:", populateError);
            }
          }
        }
        
        toast(t("auth.signup_success"), {
          description: t("auth.welcome_message")
        });
        return { error: null, data: authResponse.data.session };
      }
      
      return { error: new Error(t("auth.unknown_error")), data: null };
    } catch (error) {
      console.error("Sign up error:", error);
      toast(t("auth.signup_error"), {
        description: t("auth.unexpected_error")
      });
      return { error: error as Error, data: null };
    } finally {
      // Auth loading state will be updated by the auth state change listener
    }
  };

  const signOut = async () => {
    setIsAuthLoading(true);
    
    try {
      await supabase.auth.signOut();
      setProfile(null);
      setProfileError(false);
      toast(t("auth.logout_success"), {
        description: t("auth.logout_success_description")
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast(t("auth.logout_error"), {
        description: t("auth.logout_error_description")
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsAuthLoading(true);
    
    try {
      const response = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (response.error) {
        toast(t("auth.reset_email_error"), {
          description: response.error.message
        });
      } else {
        toast(t("auth.reset_email_sent"), {
          description: t("auth.reset_email_check_inbox")
        });
      }
      
      return response;
    } catch (error) {
      console.error("Reset password error:", error);
      toast(t("auth.reset_password_error"), {
        description: t("auth.unexpected_error")
      });
      return { error: error as Error, data: null };
    } finally {
      setIsAuthLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error(t("auth.no_user_logged_in")), data: null };
    }
    
    setIsProfileLoading(true);
    
    try {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)
        .select()
        .single();
        
      if (error) {
        toast(t("auth.profile_update_error"), {
          description: error.message
        });
        return { error, data: null };
      }
      
      setProfile(updatedProfile as UserProfile);
      toast(t("auth.profile_updated"), {
        description: t("auth.profile_updated_success")
      });
      
      // Update preferred currency if changed
      if (data.preferred_currency && currencyUpdater) {
        const currency = CURRENCIES.find(c => c.code === data.preferred_currency);
        if (currency) {
          currencyUpdater.setCurrency(currency);
        }
      }
      
      return { error: null, data: updatedProfile as UserProfile };
    } catch (error) {
      console.error("Update profile error:", error);
      toast(t("auth.profile_update_error"), {
        description: t("auth.unexpected_error")
      });
      return { error: error as Error, data: null };
    } finally {
      setIsProfileLoading(false);
    }
  };

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  const contextValue: AuthState = {
    user,
    session,
    profile,
    isAuthLoading,
    isProfileLoading,
    isAuthenticated,
    isAdmin,
    authStatus,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
