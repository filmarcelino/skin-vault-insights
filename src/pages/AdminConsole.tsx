
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Search } from '@/components/ui/search';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loading } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Users, Package, CreditCard, ReceiptText, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/format-utils';
import { formatDistance } from 'date-fns';

type AdminTab = 'profiles' | 'inventory' | 'transactions' | 'subscribers';

const AdminConsole: React.FC = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>('profiles');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [profiles, setProfiles] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('all');
  
  // Get unique countries and currencies for filter dropdowns
  const countries = [...new Set(profiles.map(p => p.country).filter(Boolean))];
  const currencies = [...new Set(profiles.map(p => p.preferred_currency).filter(Boolean))];
  
  // Set up realtime subscription
  useEffect(() => {
    let profilesChannel: any;
    let inventoryChannel: any;
    let transactionsChannel: any;
    let subscribersChannel: any;
    
    const setupRealtimeSubscriptions = async () => {
      // Subscribe to profiles changes
      profilesChannel = supabase
        .channel('admin-profiles')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, 
          (payload) => {
            console.log('Profile change detected:', payload);
            loadProfiles();
          }
        )
        .subscribe();
      
      // Subscribe to inventory changes  
      inventoryChannel = supabase
        .channel('admin-inventory')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, 
          (payload) => {
            console.log('Inventory change detected:', payload);
            if (activeTab === 'inventory') loadInventory();
          }
        )
        .subscribe();
      
      // Subscribe to transactions changes
      transactionsChannel = supabase
        .channel('admin-transactions')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, 
          (payload) => {
            console.log('Transaction change detected:', payload);
            if (activeTab === 'transactions') loadTransactions();
          }
        )
        .subscribe();
      
      // Subscribe to subscribers changes  
      subscribersChannel = supabase
        .channel('admin-subscribers')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'subscribers' }, 
          (payload) => {
            console.log('Subscription change detected:', payload);
            if (activeTab === 'subscribers') loadSubscribers();
          }
        )
        .subscribe();
    };
    
    setupRealtimeSubscriptions();
    
    // Initial data load
    loadData();
    
    // Cleanup function
    return () => {
      if (profilesChannel) supabase.removeChannel(profilesChannel);
      if (inventoryChannel) supabase.removeChannel(inventoryChannel);
      if (transactionsChannel) supabase.removeChannel(transactionsChannel);
      if (subscribersChannel) supabase.removeChannel(subscribersChannel);
    };
  }, []);
  
  // Load data when tab changes
  useEffect(() => {
    loadData();
  }, [activeTab]);
  
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      switch (activeTab) {
        case 'profiles':
          await loadProfiles();
          break;
        case 'inventory':
          await loadInventory();
          break;
        case 'transactions':
          await loadTransactions();
          break;
        case 'subscribers':
          await loadSubscribers();
          break;
      }
    } catch (err) {
      console.error(`Error loading ${activeTab} data:`, err);
      setError(`Failed to load ${activeTab} data. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    setProfiles(data || []);
  };
  
  const loadInventory = async () => {
    const { data, error } = await supabase
      .from('inventory')
      .select('*, profiles!inventory_user_id_fkey(email, username)')
      .order('created_at', { ascending: false })
      .limit(100);
      
    if (error) throw error;
    setInventory(data || []);
  };
  
  const loadTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, profiles!transactions_user_id_fkey(email, username)')
      .order('date', { ascending: false })
      .limit(100);
      
    if (error) throw error;
    setTransactions(data || []);
  };
  
  const loadSubscribers = async () => {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    setSubscribers(data || []);
  };
  
  const filterData = (data: any[]) => {
    if (!data || !Array.isArray(data)) return [];
    
    // Apply search filter
    let filtered = data;
    
    // Apply text search if applicable
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      
      // Apply different search logic depending on the active tab
      switch (activeTab) {
        case 'profiles':
          filtered = filtered.filter(item => 
            item.email?.toLowerCase().includes(query) || 
            item.username?.toLowerCase().includes(query) ||
            item.full_name?.toLowerCase().includes(query) ||
            item.city?.toLowerCase().includes(query) ||
            item.country?.toLowerCase().includes(query)
          );
          break;
          
        case 'inventory':
          filtered = filtered.filter(item => 
            item.name?.toLowerCase().includes(query) ||
            item.weapon?.toLowerCase().includes(query) ||
            item.profiles?.email?.toLowerCase().includes(query) ||
            item.profiles?.username?.toLowerCase().includes(query)
          );
          break;
          
        case 'transactions':
          filtered = filtered.filter(item => 
            item.skin_name?.toLowerCase().includes(query) ||
            item.weapon_name?.toLowerCase().includes(query) ||
            item.profiles?.email?.toLowerCase().includes(query) ||
            item.profiles?.username?.toLowerCase().includes(query) ||
            item.type?.toLowerCase().includes(query)
          );
          break;
          
        case 'subscribers':
          filtered = filtered.filter(item => 
            item.email?.toLowerCase().includes(query) ||
            item.stripe_customer_id?.toLowerCase().includes(query)
          );
          break;
      }
    }
    
    // Apply additional filters for profiles
    if (activeTab === 'profiles') {
      // Country filter
      if (countryFilter && countryFilter !== 'all') {
        filtered = filtered.filter(item => item.country === countryFilter);
      }
      
      // Currency filter
      if (currencyFilter && currencyFilter !== 'all') {
        filtered = filtered.filter(item => item.preferred_currency === currencyFilter);
      }
    }
    
    // Apply subscription filter
    if (activeTab === 'subscribers') {
      if (subscriptionFilter === 'trial') {
        filtered = filtered.filter(item => item.is_trial);
      } else if (subscriptionFilter === 'active') {
        filtered = filtered.filter(item => item.subscribed && !item.is_trial);
      } else if (subscriptionFilter === 'expired') {
        filtered = filtered.filter(item => !item.subscribed);
      }
    }
    
    return filtered;
  };
  
  const getFilteredData = () => {
    switch (activeTab) {
      case 'profiles':
        return filterData(profiles);
      case 'inventory':
        return filterData(inventory);
      case 'transactions':
        return filterData(transactions);
      case 'subscribers':
        return filterData(subscribers);
      default:
        return [];
    }
  };
  
  const handleRefresh = () => {
    loadData();
    toast({
      title: "Refreshing data",
      description: "The latest data is being loaded."
    });
  };
  
  const filteredData = getFilteredData();
  
  // Check if we should deny access
  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to view the admin console.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Admin Console</CardTitle>
              <CardDescription>Manage users, inventory, and subscriptions</CardDescription>
            </div>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AdminTab)}>
            <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
              <TabsList>
                <TabsTrigger value="profiles">
                  <Users className="h-4 w-4 mr-2" />
                  Profiles
                </TabsTrigger>
                <TabsTrigger value="inventory">
                  <Package className="h-4 w-4 mr-2" />
                  Inventory
                </TabsTrigger>
                <TabsTrigger value="transactions">
                  <ReceiptText className="h-4 w-4 mr-2" />
                  Transactions
                </TabsTrigger>
                <TabsTrigger value="subscribers">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Subscribers
                </TabsTrigger>
              </TabsList>
              
              <div className="w-full md:w-1/3">
                <Search 
                  placeholder={`Search ${activeTab}...`} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Filters */}
            {activeTab === 'profiles' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Select 
                    value={countryFilter} 
                    onValueChange={setCountryFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {countries.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select 
                    value={currencyFilter} 
                    onValueChange={setCurrencyFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Currencies</SelectItem>
                      {currencies.map(currency => (
                        <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {activeTab === 'subscribers' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Select 
                    value={subscriptionFilter} 
                    onValueChange={setSubscriptionFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subscriptions</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {/* Results count */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">
                {filteredData.length} {filteredData.length === 1 ? 'result' : 'results'} found
              </div>
            </div>
            
            {/* Tab contents */}
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loading />
              </div>
            ) : (
              <>
                <TabsContent value="profiles">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Full Name</TableHead>
                          <TableHead>Country</TableHead>
                          <TableHead>Currency</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.map((profile) => (
                          <TableRow key={profile.id}>
                            <TableCell className="font-medium">{profile.email}</TableCell>
                            <TableCell>{profile.username}</TableCell>
                            <TableCell>{profile.full_name}</TableCell>
                            <TableCell>{profile.country || 'N/A'}</TableCell>
                            <TableCell>{profile.preferred_currency}</TableCell>
                            <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {profile.is_admin ? (
                                <Badge className="bg-purple-500">Admin</Badge>
                              ) : (
                                <Badge>User</Badge>
                              )}
                              {profile.inventory_populated && (
                                <Badge className="ml-2 bg-blue-500">Populated</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredData.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">No profiles found</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                
                <TabsContent value="inventory">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Weapon</TableHead>
                          <TableHead>Skin</TableHead>
                          <TableHead>Rarity</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Added</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.profiles?.email || 'Unknown'}
                            </TableCell>
                            <TableCell>{item.weapon}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {item.image && (
                                  <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-8 h-8 mr-2 object-cover rounded-sm"
                                  />
                                )}
                                {item.name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                item.rarity === 'Covert' ? 'bg-red-500' :
                                item.rarity === 'Classified' ? 'bg-pink-500' :
                                item.rarity === 'Restricted' ? 'bg-purple-500' :
                                item.rarity === 'Mil-Spec' ? 'bg-blue-500' :
                                item.rarity === 'Industrial' ? 'bg-teal-500' :
                                item.rarity === 'Consumer' ? 'bg-gray-500' :
                                ''
                              }>
                                {item.rarity || 'Unknown'}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatCurrency(item.purchase_price || 0, item.currency_code || 'USD')}</TableCell>
                            <TableCell>
                              <Badge className={item.is_in_user_inventory ? 'bg-green-500' : 'bg-red-500'}>
                                {item.is_in_user_inventory ? 'In Inventory' : 'Sold'}
                              </Badge>
                              {item.is_stat_trak && (
                                <Badge className="ml-2 bg-orange-500">StatTrak</Badge>
                              )}
                            </TableCell>
                            <TableCell>{new Date(item.acquired_date).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                        {filteredData.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">No inventory items found</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                
                <TabsContent value="transactions">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">
                              {transaction.profiles?.email || 'Unknown'}
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                transaction.type === 'add' ? 'bg-green-500' :
                                transaction.type === 'sell' ? 'bg-blue-500' :
                                transaction.type === 'buy' ? 'bg-purple-500' :
                                'bg-gray-500'
                              }>
                                {transaction.type}
                              </Badge>
                            </TableCell>
                            <TableCell>{transaction.weapon_name} | {transaction.skin_name}</TableCell>
                            <TableCell>{formatCurrency(transaction.price || 0, transaction.currency_code || 'USD')}</TableCell>
                            <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                            <TableCell className="max-w-xs truncate">{transaction.notes || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                        {filteredData.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4">No transactions found</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                
                <TabsContent value="subscribers">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>End Date</TableHead>
                          <TableHead>Customer ID</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.map((sub) => {
                          const now = new Date();
                          const endDate = sub.subscription_end ? new Date(sub.subscription_end) : null;
                          const isActive = sub.subscribed && (!endDate || endDate > now);
                          const timeLeft = endDate ? formatDistance(endDate, now, { addSuffix: true }) : 'N/A';
                          
                          return (
                            <TableRow key={sub.id}>
                              <TableCell className="font-medium">{sub.email}</TableCell>
                              <TableCell>
                                <Badge className={isActive ? 'bg-green-500' : 'bg-red-500'}>
                                  {isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {sub.is_trial ? (
                                  <Badge variant="outline">Trial</Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-blue-100">Paid</Badge>
                                )}
                              </TableCell>
                              <TableCell>{new Date(sub.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>
                                {sub.subscription_end ? (
                                  <span title={new Date(sub.subscription_end).toLocaleDateString()}>
                                    {timeLeft}
                                  </span>
                                ) : 'N/A'}
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {sub.stripe_customer_id || 'N/A'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {filteredData.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4">No subscribers found</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminConsole;
