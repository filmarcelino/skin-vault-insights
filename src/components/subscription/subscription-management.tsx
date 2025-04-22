
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { CheckCircle, CreditCard } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const SubscriptionManagement = () => {
  const [plan, setPlan] = useState<"monthly" | "annual">("monthly");
  const [coupon, setCoupon] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  const handleSubscribe = async () => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan, coupon: coupon.trim() || undefined },
      });
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Erro ao iniciar pagamento",
          description: data?.error || error?.message || "Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "Erro inesperado",
        description: err.message || "Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-primary/20">
      <CardHeader className="bg-gradient-to-br from-primary/20 to-primary/5">
        <CardTitle className="text-gradient-to-r from-primary to-accent bg-clip-text">
          CS Skin Vault Premium
        </CardTitle>
        <CardDescription>
          Assine para acessar recursos premium
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        <Tabs defaultValue="monthly" onValueChange={val => setPlan(val as "monthly" | "annual")}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="monthly" className="w-1/2">Mensal</TabsTrigger>
            <TabsTrigger value="annual" className="w-1/2">Anual (10% OFF)</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly">
            <div className="space-y-4">
              <div className="flex flex-col gap-3 p-4 rounded-lg bg-gradient-to-br from-primary/20 to-accent/5 backdrop-blur-sm border border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 p-3 rounded-full">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Plano Mensal</h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold">$3.99</span>
                      <span className="text-sm text-muted-foreground">/mês</span>
                    </div>
                  </div>
                </div>
              </div>

              <ul className="text-sm space-y-2 p-4 rounded-lg bg-muted/50">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Skins ilimitadas no inventário</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Analytics e rastreamento de preços avançados</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Suporte prioritário</span>
                </li>
              </ul>

              <div>
                <label htmlFor="coupon" className="block text-sm font-medium mb-1">Cupom (até 3 meses grátis)</label>
                <Input
                  id="coupon"
                  value={coupon}
                  onChange={e => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Digite seu cupom"
                  className="mb-2"
                  maxLength={32}
                  autoComplete="off"
                  disabled={submitting}
                />
              </div>

              <Button 
                onClick={handleSubscribe}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                disabled={submitting}
              >
                {submitting ? "Processando..." : "Assinar Plano Mensal"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="annual">
            <div className="space-y-4">
              <div className="flex flex-col gap-3 p-4 rounded-lg bg-gradient-to-br from-accent/20 to-primary/5 backdrop-blur-sm border border-accent/10">
                <div className="flex items-center gap-3">
                  <div className="bg-accent/20 p-3 rounded-full">
                    <CreditCard className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-medium">
                      Plano Anual <Badge variant="outline" className="ml-1 bg-green-500/10 text-green-500 border-green-500/30">ECONOMIZE 10%</Badge>
                    </h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold">$43.00</span>
                      <span className="text-sm text-muted-foreground">/ano</span>
                    </div>
                    <div className="text-sm text-muted-foreground">Equivalente a $3.58/mês</div>
                  </div>
                </div>
              </div>

              <ul className="text-sm space-y-2 p-4 rounded-lg bg-muted/50">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Skins ilimitadas no inventário</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Analytics e rastreamento de preços avançados</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Suporte prioritário</span>
                </li>
              </ul>

              <div>
                <label htmlFor="coupon-a" className="block text-sm font-medium mb-1">Cupom (até 3 meses grátis)</label>
                <Input
                  id="coupon-a"
                  value={coupon}
                  onChange={e => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Digite seu cupom"
                  className="mb-2"
                  maxLength={32}
                  autoComplete="off"
                  disabled={submitting}
                />
              </div>

              <Button 
                onClick={handleSubscribe}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                disabled={submitting}
              >
                {submitting ? "Processando..." : "Assinar Plano Anual"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

