
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionTab } from "./subscription-tab";

export const SubscriptionManagement = () => {
  const [plan, setPlan] = useState<"monthly" | "annual">("monthly");
  const [coupon, setCoupon] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [couponStatus, setCouponStatus] = useState<
    { valid: boolean; message?: string; trialMonths?: number } | null
  >(null);

  const handleSubscribe = async () => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan, coupon: coupon.trim() || undefined },
      });
      
      if (data?.url) {
        window.location.href = data.url;
      } else if (data?.error) {
        toast.error("Error starting payment", {
          description: data.error
        });
      } else if (error) {
        toast.error("Error starting payment", {
          description: error.message
        });
      } else {
        toast.error("Unexpected error", {
          description: "Please try again later."
        });
      }
    } catch (err: any) {
      toast.error("Unexpected error", {
        description: err.message || "Please try again."
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
          Subscribe to access premium features
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        <Tabs defaultValue="monthly" onValueChange={val => setPlan(val as "monthly" | "annual")}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="monthly" className="w-1/2">Monthly</TabsTrigger>
            <TabsTrigger value="annual" className="w-1/2">Annual (10% OFF)</TabsTrigger>
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
