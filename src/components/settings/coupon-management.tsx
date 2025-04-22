
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableCell, TableHead, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

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

  // Criar cupom
  const mutation = useMutation({
    mutationFn: async () => {
      if (!code.trim()) throw new Error("Código é obrigatório");
      // Validar unicidade no frontend (melhor validar no backend/db)
      if (coupons?.find((c) => c.code === code.toUpperCase())) {
        throw new Error("Já existe um cupom com esse código.");
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
      toast.success("Cupom criado!");
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
    },
    onError: (err: any) => {
      toast.error("Erro ao criar cupom", { description: err.message });
    },
  });

  // Trocar status ativo/desativado de cupom
  const toggleActive = async (coupon: Coupon) => {
    await supabase.from("coupons")
      .update({ active: !coupon.active })
      .eq("id", coupon.id);
    toast.success(coupon.active ? "Cupom desativado" : "Cupom ativado");
    queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Criar Cupom Promocional</CardTitle>
        <CardDescription>Gere cupons para liberar trial de até 3 meses sem passar pela Stripe.</CardDescription>
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
            />
          </div>
          <div>
            <label htmlFor="duration" className="block mb-1 text-sm">Meses de trial</label>
            <Input
              id="duration"
              type="number"
              min={1}
              max={3}
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              required
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
        </CardContent>
      </form>
      <CardFooter>
        <div className="w-full mt-2">
          <h3 className="font-semibold mb-2">Cupons cadastrados</h3>
          {isLoading ? (
            <div>Carregando...</div>
          ) : error ? (
            <div className="text-destructive">Erro ao carregar cupons</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Trial(em meses)</TableHead>
                    <TableHead>Usos</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons && coupons.length > 0 ? coupons.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.code}</TableCell>
                      <TableCell>{c.duration_months}</TableCell>
                      <TableCell>{c.times_redeemed ?? 0}/{c.max_redemptions ?? "∞"}</TableCell>
                      <TableCell>
                        <Switch
                          checked={c.active}
                          onCheckedChange={() => toggleActive(c)}
                        />
                      </TableCell>
                      <TableCell>
                        {/* Ações como deletar ou editar podem ser implementadas futuramente */}
                        {/* <Button variant="ghost" size="sm">Editar</Button> */}
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
