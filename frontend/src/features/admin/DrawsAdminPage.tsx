import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { PlayCircle, Rocket } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { SectionHeading } from '@/components/ui/section-heading';
import { drawApi } from '@/lib/requests';
import { queryClient } from '@/app/queryClient';
import { money } from '@/lib/format';
import { cn } from '@/lib/cn';

import { SkeletonListItems } from '@/components/ui/skeleton';

export default function DrawsAdminPage() {
  const [mode, setMode] = useState<'RANDOM' | 'ALGORITHMIC'>('RANDOM');
  const [logic, setLogic] = useState<'RANDOM' | 'MOST_FREQUENT' | 'LEAST_FREQUENT'>('RANDOM');
  const { data, isLoading } = useQuery({ queryKey: ['draws'], queryFn: drawApi.list });
  const [simulation, setSimulation] = useState<any>(null);

  const simulate = useMutation({
    mutationFn: () => drawApi.simulate(logic),
    onSuccess: (response) => {
      setSimulation(response.simulation);
      toast.success('Draw simulated');
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Simulation failed'),
  });

  const publish = useMutation({
    mutationFn: () => drawApi.publish({ logic }),
    onSuccess: () => {
      toast.success('Draw published');
      queryClient.invalidateQueries({ queryKey: ['draws'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Publish failed'),
  });

  return (
    <motion.div
      key={isLoading ? 'loading' : 'loaded'}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      <SectionHeading eyebrow="Draw control" title="Simulate and publish monthly draws" />
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => { setMode('RANDOM'); setLogic('RANDOM'); }} className={mode === 'RANDOM' ? 'rounded-full border border-emerald/25 bg-emerald/12 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald' : 'rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted'}>Random</button>
          <button type="button" onClick={() => { setMode('ALGORITHMIC'); setLogic('MOST_FREQUENT'); }} className={mode === 'ALGORITHMIC' ? 'rounded-full border border-emerald/25 bg-emerald/12 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald' : 'rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted'}>Algorithmic</button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select className="max-w-64" value={logic} onChange={(event) => setLogic(event.target.value as typeof logic)}>
            <option value="RANDOM">RANDOM</option>
            <option value="MOST_FREQUENT">MOST_FREQUENT</option>
            <option value="LEAST_FREQUENT">LEAST_FREQUENT</option>
          </Select>
          <Button busy={simulate.isPending} onClick={() => simulate.mutate()}><PlayCircle size={14} /> Simulate</Button>
          <Button busy={publish.isPending} onClick={() => publish.mutate()}><Rocket size={14} /> Publish current month</Button>
        </div>

        {simulation ? (
          <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-muted">Simulation preview</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {simulation.numbers.map((num: number) => (
                <span key={num} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold/20 bg-black text-gold font-data">{num}</span>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm text-muted">
              <div>Total pool: <span className="font-data text-text">{money(simulation.totalPoolCents)}</span></div>
              <div>Tier 4: <span className="font-data text-text">{money(simulation.pool4Cents)}</span></div>
              <div>Tier 3: <span className="font-data text-text">{money(simulation.pool3Cents)}</span></div>
            </div>
          </div>
        ) : null}
      </Card>

      <div className="grid gap-4">
        {isLoading ? (
          <SkeletonListItems count={3} />
        ) : (
          data?.draws?.map((draw) => (
            <Card key={draw.id} className="flex items-center justify-between">
              <div>
                <div className="font-display text-lg font-semibold">Draw {draw.month}/{draw.year}</div>
                <div className="text-sm text-muted">{draw.logic} logic</div>
              </div>
              <div className={cn(
                "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em]",
                draw.status === 'PUBLISHED' ? "bg-emerald/15 text-emerald" : "bg-white/5 text-muted"
              )}>
                {draw.status}
              </div>
            </Card>
          ))
        )}
      </div>
    </motion.div>
  );
}
