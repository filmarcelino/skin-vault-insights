
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

interface CouponInputProps {
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
  id?: string;
}

export const CouponInput: React.FC<CouponInputProps> = ({
  coupon,
  setCoupon,
  submitting,
  couponStatus,
  setCouponStatus,
  id = "coupon",
}) => {
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

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1">Coupon (up to 12 months free)</label>
      <div className="flex gap-2">
        <Input
          id={id}
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
  );
};
