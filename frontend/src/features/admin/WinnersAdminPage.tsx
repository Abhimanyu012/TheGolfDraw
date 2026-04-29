import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { SkeletonListItems } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { winnerApi } from '@/lib/requests';
import { money } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { queryClient } from '@/app/queryClient';

export default function WinnersAdminPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'winners'], queryFn: winnerApi.list });
  
  const review = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' }) =>
      winnerApi.review(id, { verificationStatus: status, payoutStatus: status === 'APPROVED' ? 'PAID' : 'PENDING' }),
    onSuccess: () => {
      toast.success('Winner updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'winners'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Could not update winner'),
  });

  return (
    <motion.div 
      key={isLoading ? 'loading' : 'loaded'}
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      <SectionHeading eyebrow="Winners" title="Review proof and payout status" />
      <div className="grid gap-4">
        {isLoading ? (
          <SkeletonListItems count={5} />
        ) : (
          data?.winners?.map((winner) => (
            <Card key={winner.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-text">{winner.user?.fullName || winner.userId}</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted">{winner.verificationStatus} · {winner.payoutStatus}</div>
                </div>
                <div className="font-data text-xl font-bold text-emerald">{money(winner.amountCents)}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button busy={review.isPending} onClick={() => review.mutate({ id: winner.id, status: 'APPROVED' })}>Approve</Button>
                <Button variant="danger" busy={review.isPending} onClick={() => review.mutate({ id: winner.id, status: 'REJECTED' })}>Reject</Button>
                {winner.proofUrl && (
                  <a href={winner.proofUrl} target="_blank" rel="noreferrer" className="ml-auto text-sm text-emerald underline">
                    View Proof
                  </a>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </motion.div>
  );
}
