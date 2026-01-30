/**
 * AuthForm Component (P2-S1)
 *
 * Sign-in/sign-up form with:
 * - Email/password authentication
 * - Google OAuth
 * - Non-enumerating errors
 * - "Check your email" signup state
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { AUTH_MESSAGES, AUTH_LABELS, ACTION_LABELS } from '@/lib/copy';

// Validation schema
const authSchema = z.object({
  email: z.string().email(AUTH_MESSAGES.INVALID_EMAIL),
  password: z.string().min(8, AUTH_MESSAGES.PASSWORD_MIN_LENGTH),
});

type AuthFormData = z.infer<typeof authSchema>;

interface AuthFormProps {
  defaultMode?: 'signin' | 'signup';
}

export function AuthForm({ defaultMode = 'signin' }: AuthFormProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });

        if (signUpError) {
          // Non-enumerating: don't reveal if email exists
          setError(AUTH_MESSAGES.GENERIC_ERROR);
        } else {
          // Show "check your email" state
          setSignupSuccess(true);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (signInError) {
          // Non-enumerating error
          setError(AUTH_MESSAGES.INVALID_CREDENTIALS);
        }
        // Success: session hook will handle redirect
      }
    } catch {
      setError(AUTH_MESSAGES.GENERIC_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/#/auth/callback`,
        },
      });

      if (error) {
        setError(AUTH_MESSAGES.GENERIC_ERROR);
      }
    } catch {
      setError(AUTH_MESSAGES.GENERIC_ERROR);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Signup success state
  if (signupSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>{AUTH_MESSAGES.CHECK_EMAIL_TITLE}</CardTitle>
          <CardDescription>{AUTH_MESSAGES.CHECK_EMAIL_DESC}</CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button
            variant="link"
            onClick={() => {
              setSignupSuccess(false);
              setMode('signin');
            }}
          >
            {AUTH_LABELS.BACK_TO_SIGNIN}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'signin' ? AUTH_LABELS.SIGNIN_TITLE : AUTH_LABELS.SIGNUP_TITLE}
        </CardTitle>
        <CardDescription>
          {mode === 'signin' ? AUTH_LABELS.SIGNIN_DESC : AUTH_LABELS.SIGNUP_DESC}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{AUTH_LABELS.EMAIL}</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{AUTH_LABELS.PASSWORD}</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'signin' ? ACTION_LABELS.SIGN_IN : ACTION_LABELS.SIGN_UP}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              {AUTH_LABELS.OR_CONTINUE}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {AUTH_LABELS.CONTINUE_GOOGLE}
        </Button>
      </CardContent>
      <CardFooter className="justify-center">
        <Button
          variant="link"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        >
          {mode === 'signin' ? AUTH_LABELS.NO_ACCOUNT : AUTH_LABELS.HAS_ACCOUNT}
        </Button>
      </CardFooter>
    </Card>
  );
}
