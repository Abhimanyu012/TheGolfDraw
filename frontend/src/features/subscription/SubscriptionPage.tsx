import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  BadgeCheck,
  Check,
  CircleDollarSign,
  Crown,
  Rocket,
  ShieldCheck,
  Sparkles,
  XCircle,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { StatCard } from '@/components/ui/stat-card';
import { paymentApi, subscriptionApi } from '@/lib/requests';
import { useAuthStore } from '@/lib/auth-store';
import { money, shortDate } from '@/lib/format';

/* ────────────────────── plan config ────────────────────── */

const plans = [
  {
    id: 'MONTHLY' as const,
    name: 'Monthly',
    priceCents: 19900,
    period: '/mo',
    badge: 'Flexible Entry',
    badgeIcon: Crown,
    accentClass: 'text-emerald',
    borderClass: 'border-white/10',
    bgClass: 'bg-gradient-to-b from-[#171723] to-[#11111b]',
    blurb: 'Start small. Enter the monthly draw with full eligibility and charity contribution.',
    features: [
      'Full dashboard access',
      'Score tracking & draw eligibility',
      'Charity impact reporting',
      'Winner proof upload',
      'Cancel anytime',
    ],
  },
  {
    id: 'YEARLY' as const,
    name: 'Yearly',
    priceCents: 199900,
    period: '/yr',
    badge: 'Best Value — Save ₹389/mo',
    badgeIcon: BadgeCheck,
    accentClass: 'text-gold',
    borderClass: 'border-gold/30',
    bgClass:
      'bg-gradient-to-b from-[#18151d] to-[#12121a] shadow-[0_0_0_1px_rgba(212,175,55,0.16),0_24px_48px_rgba(0,0,0,0.35)]',
    blurb: 'Commit for a full year. Maximum draw entries and the deepest charity impact.',
    features: [
      'Everything in Monthly',
      '12 consecutive draw entries',
      'Priority support',
      'Annual impact summary',
      'Locked-in pricing',
    ],
  },
];

type Plan = 'MONTHLY' | 'YEARLY';

/* ────────────────────── razorpay types ────────────────────── */

type RazorpaySuccessPayload = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessPayload) => void;
  modal?: { ondismiss?: () => void };
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

