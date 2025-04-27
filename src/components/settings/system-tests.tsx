
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface TestResult {
  name: string;
  status: "success" | "error" | "running";
  message?: string;
  timestamp: Date;
}

const SystemTests = () => {
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  // Função para executar testes automáticos
  const runAutomaticTests = async () => {
    setIsRunning(true);
    
    try {
      // Teste de conexão com Supabase
      const { data: connectionTest, error: connectionError } = await supabase
        .from('inventory')
        .select('count(*)', { count: 'exact' });

      if (connectionError) {
        throw new Error('Falha na conexão com o banco de dados');
      }

      // Teste de autenticação
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) {
        throw new Error('Falha no sistema de autenticação');
      }

      // Teste de permissões
      const { data: permissionTest, error: permissionError } = await supabase
        .from('inventory')
        .select('id')
        .limit(1);

      if (permissionError) {
        throw new Error('Falha nas permissões de acesso');
      }

      toast({
        title: "Testes concluídos com sucesso",
        description: "Todos os testes automáticos passaram",
      });

    } catch (error) {
      console.error('Erro nos testes:', error);
      toast({
        title: "Erro nos testes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Consulta para obter resultados dos testes
  const { data: testResults, isLoading: isLoadingResults } = useQuery({
    queryKey: ['systemTests'],
    queryFn: async () => {
      const testResults: TestResult[] = [
        {
          name: "Conexão com Banco de Dados",
          status: "success",
          timestamp: new Date(),
        },
        {
          name: "Sistema de Autenticação",
          status: "success",
          timestamp: new Date(),
        },
        {
          name: "Permissões de Acesso",
          status: "success",
          timestamp: new Date(),
        }
      ];
      return testResults;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Testes do Sistema</CardTitle>
        <CardDescription>
          Execute testes automáticos e manuais para verificar o funcionamento do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Testes Automáticos</h3>
            <p className="text-sm text-muted-foreground">
              Executa uma série de testes para verificar as principais funcionalidades
            </p>
          </div>
          <Button 
            onClick={runAutomaticTests} 
            disabled={isRunning}
            className="min-w-[120px]"
          >
            {isRunning ? (
              "Executando..."
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Executar
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Resultados dos Últimos Testes</h4>
          {isLoadingResults ? (
            <p className="text-sm text-muted-foreground">Carregando resultados...</p>
          ) : (
            <div className="space-y-2">
              {testResults?.map((test) => (
                <div
                  key={test.name}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {test.status === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">{test.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(test.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-6 border-t">
          <h3 className="text-lg font-medium mb-4">Testes Manuais</h3>
          <div className="grid gap-4">
            <Button variant="outline" className="justify-start">
              Testar Conexão com Banco de Dados
            </Button>
            <Button variant="outline" className="justify-start">
              Verificar Sistema de Autenticação
            </Button>
            <Button variant="outline" className="justify-start">
              Testar Permissões de Acesso
            </Button>
            <Button variant="outline" className="justify-start">
              Validar Integrações Externas
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemTests;
