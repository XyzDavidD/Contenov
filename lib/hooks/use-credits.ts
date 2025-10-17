import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from './use-auth';
import { eventEmitter, EVENTS } from '@/lib/events';

export function useCredits() {
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  const [credits, setCredits] = useState<number | null>(null);
  const [planType, setPlanType] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('credits_remaining, plan_type')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching credits:', error);
        return;
      }

      if (data) {
        setCredits(data.credits_remaining);
        setPlanType(data.plan_type);
      }
    } catch (err) {
      console.error('Failed to fetch credits:', err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  const updateCredits = (newCredits: number) => {
    setCredits(newCredits);
    // Emit global event for other components
    eventEmitter.emit(EVENTS.CREDITS_UPDATED, newCredits);
  };

  useEffect(() => {
    if (user) {
      fetchCredits();
    }
  }, [user, fetchCredits]);

  // Listen for global credit updates
  useEffect(() => {
    const handleCreditsUpdate = (newCredits: number) => {
      setCredits(newCredits);
    };

    eventEmitter.on(EVENTS.CREDITS_UPDATED, handleCreditsUpdate);

    return () => {
      eventEmitter.off(EVENTS.CREDITS_UPDATED, handleCreditsUpdate);
    };
  }, []);

  return {
    credits,
    planType,
    loading,
    fetchCredits,
    updateCredits
  };
}
