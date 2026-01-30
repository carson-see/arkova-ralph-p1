/**
 * DashboardLayout Component (P3-S1)
 *
 * Responsive dashboard layout with sidebar and header.
 * Used by both Individual Vault and Org Admin pages.
 */

import { ReactNode, useState } from 'react';
import {
  Menu,
  X,
  LogOut,
  Shield,
  ShieldOff,
  FileText,
  Users,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { NAV_LABELS } from '@/lib/copy';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  roles?: Array<'INDIVIDUAL' | 'ORG_ADMIN'>;
}

const navItems: NavItem[] = [
  {
    label: NAV_LABELS.MY_RECORDS,
    href: '#/vault',
    icon: <FileText className="h-5 w-5" />,
    roles: ['INDIVIDUAL'],
  },
  {
    label: 'Affiliations',
    href: '#/affiliations',
    icon: <Users className="h-5 w-5" />,
    roles: ['INDIVIDUAL'],
  },
  {
    label: NAV_LABELS.ORG_RECORDS,
    href: '#/org',
    icon: <FileText className="h-5 w-5" />,
    roles: ['ORG_ADMIN'],
  },
  {
    label: NAV_LABELS.ORGANIZATION,
    href: '#/org/settings',
    icon: <Users className="h-5 w-5" />,
    roles: ['ORG_ADMIN'],
  },
  {
    label: NAV_LABELS.SETTINGS,
    href: '#/settings',
    icon: <Settings className="h-5 w-5" />,
  },
  {
    label: NAV_LABELS.HELP,
    href: '#/help',
    icon: <HelpCircle className="h-5 w-5" />,
  },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, profile, signOut } = useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || (profile?.role && item.roles.includes(profile.role))
  );

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '#/auth';
  };

  const isPublic = profile?.is_public ?? false;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <a href="#/" className="text-xl font-bold text-primary">
              Arkova
            </a>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                {item.label}
              </a>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-background border-b">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold hidden sm:block">
              {profile?.role === 'ORG_ADMIN' ? 'Organization' : 'Your Vault'}
            </h1>
          </div>

          {/* Vault status indicator (Individual only) */}
          {profile?.role === 'INDIVIDUAL' && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                isPublic
                  ? 'bg-green-500/10 text-green-700'
                  : 'bg-yellow-500/10 text-yellow-700'
              }`}
            >
              {isPublic ? (
                <>
                  <ShieldOff className="h-4 w-4" />
                  <span className="hidden sm:inline">Vault Public</span>
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Vault Private</span>
                </>
              )}
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
