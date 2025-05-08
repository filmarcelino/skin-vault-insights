
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionTab } from "./subscription-tab";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const SubscriptionManagement = () => {
  const [plan, setPlan] = useState<"monthly" | "annual">("monthly");
  const [coupon, setCoupon] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponStatus, setCouponStatus] = useState<
    { valid: boolean; message?: string; trialMonths?: number } | null
  >(null);

  const handleSubscribe = async () => {
    setSubmitting(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan, coupon: coupon.trim() || undefined },
      });
      
      if (data?.url) {
        window.location.href = data.url;
      } else if (data?.error) {
        setError(data.error);
        toast.error("Erro ao iniciar pagamento", {
          description: data.error
        });
      } else if (error) {
        setError(error.message);
        toast.error("Erro ao iniciar pagamento", {
          description: error.message
        });
      } else {
        setError("Erro inesperado, tente novamente mais tarde.");
        toast.error("Erro inesperado", {
          description: "Por favor, tente novamente mais tarde."
        });
      }
    } catch (err: any) {
      setError(err.message || "Erro inesperado, tente novamente.");
      toast.error("Erro inesperado", {
        description: err.message || "Por favor, tente novamente."
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
          Assine para acessar funcionalidades premium
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="monthly" onValueChange={val => setPlan(val as "monthly" | "annual")}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="monthly" className="w-1/2">Mensal</TabsTrigger>
            <TabsTrigger value="annual" className="w-1/2">Anual (10% OFF)</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly">
            <SubscriptionTab
              plan="monthly"
              coupon={coupon}
              setCoupon={setCoupon}
              submitting={submitting}
              couponStatus={couponStatus}
              setCouponStatus={setCouponStatus}
              handleSubscribe={handleSubscribe}
              id="coupon"
            />
          </TabsContent>

          <TabsContent value="annual">
            <SubscriptionTab
              plan="annual"
              coupon={coupon}
              setCoupon={setCoupon}
              submitting={submitting}
              couponStatus={couponStatus}
              setCouponStatus={setCouponStatus}
              handleSubscribe={handleSubscribe}
              id="coupon-a"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
