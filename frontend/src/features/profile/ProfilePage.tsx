import { motion } from 'framer-motion';
import { User, Mail, CreditCard, Heart, Shield } from 'lucide-react';
import { useSession } from '@/app/providers';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { dashboardApi } from '@/lib/requests';
import { shortDate, money } from '@/lib/format';

export default function ProfilePage() {
  const { user } = useSession();
  const { data } = useQuery({ queryKey: ['dashboard', 'me'], queryFn: dashboardApi.user });
  const dashboard = data?.dashboard;
  const subscription = dashboard?.subscription;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="Identity"
          title="Account Profile"
          description="Your account details, membership status, and charity partnership."
        />
        <Badge tone="emerald" className="w-fit px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(168,224,99,0.2)]">
          {user?.role} Access
        </Badge>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Account Info */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="material-card border-white/5 bg-white/2 backdrop-blur-xl p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              {/* Avatar */}
              <div className="size-24 md:size-28 rounded-[32px] bg-gradient-to-br from-emerald/20 to-gold/20 flex items-center justify-center font-display text-4xl font-bold text-text border border-white/10 shrink-0">
                {user?.fullName?.[0]}
              </div>

              {/* Fields */}
              <div className="flex-1 space-y-4">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                      <Input
                        disabled
                        value={user?.fullName ?? ''}
                        className="pl-12 bg-black/20 border-white/8 h-12 rounded-2xl font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                      <Input
                        disabled
                        value={user?.email ?? ''}
                        className="pl-12 bg-black/20 border-white/8 h-12 rounded-2xl font-medium"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted">
                  To update your name or email, please contact support.
                </p>
              </div>
            </div>
          </Card>

          {/* Security note — read-only, no dead button */}
          <Card className="material-card border-white/5 bg-white/2 backdrop-blur-xl p-6">
            <div className="flex items-center gap-3 mb-3 text-emerald">
              <Shield size={18} />
              <h3 className="font-display font-bold tracking-tight">Account Security</h3>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Your account is protected by enterprise-grade encryption and secure authentication protocols. 
              To update your security credentials or change your password, please contact our administrative team.
            </p>
          </Card>
        </div>

        {/* Right Column: Live Stats */}
        <div className="lg:col-span-4 space-y-5">
          {/* Subscription status — live from API */}
          <Card className="material-card border-emerald/10 bg-emerald/[0.03] backdrop-blur-xl p-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-5">Membership</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-emerald/10 flex items-center justify-center text-emerald">
                    <CreditCard size={18} />
                  </div>
                  <span className="font-bold text-text">{subscription?.plan ?? 'No plan'}</span>
                </div>
                <Badge tone={subscription?.status === 'ACTIVE' ? 'emerald' : 'muted'}>
                  {subscription?.status ?? 'Inactive'}
                </Badge>
              </div>
              {subscription?.renewsAt && (
                <div className="pt-3 border-t border-white/5">
                  <p className="text-xs text-muted leading-relaxed">
                    {subscription.status === 'ACTIVE' ? 'Renews' : 'Ended'}{' '}
                    <span className="text-text font-bold">{shortDate(subscription.renewsAt)}</span>
                  </p>
                  <p className="text-xs text-muted mt-1">
                    Amount: <span className="text-text font-bold">{money(subscription.amountCents)}</span>
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Charity partnership — live from API */}
          <Card className="material-card border-gold/10 bg-gold/[0.03] backdrop-blur-xl p-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-5">Charity Partner</h3>
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center text-gold shrink-0">
                <Heart size={22} fill="currentColor" />
              </div>
              <div>
                <div className="font-bold text-text">
                  {dashboard?.charity?.name ?? 'Not selected'}
                </div>
                <div className="text-xs text-muted mt-0.5">
                  {dashboard?.charityContributionPercent ?? 10}% of your subscription
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
