import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, HandCoins, LayoutDashboard, Trophy, Target, Shield, LogOut } from 'lucide-react';
import { useSession } from '@/app/providers';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/lib/auth-store';
import { queryClient } from '@/app/queryClient';
import { dashboardApi, scoreApi, winnerApi, subscriptionApi } from '@/lib/requests';

const userLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, prefetch: () => queryClient.prefetchQuery({ queryKey: ['dashboard', 'me'], queryFn: dashboardApi.user }) },
  { to: '/subscription', label: 'Subscription', icon: CreditCard, prefetch: () => queryClient.prefetchQuery({ queryKey: ['subscription', 'me'], queryFn: subscriptionApi.get }) },
  { to: '/scores', label: 'Scores', icon: Target, prefetch: () => queryClient.prefetchQuery({ queryKey: ['scores'], queryFn: scoreApi.list }) },
  { to: '/draws', label: 'Draws', icon: Trophy },
  { to: '/winnings', label: 'Winnings', icon: HandCoins, prefetch: () => queryClient.prefetchQuery({ queryKey: ['winnings'], queryFn: winnerApi.listMyWinnings }) },
];

const adminLinks = [
  { to: '/admin', label: 'Admin Home', icon: Shield, prefetch: () => queryClient.prefetchQuery({ queryKey: ['dashboard', 'admin'], queryFn: dashboardApi.admin }) },
  { to: '/admin/users', label: 'Users', icon: LayoutDashboard },
  { to: '/admin/subscriptions', label: 'Subscriptions', icon: Target },
  { to: '/admin/draws', label: 'Draws', icon: Trophy },
  { to: '/admin/charities', label: 'Charities', icon: HandCoins },
  { to: '/admin/winners', label: 'Winners', icon: Shield },
  { to: '/admin/broadcast', label: 'Broadcast', icon: LogOut },
];

export function AppLayout() {
  const { user } = useSession();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const isAdmin = user?.role === 'admin';
  const links = isAdmin ? adminLinks : userLinks;

  return (
    <div className="min-h-screen">
      <div className="noise-overlay" />
      <div className={cn("page-shell grid gap-6 py-6 md:grid-cols-[88px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)] md:py-8", !isAdmin && "pb-28 md:pb-8")}>
        <aside className={cn('glass-panel hidden rounded-3xl p-4 md:sticky md:top-6 md:block md:h-[calc(100vh-3rem)] md:p-5', isAdmin && 'bg-[linear-gradient(180deg,rgba(39,30,66,0.82),rgba(14,14,23,0.9))]')}>
          <div className="flex items-center gap-3 border-b border-white/8 pb-4">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald/15 text-emerald">T</div>
            <div className="hidden lg:block">
              <div className="font-display text-lg font-bold">The Golf Draw</div>
              <div className="text-xs uppercase tracking-[0.22em] text-muted">{user?.role ?? 'Guest'}</div>
            </div>
          </div>
          <nav className="mt-4 grid gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onMouseEnter={() => link.prefetch?.()}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-muted transition hover:bg-white/6 hover:text-text',
                      isActive && 'bg-emerald/12 text-text',
                    )
                  }
                >
                  <Icon size={16} />
                  <span className="hidden lg:inline">{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
          <div className="mt-6 hidden rounded-3xl border border-white/8 bg-white/4 p-4 lg:block">
            <div className="text-xs uppercase tracking-[0.24em] text-muted">Signed in as</div>
            <div className="mt-2 font-medium text-text">{user?.fullName}</div>
            <div className="text-sm text-muted">{user?.email}</div>
            <Button className="mt-4 w-full" variant="secondary" onClick={logout}>
              Log out
            </Button>
          </div>
        </aside>
        <section className="min-w-0">
          <Outlet />
        </section>
      </div>

      {!isAdmin ? (
        <nav className="fixed inset-x-4 bottom-5 z-50 rounded-[32px] border border-white/10 bg-black/80 p-2 backdrop-blur-md md:hidden">
          <div className="flex items-center justify-between">
            {userLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onMouseEnter={() => link.prefetch?.()}
                  onTouchStart={() => link.prefetch?.()}
                  className={cn(
                    'relative flex h-11 items-center justify-center gap-2 rounded-full px-3 transition-all duration-300',
                    isActive ? 'flex-[1.5] bg-emerald/15 text-emerald' : 'flex-1 text-muted hover:bg-white/5 hover:text-text'
                  )}
                >
                  <Icon size={18} />
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="overflow-hidden whitespace-nowrap text-xs font-medium"
                      >
                        {link.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              );
            })}
          </div>
        </nav>
      ) : null}
    </div>
  );
}