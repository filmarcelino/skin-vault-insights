
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ExportOptions, ExportDataType } from "@/services/inventory/inventory-service";
import { InventoryItem, Transaction } from "@/types/skin";
import { mapSupabaseToInventoryItem, mapSupabaseToTransaction } from "@/services/inventory/inventory-mapper";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Download } from "lucide-react";

// Função para exportar dados completos de todos os usuários ou de um usuário específico
async function exportUserData(options: ExportOptions, userId?: string): Promise<any> {
  try {
    console.log(`Exportando dados ${userId ? `para o usuário ID: ${userId}` : 'para todos os usuários'}`);
    
    // Construir a query base para o inventário
    let inventoryQuery = supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Se um ID de usuário específico foi fornecido, filtrar por ele
    if (userId) {
      inventoryQuery = inventoryQuery.eq('user_id', userId);
    }
    
    // Executar a consulta do inventário
    const inventoryResult = await inventoryQuery;
    
    if (inventoryResult.error) {
      console.error("Erro ao buscar inventário:", inventoryResult.error);
      throw new Error(`Erro ao buscar inventário: ${inventoryResult.error.message}`);
    }
    
    console.log(`Itens no inventário encontrados: ${inventoryResult.data?.length || 0}`);
    
    // Construir a query base para transações
    let transactionsQuery = supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    // Se um ID de usuário específico foi fornecido, filtrar por ele
    if (userId) {
      transactionsQuery = transactionsQuery.eq('user_id', userId);
    }
    
    // Executar a consulta de transações
    const transactionsResult = await transactionsQuery;
    
    if (transactionsResult.error) {
      console.error("Erro ao buscar transações:", transactionsResult.error);
      throw new Error(`Erro ao buscar transações: ${transactionsResult.error.message}`);
    }
    
    console.log(`Transações encontradas: ${transactionsResult.data?.length || 0}`);
    
    // Mapear dados para os tipos corretos
    const inventory = inventoryResult.data?.map(item => mapSupabaseToInventoryItem(item)).filter(Boolean) as InventoryItem[] || [];
    const transactions = transactionsResult.data?.map(item => mapSupabaseToTransaction(item)).filter(Boolean) as Transaction[] || [];
    
    // Filtrar itens ativos do inventário para algumas estatísticas
    const activeItems = inventory.filter((item) => item.isInUserInventory);
    
    // Calcular valor total do inventário ativo
    const totalValue = activeItems.reduce((sum, item) => {
      const price = typeof item.currentPrice === 'number' ? item.currentPrice : 
                   (typeof item.price === 'number' ? item.price : 0);
      return sum + price;
    }, 0);
    
    // Calcular lucro/prejuízo
    const salesTransactions = transactions.filter(t => t.type === 'sell');
    const totalSales = salesTransactions.reduce((sum, t) => {
      const price = typeof t.price === 'number' ? t.price : 0;
      return sum + price;
    }, 0);
    
    const purchaseTransactions = transactions.filter(t => t.type === 'add');
    const totalPurchases = purchaseTransactions.reduce((sum, t) => {
      const price = typeof t.price === 'number' ? t.price : 0;
      return sum + price;
    }, 0);
    
    // Criar resumo dos dados
    const summary = {
      totalItems: inventory.length,
      activeSkins: activeItems.length,
      totalValue,
      totalProfit: totalSales,
      totalLoss: totalPurchases,
      netProfit: totalSales - totalPurchases,
      transactionCount: transactions.length,
      exportDate: new Date().toISOString()
    };
    
    // Preparar os dados para exportação com base nas opções
    let exportData;
    switch (options.type) {
      case 'inventory':
        exportData = inventory;
        break;
      case 'transactions':
        exportData = transactions;
        break;
      case 'financial':
        exportData = {
          summary,
          transactions: transactions.filter((t) => t.type === 'sell' || t.type === 'add')
        };
        break;
      case 'all':
      default:
        exportData = {
          inventory,
          transactions,
          summary
        };
    }
    
    return {
      data: exportData,
      summary
    };
  } catch (error) {
    console.error("Erro ao exportar dados:", error);
    throw error;
  }
}

// Função para converter para CSV
function convertToCSV(data: any[]): string {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }
  
  // Extrair cabeçalhos do primeiro objeto
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Adicionar linha de cabeçalhos
  csvRows.push(headers.join(','));
  
  // Adicionar linhas de dados
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      
      // Tratar valores nulos/indefinidos
      if (value === null || value === undefined) {
        return '';
      }
      
      // Tratar strings (especialmente aquelas com vírgulas)
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`;
      }
      
      // Tratar objetos/arrays aninhados
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      
      return value;
    });
    
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

// Função para baixar dados como arquivo
function downloadData(data: any, format: 'json' | 'csv', filename = 'export'): void {
  const date = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}-${date}.${format}`;
  
  let content;
  let type;
  
  if (format === 'csv') {
    // Se os dados não são um array, mas têm propriedades que são arrays, use o primeiro array encontrado
    if (!Array.isArray(data)) {
      for (const key in data) {
        if (Array.isArray(data[key]) && data[key].length > 0) {
          data = data[key];
          break;
        }
      }
    }
    
    content = convertToCSV(Array.isArray(data) ? data : [data]);
    type = 'text/csv';
  } else {
    content = JSON.stringify(data, null, 2);
    type = 'application/json';
  }
  
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fullFilename;
  link.click();
  
  // Limpar
  URL.revokeObjectURL(url);
}

