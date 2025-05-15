
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Loading } from "@/components/ui/loading";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// Define validation schema
const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  full_name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  city: z.string().optional(),
  country: z.string().optional(),
  preferred_currency: z.string(),
});

const PasswordFormSchema = z.object({
  currentPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  newPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

export default function Profile() {
  const { user, profile, isProfileLoading, updateProfile } = useAuth();
  const { currencies } = useCurrency();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("profile");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);

  // Profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: profile?.username || "",
      full_name: profile?.full_name || "",
      city: profile?.city || "",
      country: profile?.country || "",
      preferred_currency: profile?.preferred_currency || "USD",
    },
  });

  // Password form
  const passwordForm = useForm<z.infer<typeof PasswordFormSchema>>({
    resolver: zodResolver(PasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update profile function
  const onProfileSubmit = async (data: z.infer<typeof profileFormSchema>) => {
    setIsUpdating(true);
    try {
      const result = await updateProfile({
        username: data.username,
        full_name: data.full_name,
        city: data.city,
        country: data.country,
        preferred_currency: data.preferred_currency,
      });

      if (result.error) {
        toast.error(t("profile.update_failed"), {
          description: result.error.message,
        });
      } else {
        toast.success(t("profile.update_success"), {
          description: t("profile.profile_updated"),
        });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(t("profile.update_failed"), {
        description: t("common.unexpected_error"),
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Update password function
  const onPasswordSubmit = async (data: z.infer<typeof PasswordFormSchema>) => {
    setIsPasswordUpdating(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (authError) {
        toast.error(t("profile.password_update_failed"), {
          description: authError.message,
        });
      } else {
        toast.success(t("profile.password_update_success"), {
          description: t("profile.password_updated"),
        });
        passwordForm.reset({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Password update error:", error);
      toast.error(t("profile.password_update_failed"), {
        description: t("common.unexpected_error"),
      });
    } finally {
      setIsPasswordUpdating(false);
    }
  };

  // Update form when profile data changes
  React.useEffect(() => {
    if (profile) {
      profileForm.reset({
        username: profile.username || "",
        full_name: profile.full_name || "",
        city: profile.city || "",
        country: profile.country || "",
        preferred_currency: profile.preferred_currency || "USD",
      });
    }
  }, [profile, profileForm]);

  if (isProfileLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading size="lg" />
        <span className="ml-2 text-muted-foreground">{t("common.loading")}</span>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl font-semibold">{t("profile.not_logged_in")}</p>
        <p className="text-muted-foreground">{t("profile.login_required")}</p>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>{t("profile.your_profile")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback>
                {profile.username?.substring(0, 2).toUpperCase() || "??"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-lg font-medium">{profile.full_name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-sm text-muted-foreground mt-1">
                @{profile.username}
              </p>
            </div>

            <div className="w-full mt-6">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>{t("profile.city")}</Label>
                  <p className="text-sm">
                    {profile.city || t("common.not_specified")}
                  </p>
                </div>
                <div>
                  <Label>{t("profile.country")}</Label>
                  <p className="text-sm">
                    {profile.country || t("common.not_specified")}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Label>{t("profile.currency")}</Label>
                <p className="text-sm">
                  {currencies.find((c) => c.code === profile.preferred_currency)
                    ?.name || profile.preferred_currency}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>{t("profile.edit_profile")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="profile"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="mb-4">
                <TabsTrigger value="profile">{t("profile.details")}</TabsTrigger>
                <TabsTrigger value="password">{t("profile.password")}</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Form {...profileForm}>
                  <form
                    onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={profileForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile.username")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile.full_name")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("profile.city")}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("profile.country")}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={profileForm.control}
                      name="preferred_currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile.preferred_currency")}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t("profile.select_currency")}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {currencies.map((currency) => (
                                <SelectItem
                                  key={currency.code}
                                  value={currency.code}
                                >
                                  {currency.code} - {currency.name} (
                                  {currency.symbol})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? (
                          <>
                            <Loading size="sm" className="mr-2" />
                            {t("common.updating")}
                          </>
                        ) : (
                          t("common.save_changes")
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="password">
                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile.current_password")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              autoComplete="current-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile.new_password")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              autoComplete="new-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile.confirm_password")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              autoComplete="new-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isPasswordUpdating}>
                        {isPasswordUpdating ? (
                          <>
                            <Loading size="sm" className="mr-2" />
                            {t("common.updating")}
                          </>
                        ) : (
                          t("profile.update_password")
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
