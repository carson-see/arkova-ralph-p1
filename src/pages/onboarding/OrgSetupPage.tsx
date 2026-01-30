/**
 * OrgSetupPage (P2-S6)
 *
 * Organization KYB-lite form for ORG_ADMIN onboarding.
 * Captures: legal_name, display_name, domain
 * Shows warning for public email domains.
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, Building2, Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/RouteGuard';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

// Public email domains that trigger manual review
const PUBLIC_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'mail.com',
  'protonmail.com',
];

// Validation schema
const orgSetupSchema = z.object({
  legal_name: z
    .string()
    .min(2, 'Legal name must be at least 2 characters')
    .max(255, 'Legal name must be 255 characters or less'),
  display_name: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(255, 'Display name must be 255 characters or less'),
  domain: z
    .string()
    .max(255, 'Domain must be 255 characters or less')
    .optional(),
});

type OrgSetupFormData = z.infer<typeof orgSetupSchema>;

export function OrgSetupPage() {
  const { user, profile, refetchProfile } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDomainWarning, setShowDomainWarning] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrgSetupFormData>({
    resolver: zodResolver(orgSetupSchema),
    defaultValues: {
      legal_name: '',
      display_name: '',
      domain: '',
    },
  });

  const domainValue = watch('domain');

  // Check for public domain warning
  useEffect(() => {
    if (domainValue) {
      const isPublic = PUBLIC_DOMAINS.some((pd) =>
        domainValue.toLowerCase().includes(pd)
      );
      setShowDomainWarning(isPublic);
    } else {
      setShowDomainWarning(false);
    }
  }, [domainValue]);

  // Auto-populate domain from user email
  useEffect(() => {
    if (user?.email && !domainValue) {
      const emailDomain = user.email.split('@')[1];
      if (emailDomain) {
        setValue('domain', emailDomain);
      }
    }
  }, [user?.email, domainValue, setValue]);

  // Redirect if already has org
  if (profile?.org_id) {
    window.location.href = profile.requires_manual_review
      ? '#/org/pending-review'
      : '#/org';
    return null;
  }

  const onSubmit = async (data: OrgSetupFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const domainValue = data.domain?.toLowerCase().trim() || null;
      
      const { error: rpcError } = await supabase.rpc('update_profile_onboarding', {
        p_role: 'ORG_ADMIN',
        p_org_legal_name: data.legal_name,
        p_org_display_name: data.display_name,
        p_org_domain: domainValue,
      });

      if (rpcError) {
        throw rpcError;
      }

      // Wait for profile to update before redirect (fixes HIGH-003)
      await refetchProfile();

      // Redirect to org dashboard or pending review
      // The route guard will handle the redirect based on profile state
      window.location.href = '#/org';
    } catch (err) {
      console.error('Org setup error:', err);
      setError('Failed to create organization. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Set Up Your Organization</CardTitle>
            <CardDescription>
              Tell us about your organization to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="legal_name">Legal Name *</Label>
                <Input
                  id="legal_name"
                  placeholder="Acme Corporation Inc."
                  {...register('legal_name')}
                  disabled={isLoading}
                />
                {errors.legal_name && (
                  <p className="text-sm text-destructive">
                    {errors.legal_name.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Your organization's official registered name
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name *</Label>
                <Input
                  id="display_name"
                  placeholder="Acme Corp"
                  {...register('display_name')}
                  disabled={isLoading}
                />
                {errors.display_name && (
                  <p className="text-sm text-destructive">
                    {errors.display_name.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  How your organization appears in the app
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain">Email Domain</Label>
                <Input
                  id="domain"
                  placeholder="acme.com"
                  {...register('domain')}
                  disabled={isLoading}
                />
                {errors.domain && (
                  <p className="text-sm text-destructive">
                    {errors.domain.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Your organization's email domain (optional)
                </p>
              </div>

              {showDomainWarning && (
                <div className="rounded-md bg-yellow-500/10 border border-yellow-500/50 p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800">
                        Public Email Domain Detected
                      </p>
                      <p className="text-yellow-700 mt-1">
                        Organization accounts using public email domains (like
                        gmail.com) require manual verification. You'll be able to
                        access your account after our team reviews it.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Organization
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => (window.location.href = '#/onboarding/role')}
                disabled={isLoading}
              >
                ← Back to role selection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
