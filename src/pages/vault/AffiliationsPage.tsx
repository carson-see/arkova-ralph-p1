/**
 * AffiliationsPage (P3-S3)
 *
 * Placeholder view for future org relationships.
 * Shows empty state for upcoming affiliations feature.
 */

import { Building2 } from 'lucide-react';
import { RoleRoute } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function AffiliationsPage() {
  return (
    <RoleRoute allowedRoles={['INDIVIDUAL']} fallbackPath="/org">
      <DashboardLayout>
        <Card>
          <CardHeader>
            <CardTitle>Affiliations</CardTitle>
            <CardDescription>
              Organizations you're connected with
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Affiliations Yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              When you're invited to an organization or receive verifications
              from organizations, they'll appear here.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    </RoleRoute>
  );
}
