import React from "react";
import { JsonSettings } from "@/components/settings/json-settings";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Save, Shield, Wrench, Users, SlidersHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loading } from "@/components/ui/loading";
import { CouponManagement } from "@/components/settings/coupon-management";

const ADMIN_EMAIL = "luisfelipemarcelino33@gmail.com";

const Settings = () => {
  const { toast } = useToast();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Shield className="h-12 w-12 text-primary mb-4" />
        <p className="text-xl font-semibold">Acesso restrito.</p>
        <p className="text-muted-foreground">
          Esta página é exclusiva para administradores.
        </p>
      </div>
    );
  }

  const handleSaveSettings = (event: React.FormEvent) => {
    event.preventDefault();
    toast({
      title: "Settings saved",
      description: "Your application settings have been saved successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Settings (Admin)</h1>
          <p className="text-muted-foreground">
            Configurações administrativas do CS Skin Vault.
          </p>
        </div>
        <Button
          type="submit"
          form="settings-form"
          className="shrink-0"
          onClick={handleSaveSettings}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>

      <Separator />

      {/* Gestão de Cupons */}
      <CouponManagement />

      {/* Outras áreas de gerenciamento */}
      <div className="space-y-6">
        {/* Gerenciamento do site: áreas que poderão ser expandidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg shadow p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">Ferramentas de Gerenciamento</span>
            </div>
            <p className="text-muted-foreground text-sm mb-2">
              Gerencie rotinas e recursos do sistema.
            </p>
            <Button variant="outline" disabled>
              Em breve: Limpeza de dados, manutenção, backups...
            </Button>
          </div>
          <div className="bg-card rounded-lg shadow p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">Gestão de Usuários</span>
            </div>
            <p className="text-muted-foreground text-sm mb-2">
              Controle de usuários com acesso administrativo ou relatórios.
            </p>
            <Button variant="outline" disabled>
              Em breve: Listagem/administração de usuários
            </Button>
          </div>
          <div className="bg-card rounded-lg shadow p-6 flex flex-col gap-2 md:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">Configurações Avançadas</span>
            </div>
            <p className="text-muted-foreground text-sm mb-2">
              Opções administrativas para customizar regras e automações do site.
            </p>
            <Button variant="outline" disabled>
              Em breve: Automações, webhooks, integrações
            </Button>
          </div>
        </div>
        <Separator />
        <div>
          <h2 className="text-xl font-semibold mb-2">Data Sources</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Configure custom JSON files for your weapon skins, collections, and other data.
            Place your JSON files in the public folder and enter their paths below.
          </p>
          <JsonSettings />
        </div>
      </div>
    </div>
  );
};

export default Settings;
