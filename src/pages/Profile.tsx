
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, UserRound } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

// Define a simple interface for profile updates
interface ProfileUpdate {
  id: string;
  full_name?: string;
  username?: string;
  city?: string;
  country?: string;
  preferred_currency?: string;
}

export default function Profile() {
  const { user, profile } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const { t, language, setLanguage } = useLanguage();
  
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [preferredCurrency, setPreferredCurrency] = useState("USD");
  
  // Define supported currencies
  const supportedCurrencies = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
    { code: "BRL", name: "Brazilian Real" }
  ];
  
  // Load profile data when component mounts
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setUsername(profile.username || "");
      setCity(profile.city || "");
      setCountry(profile.country || "");
      setPreferredCurrency(profile.preferred_currency || "USD");
    }
  }, [profile]);

  // Function to update user profile
  const updateUserProfile = async (profileData: ProfileUpdate) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', profileData.id);
        
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, error };
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error(t("auth.login_required"));
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update profile in database
      const result = await updateUserProfile({
        id: user.id,
        full_name: fullName,
        username,
        city,
        country,
        preferred_currency: preferredCurrency,
      });
      
      if (!result.success) {
        throw new Error("Failed to update profile");
      }
      
      // Also update currency in app state
      setCurrency(preferredCurrency);
      
      toast.success(t("profile.saved"));
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(t("profile.save_error"));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    toast.success(t("settings.language_changed"));
  };
  
  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t("profile.title")}</h1>
      
      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.account")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={profile.avatar_url || ""} />
              <AvatarFallback>
                <UserRound className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            <h3 className="font-medium text-lg">{profile.full_name}</h3>
            <p className="text-muted-foreground">{profile.username}</p>
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            <div className="w-full border-t my-4" />
            <div className="w-full text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t("profile.email")}</span>
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("profile.member_since")}</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <form onSubmit={handleSaveProfile}>
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.edit")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">{t("profile.full_name")}</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t("profile.enter_full_name")}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="username">{t("profile.username")}</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t("profile.enter_username")}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">{t("profile.city")}</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={t("profile.enter_city")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country">{t("profile.country")}</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder={t("profile.enter_country")}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="currency">{t("profile.preferred_currency")}</Label>
                <Select value={preferredCurrency} onValueChange={setPreferredCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("profile.select_currency")} />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedCurrencies.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.code} - {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="language">{t("profile.language")}</Label>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("profile.select_language")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("common.saving")}
                  </>
                ) : (
                  t("common.save")
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
