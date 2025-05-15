
// Importing necessary components and hooks
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

// Admin email - standardized across the application
const ADMIN_EMAIL = "luizfelipemarcelino43@gmail.com";

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
    console.log(`AdminConsole - Loading ${tab} data`);
    
    try {
      switch (tab) {
        case 'profiles':
          const { data: profilesData } = await supabase.from('profiles').select('*');
          setProfiles(profilesData || []);
          console.log(`AdminConsole - Loaded ${profilesData?.length || 0} profiles`);
          break;
          
        case 'inventory':
          const { data: inventoryData } = await supabase.from('inventory').select('*');
          setInventory(inventoryData || []);
          console.log(`AdminConsole - Loaded ${inventoryData?.length || 0} inventory items`);
          break;
          
        case 'transactions':
          const { data: transactionsData } = await supabase.from('transactions').select('*');
          setTransactions(transactionsData || []);
          console.log(`AdminConsole - Loaded ${transactionsData?.length || 0} transactions`);
          break;
          
        case 'subscribers':
          const { data: subscribersData } = await supabase.from('subscribers').select('*');
          setSubscribers(subscribersData || []);
          console.log(`AdminConsole - Loaded ${subscribersData?.length || 0} subscribers`);
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
    { 
      header: 'Username', 
      accessorKey: 'username',
      cell: ({ row }: any) => row.original.username || 'N/A'
    },
    { 
      header: 'Full Name', 
      accessorKey: 'full_name',
      cell: ({ row }: any) => row.original.full_name || 'N/A' 
    },
    { 
      header: 'Email', 
      accessorKey: 'email',
      cell: ({ row }: any) => row.original.email || 'N/A' 
    },
    { 
      header: 'Location', 
      accessorFn: (row: any) => `${row.city || ''} ${row.country || ''}`.trim(),
      cell: ({ row }: any) => `${row.original.city || ''} ${row.original.country || ''}`.trim() || 'N/A'
    },
    { 
      header: 'Currency', 
      accessorKey: 'preferred_currency',
      cell: ({ row }: any) => row.original.preferred_currency || 'USD' 
    },
    { 
      header: 'Admin', 
      accessorFn: (row: any) => row.is_admin ? 'Yes' : 'No',
      cell: ({ row }: any) => {
        const isAdminUser = row.original.is_admin || row.original.email === ADMIN_EMAIL;
        return isAdminUser ? 'Yes' : 'No';
      }
    },
    { 
      header: 'Created', 
      accessorFn: (row: any) => new Date(row.created_at).toLocaleDateString(),
      cell: ({ row }: any) => {
        try {
          return new Date(row.original.created_at).toLocaleDateString();
        } catch (e) {
          return 'Invalid date';
        }
      }
    }
  ];
  
  const inventoryColumns = [
    { 
      header: 'Skin', 
      accessorKey: 'name',
      cell: ({ row }: any) => row.original.name || 'Unknown'
    },
    { 
      header: 'Weapon', 
      accessorKey: 'weapon',
      cell: ({ row }: any) => row.original.weapon || 'Unknown'
    },
    { 
      header: 'Rarity', 
      accessorKey: 'rarity',
      cell: ({ row }: any) => row.original.rarity || 'N/A'
    },
    { 
      header: 'User ID', 
      accessorKey: 'user_id',
      cell: ({ row }: any) => row.original.user_id || 'N/A'
    },
    { 
      header: 'Price', 
      accessorFn: (row: any) => formatCurrency(row.price || 0, row.currency_code),
      cell: ({ row }: any) => formatCurrency(row.original.price || 0, row.original.currency_code || 'USD')
    },
    { 
      header: 'In Inventory', 
      accessorFn: (row: any) => row.is_in_user_inventory ? 'Yes' : 'No',
      cell: ({ row }: any) => row.original.is_in_user_inventory ? 'Yes' : 'No'
    },
    { 
      header: 'Acquired', 
      accessorFn: (row: any) => new Date(row.acquired_date).toLocaleDateString(),
      cell: ({ row }: any) => {
        try {
          return new Date(row.original.acquired_date).toLocaleDateString();
        } catch (e) {
          return 'Invalid date';
        }
      }
    }
  ];
  
  const transactionColumns = [
    { 
      header: 'Type', 
      accessorKey: 'type',
      cell: ({ row }: any) => row.original.type || 'Unknown'
    },
    { 
      header: 'Skin', 
      accessorKey: 'skin_name',
      cell: ({ row }: any) => row.original.skin_name || 'Unknown'
    },
    { 
      header: 'Weapon', 
      accessorKey: 'weapon_name',
      cell: ({ row }: any) => row.original.weapon_name || 'Unknown'
    },
    { 
      header: 'User ID', 
      accessorKey: 'user_id',
      cell: ({ row }: any) => row.original.user_id || 'N/A'
    },
    { 
      header: 'Price', 
      accessorFn: (row: any) => formatCurrency(row.price || 0, row.currency_code),
      cell: ({ row }: any) => formatCurrency(row.original.price || 0, row.original.currency_code || 'USD')
    },
    { 
      header: 'Date', 
      accessorFn: (row: any) => new Date(row.date).toLocaleDateString(),
      cell: ({ row }: any) => {
        try {
          return new Date(row.original.date).toLocaleDateString();
        } catch (e) {
          return 'Invalid date';
        }
      }
    }
  ];
  
  const subscriberColumns = [
    { 
      header: 'User ID', 
      accessorKey: 'user_id',
      cell: ({ row }: any) => row.original.user_id || 'N/A'
    },
    { 
      header: 'Email', 
      accessorKey: 'email',
      cell: ({ row }: any) => row.original.email || 'N/A'
    },
    { 
      header: 'Subscribed', 
      accessorFn: (row: any) => row.subscribed ? 'Yes' : 'No',
      cell: ({ row }: any) => row.original.subscribed ? 'Yes' : 'No'
    },
    { 
      header: 'Trial', 
      accessorFn: (row: any) => row.is_trial ? 'Yes' : 'No',
      cell: ({ row }: any) => row.original.is_trial ? 'Yes' : 'No'
    },
    { 
      header: 'Expires', 
      accessorFn: (row: any) => row.subscription_end ? new Date(row.subscription_end).toLocaleDateString() : 'N/A',
      cell: ({ row }: any) => {
        try {
          return row.original.subscription_end 
            ? new Date(row.original.subscription_end).toLocaleDateString() 
            : 'N/A';
        } catch (e) {
          return 'Invalid date';
        }
      }
    },
    { 
      header: 'Created', 
      accessorFn: (row: any) => new Date(row.created_at).toLocaleDateString(),
      cell: ({ row }: any) => {
        try {
          return new Date(row.original.created_at).toLocaleDateString();
        } catch (e) {
          return 'Invalid date';
        }
      }
    }
  ];
  
  // Render different data based on selected tab
  const renderTabContent = () => {
    if (loading) {
      return <div className="flex justify-center py-8"><Loading /></div>;
    }
    
    switch (activeTab) {
      case 'profiles':
        return <DataTable 
          columns={profileColumns} 
          data={filterData(profiles)}
          filterColumn="email" 
          filterPlaceholder="Filter by email..."
        />;
      case 'inventory':
        return <DataTable 
          columns={inventoryColumns} 
          data={filterData(inventory)}
          filterColumn="name" 
          filterPlaceholder="Filter by skin name..."
        />;
      case 'transactions':
        return <DataTable 
          columns={transactionColumns} 
          data={filterData(transactions)}
          filterColumn="skin_name" 
          filterPlaceholder="Filter by skin name..."
        />;
      case 'subscribers':
        return <DataTable 
          columns={subscriberColumns} 
          data={filterData(subscribers)}
          filterColumn="email" 
          filterPlaceholder="Filter by email..."
        />;
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
