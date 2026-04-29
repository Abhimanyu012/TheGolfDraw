import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Award, Upload, BadgeCheck, Clock3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { money, monthLabel } from '@/lib/format';
import { queryClient } from '@/app/queryClient';
import { winnerApi } from '@/lib/requests';

import { SkeletonListItems, SkeletonStatCards } from '@/components/ui/skeleton';

export default function WinningsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['winnings', 'me'], queryFn: winnerApi.mine });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const winnings = data?.winnings ?? [];
  const stats = {
    pendingProof: winnings.filter(w => !w.proofUrl).length,
    approvedWins: winnings.filter(w => w.verificationStatus === 'APPROVED').length,
    totalPaidCents: winnings.filter(w => w.payoutStatus === 'PAID').reduce((acc, w) => acc + w.amountCents, 0),
  };

  const uploadMutation = useMutation({
    mutationFn: ({ winnerId, file }: { winnerId: string; file: File }) => {
      const formData = new FormData();
      formData.append('proof', file);
      return winnerApi.uploadProof(winnerId, formData);
    },
    onSuccess: () => {
      toast.success('Proof uploaded');
      queryClient.invalidateQueries({ queryKey: ['winnings', 'me'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Upload failed'),
  });

  return (
    <motion.div 
      key={isLoading ? 'loading' : 'loaded'}
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      <SectionHeading eyebrow="Winnings" title="Proof upload and payout status in one view" description="Members can review their wins, submit proof, and see payout progress without leaving the page." />
      
      {isLoading ? (
        <div className="space-y-6">
          <SkeletonStatCards count={3} />
          <SkeletonListItems count={3} />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: 'Pending proof', value: stats.pendingProof.toString(), icon: Clock3 },
              { label: 'Approved wins', value: stats.approvedWins.toString(), icon: BadgeCheck },
              { label: 'Total paid', value: money(stats.totalPaidCents), icon: Award },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-muted">{item.label}</div>
                    <div className="mt-2 font-display text-2xl font-semibold text-text">{item.value}</div>
                  </div>
                  <Icon className="text-emerald" size={18} />
                </Card>
              );
            })}
          </div>

          <div className="grid gap-4">
            {winnings.map((winner) => (
              <Card key={winner.id} className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-display text-xl font-semibold">{monthLabel(winner.draw?.month ?? 1, winner.draw?.year ?? new Date().getFullYear())}</div>
                    <div className="text-sm text-muted">Tier {winner.tier} · Match count {winner.matchCount}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{money(winner.amountCents)}</div>
                    <div className="text-xs text-muted">{winner.verificationStatus} · {winner.payoutStatus}</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <input type="file" accept=".png,.jpg,.jpeg,.webp,.pdf" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} />
                  <Button busy={uploadMutation.isPending} disabled={!selectedFile} onClick={() => selectedFile && uploadMutation.mutate({ winnerId: winner.id, file: selectedFile })}>
                    <Upload size={14} /> Upload proof
                  </Button>
                  {winner.proofUrl ? <a className="text-sm text-emerald" href={winner.proofUrl} target="_blank" rel="noreferrer">View proof</a> : null}
                </div>
              </Card>
            ))}
            {winnings.length === 0 && (
              <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
                <Award className="mb-4 text-muted opacity-20" size={48} />
                <p className="text-muted text-sm">No winning entries yet. Keep tracking your scores!</p>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
