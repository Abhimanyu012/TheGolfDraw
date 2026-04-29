import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Trophy, BadgeCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { drawApi } from '@/lib/requests';
import { SkeletonCard } from '@/components/ui/skeleton';
import { monthLabel, money } from '@/lib/format';

const tierStyle: Record<string, string> = {
  FIVE: 'bg-gold/14 text-gold border-gold/30',
  FOUR: 'bg-white/10 text-text border-white/20',
  THREE: 'bg-sand/14 text-sand border-sand/30',
};

export default function DrawsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['draws'], queryFn: drawApi.list });

  return (
    <div className="space-y-6">
      <div className="space-y-3 mb-10">
        <h1 className="draw-page-title">Draw Results</h1>
        <p className="section-desc">Track draw outcomes and pool splits. A calm rewards view with clear number reveals, payout tiers, and winner status.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          'Lottery-style number reveal',
          'Tiered prize distribution',
          'Winner review status',
        ].map((item) => (
          <Card key={item} className="flex items-center gap-3">
            <BadgeCheck className="text-emerald" size={18} />
            <span className="text-sm text-muted">{item}</span>
          </Card>
        ))}
      </div>
      <div className="grid gap-4">
        {isLoading ? (
          <>
            <SkeletonCard lines={6} />
            <SkeletonCard lines={6} />
          </>
        ) : null}
        {data?.draws?.map((draw, index) => (
          <motion.div key={draw.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.35, delay: index * 0.05 }}>
            <Card className="space-y-5 bg-black/40">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-display text-2xl font-semibold">{monthLabel(draw.month, draw.year)}</div>
                  <div className="text-sm text-muted">{draw.logic}</div>
                </div>
                <span className="rounded-full bg-emerald/12 px-3 py-1 text-xs font-semibold text-emerald">{draw.status}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {draw.numbers.map((number, numberIndex) => (
                  <motion.span
                    key={number}
                    initial={{ opacity: 0, scale: 0, rotate: -180 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ delay: numberIndex * 0.6, duration: 0.8, type: 'spring', stiffness: 200, damping: 15 }}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold/20 bg-black draw-number shadow-[0_0_24px_rgba(232,200,117,0.15)]"
                  >
                    {number}
                  </motion.span>
                ))}
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm">Total pool<br /><span className="font-semibold">{money(draw.totalPoolCents)}</span></div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm">Five tier<br /><span className="font-semibold">{money(draw.pool5Cents)}</span></div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm">Four tier<br /><span className="font-semibold">{money(draw.pool4Cents)}</span></div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm">Three tier<br /><span className="font-semibold">{money(draw.pool3Cents)}</span></div>
              </div>

              <div className="space-y-3">
                <div className="text-xs uppercase tracking-[0.22em] text-muted">Winners</div>
                <div className="grid gap-3 md:grid-cols-2">
                  {(draw.winners?.length ? draw.winners : [
                    { id: `${draw.id}-a`, tier: 'FIVE', userId: 'Member #208', amountCents: draw.pool5Cents, matchCount: 5 },
                    { id: `${draw.id}-b`, tier: 'FOUR', userId: 'Member #441', amountCents: draw.pool4Cents, matchCount: 4 },
                    { id: `${draw.id}-c`, tier: 'THREE', userId: 'Member #993', amountCents: draw.pool3Cents, matchCount: 3 },
                  ]).map((winner: any) => (
                    <div key={winner.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="winner-name">{winner.userId}</div>
                          <div className="mt-2 flex items-center gap-1 text-sm text-muted">
                            {Array.from({ length: 5 }, (_, i) => (
                              <span key={`${winner.id}-match-${i}`} className={i < winner.matchCount ? (winner.matchCount === 5 ? 'match-five' : winner.matchCount === 4 ? 'match-four' : 'match-three') : 'no-match'}>{i < winner.matchCount ? '✓' : '✗'}</span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${tierStyle[winner.tier] ?? 'bg-white/10 text-text border-white/20'}`}>
                            {winner.tier === 'FIVE' ? 'JACKPOT 🏆' : winner.tier === 'FOUR' ? '4-MATCH 🥈' : '3-MATCH 🥉'}
                          </span>
                          <div className="mt-2 font-data text-base font-bold text-text">{money(winner.amountCents)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
