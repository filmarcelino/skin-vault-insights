
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/auth";

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const { currencies, currency, setCurrency } = useCurrency();
  const { t, language, setLanguage, languages } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Profile form state
  const [formState, setFormState] = useState({
    fullName: "",
    username: "",
    currency: "",
    language: ""
  });
  
  // Initialize form with user data
  useEffect(() => {
    if (user && profile) {
      setFormState({
        fullName: profile.full_name || "",
        username: profile.username || "",
        currency: profile.preferred_currency || "USD",
        language: language
      });
    }
  }, [user, profile, language]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleUpdateProfile = async () => {
    if (!user || !profile) return;
    
    try {
      setIsUpdating(true);
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formState.username,
          full_name: formState.fullName,
          preferred_currency: formState.currency,
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update language context
      setLanguage(formState.language as "en" | "pt" | "es");
      
      // Update currency context
      setCurrency(formState.currency);
      
      toast.success(t("profile.updateSuccess"));
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(t("profile.updateError"));
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (!user || !profile) {
    return <div>{t("common.loading")}</div>;
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t("profile.title")}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto">
              <AvatarImage src={profile.avatar_url || ""} />
              <AvatarFallback>{profile.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <CardTitle className="mt-4">{profile.full_name}</CardTitle>
            <CardDescription>{profile.username || user.email}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => signOut()}
            >
              {t("auth.logout")}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Edit Profile Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("profile.editProfile")}</CardTitle>
            <CardDescription>{t("profile.editProfileDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">{t("profile.fullName")}</Label>
              <Input 
                id="fullName" 
                name="fullName"
                value={formState.fullName} 
                onChange={handleInputChange}
                placeholder={t("profile.fullNamePlaceholder")}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="username">{t("profile.username")}</Label>
              <Input 
                id="username" 
                name="username"
                value={formState.username} 
                onChange={handleInputChange}
                placeholder={t("profile.usernamePlaceholder")}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="currency">{t("profile.currency")}</Label>
              <Select 
                value={formState.currency} 
                onValueChange={(value) => setFormState(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("profile.selectCurrency")} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(currencies).map(([code, currencyInfo]) => (
                    <SelectItem key={code} value={code}>
                      {currencyInfo.symbol} {code} - {currencyInfo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="language">{t("profile.language")}</Label>
              <Select 
                value={formState.language} 
                onValueChange={(value) => setFormState(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("profile.selectLanguage")} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(languages).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleUpdateProfile} 
              disabled={isUpdating}
            >
              {isUpdating ? t("common.updating") : t("common.saveChanges")}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
