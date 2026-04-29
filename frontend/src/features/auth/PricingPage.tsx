import { useState } from 'react';
import { BadgeCheck, Check, CircleDollarSign, Crown, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NavLink, useNavigate } from 'react-router-dom';
import { SectionHeading } from '@/components/ui/section-heading';
import toast from 'react-hot-toast';
import { paymentApi } from '@/lib/requests';
import { useAuthStore } from '@/lib/auth-store';
import { useQueryClient } from '@tanstack/react-query';

const plans = [
  { id: 'MONTHLY', name: 'Monthly', price: 1999, accent: 'emerald', blurb: 'Flexible entry with monthly draw cadence.' },
  { id: 'YEARLY', name: 'Yearly', price: 19999, accent: 'gold', blurb: 'Best value with longer participation runway.' },
];

type Plan = 'MONTHLY' | 'YEARLY';

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
  modal?: {
    ondismiss?: () => void;
  };
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

const loadRazorpayScript = async () => {
  if (window.Razorpay) {
    return true;
  }

  return new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PricingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token, user } = useAuthStore();
  const [busyPlan, setBusyPlan] = useState<Plan | null>(null);

  const startCheckout = async (plan: Plan) => {
    if (!token) {
      navigate(`/signup?plan=${plan}`);
      return;
    }

    setBusyPlan(plan);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        throw new Error('Unable to load Razorpay Checkout. Please try again.');
      }

      const { order } = await paymentApi.createSubscriptionOrder(plan);

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amountCents,
        currency: order.currency,
        name: 'The Golf Draw',
        description: `${plan} membership`,
        order_id: order.razorpayOrderId,
        handler: async (response) => {
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

          toast.success('Subscription activated successfully');
          navigate('/dashboard');
        },
        modal: {
          ondismiss: () => {
            toast('Checkout cancelled');
          },
        },
        prefill: {
          name: user?.fullName,
          email: user?.email,
        },
        theme: {
          color: '#4ade80',
        },
      });

      razorpay.open();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment could not be started';
      toast.error(message);
    } finally {
      setBusyPlan(null);
    }
  };

  return (
    <div className="relative overflow-hidden py-16">
      <div className="orb-lime -top-10 right-[12%] h-40 w-40" aria-hidden="true" />
      <div className="orb-violet -bottom-10 left-[8%] h-52 w-52" aria-hidden="true" />

      <div className="page-shell relative z-10 space-y-8">
        <Card className="border-white/10 bg-black/35 p-7 md:p-10">
          <div className="grid gap-6 md:grid-cols-[1.25fr_0.75fr] md:items-end">
            <SectionHeading
              eyebrow="Pricing"
              title="Membership plans with a private-club feel"
              description="One premium experience. Two commitment styles. Charity contribution and draw access are included by design."
            />
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted">
                <ShieldCheck size={14} className="text-emerald" />
                Trusted Billing
              </div>
              <div className="mt-2 text-sm leading-7 text-slate-200/90">PCI-compliant payments, instant activation, and transparent monthly winner reporting.</div>
            </div>
          </div>
        </Card>

        <div className="grid gap-5 xl:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={plan.id === 'YEARLY' ? 'space-y-6 border-gold/30 bg-gradient-to-b from-[#18151d] to-[#12121a] shadow-[0_0_0_1px_rgba(212,175,55,0.16),0_24px_48px_rgba(0,0,0,0.35)]' : 'space-y-6 border-white/10 bg-gradient-to-b from-[#171723] to-[#11111b]'}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted">
                    {plan.id === 'YEARLY' ? <BadgeCheck size={13} className="text-gold" /> : <Crown size={13} className="text-emerald" />}
                    {plan.id === 'YEARLY' ? 'Best Value' : 'Flexible Entry'}
                  </div>
                  <div className="plan-name mt-4 text-emerald">{plan.name}</div>
                  <div className="mt-1 text-sm text-muted">{plan.blurb}</div>
                </div>
                <div className="text-right flex items-baseline gap-1 pt-4 justify-end">
                  <span className="plan-currency">£</span>
                  <span className="plan-price">{plan.price / 100}</span>
                  <span className="plan-period">/{plan.id === 'YEARLY' ? 'yr' : 'mo'}</span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Activation', value: 'Instant', icon: Crown },
                  { label: 'Contribution', value: 'Built-in', icon: CircleDollarSign },
                  { label: 'Renewal', value: plan.name, icon: Check },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-2xl border border-white/8 bg-black/30 p-3">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted">
                        <span>{item.label}</span>
                        <Icon size={14} className={plan.id === 'YEARLY' ? 'text-gold' : 'text-emerald'} />
                      </div>
                      <div className="mt-2 font-display text-lg font-semibold text-text">{item.value}</div>
                    </div>
                  );
                })}
              </div>

              <ul className="space-y-4 border-t border-white/10 pt-5 text-sm text-muted">
                {['Access to active subscriber dashboard', 'Score tracking and draw eligibility', 'Winner proof and payout status', 'Charity impact visibility'].map((item) => (
                  <li key={item} className="plan-feature"><Check size={16} className={plan.id === 'YEARLY' ? 'text-gold' : 'text-emerald'} />{item}</li>
                ))}
              </ul>

              <Button
                className="w-full"
                busy={busyPlan === plan.id}
                onClick={() => {
                  void startCheckout(plan.id as Plan);
                }}
              >
                {token ? `Buy ${plan.name.toLowerCase()}` : `Choose ${plan.name.toLowerCase()}`}
              </Button>
            </Card>
          ))}
        </div>

        <div className="grid gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 md:grid-cols-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted"><BadgeCheck size={14} className="text-emerald" />Instant account activation</div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted"><BadgeCheck size={14} className="text-emerald" />Transparent monthly reporting</div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted"><BadgeCheck size={14} className="text-emerald" />Verified payout workflow</div>
        </div>
      </div>
    </div>
  );
}
