
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

// Função para exportar dados completos de um usuário específico
async function exportUserData(options: ExportOptions, userId: string): Promise<any> {
  try {
    console.log(`Exportando dados para o usuário ID: ${userId}`);
    
    // Buscar TODOS os itens de inventário do usuário (incluindo vendidos)
    const inventoryQuery = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (inventoryQuery.error) {
      console.error("Erro ao buscar inventário:", inventoryQuery.error);
      throw new Error(`Erro ao buscar inventário: ${inventoryQuery.error.message}`);
    }
    
    console.log(`Itens no inventário encontrados: ${inventoryQuery.data?.length || 0}`);
    
    // Buscar TODAS as transações do usuário
    const transactionsQuery = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (transactionsQuery.error) {
      console.error("Erro ao buscar transações:", transactionsQuery.error);
      throw new Error(`Erro ao buscar transações: ${transactionsQuery.error.message}`);
    }
    
    console.log(`Transações encontradas: ${transactionsQuery.data?.length || 0}`);
    
    // Mapear dados para os tipos corretos
    const inventory = inventoryQuery.data?.map(item => mapSupabaseToInventoryItem(item)).filter(Boolean) as InventoryItem[] || [];
    const transactions = transactionsQuery.data?.map(item => mapSupabaseToTransaction(item)).filter(Boolean) as Transaction[] || [];
    
    // Filtrar itens ativos do inventário para algumas estatísticas
    const activeItems = inventory.filter((item) => item.isInUserInventory);
    
    // Calcular valor total do inventário ativo
    const totalValue = activeItems.reduce((sum, item) => sum + (item.currentPrice || item.price || 0), 0);
    
    // Calcular lucro/prejuízo
    const salesTransactions = transactions.filter(t => t.type === 'sell');
    const totalSales = salesTransactions.reduce((sum, t) => sum + (t.price || 0), 0);
    
    const purchaseTransactions = transactions.filter(t => t.type === 'add');
    const totalPurchases = purchaseTransactions.reduce((sum, t) => sum + (t.price || 0), 0);
    
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

export default function PublicExport() {
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [exportType, setExportType] = useState<ExportDataType>('all');
  const [includeDetails, setIncludeDetails] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>("dc82fd34-5d56-4504-ad8d-306af593d841");
  const [isLoading, setIsLoading] = useState(false);
  const [exportStats, setExportStats] = useState<{totalItems: number, activeSkins: number} | null>(null);
  const { toast } = useToast();

  const users = [
    { id: "dc82fd34-5d56-4504-ad8d-306af593d841", name: "Breno (Usuário Teste)" },
    { id: "outros-ids-aqui", name: "Outro Usuário" }, // Adicione outros IDs de usuário conforme necessário
  ];
  
  // Buscar estatísticas iniciais para mostrar na UI
  useEffect(() => {
    const loadInitialStats = async () => {
      try {
        const { data: inventory } = await supabase
          .from('inventory')
          .select('inventory_id, is_in_user_inventory')
          .eq('user_id', selectedUser);
          
        if (inventory) {
          const totalItems = inventory.length;
          const activeSkins = inventory.filter(item => item.is_in_user_inventory).length;
          setExportStats({ totalItems, activeSkins });
        }
      } catch (error) {
        console.error("Erro ao carregar estatísticas iniciais:", error);
      }
    };
    
    loadInitialStats();
  }, [selectedUser]);

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
              {exportStats && (
                <div className="bg-muted rounded-md p-3 mb-4 text-sm">
                  <p>Usuário atual tem <strong>{exportStats.totalItems}</strong> itens no total e <strong>{exportStats.activeSkins}</strong> skins ativas.</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="user">Selecionar Usuário</Label>
                <Select
                  value={selectedUser}
                  onValueChange={(value) => setSelectedUser(value)}
                >
                  <SelectTrigger id="user">
                    <SelectValue placeholder="Selecione um usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
              onClick={async () => {
                const options = {
                  format: exportFormat,
                  type: exportType,
                  includeDetails
                };
                
                setIsLoading(true);
                try {
                  const result = await exportUserData(options, selectedUser);
                  downloadData(result.data, exportFormat, `export-${exportType}`);
                  
                  toast({
                    title: "Exportação Concluída",
                    description: `Exportados ${result.summary.totalItems} itens no total, incluindo ${result.summary.activeSkins} skins ativas.`
                  });
                } catch (error) {
                  console.error("Erro na exportação:", error);
                  toast({
                    title: "Falha na Exportação",
                    description: error instanceof Error ? error.message : "Erro desconhecido",
                    variant: "destructive"
                  });
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Exportando..." : "Exportar Dados"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
