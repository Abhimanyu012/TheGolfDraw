import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Edit3, PlusCircle, ShieldCheck, Target, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SectionHeading } from '@/components/ui/section-heading';
import { scoreApi, subscriptionApi } from '@/lib/requests';
import { shortDate } from '@/lib/format';
import { queryClient } from '@/app/queryClient';
import { useNavigate } from 'react-router-dom';
import { SkeletonListItems } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

const schema = z.object({ value: z.coerce.number().int().min(1).max(45), date: z.string().min(1) });

type FormValues = z.infer<typeof schema>;

export default function ScoresPage() {
  const navigate = useNavigate();
  const [editing, setEditing] = useState<{ id: string; value: number } | null>(null);
  
  const { data, isLoading } = useQuery({ queryKey: ['scores'], queryFn: scoreApi.list });
  const { data: subData, isLoading: isSubLoading } = useQuery({ 
    queryKey: ['subscriptions', 'me'], 
    queryFn: subscriptionApi.me 
  });

  const scores = data?.scores ?? [];
  const isActive = subData?.subscription?.status === 'ACTIVE';

  const createMutation = useMutation({
    mutationFn: scoreApi.create,
    onSuccess: () => {
      toast.success('Score saved');
      queryClient.invalidateQueries({ queryKey: ['scores'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'me'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Could not save score'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, value }: { id: string; value: number }) => scoreApi.update(id, { value }),
    onSuccess: () => {
      toast.success('Score updated');
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ['scores'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Could not update score'),
  });

  const deleteMutation = useMutation({
    mutationFn: scoreApi.remove,
    onSuccess: () => {
      toast.success('Score deleted');
      queryClient.invalidateQueries({ queryKey: ['scores'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Could not delete score'),
  });

  const form = useForm<FormValues>({ resolver: zodResolver(schema) as any, defaultValues: { date: new Date().toISOString().slice(0, 10), value: 18 } });

  const onSubmit = form.handleSubmit((values) => createMutation.mutate(values));

  return (
    <motion.div 
      key={isLoading ? 'loading' : 'loaded'}
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >

      <SectionHeading eyebrow="Score management" title="Track your last five scores" description="Values must stay between 1 and 45 and only one score can exist per date." />
      
      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        {/* ADD SCORE CARD / GATING */}
        {!isActive && !isSubLoading ? (
          <Card className="material-card h-fit space-y-6 p-5 md:p-8 border-gold/30 bg-gradient-to-b from-[#1a1720] to-[#12121a]">
            <div className="space-y-4 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
                <ShieldCheck size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-2xl font-bold">Subscription Required</h3>
                <p className="text-sm text-muted leading-relaxed px-4">
                  You need an active membership to track scores and participate in monthly draws.
                </p>
              </div>
              <Button className="w-full h-12 rounded-2xl" onClick={() => navigate('/subscription')}>
                View Plans
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="material-card h-fit space-y-6 p-5 md:p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/8 bg-white/5 text-emerald">
                <PlusCircle size={20} />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold">Add new score</h3>
                <p className="text-xs text-muted">Enter your daily total</p>
              </div>
            </div>
            
            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted">Date of play</label>
                <Input 
                  type="date" 
                  className={cn(
                    "text-white h-11 md:h-12",
                    form.formState.errors.date && "border-danger focus-visible:ring-danger/20"
                  )}
                  {...form.register('date')} 
                />
                {form.formState.errors.date && (
                  <p className="text-xs font-medium text-danger">{form.formState.errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted">Stableford score (1-45)</label>
                <Input 
                  type="number" 
                  min={1} 
                  max={45} 
                  placeholder="Enter score" 
                  className={cn(
                    "text-white h-11 md:h-12",
                    form.formState.errors.value && "border-danger focus-visible:ring-danger/20"
                  )}
                  {...form.register('value')} 
                />
                {form.formState.errors.value && (
                  <p className="text-xs font-medium text-danger">{form.formState.errors.value.message}</p>
                )}
              </div>

              <Button className="w-full py-3 md:py-3.5" busy={createMutation.isPending} type="submit">
                Save score
              </Button>
            </form>
          </Card>
        )}

        {/* RECENT SCORES CARD */}
        <Card className="material-card space-y-6 p-5 md:p-6">
          <div className="flex flex-col gap-4 border-b border-white/8 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/8 bg-white/5 text-gold">
                <Target size={20} />
              </div>
              <h3 className="font-display text-xl font-bold">Recent scores</h3>
            </div>
            <span className="w-fit rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              Descending order
            </span>
          </div>

          <div className="grid gap-3">
            {isLoading ? (
              <SkeletonListItems count={Math.max(1, scores.length || 3)} />
            ) : (
              <>
                {scores.length === 0 && (
                  <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-full bg-white/4 p-4 text-muted/20">
                      <Target size={40} />
                    </div>
                    <p className="text-sm text-muted">No scores recorded yet.<br/>Your last 5 scores determine your eligibility.</p>
                  </div>
                )}
                {scores.map((score) => (
                  <div key={score.id} className="group relative flex items-center justify-between gap-3 rounded-3xl border border-white/8 bg-white/2 px-4 py-3 transition-all hover:border-white/12 hover:bg-white/4 md:px-5 md:py-4">
                    {editing?.id === score.id ? (
                      <div className="flex w-full items-center gap-2 md:gap-3">
                        <div className="flex-1">
                          <Input 
                            type="number" 
                            min={1} 
                            max={45} 
                            className="h-10 text-white" 
                            defaultValue={editing.value} 
                            onChange={(event) => setEditing({ ...editing, value: Number(event.target.value) })} 
                          />
                        </div>
                        <Button busy={updateMutation.isPending} onClick={() => updateMutation.mutate({ id: score.id, value: editing.value })}>
                          Update
                        </Button>
                        <Button variant="ghost" onClick={() => setEditing(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="grid h-10 w-10 place-items-center rounded-xl bg-black font-data text-xl font-bold text-emerald shadow-inner md:h-12 md:w-12 md:rounded-2xl md:text-2xl">
                            {score.value}
                          </div>
                          <div>
                            <div className="font-display text-sm font-semibold text-text md:text-base">Round Score</div>
                            <div className="text-[10px] text-muted md:text-xs">{shortDate(score.date)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2">
                          <button 
                            onClick={() => setEditing({ id: score.id, value: score.value })}
                            className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-muted hover:bg-white/10 hover:text-text transition-colors md:h-10 md:w-10"
                            title="Edit score"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button 
                            onClick={() => deleteMutation.mutate(score.id)}
                            className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-muted hover:bg-danger/10 hover:text-danger transition-colors md:h-10 md:w-10"
                            title="Delete score"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