const loadRazorpayScript = async () => {
  if (window.Razorpay) return true;
  return new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

import { SkeletonSubscription } from '@/components/ui/skeleton';

/* ────────────────────── component ────────────────────── */

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [busyPlan, setBusyPlan] = useState<Plan | null>(null);

  const { data: subData, isLoading } = useQuery({
    queryKey: ['subscriptions', 'me'],
    queryFn: subscriptionApi.me,
  });

  const subscription = subData?.subscription;
  const isActive = subscription?.status === 'ACTIVE';

  /* ── razorpay checkout ── */
  const startCheckout = async (plan: Plan) => {
    setBusyPlan(plan);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        throw new Error('Unable to load payment gateway. Please refresh and try again.');
      }

      const { order } = await paymentApi.createSubscriptionOrder(plan);

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amountCents,
        currency: order.currency,
        name: 'The Golf Draw',
        description: `${plan === 'MONTHLY' ? 'Monthly' : 'Yearly'} membership`,
        order_id: order.razorpayOrderId,
        handler: async (response) => {
          try {
            await paymentApi.verifySubscriptionPayment({
              plan,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            await Promise.all([
              queryClient.invalidateQueries({ queryKey: ['dashboard', 'me'] }),
              queryClient.invalidateQueries({ queryKey: ['subscriptions', 'me'] }),
            ]);

            toast.success('Subscription activated — welcome aboard!');
            navigate('/dashboard');
          } catch {
            toast.error('Payment received but verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => toast('Checkout cancelled'),
        },
        prefill: {
          name: user?.fullName,
          email: user?.email,
        },
        theme: { color: '#4ade80' },
      });

      razorpay.open();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment could not be started';
      toast.error(message);
    } finally {
      setBusyPlan(null);
    }
  };

  /* ── loading state ── */
  if (isLoading) {
    return <SkeletonSubscription />;
  }

  return (
    <div className="space-y-8">
      {/* ── header ── */}
      <SectionHeading
        eyebrow="Membership"
        title={isActive ? 'Active Membership Tier' : 'Choose Your Access Tier'}
        description={
          isActive
            ? 'Manage your membership cycle, billing preferences, and exclusive club privileges.'
            : 'Unlock the dashboard, performance tracking, and verified charity impact.'
        }
      />

      {/* ── current subscription status ── */}
      {subscription ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              label="Status"
              value={subscription.status}
              hint={isActive ? 'Your membership is live' : 'Renew to restore access'}
            />
            <StatCard label="Plan" value={subscription.plan} hint={subscription.plan === 'YEARLY' ? 'Annual billing' : 'Monthly billing'} />
            <StatCard label="Amount" value={money(subscription.amountCents)} hint="Per billing cycle" />
            <StatCard
              label={isActive ? 'Renews' : 'Ended'}
              value={shortDate(isActive ? subscription.renewsAt : subscription.endsAt ?? subscription.renewsAt)}
              hint={isActive ? 'Next billing date' : 'Subscription ended'}
            />
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="flex items-center gap-4 border-gold/20 bg-gradient-to-r from-[#1a1720] to-[#12121a]">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="font-display text-lg font-semibold text-text">No active subscription</div>
              <div className="mt-1 text-sm text-muted">
                Select a plan below to unlock score tracking, draw entries, and charity contributions.
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── plan cards ── */}
      <div className="grid gap-5 xl:grid-cols-2">
        {plans.map((plan, index) => {
          const Icon = plan.badgeIcon;
          const isCurrent = isActive && subscription?.plan === plan.id;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
            >
              <Card className={`relative space-y-6 ${plan.borderClass} ${plan.bgClass}`}>
                {isCurrent && (
                  <div className="absolute -top-3 right-6 rounded-full border border-emerald/30 bg-emerald/15 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald">
                    Current plan
                  </div>
                )}

                {/* plan header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted">
                      <Icon size={13} className={plan.accentClass} />
                      {plan.badge}
                    </div>
                    <div className={`mt-4 font-display text-3xl font-bold ${plan.accentClass}`}>{plan.name}</div>
                    <div className="mt-1 text-sm text-muted">{plan.blurb}</div>
                  </div>
                  <div className="flex items-baseline gap-1 pt-4 text-right">
                    <span className="text-sm text-muted">₹</span>
                    <span className="font-display text-4xl font-bold text-text">{(plan.priceCents / 100).toLocaleString('en-IN')}</span>
                    <span className="text-sm text-muted">{plan.period}</span>
                  </div>
                </div>

                {/* quick stats */}
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Activation', value: 'Instant', icon: Zap },
                    { label: 'Charity share', value: '10%+', icon: CircleDollarSign },
                    { label: 'Draw access', value: 'Full', icon: Rocket },
                  ].map((item) => {
                    const StatIcon = item.icon;
                    return (
                      <div key={item.label} className="rounded-2xl border border-white/8 bg-black/30 p-3">
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted">
                          <span>{item.label}</span>
                          <StatIcon size={14} className={plan.accentClass} />
                        </div>
                        <div className="mt-2 font-display text-lg font-semibold text-text">{item.value}</div>
                      </div>
                    );
                  })}
                </div>

                {/* features */}
                <ul className="space-y-3 border-t border-white/10 pt-5 text-sm text-muted">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check size={16} className={plan.accentClass} />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-emerald/20 bg-emerald/8 px-5 py-4 text-sm text-emerald">
                    <ShieldCheck size={18} />
                    You're on this plan — renews {shortDate(subscription?.renewsAt ?? '')}
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    busy={busyPlan === plan.id}
                    onClick={() => void startCheckout(plan.id)}
                  >
                    {isActive ? `Switch to ${plan.name}` : `Subscribe — ₹${(plan.priceCents / 100).toLocaleString('en-IN')}${plan.period}`}
                  </Button>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ── trust bar ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="grid gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 md:grid-cols-3"
      >
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted">
          <BadgeCheck size={14} className="text-emerald" />
          PCI-compliant payments
        </div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted">
          <BadgeCheck size={14} className="text-emerald" />
          Instant account activation
        </div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted">
          <BadgeCheck size={14} className="text-emerald" />
          Transparent monthly reporting
        </div>
      </motion.div>
    </div>
  );
}
