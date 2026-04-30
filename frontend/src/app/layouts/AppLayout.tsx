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
import { dashboardApi, scoreApi, winnerApi, subscriptionApi, systemApi } from '@/lib/requests';

const userLinks = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard, prefetch: () => queryClient.prefetchQuery({ queryKey: ['dashboard', 'me'], queryFn: dashboardApi.user }) },
  { to: '/subscription', label: 'Club', icon: CreditCard, prefetch: () => queryClient.prefetchQuery({ queryKey: ['subscription', 'me'], queryFn: subscriptionApi.me }) },
  { to: '/scores', label: 'Scores', icon: Target, prefetch: () => queryClient.prefetchQuery({ queryKey: ['scores'], queryFn: scoreApi.list }) },
  { to: '/draws', label: 'Draws', icon: Trophy },
  { to: '/winnings', label: 'Prizes', icon: IndianRupee, prefetch: () => queryClient.prefetchQuery({ queryKey: ['winnings'], queryFn: winnerApi.mine }) },
];

const adminLinks = [
  { to: '/admin', label: 'Intelligence', icon: Shield, prefetch: () => queryClient.prefetchQuery({ queryKey: ['dashboard', 'admin'], queryFn: dashboardApi.admin }) },
  { to: '/admin/users', label: 'Members', icon: Users },
  { to: '/admin/subscriptions', label: 'Revenue', icon: CreditCard },
  { to: '/admin/draws', label: 'Simulate', icon: Trophy },
  { to: '/admin/winners', label: 'Verify', icon: IndianRupee },
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
    const fetchBroadcast = async () => {
      try {
        await systemApi.ping(); 
        setBroadcast({
          id: '1',
          message: 'System Update: May Draw results are being finalized. Check your "Prizes" tab shortly.',
          type: 'INFO'
        });
      } catch (e) {
        console.error('Broadcast fetch failed');
      }
    };
    fetchBroadcast();
  }, []);

  return (
    <div className="min-h-screen pb-32">
      <div className="noise-overlay" />
      
      {/* Global Broadcast Banner */}
      <AnimatePresence>
        {broadcast && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative z-[60] bg-emerald/10 border-b border-emerald/20 backdrop-blur-xl px-4 py-3 text-center"
          >
            <div className="flex items-center justify-center gap-3">
              <Megaphone size={14} className="text-emerald animate-pulse" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-emerald">
                {broadcast.message}
              </span>
              <button onClick={() => setBroadcast(null)} className="p-1 hover:bg-white/5 rounded-full transition-colors">
                <X size={14} className="text-muted" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="page-shell py-8 md:py-12">
        <Outlet />
      </main>

      {/* Universal Floating Glass Navigation */}
      <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        <nav className="flex w-full max-w-[600px] items-center justify-between rounded-[32px] border border-white/10 bg-black/40 p-2 shadow-2xl backdrop-blur-3xl ring-1 ring-white/5">
          {links.map((link, idx) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onMouseEnter={() => link.prefetch?.()}
                className={cn(
                  'relative flex h-12 items-center justify-center gap-2 rounded-full px-4 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]',
                  isActive ? 'flex-[1.8] bg-emerald text-black shadow-[0_0_20px_rgba(168,224,99,0.4)]' : 'flex-1 text-muted hover:bg-white/5 hover:text-text',
                  idx >= 4 && 'hidden sm:flex' // Show more on desktop
                )}
              >
                <Icon size={isActive ? 18 : 20} className={cn("transition-transform", isActive && "scale-110")} />
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, width: 0, x: -10 }}
                      animate={{ opacity: 1, width: 'auto', x: 0 }}
                      exit={{ opacity: 0, width: 0, x: -10 }}
                      className="overflow-hidden whitespace-nowrap text-xs font-black uppercase tracking-tighter"
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
            className="flex h-12 flex-1 items-center justify-center rounded-full text-muted hover:bg-white/5 transition-all"
          >
            <Menu size={20} />
          </button>
        </nav>
      </div>

      {/* Global More Menu (Universal) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-[101] mx-auto w-full max-w-xl rounded-t-[40px] border-t border-white/10 bg-[#09090f]/98 p-6 pb-10 shadow-[0_-20px_60px_rgba(0,0,0,0.6)] md:bottom-12 md:rounded-[40px] md:border"
            >
              <div className="mx-auto w-12 h-1 bg-white/10 rounded-full mb-6 md:hidden" />
              
              <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl bg-gradient-to-br from-emerald/20 to-gold/20 flex items-center justify-center font-bold text-xl text-text border border-white/10 shadow-inner">
                    {user?.fullName?.[0]}
                  </div>
                  <div>
                    <div className="font-display text-lg font-bold tracking-tight text-text leading-tight">{user?.fullName}</div>
                    <div className="text-[10px] text-muted font-bold uppercase tracking-[0.15em] mt-0.5">{isAdmin ? 'Strategic Command' : 'Elite Member'}</div>
                  </div>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="size-9 rounded-full bg-white/5 flex items-center justify-center text-muted border border-white/5 hover:bg-white/10 transition-colors"><X size={18} /></button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-8">
                {links.map(link => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsMenuOpen(false)}
                      className="group flex items-center gap-3 p-3.5 rounded-2xl bg-white/2 border border-white/5 text-text transition-all hover:bg-white/6 hover:border-white/10"
                    >
                      <div className="size-9 rounded-xl bg-white/5 flex items-center justify-center text-muted group-hover:text-emerald transition-colors">
                        <Icon size={18} />
                      </div>
                      <span className="font-bold text-[11px] uppercase tracking-wider">{link.label}</span>
                    </NavLink>
                  );
                })}
                <NavLink
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="group flex items-center gap-3 p-3.5 rounded-2xl bg-white/2 border border-white/5 text-text transition-all hover:bg-white/6"
                >
                  <div className="size-9 rounded-xl bg-white/5 flex items-center justify-center text-muted group-hover:text-text">
                    <CircleUser size={18} />
                  </div>
                  <span className="font-bold text-[11px] uppercase tracking-wider">Account</span>
                </NavLink>
              </div>

              <Button 
                variant="danger" 
                className="w-full h-14 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-2xl border border-danger/20"
                onClick={() => { logout(); setIsMenuOpen(false); }}
              >
                <LogOut size={16} className="mr-3" />
                Disconnect Session
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}