/**
 * AuthPage (P2-S1)
 *
 * Sign-in/sign-up page for unauthenticated users.
 */

import { AuthForm } from '@/components/auth/AuthForm';
import { PublicRoute } from '@/components/auth/RouteGuard';

export function AuthPage() {
  return (
    <PublicRoute>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">Arkova</h1>
            <p className="text-muted-foreground mt-2">
              Secure your documents with verifiable proof
            </p>
          </div>
          <AuthForm />
        </div>
      </div>
    </PublicRoute>
  );
}
