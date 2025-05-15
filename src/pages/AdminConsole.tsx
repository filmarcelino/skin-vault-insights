
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loading } from '@/components/ui/loading';
import { Shield, Users, Package, Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrencyValue } from '@/utils/format-utils'; // Updated import
import { supabase } from '@/integrations/supabase/client';

// Admin email whitelist
const ADMIN_EMAIL = "luisfelipemarcelino33@gmail.com";

// Format currency utility function
const formatCurrency = (value: number, currencyCode: string = 'USD') => {
  return formatCurrencyValue(value, currencyCode);
};

export default function AdminConsole() {
  const { user, profile, isAdmin, authStatus } = useAuth();
  const [activeTab, setActiveTab] = useState('profiles');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Show loading while auth is initializing
  if (authStatus === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // Check if user is authorized to access this page
  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Shield className="h-12 w-12 text-primary mb-4" />
        <p className="text-xl font-semibold">Access Denied</p>
        <p className="text-muted-foreground">
          This console is restricted to administrators only.
        </p>
      </div>
    );
  }

  // Load data on component mount and when tab changes
  useEffect(() => {
    loadData(activeTab);
    
    // Set up realtime subscriptions
    const channel = supabase
      .channel('admin-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => loadData('profiles'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => loadData('inventory'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => loadData('transactions'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscribers' }, () => loadData('subscribers'))
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab]);

  // Load data for the selected tab
  const loadData = async (tab: string) => {
    setLoading(true);
    
    try {
      switch (tab) {
        case 'profiles':
          const { data: profilesData } = await supabase.from('profiles').select('*');
          setProfiles(profilesData || []);
          break;
          
        case 'inventory':
          const { data: inventoryData } = await supabase.from('inventory').select('*');
          setInventory(inventoryData || []);
          break;
          
        case 'transactions':
          const { data: transactionsData } = await supabase.from('transactions').select('*');
          setTransactions(transactionsData || []);
          break;
          
        case 'subscribers':
          const { data: subscribersData } = await supabase.from('subscribers').select('*');
          setSubscribers(subscribersData || []);
          break;
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on search query
  const filterData = (data: any[]) => {
    if (!searchQuery) return data;
    
    const query = searchQuery.toLowerCase();
    
    return data.filter(item => {
      // Common fields to search across all tables
      const searchFields = [
        item.id,
        item.user_id,
        item.email,
        item.username,
        item.full_name,
        item.city,
        item.country,
        item.name,
        item.skin_name,
        item.weapon_name,
        item.type,
        item.marketplace,
        item.notes
      ];
      
      return searchFields.some(field => 
        field && field.toString().toLowerCase().includes(query)
      );
    });
  };

  // Define columns for each table
  const profileColumns = [
    { header: 'Username', accessorKey: 'username' },
    { header: 'Full Name', accessorKey: 'full_name' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Location', accessorFn: (row: any) => `${row.city || ''} ${row.country || ''}`.trim() },
    { header: 'Currency', accessorKey: 'preferred_currency' },
    { header: 'Admin', accessorFn: (row: any) => row.is_admin ? 'Yes' : 'No' },
    { header: 'Created', accessorFn: (row: any) => new Date(row.created_at).toLocaleDateString() }
  ];
  
  const inventoryColumns = [
    { header: 'Skin', accessorKey: 'name' },
    { header: 'Weapon', accessorKey: 'weapon' },
    { header: 'Rarity', accessorKey: 'rarity' },
    { header: 'User ID', accessorKey: 'user_id' },
    { header: 'Price', accessorFn: (row: any) => formatCurrency(row.price || 0, row.currency_code) },
    { header: 'In Inventory', accessorFn: (row: any) => row.is_in_user_inventory ? 'Yes' : 'No' },
    { header: 'Acquired', accessorFn: (row: any) => new Date(row.acquired_date).toLocaleDateString() }
  ];
  
  const transactionColumns = [
    { header: 'Type', accessorKey: 'type' },
    { header: 'Skin', accessorKey: 'skin_name' },
    { header: 'Weapon', accessorKey: 'weapon_name' },
    { header: 'User ID', accessorKey: 'user_id' },
    { header: 'Price', accessorFn: (row: any) => formatCurrency(row.price || 0, row.currency_code) },
    { header: 'Date', accessorFn: (row: any) => new Date(row.date).toLocaleDateString() }
  ];
  
  const subscriberColumns = [
    { header: 'User ID', accessorKey: 'user_id' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Subscribed', accessorFn: (row: any) => row.subscribed ? 'Yes' : 'No' },
    { header: 'Trial', accessorFn: (row: any) => row.is_trial ? 'Yes' : 'No' },
    { header: 'Expires', accessorFn: (row: any) => row.subscription_end ? new Date(row.subscription_end).toLocaleDateString() : 'N/A' },
    { header: 'Created', accessorFn: (row: any) => new Date(row.created_at).toLocaleDateString() }
  ];
  
  // Render different data based on selected tab
  const renderTabContent = () => {
    if (loading) {
      return <div className="flex justify-center py-8"><Loading /></div>;
    }
    
    switch (activeTab) {
      case 'profiles':
        return <DataTable columns={profileColumns} data={filterData(profiles)} />;
      case 'inventory':
        return <DataTable columns={inventoryColumns} data={filterData(inventory)} />;
      case 'transactions':
        return <DataTable columns={transactionColumns} data={filterData(transactions)} />;
      case 'subscribers':
        return <DataTable columns={subscriberColumns} data={filterData(subscribers)} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="container py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Console
          </CardTitle>
          <CardDescription>
            View and manage users, inventory, transactions, and subscriptions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2 items-center">
              <Badge variant="outline">Admin Mode</Badge>
              <span className="text-sm text-muted-foreground">
                Logged in as {user.email}
              </span>
            </div>
            <Input 
              type="search"
              placeholder="Search records..."
              className="max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="profiles">
                <Users className="h-4 w-4 mr-2" />
                Profiles
              </TabsTrigger>
              <TabsTrigger value="inventory">
                <Package className="h-4 w-4 mr-2" />
                Inventory
              </TabsTrigger>
              <TabsTrigger value="transactions">
                <Receipt className="h-4 w-4 mr-2" />
                Transactions
              </TabsTrigger>
              <TabsTrigger value="subscribers">
                <Users className="h-4 w-4 mr-2" />
                Subscribers
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              {renderTabContent()}
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end mt-4">
            <Button onClick={() => loadData(activeTab)}>Refresh Data</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
