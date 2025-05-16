
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from 'sonner';
import { CURRENCIES } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { User } from '@/types/auth';
import { supabase } from "@/integrations/supabase/client";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { isSubscribed, isTrial, subscriptionEnd } = useSubscription();
  const { currency, setCurrency } = useCurrency();
  const { t, setLanguage, language } = useLanguage();
  
  const [profile, setProfile] = useState({
    full_name: '',
    username: '',
    email: '',
    city: '',
    country: '',
    preferred_currency: currency.code
  });
  
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Fetch user profile data
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setProfile({
            full_name: data.full_name || '',
            username: data.username || '',
            email: data.email || '',
            city: data.city || '',
            country: data.country || '',
            preferred_currency: data.preferred_currency || currency.code
          });
          
          // Update currency context if it's different
          if (data.preferred_currency && data.preferred_currency !== currency.code) {
            const currencyObj = CURRENCIES.find(c => c.code === data.preferred_currency);
            if (currencyObj) {
              setCurrency(currencyObj);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error(t('errors.profileLoadFailed'));
      }
    };
    
    fetchProfile();
  }, [user, currency.code, setCurrency, t]);
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          username: profile.username,
          city: profile.city,
          country: profile.country,
          preferred_currency: profile.preferred_currency,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update currency if changed
      if (profile.preferred_currency !== currency.code) {
        const newCurrency = CURRENCIES.find(c => c.code === profile.preferred_currency);
        if (newCurrency) {
          setCurrency(newCurrency);
        }
      }
      
      toast.success(t('profile.updateSuccess'));
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('errors.profileUpdateFailed'));
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error(t('errors.logoutFailed'));
    }
  };
  
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };
  
  const handleCurrencyChange = (value: string) => {
    setProfile({...profile, preferred_currency: value});
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('profile.title')}</h1>
          <p className="text-muted-foreground">{t('profile.subtitle')}</p>
        </div>
        
        <Button variant="outline" onClick={handleLogout}>
          {t('auth.logout')}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.accountInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-3">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>
                  {profile.full_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-medium text-lg">{profile.full_name}</h3>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('profile.memberSince')}</span>
                <span>{new Date(user.created_at || Date.now()).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('profile.plan')}</span>
                <span className={isSubscribed ? "text-primary font-medium" : ""}>
                  {isSubscribed ? t('subscription.premium') : t('subscription.free')}
                  {isTrial && ` (${t('subscription.trial')})`}
                </span>
              </div>
              {isSubscribed && subscriptionEnd && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('subscription.renewsOn')}</span>
                  <span>{new Date(subscriptionEnd).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full">
                {isSubscribed ? t('subscription.manageSubscription') : t('subscription.upgradeToPremium')}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">{t('profile.profileSettings')}</TabsTrigger>
              <TabsTrigger value="preferences">{t('profile.preferences')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-4 py-4">
              <form onSubmit={handleProfileUpdate}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="full-name">{t('profile.fullName')}</Label>
                      <Input 
                        id="full-name" 
                        placeholder={t('profile.enterFullName')}
                        value={profile.full_name}
                        onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">{t('profile.username')}</Label>
                      <Input 
                        id="username" 
                        placeholder={t('profile.enterUsername')}
                        value={profile.username}
                        onChange={(e) => setProfile({...profile, username: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('profile.email')}</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      disabled
                      value={profile.email}
                    />
                    <p className="text-xs text-muted-foreground">{t('profile.cantChangeEmail')}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">{t('profile.city')}</Label>
                      <Input 
                        id="city" 
                        placeholder={t('profile.enterCity')}
                        value={profile.city}
                        onChange={(e) => setProfile({...profile, city: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">{t('profile.country')}</Label>
                      <Input 
                        id="country" 
                        placeholder={t('profile.enterCountry')} 
                        value={profile.country}
                        onChange={(e) => setProfile({...profile, country: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? t('common.saving') : t('common.saveChanges')}
                    </Button>
                  </div>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="preferences" className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">{t('preferences.language')}</Label>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder={t('preferences.selectLanguage')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">{t('preferences.currency')}</Label>
                  <Select 
                    value={profile.preferred_currency} 
                    onValueChange={handleCurrencyChange}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder={t('preferences.selectCurrency')} />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          {curr.symbol} {curr.name} ({curr.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleProfileUpdate} disabled={isUpdating}>
                    {isUpdating ? t('common.saving') : t('common.saveChanges')}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
