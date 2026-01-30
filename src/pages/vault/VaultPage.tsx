/**
 * VaultPage (P3-S1, P3-S2)
 *
 * Individual user's vault dashboard.
 * Shows records list and privacy toggle.
 */

import { useState, useEffect } from 'react';
import { FileText, Plus, Shield, ShieldOff, Loader2 } from 'lucide-react';
import { RoleRoute } from '@/components/auth/RouteGuard';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import {
  ANCHOR_STATUS_LABELS,
  EMPTY_STATES,
  ACTION_LABELS,
} from '@/lib/copy';
import type { Database } from '@/types/database.types';

type Anchor = Database['public']['Tables']['anchors']['Row'];

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const colors = {
    PENDING: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30',
    SECURED: 'bg-green-500/10 text-green-700 border-green-500/30',
    REVOKED: 'bg-red-500/10 text-red-700 border-red-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
        colors[status as keyof typeof colors] || colors.PENDING
      }`}
    >
      {ANCHOR_STATUS_LABELS[status as keyof typeof ANCHOR_STATUS_LABELS] || status}
    </span>
  );
}

// Privacy toggle component (P3-S2)
function PrivacyToggle() {
  const { profile } = useAuthContext();
  const [isPublic, setIsPublic] = useState(profile?.is_public ?? false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setIsPublic(profile?.is_public ?? false);
  }, [profile?.is_public]);

  const toggleVisibility = async () => {
    if (!profile) return;

    const newValue = !isPublic;
    
    // Optimistic update
    setIsPublic(newValue);
    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_public: newValue })
        .eq('id', profile.id);

      if (error) {
        // Revert on error
        setIsPublic(!newValue);
        console.error('Failed to update visibility:', error);
      }
    } catch (err) {
      // Revert on error
      setIsPublic(!newValue);
      console.error('Failed to update visibility:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {isPublic ? (
            <ShieldOff className="h-5 w-5 text-green-600" />
          ) : (
            <Shield className="h-5 w-5 text-yellow-600" />
          )}
          Vault Visibility
        </CardTitle>
        <CardDescription>
          {isPublic
            ? 'Your records can be verified by anyone with the link'
            : 'Your records are private and only visible to you'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant={isPublic ? 'outline' : 'default'}
          onClick={toggleVisibility}
          disabled={isUpdating}
          className="w-full sm:w-auto"
        >
          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPublic ? 'Make Private' : 'Make Public'}
        </Button>
      </CardContent>
    </Card>
  );
}

// Records list component
function RecordsList() {
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnchors() {
      const { data, error } = await supabase
        .from('anchors')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch anchors:', error);
      } else {
        setAnchors(data || []);
      }
      setLoading(false);
    }

    fetchAnchors();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (anchors.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{EMPTY_STATES.NO_RECORDS}</h3>
          <p className="text-muted-foreground mb-6">
            {EMPTY_STATES.NO_RECORDS_DESC}
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {ACTION_LABELS.CREATE_ANCHOR}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Records</CardTitle>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {ACTION_LABELS.CREATE_ANCHOR}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {anchors.map((anchor) => (
            <div
              key={anchor.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{anchor.filename}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(anchor.created_at).toLocaleDateString()}
                    {anchor.file_size && (
                      <span className="ml-2">
                        • {formatFileSize(anchor.file_size)}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <StatusBadge status={anchor.status} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function VaultPage() {
  return (
    <RoleRoute allowedRoles={['INDIVIDUAL']} fallbackPath="/org">
      <DashboardLayout>
        <div className="space-y-6">
          <PrivacyToggle />
          <RecordsList />
        </div>
      </DashboardLayout>
    </RoleRoute>
  );
}
