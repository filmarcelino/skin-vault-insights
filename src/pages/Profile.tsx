
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

// Schema para validação dos dados do perfil
const profileSchema = z.object({
  username: z.string().min(3, 'O nome de usuário precisa ter pelo menos 3 caracteres'),
  full_name: z.string().min(3, 'O nome completo é obrigatório'),
  city: z.string().optional(),
  country: z.string().optional(),
  preferred_currency: z.string(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const { profile, updateProfile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { currency, setCurrency } = useCurrency();

  // Inicializar o formulário com os dados do perfil
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

  // Função para atualizar o perfil
  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const { error, data: updatedProfile } = await updateProfile(data);
      
      if (error) {
        toast({
          title: "Erro ao atualizar perfil",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram salvas com sucesso.",
        });
        
        // Atualizar a moeda no contexto se foi alterada
        if (data.preferred_currency !== currency.code) {
          const newCurrency = CURRENCIES.find(c => c.code === data.preferred_currency);
          if (newCurrency) {
            setCurrency(newCurrency);
          }
        }
        
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível atualizar seu perfil. Tente novamente.",
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
      <h1 className="text-2xl font-bold">Perfil do Usuário</h1>
      
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid grid-cols-2 md:w-[400px]">
          <TabsTrigger value="info">Informações Pessoais</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Detalhes do Perfil</CardTitle>
                <CardDescription>Gerencie suas informações pessoais</CardDescription>
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
                        <FormLabel>Nome de Usuário</FormLabel>
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
                        <FormLabel>Nome Completo</FormLabel>
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
                          <FormLabel>Cidade</FormLabel>
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
                          <FormLabel>País</FormLabel>
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
                        <FormLabel>Moeda Preferida</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={!isEditing}
                        >
                          <FormControl>
                            <SelectTrigger className={isEditing ? "" : "bg-muted"}>
                              <SelectValue placeholder="Selecione uma moeda" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CURRENCIES.map((currency) => (
                              <SelectItem key={currency.code} value={currency.code}>
                                {currency.symbol} - {currency.name} ({currency.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Esta moeda será usada para exibir os valores em todo o aplicativo.
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
                        Cancelar
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
                        Salvar Alterações
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
                  Editar Perfil
                </Button>
              </CardFooter>
            )}
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>E-mail</CardTitle>
              <CardDescription>Seu endereço de e-mail registrado</CardDescription>
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
              <CardTitle>Configurações da Conta</CardTitle>
              <CardDescription>Gerencie suas preferências de conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-medium">Membro desde</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="space-y-1">
                <h3 className="font-medium">Última atualização</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(profile.updated_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
