/**
 * RoleSelectionPage (P2-S5)
 *
 * User selects their role: Individual or Organization Admin
 * Calls onboarding function and routes accordingly.
 */

import { useState } from 'react';
import { User, Building2, Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/RouteGuard';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { USER_ROLE_LABELS, USER_ROLE_DESCRIPTIONS } from '@/lib/copy';

type RoleOption = 'INDIVIDUAL' | 'ORG_ADMIN';

interface RoleCardProps {
  role: RoleOption;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
  disabled: boolean;
}

function RoleCard({ role, icon, selected, onSelect, disabled }: RoleCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all ${
        selected
          ? 'border-primary ring-2 ring-primary ring-offset-2'
          : 'hover:border-primary/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => !disabled && onSelect()}
    >
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          {icon}
        </div>
        <CardTitle className="text-lg">{USER_ROLE_LABELS[role]}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-center">
          {USER_ROLE_DESCRIPTIONS[role]}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

export function RoleSelectionPage() {
  const { profile } = useAuthContext();
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If profile already has role, redirect will happen via RouteGuard
  if (profile?.role) {
    return null;
  }

  const handleContinue = async () => {
    if (!selectedRole) return;

    setIsLoading(true);
    setError(null);

    try {
      if (selectedRole === 'INDIVIDUAL') {
        // Call onboarding function directly for individual
        const { error: rpcError } = await supabase.rpc('update_profile_onboarding', {
          p_role: 'INDIVIDUAL',
        });

        if (rpcError) {
          throw rpcError;
        }

        // Redirect to vault
        window.location.href = '#/vault';
      } else {
        // ORG_ADMIN needs org details first
        window.location.href = '#/onboarding/org';
      }
    } catch (err) {
      console.error('Role selection error:', err);
      setError('Failed to set role. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Welcome to Arkova</h1>
            <p className="text-muted-foreground mt-2">
              How will you be using Arkova?
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <RoleCard
              role="INDIVIDUAL"
              icon={<User className="h-6 w-6 text-primary" />}
              selected={selectedRole === 'INDIVIDUAL'}
              onSelect={() => setSelectedRole('INDIVIDUAL')}
              disabled={isLoading}
            />
            <RoleCard
              role="ORG_ADMIN"
              icon={<Building2 className="h-6 w-6 text-primary" />}
              selected={selectedRole === 'ORG_ADMIN'}
              onSelect={() => setSelectedRole('ORG_ADMIN')}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive text-center">
              {error}
            </div>
          )}

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleContinue}
              disabled={!selectedRole || isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
