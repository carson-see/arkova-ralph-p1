/**
 * OrgDashboardPage
 *
 * Organization admin dashboard (placeholder for P5).
 * Shows org records and management options.
 */

import { useState, useEffect } from 'react';
import { FileText, Plus, Users, Loader2 } from 'lucide-react';
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
type Organization = Database['public']['Tables']['organizations']['Row'];

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

// Helper to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Org info card
function OrgInfoCard({ org }: { org: Organization | null }) {
  if (!org) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">{org.display_name}</CardTitle>
            <CardDescription>{org.legal_name}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {org.domain && <span>Domain: {org.domain}</span>}
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              org.verification_status === 'VERIFIED'
                ? 'bg-green-500/10 text-green-700'
                : 'bg-yellow-500/10 text-yellow-700'
            }`}
          >
            {org.verification_status}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Records list component
function OrgRecordsList() {
  const { profile } = useAuthContext();
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnchors() {
      if (!profile?.org_id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('anchors')
        .select('*')
        .eq('org_id', profile.org_id)
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
  }, [profile?.org_id]);

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
          <h3 className="text-lg font-medium mb-2">
            {EMPTY_STATES.NO_ORG_RECORDS}
          </h3>
          <p className="text-muted-foreground mb-6">
            {EMPTY_STATES.NO_ORG_RECORDS_DESC}
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
          <CardTitle>Organization Records</CardTitle>
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
              <div className="flex items-center gap-2">
                {anchor.legal_hold && (
                  <span className="text-xs text-orange-600 font-medium">
                    Legal Hold
                  </span>
                )}
                <StatusBadge status={anchor.status} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function OrgDashboardPage() {
  const { profile } = useAuthContext();
  const [org, setOrg] = useState<Organization | null>(null);

  useEffect(() => {
    async function fetchOrg() {
      if (!profile?.org_id) return;

      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.org_id)
        .single();

      if (error) {
        console.error('Failed to fetch org:', error);
      } else {
        setOrg(data);
      }
    }

    fetchOrg();
  }, [profile?.org_id]);

  // Redirect if pending review
  if (profile?.requires_manual_review) {
    window.location.href = '#/org/pending-review';
    return null;
  }

  return (
    <RoleRoute allowedRoles={['ORG_ADMIN']} fallbackPath="/vault">
      <DashboardLayout>
        <div className="space-y-6">
          <OrgInfoCard org={org} />
          <OrgRecordsList />
        </div>
      </DashboardLayout>
    </RoleRoute>
  );
}
