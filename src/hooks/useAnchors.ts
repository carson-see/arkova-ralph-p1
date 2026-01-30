/**
 * useAnchors Hook
 *
 * Fetches and manages anchors for the current user.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Anchor } from '../types/database.types';

interface UseAnchorsOptions {
  orgId?: string;
}

interface UseAnchorsReturn {
  anchors: Anchor[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAnchors(options: UseAnchorsOptions = {}): UseAnchorsReturn {
  const { user } = useAuth();
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnchors = useCallback(async () => {
    if (!user) {
      setAnchors([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let query = supabase
      .from('anchors')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    // If org context, filter by org
    if (options.orgId) {
      query = query.eq('org_id', options.orgId);
    } else {
      // Otherwise, get user's own anchors
      query = query.eq('user_id', user.id);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
      setAnchors([]);
    } else {
      setAnchors(data || []);
    }

    setLoading(false);
  }, [user, options.orgId]);

  useEffect(() => {
    fetchAnchors();
  }, [fetchAnchors]);

  return {
    anchors,
    loading,
    error,
    refetch: fetchAnchors,
  };
}
