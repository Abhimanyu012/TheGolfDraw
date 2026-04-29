import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { adminApi } from '@/lib/requests';
import { money } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkeletonTable } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

export default function SubscriptionsPage() {
  const { data, isLoading } = useQuery({ 
    queryKey: ['admin', 'subscriptions'], 
    queryFn: () => adminApi.subscriptions() 
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-12"
    >
      <SectionHeading 
          eyebrow="Revenue" 
          title="Subscription Lifecycle" 
          description="Monitor active billing, cancellations, and lapsed memberships." 
        />


      <Card className="material-card p-0 overflow-hidden border-white/5 bg-white/2 backdrop-blur-xl">
        {isLoading ? (
          <div className="p-6">
            <SkeletonTable rows={8} cols={4} />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/4">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Plan</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Renewal Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Status</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data?.subscriptions?.map((subscription) => (
                    <tr key={subscription.id} className="group hover:bg-white/[0.03] transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-xl bg-emerald/10 flex items-center justify-center text-emerald">
                            <CreditCard size={18} />
                          </div>
                          <div>
                            <div className="font-bold text-text">{subscription.plan}</div>
                            <div className="text-[10px] text-muted uppercase tracking-wider">Recurring</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-display font-bold text-lg text-text">
                          {money(subscription.amountCents)}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <Calendar size={14} className="opacity-50" />
                          {new Date(subscription.renewsAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <Badge 
                          tone={subscription.status === 'ACTIVE' ? 'emerald' : subscription.status === 'CANCELED' ? 'danger' : 'muted'}
                        >
                          {subscription.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="p-2 rounded-xl hover:bg-white/5 text-muted hover:text-text transition-all">
                          <ArrowUpRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="grid gap-3 md:hidden p-4">
              {data?.subscriptions?.map((subscription) => (
                <div key={subscription.id} className="p-4 rounded-2xl border border-white/5 bg-white/4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-emerald/10 flex items-center justify-center text-emerald">
                        <CreditCard size={16} />
                      </div>
                      <div className="font-bold text-text text-sm">{subscription.plan}</div>
                    </div>
                    <Badge tone={subscription.status === 'ACTIVE' ? 'emerald' : subscription.status === 'CANCELED' ? 'danger' : 'muted'}>
                      {subscription.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    <div className="font-display font-bold text-emerald">{money(subscription.amountCents)}</div>
                    <div className="text-[10px] text-muted uppercase tracking-widest">
                      Renews {new Date(subscription.renewsAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </motion.div>
  );
}
