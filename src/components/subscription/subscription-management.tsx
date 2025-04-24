
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { CheckCircle, CreditCard, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const SubscriptionManagement = () => {
  const [plan, setPlan] = useState<"monthly" | "annual">("monthly");
  const [coupon, setCoupon] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [couponStatus, setCouponStatus] = useState<
    { valid: boolean; message?: string; trialMonths?: number } | null
  >(null);

  // Verificar se o cupom é válido sem submeter o formulário
  const checkCoupon = async () => {
    if (!coupon.trim()) {
      setCouponStatus(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", coupon.toUpperCase())
        .eq("active", true)
        .maybeSingle();

      if (error) {
        console.error("Error checking coupon:", error);
        setCouponStatus({
          valid: false,
          message: "Erro ao verificar cupom"
        });
        return;
      }

      if (!data) {
        setCouponStatus({
          valid: false,
          message: "Cupom inválido ou inativo"
        });
        return;
      }

      // Verificar se atingiu o limite de usos
      if (
        data.max_redemptions &&
        data.times_redeemed &&
        data.times_redeemed >= data.max_redemptions
      ) {
        setCouponStatus({
          valid: false,
          message: "Este cupom já atingiu o limite de usos"
        });
        return;
      }

      setCouponStatus({
        valid: true,
        message: `Cupom válido para ${data.duration_months} meses de trial!`,
        trialMonths: data.duration_months
      });
    } catch (err) {
      console.error("Error checking coupon:", err);
      setCouponStatus({
        valid: false,
        message: "Erro ao verificar cupom"
      });
    }
  };

  const handleSubscribe = async () => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan, coupon: coupon.trim() || undefined },
      });
      
      if (data?.url) {
        window.location.href = data.url;
      } else if (data?.error) {
        toast.error("Erro ao iniciar pagamento", {
          description: data.error
        });
      } else if (error) {
        toast.error("Erro ao iniciar pagamento", {
          description: error.message
        });
      } else {
        toast.error("Erro inesperado", {
          description: "Tente novamente mais tarde."
        });
      }
    } catch (err: any) {
      toast.error("Erro inesperado", {
        description: err.message || "Tente novamente."
      });
      console.error("Subscription error:", err);
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
                <label htmlFor="coupon" className="block text-sm font-medium mb-1">Cupom (até 12 meses grátis)</label>
                <div className="flex gap-2">
                  <Input
                    id="coupon"
                    value={coupon}
                    onChange={e => {
                      setCoupon(e.target.value.toUpperCase());
                      setCouponStatus(null);
                    }}
                    onBlur={checkCoupon}
                    placeholder="Digite seu cupom"
                    className="mb-2"
                    maxLength={32}
                    autoComplete="off"
                    disabled={submitting}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={checkCoupon}
                    disabled={submitting || !coupon.trim()}
                    className="shrink-0"
                  >
                    Verificar
                  </Button>
                </div>
                
                {couponStatus && (
                  <Alert variant={couponStatus.valid ? "default" : "destructive"} className="mb-4 p-3">
                    <div className="flex gap-2 items-center">
                      {couponStatus.valid ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertDescription>
                        {couponStatus.message}
                      </AlertDescription>
                    </div>
                  </Alert>
                )}
              </div>

              <Button 
                onClick={handleSubscribe}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                disabled={submitting}
              >
                {submitting ? "Processando..." : "Assinar Plano Mensal"}
                {couponStatus?.valid && couponStatus?.trialMonths && (
                  <span className="ml-1">
                    ({couponStatus.trialMonths} {couponStatus.trialMonths === 1 ? 'mês' : 'meses'} grátis)
                  </span>
                )}
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
                <label htmlFor="coupon-a" className="block text-sm font-medium mb-1">Cupom (até 12 meses grátis)</label>
                <div className="flex gap-2">
                  <Input
                    id="coupon-a"
                    value={coupon}
                    onChange={e => {
                      setCoupon(e.target.value.toUpperCase());
                      setCouponStatus(null);
                    }}
                    onBlur={checkCoupon}
                    placeholder="Digite seu cupom"
                    className="mb-2"
                    maxLength={32}
                    autoComplete="off"
                    disabled={submitting}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={checkCoupon}
                    disabled={submitting || !coupon.trim()}
                    className="shrink-0"
                  >
                    Verificar
                  </Button>
                </div>
                
                {couponStatus && (
                  <Alert variant={couponStatus.valid ? "default" : "destructive"} className="mb-4 p-3">
                    <div className="flex gap-2 items-center">
                      {couponStatus.valid ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertDescription>
                        {couponStatus.message}
                      </AlertDescription>
                    </div>
                  </Alert>
                )}
              </div>

              <Button 
                onClick={handleSubscribe}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                disabled={submitting}
              >
                {submitting ? "Processando..." : "Assinar Plano Anual"}
                {couponStatus?.valid && couponStatus?.trialMonths && (
                  <span className="ml-1">
                    ({couponStatus.trialMonths} {couponStatus.trialMonths === 1 ? 'mês' : 'meses'} grátis)
                  </span>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
