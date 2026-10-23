import { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  ListChecks,
  Sparkles,
  LineChart,
  Settings,
  LogOut,
  HelpCircle,
  CalendarClock,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import Brand from '@/components/Brand';
import { base44 } from '@/api/base44Client';
import { initials } from '@/lib/format';

const NAV = [
  { to: '/overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/learn', label: 'Learn', icon: Layers },
  { to: '/practice', label: 'Practice', icon: ListChecks },
  { to: '/buddy', label: 'AI Study Buddy', icon: Sparkles },
  { to: '/progress', label: 'Progress', icon: LineChart },
];

export default function AppLayout() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    base44.auth.me().then((me) => { if (alive) setUser(me); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const signOut = async () => {
    await base44.auth.logout('/login');
  };

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Learner';

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col bg-brand-ink lg:flex">
        <div className="px-5 pb-5 pt-6">
          <Link to="/overview" aria-label="AzureAce overview">
            <Brand tone="light" />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3" aria-label="Primary">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition ${
                  isActive
                    ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-[17px] w-[17px] ${isActive ? 'text-brand-cyan' : ''}`} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-3">
          <Link
            to="/plan"
            className="block rounded-xl border border-white/10 bg-white/[0.04] p-3.5 transition hover:border-brand-cyan/40"
          >
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-brand-cyan">
              <CalendarClock className="h-3.5 w-3.5" /> Study plan
            </span>
            <p className="mt-1.5 text-[12.5px] leading-snug text-white/60">
              Turn your exam date into sessions your week can hold.
            </p>
          </Link>
        </div>

        <div className="border-t border-white/10 p-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition hover:bg-white/5"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-azure/20 text-[11px] font-semibold text-brand-cyan">
                {initials(displayName)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-medium text-white">{displayName}</span>
                <span className="block truncate text-[10.5px] text-white/45">{user?.email || 'signed in'}</span>
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-white/40" />
            </button>
            {menuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-xl border border-white/10 bg-brand-navy py-1 shadow-xl">
                <Link
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-[12.5px] text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  <Settings className="h-3.5 w-3.5" /> Settings
                </Link>
                <Link
                  to="/settings#help"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-[12.5px] text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  <HelpCircle className="h-3.5 w-3.5" /> Help
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md lg:hidden">
        <Link to="/overview" aria-label="AzureAce overview">
          <Brand />
        </Link>
        <div className="flex items-center gap-1">
          <Link
            to="/settings"
            className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition hover:bg-secondary"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileNavOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition hover:bg-secondary"
            aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileNavOpen}
          >
            {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {mobileNavOpen && (
        <div className="sticky top-14 z-30 border-b border-border bg-card px-4 py-3 lg:hidden">
          <p className="text-[12px] font-medium text-brand-ink">{displayName}</p>
          <p className="text-[11px] text-muted-foreground">{user?.email}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to="/plan"
              onClick={() => setMobileNavOpen(false)}
              className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-brand-navy"
            >
              Study plan
            </Link>
            <Link
              to="/settings"
              onClick={() => setMobileNavOpen(false)}
              className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-brand-navy"
            >
              Settings
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-muted-foreground"
            >
              Sign out
            </button>
          </div>
        </div>
      )}

      <div className="lg:pl-[248px]">
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 md:px-8 md:py-10 lg:pb-16">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
        aria-label="Primary"
      >
        <div className="grid grid-cols-5">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition ${
                  isActive ? 'text-brand-azure' : 'text-muted-foreground'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.2 : 1.8} />
                  <span className="leading-none">{label === 'AI Study Buddy' ? 'Buddy' : label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}