import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { adminApi } from '@/lib/requests';
import { money } from '@/lib/format';

import { SkeletonListItems } from '@/components/ui/skeleton';

export default function SubscriptionsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'subscriptions'], queryFn: () => adminApi.subscriptions() });

  return (
    <motion.div 
      key={isLoading ? 'loading' : 'loaded'}
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      <SectionHeading eyebrow="Subscriptions" title="Monitor active, canceled, and lapsed members" />
      <Card>
        {isLoading ? (
          <SkeletonListItems count={5} />
        ) : (
          <div className="mt-4 grid gap-3">
            {data?.subscriptions?.map((subscription) => (
              <div key={subscription.id} className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm transition hover:bg-white/6">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-text">{subscription.plan}</span>
                  <div className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted">{subscription.status}</div>
                </div>
                <div className="mt-2 font-data text-lg font-bold text-emerald">{money(subscription.amountCents)}</div>
              </div>
            ))}
            {data?.subscriptions?.length === 0 && (
              <div className="py-8 text-center text-sm text-muted">No subscriptions found.</div>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
