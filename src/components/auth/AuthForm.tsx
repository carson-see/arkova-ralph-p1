/**
 * AuthForm Component
 *
 * Handles sign-in and sign-up flows with email/password and Google OAuth.
 * Uses Zod for form validation and follows terminology guidelines.
 *
 * Features:
 * - Email/password authentication
 * - Google OAuth integration
 * - Form validation with user-friendly errors
 * - Non-enumerating error messages (doesn't reveal if email exists)
 */

import React, { useState } from 'react';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { MESSAGES } from '../../lib/copy';

// Form validation schemas
const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be less than 72 characters');

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onSuccess?: () => void;
  onModeChange?: (mode: 'signin' | 'signup') => void;
}

export function AuthForm({ mode, onSuccess, onModeChange }: AuthFormProps) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateForm = (): boolean => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) return;

    setLoading(true);

    if (mode === 'signin') {
      const { error: authError } = await signIn(email, password);
      if (authError) {
        // Non-enumerating error message
        setError('Invalid email or password. Please try again.');
      } else {
        onSuccess?.();
      }
    } else {
      const { error: authError } = await signUp(email, password);
      if (authError) {
        // Non-enumerating error message
        setError('Unable to create account. Please try again.');
      } else {
        setSuccess(true);
      }
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const { error: authError } = await signInWithGoogle();
    if (authError) {
      setError('Unable to sign in with Google. Please try again.');
    }
    setLoading(false);
  };

  if (success && mode === 'signup') {
    return (
      <div className="auth-success">
        <h2>Check Your Email</h2>
        <p>
          We've sent a confirmation link to <strong>{email}</strong>.
        </p>
        <p>Please check your inbox and click the link to verify your account.</p>
      </div>
    );
  }

  return (
    <div className="auth-form-container">
      <h2>{mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={loading}
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={loading}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          />
        </div>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div className="auth-divider">
        <span>or</span>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="btn-google"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>

      <div className="auth-switch">
        {mode === 'signin' ? (
          <p>
            Don't have an account?{' '}
            <button type="button" onClick={() => onModeChange?.('signup')}>
              Sign up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <button type="button" onClick={() => onModeChange?.('signin')}>
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
