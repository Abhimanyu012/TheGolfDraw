import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { useSession } from '@/app/providers';

const links = [
  { to: '/', label: 'Home' },
  { to: '/charities', label: 'Charities' },
  { to: '/pricing', label: 'Pricing' },
];

export function PublicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isCheckingSession } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <div className="min-h-screen">
      <div className="noise-overlay" />
      <header className={cn('sticky top-0 z-40 transition-all duration-300', scrolled ? 'bg-[#09090f]/40 backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.5)]' : 'bg-[#09090f]/20 backdrop-blur-xl')}>
        <div className="page-shell flex h-20 items-center justify-between gap-4">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl border border-gold/25 bg-gold/12 text-gold">
              <span className="relative h-5 w-5" aria-hidden="true">
                <span className="absolute bottom-1 left-0 right-0 h-px bg-gold/60" />
                <span className="absolute bottom-1 right-[4px] h-3 w-px bg-gold/75" />
                <span className="absolute bottom-[10px] right-[3px] h-[6px] w-[7px] origin-left skew-y-[-10deg] bg-gold/80" />
                <div className="absolute bottom-[2px] left-[2px] h-[5px] w-[5px] rounded-full border border-[#f7f3e8] bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              </span>
            </span>
            <div className="nav-logo">
              The Golf <span>Draw</span>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-8 md:flex mx-6">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => cn('nav-link', isActive && 'text-white')}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {!isCheckingSession && user ? (
              <Button as={NavLink} to={dashboardPath} variant="primary" className="gap-2 px-5 py-2.5 text-sm">
                <LayoutDashboard size={16} /> Dashboard
              </Button>
            ) : (
              <>
                <Button as={NavLink} to="/login" variant="secondary" className="px-4 py-2.5 text-sm">
                  Sign in
                </Button>
                <Button as={NavLink} to="/signup" variant="primary" className="px-5 py-2.5 text-sm">
                  Subscribe
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-white/5 text-text md:hidden"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <div className={cn('overflow-hidden border-t border-white/8 bg-[#0d0d15]/96 transition-all md:hidden', mobileOpen ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0')}>
          <div className="page-shell space-y-2 py-4">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-muted',
                    isActive && 'border-emerald/25 bg-emerald/10 text-text',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="grid gap-2 pt-2 sm:grid-cols-2">
              {!isCheckingSession && user ? (
                <Button as={NavLink} to={dashboardPath} variant="primary" className="w-full justify-center gap-2">
                  <LayoutDashboard size={16} /> Dashboard
                </Button>
              ) : (
                <>
                  <Button as={NavLink} to="/login" variant="secondary" className="w-full justify-center">
                    Sign in
                  </Button>
                  <Button as={NavLink} to="/signup" variant="primary" className="w-full justify-center">
                    Subscribe
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}