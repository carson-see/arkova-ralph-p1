/**
 * useProfile Hook (P2-S2)
 *
 * Fetches and manages the current user's profile from the database.
 * Used for route guard decisions and profile display.
 *
 * Features:
 * - Auto-fetches on user change
 * - Realtime subscription for live updates
 * - Optimistic update helper
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

interface UseProfileReturn {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<{ error: Error | null }>;
}

export function useProfile(): UseProfileReturn {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      // Profile might not exist yet for new users
      if (fetchError.code === 'PGRST116') {
        setProfile(null);
      } else {
        setError(fetchError.message);
      }
    } else {
      setProfile(data);
    }

    setLoading(false);
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Realtime subscription for profile changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`profile:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          // Update local state with the new profile data
          setProfile(payload.new as Profile);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  /**
   * Update profile with optimistic UI
   * Updates local state immediately, then syncs with DB
   * Reverts on error
   */
  const updateProfile = useCallback(
    async (updates: ProfileUpdate): Promise<{ error: Error | null }> => {
      if (!profile || !user) {
        return { error: new Error('No profile to update') };
      }

      // Store previous state for rollback
      const previousProfile = profile;

      // Optimistic update
      setProfile({ ...profile, ...updates, updated_at: new Date().toISOString() });

      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);

        if (updateError) {
          // Rollback on error
          setProfile(previousProfile);
          return { error: new Error(updateError.message) };
        }

        return { error: null };
      } catch (err) {
        // Rollback on error
        setProfile(previousProfile);
        return { error: err instanceof Error ? err : new Error('Update failed') };
      }
    },
    [profile, user]
  );

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
}
