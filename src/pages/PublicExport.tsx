
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ExportOptions, ExportDataType } from "@/services/inventory/inventory-service";

// Função simplificada para exportar dados
async function exportData(options: ExportOptions, userId: string): Promise<any> {
  try {
    // Buscar dados de inventário do usuário específico
    const inventoryQuery = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    // Buscar transações do usuário específico
    const transactionsQuery = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (inventoryQuery.error) throw new Error(`Erro ao buscar inventário: ${inventoryQuery.error.message}`);
    if (transactionsQuery.error) throw new Error(`Erro ao buscar transações: ${transactionsQuery.error.message}`);
    
    const inventory = inventoryQuery.data || [];
    const transactions = transactionsQuery.data || [];
    
    // Filtrar itens ativos do inventário
    const activeItems = inventory.filter((item) => item.is_in_user_inventory);
    
    // Calcular valor total do inventário
    const totalValue = activeItems.reduce((sum, item) => sum + (item.current_price || 0), 0);
    
    // Calcular lucro/prejuízo
    const salesTransactions = transactions.filter(t => t.type === 'sell');
    const totalSales = salesTransactions.reduce((sum, t) => sum + (t.price || 0), 0);
    
    const purchaseTransactions = transactions.filter(t => t.type === 'add');
    const totalPurchases = purchaseTransactions.reduce((sum, t) => sum + (t.price || 0), 0);
    
    const profit = totalSales;
    const loss = totalPurchases;
    
    // Criar resumo dos dados
    const summary = {
      totalItems: inventory.length,
      activeSkins: activeItems.length,
      totalValue,
      totalProfit: profit,
      totalLoss: loss,
      netProfit: profit - loss,
      transactionCount: transactions.length,
      exportDate: new Date().toISOString()
    };
    
    // Preparar os dados para exportação
    let exportData;
    switch (options.type) {
      case 'inventory':
        exportData = activeItems;
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
          inventory: activeItems,
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
        if (Array.isArray(data[key])) {
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
  const [selectedUser, setSelectedUser] = useState<string>("dc82fd34-5d56-4504-ad8d-306af593d841"); // ID do usuário teste (Breno)
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const users = [
    { id: "dc82fd34-5d56-4504-ad8d-306af593d841", name: "Breno (Usuário Teste)" },
    { id: "outros-ids-aqui", name: "Outro Usuário" }, // Adicione outros IDs de usuário conforme necessário
  ];

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
              <div className="space-y-2">
                <Label htmlFor="user">Selecionar Usuário</Label>
                <Select
                  value={selectedUser}
                  onValueChange={setSelectedUser}
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
                    <SelectItem value="inventory">Apenas Inventário</SelectItem>
                    <SelectItem value="transactions">Apenas Transações</SelectItem>
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
                  const result = await exportData(options, selectedUser);
                  downloadData(result.data, exportFormat, `export-${exportType}`);
                  
                  toast({
                    title: "Exportação Concluída",
                    description: `Exportados ${result.summary.totalItems} itens com sucesso.`
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
