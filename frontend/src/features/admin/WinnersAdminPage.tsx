import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Eye, IndianRupee, Trophy, History, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { Badge } from '@/components/ui/badge';
import { winnerApi } from '@/lib/requests';
import { money } from '@/lib/format';
import { queryClient } from '@/app/queryClient';
import { SkeletonListItems } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

export default function WinnersAdminPage() {
  const { data, isLoading } = useQuery({ 
    queryKey: ['admin', 'winners'], 
    queryFn: winnerApi.list 
  });
  
  const review = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' }) =>
      winnerApi.review(id, { 
        verificationStatus: status, 
        payoutStatus: status === 'APPROVED' ? 'PAID' : 'PENDING' 
      }),
    onSuccess: () => {
      toast.success('Validation process complete');
      queryClient.invalidateQueries({ queryKey: ['admin', 'winners'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Could not update winner status'),
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeading 
          eyebrow="Rewards" 
          title="Winner Verification" 
          description="Review proof of play and authorize prize distribution." 
        />
        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-muted">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-emerald shadow-[0_0_8px_rgba(168,224,99,0.5)]" />
            <span>Auto-Calculated</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <SkeletonListItems count={5} />
        ) : (
          <AnimatePresence mode="popLayout">
            {data?.winners?.length === 0 ? (
              <Card className="material-card py-20 text-center border-dashed border-white/10">
                <History className="mx-auto text-muted mb-4" size={40} />
                <p className="text-muted font-medium">No pending winner verifications found.</p>
              </Card>
            ) : (
              data?.winners?.map((winner, idx) => (
                <motion.div
                  key={winner.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="material-card p-0 overflow-hidden border-white/5 bg-white/2 backdrop-blur-xl group">
                    <div className="flex flex-col lg:flex-row lg:items-stretch">
                      {/* Left Side: Member Info */}
                      <div className="p-6 flex-1 flex items-center gap-4 border-b lg:border-b-0 lg:border-r border-white/5">
                        <div className="relative">
                          <div className="size-14 rounded-2xl bg-gradient-to-br from-emerald/20 to-gold/20 flex items-center justify-center font-bold text-xl text-text border border-white/10">
                            {winner.user?.fullName?.[0] || 'U'}
                          </div>
                          {winner.verificationStatus === 'APPROVED' && (
                            <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-emerald flex items-center justify-center text-black border-2 border-[#0e0e14]">
                              <ShieldCheck size={14} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-display text-lg font-bold tracking-tight text-text group-hover:text-gold transition-colors">
                            {winner.user?.fullName || 'Unknown Member'}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-2">
                            <Badge tone={winner.verificationStatus === 'APPROVED' ? 'emerald' : winner.verificationStatus === 'REJECTED' ? 'danger' : 'muted'}>
                              Proof: {winner.verificationStatus}
                            </Badge>
                            <Badge tone={winner.payoutStatus === 'PAID' ? 'gold' : 'muted'}>
                              Payout: {winner.payoutStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Amount */}
                      <div className="p-6 lg:w-64 flex flex-col justify-center items-center lg:items-start bg-white/[0.02]">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">Prize Amount</p>
                        <div className="flex items-center gap-1.5 font-display text-3xl font-black text-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                          <IndianRupee size={24} className="stroke-[3]" />
                          {money(winner.amountCents).replace('₹', '')}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="p-6 flex items-center justify-center gap-3 bg-white/4">
                        <Button 
                          variant="secondary" 
                          className="rounded-xl h-10 px-4"
                          disabled={!winner.proofUrl}
                          onClick={() => window.open(winner.proofUrl || '', '_blank')}
                        >
                          <Eye size={16} className="mr-2" />
                          Proof
                        </Button>
                        
                        {winner.verificationStatus === 'PENDING' && (
                          <>
                            <Button 
                              className="rounded-xl h-10 px-4 bg-emerald/20 text-emerald hover:bg-emerald/30 border-emerald/20" 
                              busy={review.isPending} 
                              onClick={() => review.mutate({ id: winner.id, status: 'APPROVED' })}
                            >
                              <CheckCircle2 size={16} className="mr-2" />
                              Verify
                            </Button>
                            <Button 
                              variant="danger" 
                              className="rounded-xl h-10 px-4" 
                              busy={review.isPending} 
                              onClick={() => review.mutate({ id: winner.id, status: 'REJECTED' })}
                            >
                              <XCircle size={16} className="mr-2" />
                              Deny
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
