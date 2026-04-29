import { motion, useReducedMotion } from 'framer-motion';

export function GolfMotionBackground() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_20%_10%,rgba(53,214,163,0.12),transparent_26%),radial-gradient(circle_at_82%_12%,rgba(121,140,255,0.12),transparent_22%),radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.04),transparent_38%)]" />
        <div className="absolute inset-x-[-10%] top-[18%] h-[34rem] rounded-[50%] bg-[linear-gradient(180deg,rgba(54,214,163,0.035),rgba(23,31,74,0.08))] blur-3xl" />
        <div className="absolute left-[10%] top-[16%] h-48 w-48 rounded-full border border-white/8 opacity-30" />
        <div className="absolute right-[18%] top-[20%] h-3 w-3 rounded-full bg-white/40" />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:68px_68px] opacity-30"
        animate={{ opacity: [0.16, 0.26, 0.16] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_18%_18%,rgba(53,214,163,0.16),transparent_26%),radial-gradient(circle_at_78%_12%,rgba(121,140,255,0.12),transparent_24%),radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_40%)]"
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        aria-hidden="true"
        className="absolute left-[-12%] top-[16%] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(53,214,163,0.16),rgba(53,214,163,0.02)_52%,transparent_70%)] blur-3xl"
        animate={{ x: [0, 36, 0], y: [0, -18, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        aria-hidden="true"
        className="absolute right-[-10%] top-[12%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(121,140,255,0.18),rgba(121,140,255,0.04)_52%,transparent_70%)] blur-3xl"
        animate={{ x: [0, -28, 0], y: [0, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />

      <motion.div
        aria-hidden="true"
        className="absolute left-[12%] top-[24%] h-2 w-2 rounded-full bg-white/60 shadow-[0_0_22px_rgba(255,255,255,0.55)]"
        animate={{ y: [0, -22, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        aria-hidden="true"
        className="absolute right-[18%] top-[28%] h-3 w-3 rounded-full bg-emerald/80 shadow-[0_0_20px_rgba(53,214,163,0.7)]"
        animate={{ y: [0, 18, 0], x: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      />

      <div className="absolute inset-x-0 bottom-0 h-[34%] bg-[linear-gradient(180deg,rgba(7,16,24,0),rgba(7,16,24,0.55)_25%,rgba(7,16,24,0.96))]" />
    </div>
  );
}