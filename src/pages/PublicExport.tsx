
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ExportOptions, ExportDataType } from "@/services/inventory/inventory-service";
import { InventoryItem, Transaction } from "@/types/skin";
import { mapSupabaseToInventoryItem, mapSupabaseToTransaction } from "@/services/inventory/inventory-mapper";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Download, RefreshCcw, Search } from "lucide-react";

// Lista de usuários confirmados
const USERS = [
  {
    id: "e2bb0941-694a-411f-948b-1c4267849b3b",
    name: "Breno",
    email: "brenokivegas@gmail.com",
    fullName: "Oliveira"
  }
];

// Função para exportar dados completos de usuários
async function exportUserData(options: ExportOptions, userId?: string): Promise<any> {
  try {
    console.log(`Exportando dados ${userId ? `para o usuário ID: ${userId}` : 'para todos os usuários'}`);
    console.log(`Tipo de exportação: ${options.type}, Formato: ${options.format}`);
    
    // Construir a query para o inventário com mais detalhes de log
    console.log("Construindo query para o inventário...");
    let inventoryQuery = supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (userId) {
      console.log(`Filtrando inventário por user_id: ${userId}`);
      inventoryQuery = inventoryQuery.eq('user_id', userId);
    }
    
    console.log("Executando query de inventário...");
    const { data: inventoryData, error: inventoryError } = await inventoryQuery;
    
    if (inventoryError) {
      console.error("Erro ao buscar inventário:", inventoryError);
      throw new Error(`Erro ao buscar inventário: ${inventoryError.message}`);
    }
    
    console.log(`Inventário encontrado: ${inventoryData?.length || 0} itens`);
    
    if (Array.isArray(inventoryData)) {
      console.log("Primeiros 3 itens do inventário (se existirem):", 
        inventoryData.slice(0, 3).map(item => ({
          id: item.inventory_id,
          name: item.name,
          weapon: item.weapon
        }))
      );
    }

    // Construir a query para transações
    console.log("Construindo query para transações...");
    let transactionsQuery = supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
      
    if (userId) {
      console.log(`Filtrando transações por user_id: ${userId}`);
      transactionsQuery = transactionsQuery.eq('user_id', userId);
    }
    
    console.log("Executando query de transações...");
    const { data: transactionsData, error: transactionsError } = await transactionsQuery;
    
    if (transactionsError) {
      console.error("Erro ao buscar transações:", transactionsError);
      throw new Error(`Erro ao buscar transações: ${transactionsError.message}`);
    }
    
    console.log(`Transações encontradas: ${transactionsData?.length || 0}`);
    
    if (Array.isArray(transactionsData) && transactionsData.length > 0) {
      console.log("Primeiras 3 transações (se existirem):", 
        transactionsData.slice(0, 3).map(item => ({
          id: item.transaction_id,
          type: item.type,
          item: item.skin_name
        }))
      );
    }
    
    // Verificar usuário nos profiles para debug
    if (userId) {
      console.log(`Verificando usuário com ID ${userId} na tabela profiles`);
      const { data: userProfile, error: userProfileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (userProfileError) {
        console.log(`Erro ao buscar perfil: ${userProfileError.message}`);
      } else {
        console.log(`Perfil encontrado:`, userProfile);
      }
    }
    
    // Mapear dados retornados para os tipos corretos
    const inventory = Array.isArray(inventoryData) 
      ? inventoryData.map(mapSupabaseToInventoryItem).filter(Boolean) as InventoryItem[] 
      : [];
    
    const transactions = Array.isArray(transactionsData)
      ? transactionsData.map(mapSupabaseToTransaction).filter(Boolean) as Transaction[]
      : [];
    
    // Calcular estatísticas
    const activeItems = inventory.filter((item) => item.isInUserInventory);
    console.log(`Itens ativos no inventário: ${activeItems.length}`);
    
    const totalValue = activeItems.reduce((sum, item) => {
      const price = typeof item.currentPrice === 'number' ? item.currentPrice : 
                  (typeof item.price === 'number' ? item.price : 0);
      return sum + price;
    }, 0);
    
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

// Função para buscar usuários específicos
async function searchUsers(searchTerm: string) {
  console.log(`Buscando usuários com termo: "${searchTerm}"`);
  
  if (!searchTerm || searchTerm.trim().length < 3) {
    console.log("Termo de busca muito curto, ignorando");
    return [];
  }
  
  try {
    // Busca direta pelo email específico do Breno se for o termo de busca
    if (searchTerm.toLowerCase().includes("breno") || 
        searchTerm.toLowerCase().includes("oliveira") || 
        searchTerm.toLowerCase().includes("brenokivegas")) {
      console.log("Termo de busca corresponde ao usuário Breno, retornando dados fixos");
      return [USERS[0]];
    }
    
    // Busca regular por usuários na tabela profiles
    console.log("Executando busca na tabela profiles...");
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, email')
      .or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      
    if (error) {
      console.error("Erro ao buscar usuários:", error);
      return [];
    }
    
    console.log(`Encontrados ${data?.length || 0} usuários na busca regular`);
    
    // Verificar todos os usuários no sistema (para debug)
    console.log("Buscando todos os perfis no sistema para debug");
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, email')
      .limit(10);
      
    console.log(`Total de perfis encontrados (limitado a 10): ${allProfiles?.length || 0}`);
    if (allProfiles?.length) {
      console.log("Alguns perfis encontrados:", allProfiles.map(p => ({
        id: p.id,
        name: p.username || p.full_name,
        email: p.email
      })));
    }
    
    // Se não encontrou nenhum usuário mas o termo parece ser o Breno, retorna ele mesmo assim
    if ((!data || data.length === 0) && 
        (searchTerm.toLowerCase().includes("breno") || 
         searchTerm.toLowerCase().includes("oliveira") || 
         searchTerm.toLowerCase().includes("brenokivegas"))) {
      console.log("Nenhum perfil encontrado na busca, mas o termo parece ser do Breno. Retornando dados fixos.");
      return [USERS[0]];
    }
    
    return data || [];
  } catch (err) {
    console.error("Erro ao buscar usuários:", err);
    return [];
  }
}

// Função para converter para CSV
function convertToCSV(data: any[]): string {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  csvRows.push(headers.join(','));
  
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      
      if (value === null || value === undefined) {
        return '';
      }
      
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`;
      }
      
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
  
  URL.revokeObjectURL(url);
}

export default function PublicExport() {
  // Definir o ID do Breno como valor padrão inicial
  const [selectedUserId, setSelectedUserId] = useState<string>(USERS[0].id);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [exportType, setExportType] = useState<ExportDataType>('all');
  const [includeDetails, setIncludeDetails] = useState(true);
  const [exportAllUsers, setExportAllUsers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [exportStats, setExportStats] = useState<{totalItems: number, activeSkins: number, transactionCount: number} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userList, setUserList] = useState<any[]>(USERS);

  // Função para buscar usuários
  const handleSearch = async () => {
    if (searchTerm.trim().length < 3) {
      toast({
        title: "Termo de busca muito curto",
        description: "Digite pelo menos 3 caracteres para buscar",
        variant: "destructive"
      });
      return;
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      const results = await searchUsers(searchTerm);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "Nenhum usuário encontrado",
          description: `Nenhum resultado para "${searchTerm}"`,
          variant: "destructive"
        });
      } else {
        // Adicionar resultados à lista de usuários se não estiverem lá
        const updatedUsers = [...userList];
        
        results.forEach(user => {
          if (!updatedUsers.some(u => u.id === user.id)) {
            updatedUsers.push({
              id: user.id,
              name: user.username || user.full_name,
              email: user.email,
              fullName: user.full_name
            });
          }
        });
        
        setUserList(updatedUsers);
        
        toast({
          title: "Busca concluída",
          description: `Encontrados ${results.length} usuários`
        });
      }
    } catch (err: any) {
      setError(`Erro na busca: ${err.message || "Erro desconhecido"}`);
      toast({
        title: "Erro na busca",
        description: err.message || "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Carregar estatísticas iniciais - forçando para o usuário do Breno
  const loadInitialStats = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      console.log("Carregando estatísticas iniciais...");
      
      // Sempre use o ID do Breno para testes, ignorando a seleção atual
      const userId = "e2bb0941-694a-411f-948b-1c4267849b3b"; // ID fixo do Breno
      
      console.log(`Buscando dados para o usuário com ID fixo: ${userId}`);
      
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
      
      // Verifique se realmente não há dados
      if (result.summary.totalItems === 0 && result.summary.transactionCount === 0) {
        console.log("Nenhum dado encontrado para o usuário. Verificando tabelas...");
        
        // Verificar diretamente se a tabela inventory existe e tem dados
        const { count: inventoryCount, error: countError } = await supabase
          .from('inventory')
          .select('*', { count: 'exact' })
          .limit(0);
          
        if (countError) {
          console.error("Erro ao verificar tabela inventory:", countError);
        } else {
          console.log(`Total de registros na tabela inventory: ${inventoryCount}`);
        }
        
        setError(`Nenhum dado encontrado para o usuário com ID ${userId}.`);
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
  
  useEffect(() => {
    // Carrega estatísticas iniciais quando o componente monta
    loadInitialStats();
    // Não observe selectedUserId ou exportAllUsers para não recarregar com alterações 
    // da interface, prefira usar o botão de refresh explicitamente
  }, []);

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const options = {
        format: exportFormat,
        type: exportType,
        includeDetails
      };
      
      // Usa o ID do Breno para testes, ignorando a seleção atual
      const userId = "e2bb0941-694a-411f-948b-1c4267849b3b"; // ID fixo do Breno
      console.log(`Exportando dados para ID fixo do Breno: ${userId}`);
      
      const result = await exportUserData(options, userId);
      
      if (!result || !result.data) {
        throw new Error("Nenhum dado encontrado para exportação");
      }
      
      if (result.summary.totalItems === 0 && result.summary.transactionCount === 0) {
        throw new Error("Nenhum item ou transação encontrada para exportar");
      }
      
      const userName = "breno"; // Nome fixo do Breno
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

  const refreshStats = () => {
    loadInitialStats();
    toast({
      title: "Atualizando estatísticas",
      description: "Buscando dados mais recentes..."
    });
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
            <CardTitle>Exportar Dados do Breno</CardTitle>
            <CardDescription>
              Exporte o inventário e transações do usuário Breno (ID fixo)
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
                  <div className="flex justify-between">
                    <p className="font-medium mb-1">Estatísticas dos Dados:</p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={refreshStats} 
                      disabled={isLoading}
                    >
                      <RefreshCcw className="h-4 w-4 mr-1" />
                      Atualizar
                    </Button>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li><strong>Total de Itens:</strong> {exportStats.totalItems}</li>
                    <li><strong>Skins Ativas:</strong> {exportStats.activeSkins}</li>
                    <li><strong>Transações:</strong> {exportStats.transactionCount}</li>
                  </ul>
                </div>
              )}
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mb-4">
                <h3 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                  Exportando dados do usuário Breno
                </h3>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  <p><strong>ID:</strong> e2bb0941-694a-411f-948b-1c4267849b3b</p>
                  <p><strong>Email:</strong> brenokivegas@gmail.com</p>
                  <p><strong>Nome:</strong> Breno Oliveira</p>
                </div>
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
