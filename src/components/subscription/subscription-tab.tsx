
import React from "react";
import { Button } from "@/components/ui/button";
import { CouponInput } from "./coupon-input";
import { SubscriptionPlan } from "./subscription-plans";

interface SubscriptionTabProps {
  plan: "monthly" | "annual";
  coupon: string;
  setCoupon: (coupon: string) => void;
  submitting: boolean;
  couponStatus: {
    valid: boolean;
    message?: string;
    trialMonths?: number;
  } | null;
  setCouponStatus: React.Dispatch<React.SetStateAction<{
    valid: boolean;
    message?: string;
    trialMonths?: number;
  } | null>>;
  handleSubscribe: () => Promise<void>;
  id?: string;
}

export const SubscriptionTab: React.FC<SubscriptionTabProps> = ({
  plan,
  coupon,
  setCoupon,
  submitting,
  couponStatus,
  setCouponStatus,
  handleSubscribe,
  id = "coupon",
}) => {
  return (
    <div className="space-y-4">
      <SubscriptionPlan type={plan} />
      
      <CouponInput
        id={id}
        coupon={coupon}
        setCoupon={setCoupon}
        submitting={submitting}
        couponStatus={couponStatus}
        setCouponStatus={setCouponStatus}
      />

      <Button 
        onClick={handleSubscribe}
        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
        disabled={submitting}
      >
        {submitting ? "Processing..." : `Subscribe to ${plan === 'monthly' ? 'Monthly' : 'Annual'} Plan`}
        {couponStatus?.valid && couponStatus?.trialMonths && (
          <span className="ml-1">
            ({couponStatus.trialMonths} {couponStatus.trialMonths === 1 ? 'month' : 'months'} free)
          </span>
        )}
      </Button>
    </div>
  );
};
