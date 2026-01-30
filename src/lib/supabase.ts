/**
 * Supabase Client Configuration
 *
 * This file initializes the Supabase client for authentication and database access.
 * The client is configured with environment variables for flexibility across environments.
 *
 * Security Notes:
 * - Only the ANON key is used client-side (public, safe to expose)
 * - Service role key is NEVER used in browser code
 * - RLS policies protect all data access
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// Environment variables with fallbacks for local development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

/**
 * Typed Supabase client
 *
 * Usage:
 * ```typescript
 * import { supabase } from '@/lib/supabase';
 *
 * // Auth
 * const { data, error } = await supabase.auth.signInWithPassword({ email, password });
 *
 * // Database (typed)
 * const { data: anchors } = await supabase.from('anchors').select('*');
 * ```
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist session in localStorage
    persistSession: true,
    // Auto-refresh tokens before expiry
    autoRefreshToken: true,
    // Detect session from URL (for OAuth callbacks)
    detectSessionInUrl: true,
  },
});

/**
 * Type export for typed client usage elsewhere
 */
export type TypedSupabaseClient = typeof supabase;
