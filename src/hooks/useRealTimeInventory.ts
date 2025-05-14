
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useInvalidateInventory } from '@/hooks/use-skins';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export const useRealTimeInventory = () => {
  const invalidateInventory = useInvalidateInventory();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    // Only subscribe if user is logged in
    if (!user?.id) return;
    
    // Subscribe to all changes on the inventory table for the current user
    const channel = supabase
      .channel('inventory-updates')
      .on('postgres_changes', 
        {
          event: '*', // Listen to all events: INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'inventory',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('Real-time inventory update:', payload);
          
          // Invalidate queries to refresh data
          invalidateInventory();
          
          // Show toast notification based on the event type
          if (payload.eventType === 'INSERT') {
            toast({
              title: t('inventory.added'),
              description: t('inventory.itemAdded'),
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: t('inventory.updated'),
              description: t('inventory.itemUpdated'),
            });
          } else if (payload.eventType === 'DELETE') {
            toast({
              title: t('inventory.removed'),
              description: t('inventory.itemRemoved'),
            });
          }
        }
      )
      .subscribe();
      
    // Also subscribe to transaction updates
    const transactionsChannel = supabase
      .channel('transactions-updates')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('Real-time transaction update:', payload);
          
          // Invalidate inventory queries when transactions change
          invalidateInventory();
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: t('transactions.added'),
              description: t('transactions.newTransaction'),
            });
          }
        }
      )
      .subscribe();
    
    // Cleanup function
    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(transactionsChannel);
    };
  }, [user?.id, invalidateInventory, toast, t]);
};
