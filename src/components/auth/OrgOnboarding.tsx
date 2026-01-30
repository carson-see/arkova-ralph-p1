/**
 * OrgOnboarding Component
 *
 * KYB-lite form for ORG_ADMIN users to set up their organization.
 * Captures minimal org info required for verification.
 *
 * Fields:
 * - Legal name (required)
 * - Display name (required)
 * - Domain (optional, but warns if public email domain)
 */

import React, { useState } from 'react';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

// Validation schema
const orgSchema = z.object({
  legal_name: z
    .string()
    .min(1, 'Legal name is required')
    .max(255, 'Legal name must be 255 characters or less'),
  display_name: z
    .string()
    .min(1, 'Display name is required')
    .max(255, 'Display name must be 255 characters or less'),
  domain: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/.test(val),
      'Please enter a valid domain (e.g., example.com)'
    ),
});

// Public email domains that should trigger a warning
const PUBLIC_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'protonmail.com',
];

interface OrgOnboardingProps {
  onComplete?: () => void;
}

export function OrgOnboarding({ onComplete }: OrgOnboardingProps) {
  const { user } = useAuth();
  const [legalName, setLegalName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDomainWarning, setShowDomainWarning] = useState(false);

  const handleDomainChange = (value: string) => {
    const normalizedDomain = value.toLowerCase().trim();
    setDomain(normalizedDomain);
    setShowDomainWarning(PUBLIC_DOMAINS.includes(normalizedDomain));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    const result = orgSchema.safeParse({
      legal_name: legalName,
      display_name: displayName,
      domain: domain || undefined,
    });

    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    if (!user) {
      setError('Not authenticated');
      return;
    }

    setLoading(true);

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        legal_name: legalName,
        display_name: displayName,
        domain: domain || null,
      })
      .select()
      .single();

    if (orgError) {
      setError('Unable to create organization. Please try again.');
      setLoading(false);
      return;
    }

    // Link user to organization
    const { error: linkError } = await supabase
      .from('profiles')
      .update({ org_id: org.id })
      .eq('id', user.id);

    if (linkError) {
      setError('Unable to link organization. Please try again.');
      setLoading(false);
      return;
    }

    // Navigate to org dashboard or pending review
    window.location.href = '/org';
    onComplete?.();
  };

  return (
    <div className="org-onboarding-container">
      <h1>Set Up Your Organization</h1>
      <p className="subtitle">Tell us about your organization to get started.</p>

      <form onSubmit={handleSubmit} className="org-form">
        <div className="form-group">
          <label htmlFor="legal-name">Legal Name *</label>
          <input
            id="legal-name"
            type="text"
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            placeholder="Acme Corporation Inc."
            required
            disabled={loading}
          />
          <span className="form-hint">Your organization's official legal name</span>
        </div>

        <div className="form-group">
          <label htmlFor="display-name">Display Name *</label>
          <input
            id="display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Acme Corp"
            required
            disabled={loading}
          />
          <span className="form-hint">How your organization appears in the app</span>
        </div>

        <div className="form-group">
          <label htmlFor="domain">Domain (Optional)</label>
          <input
            id="domain"
            type="text"
            value={domain}
            onChange={(e) => handleDomainChange(e.target.value)}
            placeholder="acme.com"
            disabled={loading}
          />
          <span className="form-hint">Your organization's website domain</span>
          {showDomainWarning && (
            <div className="form-warning" role="alert">
              ⚠️ Public email domains (like gmail.com) may require additional verification.
              Consider using your company domain.
            </div>
          )}
        </div>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating organization...' : 'Create Organization'}
          </button>
        </div>
      </form>
    </div>
  );
}
