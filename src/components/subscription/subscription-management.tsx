
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

  // Check if coupon is valid without submitting the form
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
          message: "Error checking coupon"
        });
        return;
      }

      if (!data) {
        setCouponStatus({
          valid: false,
          message: "Invalid or inactive coupon"
        });
        return;
      }

      // Check if redemption limit reached
      if (
        data.max_redemptions &&
        data.times_redeemed &&
        data.times_redeemed >= data.max_redemptions
      ) {
        setCouponStatus({
          valid: false,
          message: "This coupon has reached its usage limit"
        });
        return;
      }

      setCouponStatus({
        valid: true,
        message: `Valid coupon for ${data.duration_months} ${data.duration_months === 1 ? 'month' : 'months'} of trial!`,
        trialMonths: data.duration_months
      });
    } catch (err) {
      console.error("Error checking coupon:", err);
      setCouponStatus({
        valid: false,
        message: "Error checking coupon"
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
            <div className="space-y-4">
              <div className="flex flex-col gap-3 p-4 rounded-lg bg-gradient-to-br from-primary/20 to-accent/5 backdrop-blur-sm border border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 p-3 rounded-full">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Monthly Plan</h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold">$3.99</span>
                      <span className="text-sm text-muted-foreground">/month</span>
                    </div>
                  </div>
                </div>
              </div>

              <ul className="text-sm space-y-2 p-4 rounded-lg bg-muted/50">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Unlimited skins in inventory</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Advanced analytics and price tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Priority support</span>
                </li>
              </ul>

              <div>
                <label htmlFor="coupon" className="block text-sm font-medium mb-1">Coupon (up to 12 months free)</label>
                <div className="flex gap-2">
                  <Input
                    id="coupon"
                    value={coupon}
                    onChange={e => {
                      setCoupon(e.target.value.toUpperCase());
                      setCouponStatus(null);
                    }}
                    onBlur={checkCoupon}
                    placeholder="Enter your coupon"
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
                    Verify
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
                {submitting ? "Processing..." : "Subscribe to Monthly Plan"}
                {couponStatus?.valid && couponStatus?.trialMonths && (
                  <span className="ml-1">
                    ({couponStatus.trialMonths} {couponStatus.trialMonths === 1 ? 'month' : 'months'} free)
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
                      Annual Plan <Badge variant="outline" className="ml-1 bg-green-500/10 text-green-500 border-green-500/30">SAVE 10%</Badge>
                    </h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold">$43.00</span>
                      <span className="text-sm text-muted-foreground">/year</span>
                    </div>
                    <div className="text-sm text-muted-foreground">Equivalent to $3.58/month</div>
                  </div>
                </div>
              </div>

              <ul className="text-sm space-y-2 p-4 rounded-lg bg-muted/50">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Unlimited skins in inventory</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Advanced analytics and price tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Priority support</span>
                </li>
              </ul>

              <div>
                <label htmlFor="coupon-a" className="block text-sm font-medium mb-1">Coupon (up to 12 months free)</label>
                <div className="flex gap-2">
                  <Input
                    id="coupon-a"
                    value={coupon}
                    onChange={e => {
                      setCoupon(e.target.value.toUpperCase());
                      setCouponStatus(null);
                    }}
                    onBlur={checkCoupon}
                    placeholder="Enter your coupon"
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
                    Verify
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
                {submitting ? "Processing..." : "Subscribe to Annual Plan"}
                {couponStatus?.valid && couponStatus?.trialMonths && (
                  <span className="ml-1">
                    ({couponStatus.trialMonths} {couponStatus.trialMonths === 1 ? 'month' : 'months'} free)
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
