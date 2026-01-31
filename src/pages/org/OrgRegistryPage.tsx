/**
 * OrgRegistryPage (P5-S1)
 *
 * Organization registry table with server-side pagination.
 * Shows all anchors belonging to the organization with filters and search.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
} from 'lucide-react';
import { RoleRoute } from '@/components/auth/RouteGuard';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import {
  ANCHOR_STATUS_LABELS,
  EMPTY_STATES,
} from '@/lib/copy';
import type { Database, AnchorStatus } from '@/types/database.types';

type Anchor = Database['public']['Tables']['anchors']['Row'];

// =============================================================================
// CONSTANTS
// =============================================================================

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
const STATUS_FILTER_OPTIONS: Array<AnchorStatus | 'ALL'> = ['ALL', 'PENDING', 'SECURED', 'REVOKED'];

// =============================================================================
// URL QUERY PARAMS HELPERS
// =============================================================================

interface QueryParams {
  page: number;
  limit: number;
  status: AnchorStatus | 'ALL';
  search: string;
}

function getQueryParams(): QueryParams {
  const hash = window.location.hash;
  const queryIndex = hash.indexOf('?');
  if (queryIndex === -1) {
    return { page: 1, limit: 10, status: 'ALL', search: '' };
  }

  const params = new URLSearchParams(hash.slice(queryIndex + 1));
  return {
    page: Math.max(1, parseInt(params.get('page') || '1', 10)),
    limit: PAGE_SIZE_OPTIONS.includes(parseInt(params.get('limit') || '10', 10) as typeof PAGE_SIZE_OPTIONS[number])
      ? (parseInt(params.get('limit') || '10', 10) as typeof PAGE_SIZE_OPTIONS[number])
      : 10,
    status: STATUS_FILTER_OPTIONS.includes(params.get('status') as AnchorStatus | 'ALL')
      ? (params.get('status') as AnchorStatus | 'ALL')
      : 'ALL',
    search: params.get('search') || '',
  };
}

function setQueryParams(params: Partial<QueryParams>) {
  const current = getQueryParams();
  const updated = { ...current, ...params };
  
  const searchParams = new URLSearchParams();
  searchParams.set('page', String(updated.page));
  searchParams.set('limit', String(updated.limit));
  if (updated.status !== 'ALL') {
    searchParams.set('status', updated.status);
  }
  if (updated.search) {
    searchParams.set('search', updated.search);
  }
  
  window.location.hash = `/org/registry?${searchParams.toString()}`;
}

// =============================================================================
// COMPONENTS
// =============================================================================

/** Status badge component */
function StatusBadge({ status }: { status: AnchorStatus }) {
  const colors = {
    PENDING: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30',
    SECURED: 'bg-green-500/10 text-green-700 border-green-500/30',
    REVOKED: 'bg-red-500/10 text-red-700 border-red-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colors[status]}`}
    >
      {ANCHOR_STATUS_LABELS[status]}
    </span>
  );
}

/** Truncate fingerprint for display */
function truncateFingerprint(fingerprint: string): string {
  if (fingerprint.length <= 16) return fingerprint;
  return `${fingerprint.slice(0, 8)}...${fingerprint.slice(-8)}`;
}

/** Format date for display */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Search input with debounce */
function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [localValue, setLocalValue] = useState(value);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localValue, value, onChange]);

  // Sync with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search by filename..."
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="pl-9 w-full sm:w-64"
      />
    </div>
  );
}

