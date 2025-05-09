
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CouponInputProps {
  id: string;
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
}

export const CouponInput: React.FC<CouponInputProps> = ({
  id,
  coupon,
  setCoupon,
  submitting,
  couponStatus,
  setCouponStatus,
}) => {
  const [validating, setValidating] = useState(false);

  const validateCoupon = async () => {
    if (!coupon.trim()) {
      setCouponStatus(null);
      return;
    }
    
    setValidating(true);
    
    try {
      const { data, error } = await supabase.from("coupons")
        .select("*")
        .eq("code", coupon.trim().toUpperCase())
        .eq("active", true)
        .maybeSingle();
      
      if (error) {
        toast.error("Erro ao verificar cupom", {
          description: error.message
        });
        setCouponStatus(null);
        return;
      }
      
      // Verificar se o cupom existe e está ativo
      if (!data) {
        setCouponStatus({
          valid: false,
          message: "Cupom inválido ou inativo"
        });
        return;
      }

      // Verificar limite de usos
      if (data.max_redemptions && data.times_redeemed && data.times_redeemed >= data.max_redemptions) {
        setCouponStatus({
          valid: false,
          message: "Este cupom atingiu o limite de usos"
        });
        return;
      }
      
      // Verificar se o usuário já usou este cupom
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error("Usuário não autenticado");
        return;
      }
      
      const { data: usedCoupon, error: usedError } = await supabase.from("user_coupons")
        .select("*")
        .eq("user_id", user.user.id)
        .eq("coupon_id", data.id)
        .maybeSingle();
      
      if (usedError) {
        toast.error("Erro ao verificar uso do cupom", {
          description: usedError.message
        });
        return;
      }
      
      if (usedCoupon) {
        setCouponStatus({
          valid: false,
          message: "Você já utilizou este cupom"
        });
        return;
      }
      
      // Cupom válido!
      setCouponStatus({
        valid: true,
        message: `${data.duration_months} ${data.duration_months > 1 ? 'meses' : 'mês'} de teste grátis`,
        trialMonths: data.duration_months
      });
      
    } catch (err: any) {
      toast.error("Erro ao validar cupom", {
        description: err.message
      });
      setCouponStatus(null);
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Cupom (opcional)</Label>
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Input
            id={id}
            value={coupon}
            onChange={(e) => {
              setCoupon(e.target.value);
              if (couponStatus) setCouponStatus(null);
            }}
            placeholder="Digite seu cupom"
            className="pr-8"
            disabled={submitting || validating}
          />
          {couponStatus && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {couponStatus.valid ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={validateCoupon}
          disabled={!coupon.trim() || submitting || validating}
        >
          {validating ? "Verificando..." : "Verificar"}
        </Button>
      </div>
      {couponStatus && (
        <p className={`text-sm ${couponStatus.valid ? 'text-green-500' : 'text-red-500'}`}>
          {couponStatus.message}
        </p>
      )}
    </div>
  );
};
