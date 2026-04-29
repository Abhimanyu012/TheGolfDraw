import { useEffect } from 'react';
import Lenis from 'lenis';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

interface Props {
  children: React.ReactNode;
}

export function AuthBootstrap({ children }: Props) {
  const hydrated = useAuthStore((state) => state.hydrated);
  const token = useAuthStore((state) => state.token);
  const isCheckingSession = useAuthStore((state) => state.isCheckingSession);
  const setIsCheckingSession = useAuthStore((state) => state.setIsCheckingSession);
  const updateUser = useAuthStore((state) => state.updateUser);

  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      wheelMultiplier: 0.8,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!token) {
      setIsCheckingSession(false);
      return;
    }

    let mounted = true;

    // Only show global loader if we don't have a user cached in state
    const shouldShowLoader = !useAuthStore.getState().user;
    if (shouldShowLoader) {
      setIsCheckingSession(true);
    }

    api.get('/api/auth/me')
      .then(({ data }) => {
        if (!mounted) return;
        if (data?.user) {
          updateUser(data.user);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setIsCheckingSession(false);
      })
      .finally(() => {
        if (!mounted) return;
        setIsCheckingSession(false);
      });

    return () => {
      mounted = false;
    };
  }, [hydrated, token, updateUser, setIsCheckingSession]);

  useEffect(() => {
    if (hydrated) return;
    useAuthStore.getState().setHydrated(true);
  }, [hydrated]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isCheckingSession ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0f]"
          >
            <div className="relative h-24 w-24">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-emerald/20"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-t-2 border-emerald"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <div className="absolute inset-0 flex items-center justify-center font-display text-2xl font-bold text-emerald">T</div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-xs uppercase tracking-[0.3em] text-muted"
            >
              Initializing Session
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function useSession() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const isCheckingSession = useAuthStore((state) => state.isCheckingSession);
  return { token, user, hydrated, isCheckingSession };
}