import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { Award, Upload, BadgeCheck, Clock3, Paperclip, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { Badge } from '@/components/ui/badge';
import { money, monthLabel } from '@/lib/format';
import { queryClient } from '@/app/queryClient';
import { winnerApi } from '@/lib/requests';
import { SkeletonListItems, SkeletonStatCards } from '@/components/ui/skeleton';

// Isolated winner card — each card owns its own file state, preventing cross-card upload bugs
function WinnerCard({
  winner,
  isUploading,
  onUpload,
}: {
  winner: any;
  isUploading: boolean;
  onUpload: (winnerId: string, file: File) => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const statusTone = (v: string) =>
    v === 'APPROVED' ? 'emerald' : v === 'REJECTED' ? 'danger' : 'muted';

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(winner.id, selectedFile);
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const alreadyUploaded = !!winner.proofUrl;

  return (
    <Card className="material-card space-y-4 border-white/5 bg-white/2 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-display text-xl font-semibold text-text">
            {monthLabel(winner.draw?.month ?? 1, winner.draw?.year ?? new Date().getFullYear())}
          </div>
          <div className="mt-1 text-xs text-muted uppercase tracking-wider">
            Tier <span className="text-gold font-bold">{winner.tier}</span> · {winner.matchCount} numbers matched
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-2xl font-bold text-emerald">{money(winner.amountCents)}</div>
          <div className="flex items-center justify-end gap-2 mt-1 flex-wrap">
            <Badge tone={statusTone(winner.verificationStatus)}>
              {winner.verificationStatus === 'APPROVED' ? (
                <><CheckCircle2 size={10} className="mr-1" />Verified</>
              ) : winner.verificationStatus === 'REJECTED' ? (
                <><XCircle size={10} className="mr-1" />Rejected</>
              ) : (
                'Pending Review'
              )}
            </Badge>
            <Badge tone={winner.payoutStatus === 'PAID' ? 'gold' : 'muted'}>
              {winner.payoutStatus === 'PAID' ? 'Paid' : 'Awaiting Payout'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Proof section */}
      <div className="border-t border-white/5 pt-4">
        {alreadyUploaded ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-emerald font-medium">
              <CheckCircle2 size={14} />
              Proof submitted — awaiting admin review
            </div>
            <a
              href={winner.proofUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold text-emerald hover:text-emerald/80 transition-colors"
            >
              <ExternalLink size={12} />
              View Proof
            </a>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={inputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.pdf"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-muted hover:border-white/20 hover:text-text transition-all"
            >
              <Paperclip size={13} />
              {selectedFile ? selectedFile.name : 'Choose File'}
            </button>
            <Button
              busy={isUploading}
              disabled={!selectedFile}
              onClick={handleUpload}
              className="rounded-xl px-5"
            >
              <Upload size={13} className="mr-1.5" />
              Upload Proof
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function WinningsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['winnings', 'me'], queryFn: winnerApi.mine });
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const winnings = data?.winnings ?? [];
  const stats = {
    pendingProof: winnings.filter((w) => !w.proofUrl).length,
    approvedWins: winnings.filter((w) => w.verificationStatus === 'APPROVED').length,
    totalPaidCents: winnings
      .filter((w) => w.payoutStatus === 'PAID')
      .reduce((acc, w) => acc + w.amountCents, 0),
  };

  const uploadMutation = useMutation({
    mutationFn: ({ winnerId, file }: { winnerId: string; file: File }) => {
      const formData = new FormData();
      formData.append('proof', file);
      return winnerApi.uploadProof(winnerId, formData);
    },
    onSuccess: () => {
      toast.success('Proof uploaded successfully');
      setUploadingId(null);
      queryClient.invalidateQueries({ queryKey: ['winnings', 'me'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Upload failed');
      setUploadingId(null);
    },
  });

  const handleUpload = (winnerId: string, file: File) => {
    setUploadingId(winnerId);
    uploadMutation.mutate({ winnerId, file });
  };

  return (
    <motion.div
      key={isLoading ? 'loading' : 'loaded'}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      <SectionHeading
        eyebrow="Rewards"
        title="Prize History & Verification"
        description="A transparent record of your success. Track verified rewards, manage proof submissions, and monitor disbursement status."
      />

      {isLoading ? (
        <div className="space-y-6">
          <SkeletonStatCards count={3} />
          <SkeletonListItems count={3} />
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: 'Pending Proof', value: stats.pendingProof.toString(), icon: Clock3 },
              { label: 'Approved Wins', value: stats.approvedWins.toString(), icon: BadgeCheck },
              { label: 'Total Paid', value: money(stats.totalPaidCents), icon: Award },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="material-card flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-muted">{item.label}</div>
                    <div className="mt-2 font-display text-2xl font-semibold text-text">{item.value}</div>
                  </div>
                  <Icon className="text-emerald" size={18} />
                </Card>
              );
            })}
          </div>

          {/* Winner cards */}
          <div className="grid gap-4">
            {winnings.map((winner) => (
              <WinnerCard
                key={winner.id}
                winner={winner}
                isUploading={uploadingId === winner.id && uploadMutation.isPending}
                onUpload={handleUpload}
              />
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
