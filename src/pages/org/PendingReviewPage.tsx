/**
 * PendingReviewPage (P2-S7)
 *
 * Holding page for ORG_ADMIN users awaiting manual review.
 * All /org/* routes redirect here when requires_manual_review is true.
 */

import { Clock, Mail, LogOut } from 'lucide-react';
import { RoleRoute } from '@/components/auth/RouteGuard';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function PendingReviewPage() {
  const { user, profile, signOut } = useAuthContext();

  // If not flagged for review, redirect to org dashboard
  if (profile && !profile.requires_manual_review) {
    window.location.href = '#/org';
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '#/auth';
  };

  return (
    <RoleRoute allowedRoles={['ORG_ADMIN']} fallbackPath="/vault">
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle>Account Under Review</CardTitle>
            <CardDescription>
              Your organization account is pending verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-md bg-muted p-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Our team is reviewing your organization details. This typically
                takes 1-2 business days.
              </p>
              <p className="text-sm text-muted-foreground">
                Once approved, you'll have full access to your organization
                dashboard and can start securing documents.
              </p>
            </div>

            {profile?.manual_review_reason && (
              <div className="rounded-md bg-yellow-500/10 border border-yellow-500/30 p-4">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">Review reason: </span>
                  {profile.manual_review_reason}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  We'll notify you at{' '}
                  <span className="font-medium text-foreground">
                    {user?.email}
                  </span>
                </span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleRoute>
  );
}
