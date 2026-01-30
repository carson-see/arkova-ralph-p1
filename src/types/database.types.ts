/**
 * Database types generated from Supabase schema
 *
 * This file is auto-generated. Do not edit manually.
 * Regenerate with: npm run gen:types
 *
 * CI will fail if this file differs from the generated output.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// =============================================================================
// ENUMS
// =============================================================================

export type UserRole = 'INDIVIDUAL' | 'ORG_ADMIN';

export type AnchorStatus = 'PENDING' | 'SECURED' | 'REVOKED';

export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED';

export type AuditEventCategory = 'AUTH' | 'ANCHOR' | 'PROFILE' | 'ORG' | 'ADMIN' | 'SYSTEM';

// =============================================================================
// DATABASE SCHEMA
// =============================================================================

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          legal_name: string;
          display_name: string;
          domain: string | null;
          verification_status: VerificationStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          legal_name: string;
          display_name: string;
          domain?: string | null;
          verification_status?: VerificationStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          legal_name?: string;
          display_name?: string;
          domain?: string | null;
          verification_status?: VerificationStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole | null;
          role_set_at: string | null;
          org_id: string | null;
          is_public: boolean;
          requires_manual_review: boolean;
          manual_review_reason: string | null;
          manual_review_completed_at: string | null;
          manual_review_completed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole | null;
          role_set_at?: string | null;
          org_id?: string | null;
          is_public?: boolean;
          requires_manual_review?: boolean;
          manual_review_reason?: string | null;
          manual_review_completed_at?: string | null;
          manual_review_completed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole | null;
          role_set_at?: string | null;
          org_id?: string | null;
          is_public?: boolean;
          requires_manual_review?: boolean;
          manual_review_reason?: string | null;
          manual_review_completed_at?: string | null;
          manual_review_completed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'profiles_org_id_fkey';
            columns: ['org_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          }
        ];
      };
      anchors: {
        Row: {
          id: string;
          user_id: string;
          org_id: string | null;
          fingerprint: string;
          filename: string;
          file_size: number | null;
          file_mime: string | null;
          status: AnchorStatus;
          chain_tx_id: string | null;
          chain_block_height: number | null;
          chain_timestamp: string | null;
          legal_hold: boolean;
          retention_until: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          org_id?: string | null;
          fingerprint: string;
          filename: string;
          file_size?: number | null;
          file_mime?: string | null;
          status?: AnchorStatus;
          chain_tx_id?: string | null;
          chain_block_height?: number | null;
          chain_timestamp?: string | null;
          legal_hold?: boolean;
          retention_until?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          org_id?: string | null;
          fingerprint?: string;
          filename?: string;
          file_size?: number | null;
          file_mime?: string | null;
          status?: AnchorStatus;
          chain_tx_id?: string | null;
          chain_block_height?: number | null;
          chain_timestamp?: string | null;
          legal_hold?: boolean;
          retention_until?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'anchors_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'anchors_org_id_fkey';
            columns: ['org_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          }
        ];
      };
      audit_events: {
        Row: {
          id: string;
          event_type: string;
          event_category: AuditEventCategory;
          actor_id: string | null;
          actor_email: string | null;
          actor_ip: string | null;
          actor_user_agent: string | null;
          target_type: string | null;
          target_id: string | null;
          org_id: string | null;
          details: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          event_category: AuditEventCategory;
          actor_id?: string | null;
          actor_email?: string | null;
          actor_ip?: string | null;
          actor_user_agent?: string | null;
          target_type?: string | null;
          target_id?: string | null;
          org_id?: string | null;
          details?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_type?: string;
          event_category?: AuditEventCategory;
          actor_id?: string | null;
          actor_email?: string | null;
          actor_ip?: string | null;
          actor_user_agent?: string | null;
          target_type?: string | null;
          target_id?: string | null;
          org_id?: string | null;
          details?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_events_actor_id_fkey';
            columns: ['actor_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'audit_events_org_id_fkey';
            columns: ['org_id'];
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_user_org_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      is_org_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      update_profile_onboarding: {
        Args: {
          p_role: UserRole;
          p_org_legal_name?: string | null;
          p_org_display_name?: string | null;
          p_org_domain?: string | null;
        };
        Returns: Json;
      };
    };
    Enums: {
      user_role: UserRole;
      anchor_status: AnchorStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Convenience aliases
export type Organization = Tables<'organizations'>;
export type Profile = Tables<'profiles'>;
export type Anchor = Tables<'anchors'>;
export type AuditEvent = Tables<'audit_events'>;

export type OrganizationInsert = InsertTables<'organizations'>;
export type ProfileInsert = InsertTables<'profiles'>;
export type AnchorInsert = InsertTables<'anchors'>;
export type AuditEventInsert = InsertTables<'audit_events'>;

export type OrganizationUpdate = UpdateTables<'organizations'>;
export type ProfileUpdate = UpdateTables<'profiles'>;
export type AnchorUpdate = UpdateTables<'anchors'>;
export type AuditEventUpdate = UpdateTables<'audit_events'>;