// Lista de usuários importantes com IDs e nomes
const USERS = [
  {
    id: "e2bb0941-694a-411f-948b-1c4267849b3b",
    name: "Breno"
  },
  // Adicione outros usuários conforme necessário
];

export default function PublicExport() {
  const [selectedUserId, setSelectedUserId] = useState<string>(USERS[0].id);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [exportType, setExportType] = useState<ExportDataType>('all');
  const [includeDetails, setIncludeDetails] = useState(true);
  const [exportAllUsers, setExportAllUsers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [exportStats, setExportStats] = useState<{totalItems: number, activeSkins: number, transactionCount: number} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Buscar estatísticas iniciais para mostrar na UI
  useEffect(() => {
    const loadInitialStats = async () => {
      try {
        setError(null);
        setIsLoading(true);
        
        // Buscar inventário e transações para estatísticas iniciais do usuário selecionado
        const userId = exportAllUsers ? undefined : selectedUserId;
        
        // Use nossa função exportUserData para obter os dados (vai fazer queries corretamente)
        const result = await exportUserData(
          { format: 'json', type: 'all', includeDetails: true }, 
          userId
        );
        
        if (!result || !result.summary) {
          throw new Error("Não foi possível carregar estatísticas");
        }
        
        setExportStats({
          totalItems: result.summary.totalItems || 0,
          activeSkins: result.summary.activeSkins || 0,
          transactionCount: result.summary.transactionCount || 0
        });
        
        console.log(`Estatísticas carregadas: ${result.summary.totalItems} itens, ${result.summary.activeSkins} ativos, ${result.summary.transactionCount} transações`);
        
        if (result.summary.totalItems === 0 && result.summary.transactionCount === 0) {
          setError("Nenhum dado encontrado. Verifique se o ID do usuário está correto.");
        }
      } catch (err: any) {
        console.error("Erro ao carregar estatísticas:", err);
        setError(`Erro ao carregar dados: ${err.message || 'Erro desconhecido'}`);
        toast({
          title: "Erro ao carregar dados",
          description: err.message || "Não foi possível carregar os dados do inventário",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialStats();
  }, [selectedUserId, exportAllUsers, toast]);

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const options = {
        format: exportFormat,
        type: exportType,
        includeDetails
      };
      
      const userId = exportAllUsers ? undefined : selectedUserId;
      const result = await exportUserData(options, userId);
      
      if (!result || !result.data) {
        throw new Error("Nenhum dado encontrado para exportação");
      }
      
      if (result.summary.totalItems === 0 && result.summary.transactionCount === 0) {
        throw new Error("Nenhum item ou transação encontrada para exportar");
      }
      
      const userName = exportAllUsers ? "todos" : (USERS.find(u => u.id === selectedUserId)?.name || "usuario");
      downloadData(result.data, exportFormat, `${userName}-export-${exportType}`);
      
      toast({
        title: "Exportação Concluída",
        description: `Exportados ${result.summary.totalItems} itens e ${result.summary.transactionCount} transações.`
      });
    } catch (error: any) {
      console.error("Erro na exportação:", error);
      setError(error.message || "Erro desconhecido durante a exportação");
      toast({
        title: "Falha na Exportação",
        description: error.message || "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              CS Skin Vault
            </span>
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Exportador de Inventário e Transações
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Exportar Dados</CardTitle>
            <CardDescription>
              Exporte o inventário e transações para análise ou backup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              {exportStats && (
                <div className="bg-muted rounded-md p-3 mb-4">
                  <p className="font-medium mb-1">Estatísticas dos Dados:</p>
                  <ul className="text-sm space-y-1">
                    <li><strong>Total de Itens:</strong> {exportStats.totalItems}</li>
                    <li><strong>Skins Ativas:</strong> {exportStats.activeSkins}</li>
                    <li><strong>Transações:</strong> {exportStats.transactionCount}</li>
                  </ul>
                </div>
              )}

              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  id="exportAllUsers"
                  checked={exportAllUsers}
                  onCheckedChange={setExportAllUsers}
                />
                <Label htmlFor="exportAllUsers">Exportar dados de todos os usuários</Label>
              </div>

              {!exportAllUsers && (
                <div className="space-y-2">
                  <Label htmlFor="selectedUser">Usuário</Label>
                  <Select
                    value={selectedUserId}
                    onValueChange={setSelectedUserId}
                  >
                    <SelectTrigger id="selectedUser">
                      <SelectValue placeholder="Selecione o usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      {USERS.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="exportType">Dados para Exportar</Label>
                <Select
                  value={exportType}
                  onValueChange={(value) => setExportType(value as ExportDataType)}
                >
                  <SelectTrigger id="exportType">
                    <SelectValue placeholder="Selecione os dados para exportar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inventory">Todo o Inventário (ativo e vendido)</SelectItem>
                    <SelectItem value="transactions">Todas as Transações</SelectItem>
                    <SelectItem value="financial">Resumo Financeiro</SelectItem>
                    <SelectItem value="all">Todos os Dados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="exportFormat">Formato de Exportação</Label>
                <Select
                  value={exportFormat}
                  onValueChange={(value) => setExportFormat(value as 'json' | 'csv')}
                >
                  <SelectTrigger id="exportFormat">
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="includeDetails"
                  checked={includeDetails}
                  onCheckedChange={setIncludeDetails}
                />
                <Label htmlFor="includeDetails">Incluir informações detalhadas</Label>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleExport}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                "Exportando..."
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Dados
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
