/**
 * InviteMemberModal
 *
 * Modal dialog for inviting members to an organization by email.
 * Supports single email or comma-separated list input.
 */

import { useState } from 'react';
import { UserPlus, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  parseEmailList,
  validateEmails,
  inviteMembers,
  type InviteResult,
} from '@/lib/memberInvite';

interface InviteMemberModalProps {
  orgId: string;
  trigger?: React.ReactNode;
  onInviteComplete?: (results: InviteResult[]) => void;
}

export function InviteMemberModal({
  orgId,
  trigger,
  onInviteComplete,
}: InviteMemberModalProps) {
  const [open, setOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<InviteResult[] | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Parse and validate emails on input change
  const parsedEmails = parseEmailList(emailInput);
  const { valid, invalid } = validateEmails(parsedEmails);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (parsedEmails.length === 0) {
      setValidationError('Please enter at least one email address');
      return;
    }

    if (invalid.length > 0 && valid.length === 0) {
      setValidationError('No valid email addresses found');
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    try {
      const response = await inviteMembers(parsedEmails, orgId);
      setResults(response.results);
      onInviteComplete?.(response.results);
    } catch (error) {
      console.error('Failed to send invites:', error);
      setValidationError('Failed to send invitations. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setEmailInput('');
    setResults(null);
    setValidationError(null);
  };

  const handleClose = () => {
    handleReset();
    setOpen(false);
  };

  // Render result icon based on status
  const ResultIcon = ({ status }: { status: InviteResult['status'] }) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Members
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Team Members</DialogTitle>
          <DialogDescription>
            Enter email addresses to invite new members to your organization.
            Separate multiple emails with commas.
          </DialogDescription>
        </DialogHeader>

        {!results ? (
          // Input form
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emails">Email Addresses</Label>
              <Input
                id="emails"
                type="text"
                placeholder="email@example.com, another@example.com"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setValidationError(null);
                }}
                disabled={isSubmitting}
                className="w-full"
              />

              {/* Live validation feedback */}
              {parsedEmails.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {valid.length > 0 && (
                    <span className="text-green-600">
                      {valid.length} valid email{valid.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  {valid.length > 0 && invalid.length > 0 && ' • '}
                  {invalid.length > 0 && (
                    <span className="text-yellow-600">
                      {invalid.length} invalid
                    </span>
                  )}
                </div>
              )}

              {/* Validation error */}
              {validationError && (
                <p className="text-sm text-destructive">{validationError}</p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || valid.length === 0}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Send Invites
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          // Results view
          <div className="space-y-4">
            <div className="max-h-60 overflow-y-auto space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                >
                  <ResultIcon status={result.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.email}</p>
                    <p className="text-xs text-muted-foreground">{result.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="text-sm text-muted-foreground border-t pt-3">
              {results.filter((r) => r.status === 'success').length} of{' '}
              {results.length} invitation{results.length !== 1 ? 's' : ''} sent
              successfully
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleReset}>
                Invite More
              </Button>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
