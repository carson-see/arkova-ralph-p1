/**
 * ExportButton
 *
 * Button component for exporting org-scoped anchor records to CSV.
 * Fetches all organization anchors and triggers a browser download.
 */

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import {
  exportAnchorsToCSV,
  generateExportFilename,
  downloadBlob,
} from '@/lib/csvExport';

interface ExportButtonProps {
  /** Optional className for styling */
  className?: string;
  /** Button size variant */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Button variant */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
}

export function ExportButton({
  className,
  size = 'sm',
  variant = 'outline',
}: ExportButtonProps) {
  const { profile } = useAuthContext();
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    if (!profile?.org_id) {
      console.error('No org_id available for export');
      return;
    }

    setLoading(true);

    try {
      // Fetch all org anchors (RLS enforced on server)
      const { data, error } = await supabase
        .from('anchors')
        .select('*')
        .eq('org_id', profile.org_id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch anchors for export:', error);
        return;
      }

      const anchors = data || [];

      // Generate and download CSV
      const blob = exportAnchorsToCSV(anchors);
      const filename = generateExportFilename();
      downloadBlob(blob, filename);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={loading || !profile?.org_id}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </>
      )}
    </Button>
  );
}