/** Status filter dropdown */
function StatusFilter({
  value,
  onChange,
}: {
  value: AnchorStatus | 'ALL';
  onChange: (value: AnchorStatus | 'ALL') => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-muted-foreground" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as AnchorStatus | 'ALL')}
        className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="ALL">All Statuses</option>
        {STATUS_FILTER_OPTIONS.filter((s) => s !== 'ALL').map((status) => (
          <option key={status} value={status}>
            {ANCHOR_STATUS_LABELS[status as AnchorStatus]}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Page size selector */
function PageSizeSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>Show</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="border rounded-md px-2 py-1 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {PAGE_SIZE_OPTIONS.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
      <span>per page</span>
    </div>
  );
}

/** Pagination controls */
function Pagination({
  page,
  totalPages,
  totalCount,
  limit,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  onPageChange: (page: number) => void;
}) {
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalCount);

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">
        {totalCount > 0
          ? `Showing ${startItem}-${endItem} of ${totalCount} records`
          : 'No records'}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous</span>
        </Button>
        <span className="text-sm text-muted-foreground px-2">
          Page {page} of {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next</span>
        </Button>
      </div>
    </div>
  );
}

/** Registry table component */
function RegistryTable() {
  const { profile } = useAuthContext();
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [queryParams, setLocalQueryParams] = useState(getQueryParams);

  // Sync with URL changes
  useEffect(() => {
    const handleHashChange = () => {
      setLocalQueryParams(getQueryParams());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const { page, limit, status, search } = queryParams;

  // Calculate total pages
  const totalPages = useMemo(
    () => Math.ceil(totalCount / limit),
    [totalCount, limit]
  );

  // Fetch anchors with server-side pagination
  useEffect(() => {
    async function fetchAnchors() {
      if (!profile?.org_id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      // Build query
      let query = supabase
        .from('anchors')
        .select('*', { count: 'exact' })
        .eq('org_id', profile.org_id)
        .is('deleted_at', null);

      // Apply status filter
      if (status !== 'ALL') {
        query = query.eq('status', status);
      }

      // Apply search filter
      if (search) {
        query = query.ilike('filename', `%${search}%`);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, count, error } = await query;

      if (error) {
        console.error('Failed to fetch anchors:', error);
        setAnchors([]);
        setTotalCount(0);
      } else {
        setAnchors(data || []);
        setTotalCount(count || 0);
      }

      setLoading(false);
    }

    fetchAnchors();
  }, [profile?.org_id, page, limit, status, search]);

  // Handle filter/search changes (reset to page 1)
  const handleStatusChange = useCallback((newStatus: AnchorStatus | 'ALL') => {
    setQueryParams({ status: newStatus, page: 1 });
  }, []);

  const handleSearchChange = useCallback((newSearch: string) => {
    setQueryParams({ search: newSearch, page: 1 });
  }, []);

  const handlePageSizeChange = useCallback((newLimit: number) => {
    setQueryParams({ limit: newLimit, page: 1 });
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setQueryParams({ page: newPage });
  }, []);

  // Handle row click
  const handleRowClick = useCallback((anchorId: string) => {
    window.location.hash = `/vault/anchor/${anchorId}`;
  }, []);

  // Empty state
  if (!loading && anchors.length === 0 && !search && status === 'ALL') {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {EMPTY_STATES.NO_ORG_RECORDS}
          </h3>
          <p className="text-muted-foreground">
            {EMPTY_STATES.NO_ORG_RECORDS_DESC}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <CardTitle>Organization Registry</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row gap-3">
              <SearchInput value={search} onChange={handleSearchChange} />
              <StatusFilter value={status} onChange={handleStatusChange} />
            </div>
            <PageSizeSelector value={limit} onChange={handlePageSizeChange} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : anchors.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No records found matching your filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium text-muted-foreground">
                      Filename
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground">
                      Fingerprint
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {anchors.map((anchor) => (
                    <tr
                      key={anchor.id}
                      className="border-b last:border-0 hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(anchor.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleRowClick(anchor.id);
                        }
                      }}
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate max-w-[200px]">
                            {anchor.filename}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <code className="text-sm text-muted-foreground font-mono">
                          {truncateFingerprint(anchor.fingerprint)}
                        </code>
                      </td>
                      <td className="py-3">
                        <StatusBadge status={anchor.status} />
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {formatDate(anchor.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {anchors.map((anchor) => (
                <div
                  key={anchor.id}
                  className="p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(anchor.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleRowClick(anchor.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium truncate">
                        {anchor.filename}
                      </span>
                    </div>
                    <StatusBadge status={anchor.status} />
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-mono">
                      {truncateFingerprint(anchor.fingerprint)}
                    </p>
                    <p>{formatDate(anchor.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="pt-4 border-t">
              <Pagination
                page={page}
                totalPages={totalPages}
                totalCount={totalCount}
                limit={limit}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// PAGE EXPORT
// =============================================================================

export function OrgRegistryPage() {
  return (
    <RoleRoute allowedRoles={['ORG_ADMIN']} fallbackPath="/vault">
      <DashboardLayout>
        <RegistryTable />
      </DashboardLayout>
    </RoleRoute>
  );
}
