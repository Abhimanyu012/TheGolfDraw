import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, Rocket, Zap, Settings, History, CheckCircle2, TrendingUp, Shuffle, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomDropdown } from '@/components/ui/select';
import { SectionHeading } from '@/components/ui/section-heading';
import { drawApi } from '@/lib/requests';
import { queryClient } from '@/app/queryClient';
import { money } from '@/lib/format';

import { SkeletonListItems } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function DrawsAdminPage() {
  const [logic, setLogic] = useState<'RANDOM' | 'MOST_FREQUENT' | 'LEAST_FREQUENT'>('RANDOM');
  const { data, isLoading } = useQuery({ queryKey: ['draws'], queryFn: drawApi.list });
  const [simulation, setSimulation] = useState<any>(null);

  const simulate = useMutation({
    mutationFn: () => drawApi.simulate(logic),
    onSuccess: (response) => {
      setSimulation(response.simulation);
      toast.success('System simulation successful');
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Simulation failed'),
  });

  const publish = useMutation({
    mutationFn: () => drawApi.publish({ logic }),
    onSuccess: () => {
      toast.success('Draw results published globally');
      setSimulation(null);
      queryClient.invalidateQueries({ queryKey: ['draws'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Publish failed'),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-12"
    >
      <SectionHeading 
        eyebrow="Engine" 
        title="Draw Command" 
        description="Configure parameters and execute the monthly reward distribution algorithm." 
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Control Console */}
        <Card className="material-card lg:col-span-7 border-white/5 bg-white/2 backdrop-blur-xl p-8 space-y-8">
          <div className="flex items-center gap-3 text-emerald">
            <Settings size={20} />
            <h3 className="font-display text-xl font-bold tracking-tight text-text">Algorithm Parameters</h3>
          </div>

          <div className="grid gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Execution Logic</label>
              <CustomDropdown
                value={logic}
                onChange={(val) => setLogic(val as any)}
                options={[
                  {
                    value: 'RANDOM',
                    label: 'Random',
                    description: 'Standard lottery — fair and unpredictable',
                    icon: Shuffle,
                  },
                  {
                    value: 'MOST_FREQUENT',
                    label: 'Algorithmic (+)',
                    description: 'Weighted towards most-submitted scores',
                    icon: TrendingUp,
                  },
                  {
                    value: 'LEAST_FREQUENT',
                    label: 'Algorithmic (−)',
                    description: 'Weighted towards least-submitted scores',
                    icon: BarChart2,
                  },
                ]}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-white/5">
              <Button 
                variant="secondary" 
                className="flex-1 py-4 rounded-2xl font-bold text-xs sm:text-sm" 
                busy={simulate.isPending} 
                onClick={() => simulate.mutate()}
              >
                <Zap size={16} className="mr-1.5 sm:mr-2" />
                Simulate
              </Button>
              <Button 
                className="flex-[1.5] py-4 rounded-2xl font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(168,224,99,0.2)]" 
                busy={publish.isPending} 
                onClick={() => publish.mutate()}
              >
                <Rocket size={16} className="mr-1.5 sm:mr-2" />
                Run Draw
              </Button>
            </div>
          </div>
        </Card>

        {/* Simulation Output */}
        <Card className="material-card lg:col-span-5 border-emerald/10 bg-emerald/[0.02] backdrop-blur-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 text-gold">
              <PlayCircle size={20} />
              <h3 className="font-display text-xl font-bold tracking-tight text-text">Live Output</h3>
            </div>
            {simulation && <Badge tone="emerald" className="animate-pulse">Calculated</Badge>}
          </div>

          {simulation ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-4">Winning Combination</p>
                <div className="flex flex-wrap gap-2.5">
                  {simulation.numbers.map((num: number, i: number) => (
                    <motion.span 
                      key={i}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="size-11 rounded-xl bg-gold text-black font-black flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                    >
                      {num}
                    </motion.span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Total Pool</p>
                  <p className="text-xl font-bold text-text mt-1">{money(simulation.totalPoolCents)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Jackpot Carry</p>
                  <p className="text-xl font-bold text-gold mt-1">{money(simulation.jackpotCarryOutCents)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-gold/10 border border-gold/20 text-[10px] font-bold text-gold uppercase tracking-widest">
                <TrendingUp size={12} />
                Calculated across {simulation.winners?.length || 0} potential winners
              </div>
            </motion.div>
          ) : (
            <div className="h-[240px] flex flex-col items-center justify-center text-center space-y-4">
              <div className="size-16 rounded-3xl bg-white/5 flex items-center justify-center text-muted/20">
                <Zap size={32} />
              </div>
              <p className="text-sm text-muted max-w-[200px]">Execute a simulation to preview the reward distribution.</p>
            </div>
          )}
        </Card>
      </div>

      {/* History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted px-2">
          <History size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Draw Logs</span>
        </div>
        
        <div className="grid gap-4">
          {isLoading ? (
            <SkeletonListItems count={3} />
          ) : (
            data?.draws?.map((draw, idx) => (
              <motion.div
                key={draw.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="material-card group border-white/5 bg-white/2 backdrop-blur-xl p-6 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="size-12 rounded-2xl bg-white/5 flex flex-col items-center justify-center border border-white/10 group-hover:bg-emerald/10 transition-colors">
                      <span className="text-[10px] font-black uppercase leading-none">{new Date(draw.year, draw.month - 1).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-lg font-black leading-none mt-1">{draw.year.toString().slice(-2)}</span>
                    </div>
                    <div>
                      <div className="font-bold text-text tracking-tight flex items-center gap-2">
                        Official Draw Sequence
                        {draw.status === 'PUBLISHED' && <CheckCircle2 size={14} className="text-emerald" />}
                      </div>
                      <div className="mt-1 flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {draw.numbers.map((n, i) => (
                            <span key={i} className="text-xs font-bold text-gold/80">{n}{i < draw.numbers.length - 1 ? '·' : ''}</span>
                          ))}
                        </div>
                        <span className="text-muted text-[10px] uppercase tracking-widest font-bold">via {draw.logic}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted">Total Payout</div>
                      <div className="font-display font-black text-emerald mt-0.5">{money(draw.totalPoolCents)}</div>
                    </div>
                    <Badge tone={draw.status === 'PUBLISHED' ? 'emerald' : 'muted'}>
                      {draw.status}
                    </Badge>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
