
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useInvalidateInventory } from '@/hooks/use-skins';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export function useRealTimeInventory() {
  const invalidateInventory = useInvalidateInventory();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    // Make sure we're authenticated before setting up the subscription
    const setupRealtime = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No active session, not subscribing to inventory changes");
        return;
      }

      console.log("Setting up realtime inventory subscription");
      
      // Subscribe to changes in the inventory table for the current user
      const channel = supabase
        .channel('public:inventory')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'inventory',
            filter: `user_id=eq.${session.user.id}`
          },
          (payload) => {
            console.log('Inventory change received:', payload);
            
            // Show toast notification based on the type of change
            let toastMessage = '';
            if (payload.eventType === 'INSERT') {
              toastMessage = t('inventory.itemAdded');
            } else if (payload.eventType === 'UPDATE') {
              toastMessage = t('inventory.itemUpdated');
            } else if (payload.eventType === 'DELETE') {
              toastMessage = t('inventory.itemRemoved');
            }
            
            if (toastMessage) {
              toast({
                title: toastMessage,
                duration: 3000
              });
            }
            
            // Invalidate the inventory cache to trigger a refetch
            invalidateInventory();
          }
        )
        .subscribe();

      // Also refresh when the component mounts
      invalidateInventory();

      // Cleanup subscription on unmount
      return () => {
        console.log("Cleaning up realtime inventory subscription");
        supabase.removeChannel(channel);
      };
    };

    setupRealtime();
  }, [invalidateInventory, toast, t]);
}
