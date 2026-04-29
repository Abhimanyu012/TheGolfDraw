import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity, Gift, HeartHandshake, ShieldCheck, TrendingUp, Wallet, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { StatCard } from '@/components/ui/stat-card';
import { Select } from '@/components/ui/select';
import { SkeletonPageShell } from '@/components/ui/skeleton';
import { authApi, charityApi, dashboardApi } from '@/lib/requests';
import { money, shortDate } from '@/lib/format';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['dashboard', 'me'], queryFn: dashboardApi.user });
  const { data: charitiesData } = useQuery({ queryKey: ['charities'], queryFn: () => charityApi.list() });

  const dashboard = data?.dashboard;
  const charities = charitiesData?.charities ?? [];

  const [contributionPreview, setContributionPreview] = useState(10);
  const [selectedCharityId, setSelectedCharityId] = useState('');

  useEffect(() => {
    if (dashboard?.charityContributionPercent != null) {
      setContributionPreview(dashboard.charityContributionPercent);
    }
    if (dashboard?.charity?.id) {
      setSelectedCharityId(dashboard.charity.id);
    }
  }, [dashboard?.charityContributionPercent, dashboard?.charity?.id]);

  const mutation = useMutation({
    mutationFn: authApi.updatePreferences,
    onSuccess: () => {
      toast.success('Preferences updated');
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'me'] });
    },
    onError: () => {
      toast.error('Failed to update preferences');
    }
  });

  if (isLoading || !dashboard) {
    return <SkeletonPageShell />;
  }

  const subscriptionStatus = dashboard.subscription?.status ?? 'Inactive';
  const recentCharity = dashboard.charity?.name ?? 'None selected';
  const scoreCount = dashboard.scores?.length ?? 0;
  const scoreSlots = [...(dashboard.scores ?? []), ...Array(5)].slice(0, 5);
  const readiness = (scoreCount / 5) * 100;
  const monthlyPreview = dashboard.subscription?.amountCents ? (dashboard.subscription.amountCents / 100) * (contributionPreview / 100) : 0;

  const hasChanges = contributionPreview !== dashboard.charityContributionPercent || selectedCharityId !== dashboard.charity?.id;

  const handleSavePreferences = () => {
    mutation.mutate({
      charityId: selectedCharityId,
      charityContributionPercent: contributionPreview,
    });
  };

  return (
    <motion.div 
      key={isLoading ? 'loading' : 'loaded'}
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative space-y-6"
    >
      {/* Premium Material Background */}
      <div className="material-bg" style={{ backgroundImage: 'url(/assets/bg-dashboard.png)' }} />

      <SectionHeading eyebrow="Subscriber dashboard" title="Your membership, rewards, and giving in one place." description="Track subscription status, score history, draw eligibility, prize wins, and charity contribution with a calm SaaS layout." />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Subscription" value={subscriptionStatus} hint={dashboard.subscription ? dashboard.subscription.plan : 'Not activated'} />
        <StatCard label="Contribution" value={`${dashboard.charityContributionPercent}%`} hint={recentCharity} />
        <StatCard label="Scores tracked" value={`${scoreCount}/5`} hint="Recent scores keep you eligible" />
        <StatCard label="Total won" value={money(dashboard.winnings.totalWonCents)} hint="Payouts and pending entries" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="material-card space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-muted">Recent scores</div>
              <div className="mt-2 font-display text-2xl font-bold">5 score slots</div>
            </div>
            <Activity className="text-emerald" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {scoreSlots.map((score: any, index: number) => (
              <motion.div key={score?.id ?? `empty-${index}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 14, delay: index * 0.05 }}>
                <div className={score ? 'rounded-2xl border border-emerald/25 bg-white/4 px-4 py-4' : 'rounded-2xl border border-dashed border-white/20 bg-white/[0.02] px-4 py-4'}>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted">Slot {index + 1}</div>
                  {score ? (
                    <>
                      <div className="mt-2 font-data text-3xl font-bold text-text">{score.value}</div>
                      <div className="text-xs text-muted">{shortDate(score.date)}</div>
                    </>
                  ) : (
                    <div className="mt-4 text-sm text-muted">Awaiting score</div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card className="material-card space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-muted">Draw readiness</div>
              <div className="mt-2 font-display text-2xl font-bold">Stay in the monthly reward loop</div>
            </div>
            <ShieldCheck className="text-gold" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted">
              <span>Eligibility progress</span>
              <span>{scoreCount}/5 scores</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/8">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,rgb(var(--color-emerald)),rgba(255,255,255,0.85))]" style={{ width: `${readiness}%` }} />
            </div>
            <p className="text-sm leading-7 text-muted">You need five recent scores plus an active subscription to unlock the next draw cycle.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="bg-white/4 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-muted">Upcoming draw</div>
              <div className="mt-2 font-display text-xl font-semibold">{dashboard.participation.upcomingDraw.month}/{dashboard.participation.upcomingDraw.year}</div>
            </Card>
            <Card className="bg-white/4 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-muted">Total donated</div>
              <div className="mt-2 font-display text-xl font-semibold">{money(dashboard.donations.totalDonatedCents)}</div>
            </Card>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-muted">Your numbers</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {scoreSlots.map((score: any, idx: number) => (
                <span key={`num-${idx}`} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/25 font-data text-sm text-text">
                  {score?.value ?? '-'}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="material-card">
          <div className="flex items-center gap-3"><Gift className="text-gold" /> <h3 className="font-display text-xl font-semibold">Winnings</h3></div>
          <div className="mt-4 space-y-3">
            {dashboard.winnings.entries.map((winner: any) => (
              <div key={winner.id} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Tier {winner.tier}</span>
                  <span>{money(winner.amountCents)}</span>
                </div>
              </div>
            ))}
            {dashboard.winnings.entries.length === 0 ? <div className="text-sm text-muted">No winning entries yet.</div> : null}
          </div>
        </Card>
        <Card className="material-card">
          <div className="flex items-center gap-3"><Wallet className="text-emerald" /> <h3 className="font-display text-xl font-semibold">Donations</h3></div>
          <div className="mt-4 space-y-3">
            {dashboard.donations.entries.map((entry: any, index: number) => (
              <div key={`${entry.source}-${index}`} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm flex items-center justify-between">
                <span>{entry.source}</span>
                <span>{money(entry.amountCents)}</span>
              </div>
            ))}
            {dashboard.donations.entries.length === 0 ? <div className="text-sm text-muted">No donations yet.</div> : null}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-5 material-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HeartHandshake className="text-emerald" />
              <h3 className="font-display text-xl font-semibold">Charity selection</h3>
            </div>
            {hasChanges && (
              <Button className="h-8 gap-2 px-4" onClick={handleSavePreferences} busy={mutation.isPending}>
                <Save size={14} /> Save
              </Button>
            )}
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
            <Select value={selectedCharityId} onChange={(e) => setSelectedCharityId(e.target.value)} className="mb-4 bg-black/20">
              <option value="">Select a charity</option>
              {charities.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
            <div className="flex items-center justify-between text-sm text-muted">
              <span>Contribution Share</span>
              <span>{contributionPreview}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,rgb(var(--color-emerald)),rgba(255,255,255,0.85))]" style={{ width: `${contributionPreview}%` }} />
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={contributionPreview}
              onChange={(event) => setContributionPreview(Number(event.target.value))}
              className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[rgb(var(--color-emerald))]"
            />
            <p className="mt-3 text-sm leading-7 text-muted">You&apos;re giving approximately <span className="font-data text-text">{money(Math.round(monthlyPreview * 100))}</span> per month.</p>
          </div>
        </Card>
        <Card className="lg:col-span-7 material-card space-y-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-gold" />
            <h3 className="font-display text-xl font-semibold">Engagement summary</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-muted">Draws entered</div>
              <div className="mt-2 font-display text-2xl font-semibold text-text">{dashboard.participation.drawsEntered}</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-muted">Recent activity</div>
              <div className="mt-2 font-display text-2xl font-semibold text-text">Live</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-muted">Reward health</div>
              <div className="mt-2 font-display text-2xl font-semibold text-text">Strong</div>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
