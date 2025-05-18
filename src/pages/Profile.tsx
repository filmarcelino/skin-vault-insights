
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Edit, User, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useCurrency, CURRENCIES, Currency } from '@/contexts/CurrencyContext';
import { ExportData } from '@/components/profile/export-data';

const profileSchema = z.object({
  username: z.string().min(3, 'Username must have at least 3 characters'),
  full_name: z.string().min(3, 'Full name is required'),
  city: z.string().optional(),
  country: z.string().optional(),
  preferred_currency: z.string(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile: React.FC = () => {
  const { profile, updateProfile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { currency, setCurrency } = useCurrency();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile?.username || '',
      full_name: profile?.full_name || '',
      city: profile?.city || '',
      country: profile?.country || '',
      preferred_currency: profile?.preferred_currency || 'USD',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const { error, data: updatedProfile } = await updateProfile({
        username: data.username,
        full_name: data.full_name,
        city: data.city,
        country: data.country,
        preferred_currency: data.preferred_currency,
      });
      
      if (error) {
        toast({
          title: "Error updating profile",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile updated",
          description: "Your information was saved successfully.",
        });
        
        if (data.preferred_currency !== currency.code) {
          const newCurrency = CURRENCIES.find(c => c.code === data.preferred_currency);
          if (newCurrency) {
            setCurrency(newCurrency);
          }
        }
        
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Unexpected error",
        description: "Could not update your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!profile) {
    return (
      <div className="w-full flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-4">
      <h1 className="text-2xl font-bold">User Profile</h1>
      
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid grid-cols-3 md:w-[600px]">
          <TabsTrigger value="info">Personal Information</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="export">Export Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
              </div>
              <Avatar className="h-16 w-16">
                {profile.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                ) : (
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                )}
              </Avatar>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            disabled={!isEditing}
                            className={isEditing ? "" : "bg-muted"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            disabled={!isEditing}
                            className={isEditing ? "" : "bg-muted"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={!isEditing}
                              className={isEditing ? "" : "bg-muted"}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={!isEditing}
                              className={isEditing ? "" : "bg-muted"}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="preferred_currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Currency</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={!isEditing}
                        >
                          <FormControl>
                            <SelectTrigger className={isEditing ? "" : "bg-muted"}>
                              <SelectValue placeholder="Select a currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CURRENCIES.map((curr) => (
                              <SelectItem key={curr.code} value={curr.code}>
                                {curr.symbol} - {curr.name} ({curr.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This currency will be used to display values throughout the app.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {isEditing && (
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
            
            {!isEditing && (
              <CardFooter className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </CardFooter>
            )}
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Email</CardTitle>
              <CardDescription>Your registered email address</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span>{profile.email}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-medium">Member since</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="space-y-1">
                <h3 className="font-medium">Last update</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(profile.updated_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="export" className="space-y-4 mt-4">
          <ExportData />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
