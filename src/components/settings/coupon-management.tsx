
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableCell, TableHead, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle } from "lucide-react";

type Coupon = {
  id: string;
  code: string;
  duration_months: number;
  active: boolean;
  times_redeemed: number;
  max_redemptions: number | null;
  created_at: string;
};

export const CouponManagement = () => {
  const queryClient = useQueryClient();
  // Campos do formulário
  const [code, setCode] = useState("");
  const [duration, setDuration] = useState(3);
  const [maxRedemptions, setMaxRedemptions] = useState<number | "">("");
  const [isCreating, setIsCreating] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Listar cupons
  const { data: coupons, isLoading, error } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async (): Promise<Coupon[]> => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Coupon[];
    },
  });

  // Validar formulário
  const validateForm = (): boolean => {
    // Reset previous errors
    setValidationError("");
    
    // Check if code is empty
    if (!code.trim()) {
      setValidationError("O código do cupom é obrigatório");
      return false;
    }

    // Check if code has valid format
    if (!/^[A-Z0-9_-]+$/.test(code)) {
      setValidationError("O código deve conter apenas letras maiúsculas, números, _ e -");
      return false;
    }

    // Check if duration is valid
    if (duration < 1 || duration > 12) {
      setValidationError("A duração do trial deve estar entre 1 e 12 meses");
      return false;
    }

    // Check if maxRedemptions is valid when provided
    if (maxRedemptions !== "" && (Number(maxRedemptions) < 1 || Number(maxRedemptions) > 10000)) {
      setValidationError("O máximo de resgates deve estar entre 1 e 10000 (ou vazio para ilimitado)");
      return false;
    }

    // Check if code already exists
    if (coupons?.find((c) => c.code === code.toUpperCase())) {
      setValidationError("Já existe um cupom com esse código");
      return false;
    }

    return true;
  };

  // Criar cupom
  const mutation = useMutation({
    mutationFn: async () => {
      if (!validateForm()) {
        throw new Error(validationError || "Formulário inválido");
      }
      
      const { error } = await supabase.from("coupons").insert({
        code: code.toUpperCase(),
        duration_months: duration,
        max_redemptions: maxRedemptions === "" ? null : maxRedemptions,
        active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setCode("");
      setDuration(3);
      setMaxRedemptions("");
      toast.success("Cupom criado com sucesso!", {
        description: `Cupom ${code.toUpperCase()} adicionado com ${duration} meses de trial.`
      });
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
    },
    onError: (err: any) => {
      toast.error("Erro ao criar cupom", { description: err.message });
    },
  });

  // Trocar status ativo/desativado de cupom
  const toggleActive = async (coupon: Coupon) => {
    try {
      const { error } = await supabase.from("coupons")
        .update({ active: !coupon.active })
        .eq("id", coupon.id);
        
      if (error) throw error;
      
      toast.success(
        coupon.active 
          ? `Cupom ${coupon.code} desativado` 
          : `Cupom ${coupon.code} ativado`
      );
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
    } catch (err: any) {
      toast.error("Erro ao alterar status do cupom", {
        description: err.message
      });
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Criar Cupom Promocional</CardTitle>
        <CardDescription>Gere cupons para liberar trial de até 12 meses sem passar pela Stripe.</CardDescription>
      </CardHeader>
      <form
        onSubmit={e => {
          e.preventDefault();
          setIsCreating(true);
          mutation.mutate();
          setIsCreating(false);
        }}
      >
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="code" className="block mb-1 text-sm">Código</label>
            <Input
              id="code"
              required
              placeholder="EXEMPLO3MES"
              autoCapitalize="on"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              maxLength={24}
              className={validationError && !code.trim() ? "border-red-500" : ""}
            />
          </div>
          <div>
            <label htmlFor="duration" className="block mb-1 text-sm">Meses de trial</label>
            <Input
              id="duration"
              type="number"
              min={1}
              max={12}
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              required
              className={validationError && (duration < 1 || duration > 12) ? "border-red-500" : ""}
            />
          </div>
          <div>
            <label htmlFor="max-redemptions" className="block mb-1 text-sm">Nº máximo usos</label>
            <Input
              id="max-redemptions"
              type="number"
              min={1}
              value={maxRedemptions}
              onChange={e =>
                setMaxRedemptions(
                  e.target.value ? Number(e.target.value) : ""
                )
              }
              placeholder="Sem limite"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full" disabled={mutation.isPending || isCreating}>
              {mutation.isPending || isCreating ? "Criando..." : "Criar"}
            </Button>
          </div>
          {validationError && (
            <div className="col-span-1 md:col-span-4 flex items-center gap-2 p-2 bg-red-50 text-red-600 rounded border border-red-200">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{validationError}</span>
            </div>
          )}
        </CardContent>
      </form>
      <CardFooter>
        <div className="w-full mt-2">
          <h3 className="font-semibold mb-2">Cupons cadastrados</h3>
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Carregando...</div>
          ) : error ? (
            <div className="p-4 text-center text-destructive flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Erro ao carregar cupons</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Trial(meses)</TableHead>
                    <TableHead>Usos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons && coupons.length > 0 ? coupons.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.code}</TableCell>
                      <TableCell>{c.duration_months}</TableCell>
                      <TableCell>
                        {c.times_redeemed ?? 0}
                        {c.max_redemptions ? 
                          `/${c.max_redemptions}` : 
                          <span className="text-muted-foreground text-sm ml-1">∞</span>
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={c.active}
                            onCheckedChange={() => toggleActive(c)}
                          />
                          <Badge 
                            variant={c.active ? "default" : "destructive"}
                            className={c.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {c.active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {c.times_redeemed === 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:text-destructive/80"
                            onClick={() => {
                              // Implementar exclusão de cupom (somente se não tiver sido usado)
                              toast.error("Exclusão de cupoms será implementada em breve");
                            }}
                          >
                            Excluir
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground text-center">
                        Nenhum cupom cadastrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
