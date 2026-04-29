import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, IndianRupee, LayoutDashboard, Trophy, Target, 
  Shield, LogOut, CircleUser, Megaphone, Users, Heart, Menu, X, Bell 
} from 'lucide-react';
import { useSession } from '@/app/providers';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/lib/auth-store';
import { queryClient } from '@/app/queryClient';
import { dashboardApi, scoreApi, winnerApi, subscriptionApi, adminApi, systemApi } from '@/lib/requests';

const userLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, prefetch: () => queryClient.prefetchQuery({ queryKey: ['dashboard', 'me'], queryFn: dashboardApi.user }) },
  { to: '/subscription', label: 'Subscription', icon: CreditCard, prefetch: () => queryClient.prefetchQuery({ queryKey: ['subscription', 'me'], queryFn: subscriptionApi.me }) },
  { to: '/scores', label: 'Scores', icon: Target, prefetch: () => queryClient.prefetchQuery({ queryKey: ['scores'], queryFn: scoreApi.list }) },
  { to: '/draws', label: 'Draws', icon: Trophy },
  { to: '/winnings', label: 'Winnings', icon: IndianRupee, prefetch: () => queryClient.prefetchQuery({ queryKey: ['winnings'], queryFn: winnerApi.mine }) },
  { to: '/profile', label: 'Profile', icon: CircleUser },
];

const adminLinks = [
  { to: '/admin', label: 'Admin Home', icon: Shield, prefetch: () => queryClient.prefetchQuery({ queryKey: ['dashboard', 'admin'], queryFn: dashboardApi.admin }) },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { to: '/admin/draws', label: 'Draws', icon: Trophy },
  { to: '/admin/charities', label: 'Charities', icon: Heart },
  { to: '/admin/winners', label: 'Winners', icon: IndianRupee },
  { to: '/admin/broadcast', label: 'Broadcast', icon: Megaphone },
  { to: '/profile', label: 'Profile', icon: CircleUser },
];

export function AppLayout() {
  const { user } = useSession();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const isAdmin = user?.role === 'admin';
  const links = isAdmin ? adminLinks : userLinks;
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [broadcast, setBroadcast] = useState<any>(null);

  useEffect(() => {
    // Global broadcast propagation
    const fetchBroadcast = async () => {
      try {
        await systemApi.ping(); 
        setBroadcast({
          id: '1',
          message: 'System Update: Draw results for May are now being calculated. Stay tuned!',
          type: 'INFO'
        });
      } catch (e) {
        console.error('Broadcast fetch failed');
      }
    };
    fetchBroadcast();
  }, []);

  // Primary links for mobile bar
  const mobilePrimaryLinks = isAdmin 
    ? [links[0], links[3], links[6]] // Admin Home, Draws, Broadcast
    : [links[0], links[3], links[4]]; // Dashboard, Draws, Winnings

  return (
    <div className="min-h-screen">
      <div className="noise-overlay" />
      
      {/* Global Broadcast Banner */}
      <AnimatePresence>
        {broadcast && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative z-[60] bg-emerald/10 border-b border-emerald/20 backdrop-blur-md px-4 py-2 text-center"
          >
            <div className="flex items-center justify-center gap-3">
              <Megaphone size={14} className="text-emerald animate-pulse" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-emerald">
                {broadcast.message}
              </span>
              <button onClick={() => setBroadcast(null)} className="p-1 hover:bg-white/5 rounded-full transition-colors">
                <X size={14} className="text-muted" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="page-shell grid gap-6 py-6 md:grid-cols-[88px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)] md:py-8 pb-28 md:pb-8">
        {/* Desktop Sidebar */}
        <aside className={cn('glass-panel hidden rounded-3xl p-4 md:sticky md:top-6 md:block md:h-[calc(100vh-3rem)] md:p-5', isAdmin && 'bg-[linear-gradient(165deg,rgba(39,30,66,0.4),rgba(14,14,23,0.6))] border-violet/20')}>
          <div className="flex items-center gap-3 border-b border-white/8 pb-4">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald/15 text-emerald font-black">TGD</div>
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
          <div className="mt-auto hidden lg:block rounded-3xl border border-white/8 bg-white/4 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-8 rounded-xl bg-gradient-to-br from-emerald/20 to-gold/20 flex items-center justify-center font-bold text-xs text-text border border-white/10">
                {user?.fullName?.[0]}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-text truncate">{user?.fullName}</div>
                <div className="text-[10px] text-muted truncate">{user?.email}</div>
              </div>
            </div>
            <Button className="w-full h-10 rounded-xl text-xs font-bold" variant="secondary" onClick={logout}>
              <LogOut size={14} className="mr-2" />
              Sign Out
            </Button>
          </div>
        </aside>

        <section className="min-w-0">
          <Outlet />
        </section>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed inset-x-4 bottom-5 z-50 rounded-[32px] border border-white/10 bg-black/80 p-2 backdrop-blur-md md:hidden shadow-2xl">
        <div className="flex items-center justify-between">
          {mobilePrimaryLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onMouseEnter={() => link.prefetch?.()}
                className={cn(
                  'relative flex h-11 items-center justify-center gap-2 rounded-full px-4 transition-all duration-300',
                  isActive ? 'flex-[1.5] bg-emerald/15 text-emerald' : 'flex-1 text-muted hover:bg-white/5'
                )}
              >
                <Icon size={18} />
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="overflow-hidden whitespace-nowrap text-xs font-bold tracking-tight"
                    >
                      {link.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            );
          })}
          
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex h-11 flex-1 items-center justify-center rounded-full text-muted hover:bg-white/5 transition-all"
          >
            <Menu size={18} />
          </button>
        </div>
      </nav>

      {/* Mobile More Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-[101] rounded-t-[40px] border-t border-white/10 bg-[#0e0e14] p-8 pb-12 md:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl bg-gradient-to-br from-emerald/20 to-gold/20 flex items-center justify-center font-bold text-text border border-white/10">
                    {user?.fullName?.[0]}
                  </div>
                  <div>
                    <div className="font-display text-lg font-bold text-text">{user?.fullName}</div>
                    <div className="text-xs text-muted font-medium">{user?.role === 'admin' ? 'Privileged' : 'Member'} Access</div>
                  </div>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full bg-white/5 text-muted"><X size={20} /></button>
              </div>

              <div className="grid gap-2 mb-8">
                {links.filter(l => !mobilePrimaryLinks.includes(l)).map(link => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-white/4 border border-white/5 text-text font-bold text-sm"
                    >
                      <Icon size={18} className="text-muted" />
                      {link.label}
                    </NavLink>
                  );
                })}
              </div>

              <Button 
                variant="danger" 
                className="w-full h-14 rounded-[20px] font-bold text-sm shadow-xl"
                onClick={() => { logout(); setIsMenuOpen(false); }}
              >
                <LogOut size={18} className="mr-2" />
                Sign Out
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}