import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Sparkles, Heart, Zap, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { useSession } from '@/app/providers';
import { AnimatePresence, motion } from 'framer-motion';

const links = [
  { to: '/', label: 'Experience', icon: Sparkles },
  { to: '/charities', label: 'Impact', icon: Heart },
  { to: '/pricing', label: 'Club', icon: Zap },
];

export function PublicLayout() {
  const location = useLocation();
  const { user, isCheckingSession } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <div className="min-h-screen pb-32">
      <div className="noise-overlay" />
      
      <main>
        <Outlet />
      </main>

      {/* Universal Floating Public Navigation */}
      <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        <nav className="flex w-full max-w-[480px] items-center justify-between rounded-[32px] border border-white/10 bg-black/40 p-2 shadow-2xl backdrop-blur-3xl ring-1 ring-white/5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={cn(
                  'relative flex h-12 items-center justify-center gap-2 rounded-full px-4 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]',
                  isActive ? 'flex-[1.8] bg-gold text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'flex-1 text-muted hover:bg-white/5 hover:text-text'
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
            onClick={() => setMobileOpen(true)}
            className="flex h-12 flex-1 items-center justify-center rounded-full text-muted hover:bg-white/5 transition-all"
          >
            <Menu size={20} />
          </button>
        </nav>
      </div>

      {/* Public More Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
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
              
              <div className="flex items-center justify-center mb-10 px-2">
                <div className="nav-logo text-3xl">
                  The Golf <span>Draw</span>
                </div>
              </div>

              <div className="grid gap-3 mb-8">
                {!isCheckingSession && user ? (
                  <Button as={NavLink} to={dashboardPath} variant="primary" className="h-16 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl" onClick={() => setMobileOpen(false)}>
                    <LayoutDashboard size={18} className="mr-3" />
                    Enter Command Center
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Button as={NavLink} to="/login" variant="secondary" className="h-14 rounded-2xl font-bold text-xs uppercase tracking-widest" onClick={() => setMobileOpen(false)}>
                      <LogIn size={18} className="mr-3" />
                      Access
                    </Button>
                    <Button as={NavLink} to="/signup" variant="primary" className="h-14 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-2xl" onClick={() => setMobileOpen(false)}>
                      <UserPlus size={18} className="mr-3" />
                      Join
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {links.map(link => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/2 border border-white/5 text-text transition-all hover:bg-white/6"
                  >
                    <link.icon size={18} className="text-muted" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{link.label}</span>
                  </NavLink>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}