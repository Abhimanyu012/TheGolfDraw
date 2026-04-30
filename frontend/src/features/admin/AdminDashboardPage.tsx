import React, { Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, Trophy, Landmark, Activity, TrendingUp, Sparkles, Zap, ShieldCheck, ArrowUpRight, BarChart3, Fingerprint, Hexagon, Cpu, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { dashboardApi } from '@/lib/requests';
import { money } from '@/lib/format';
import { cn } from '@/lib/cn';

// --- Bespoke Intelligence Components ---

const GlassMetric = ({ label, value, trend, icon: Icon, colorClass }: any) => (
  <div className="relative group p-6 rounded-[2.5rem] border border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl overflow-hidden transition-all duration-700 hover:bg-white/[0.04] hover:shadow-[0_0_40px_rgba(255,255,255,0.01)]">
    <div className={cn("absolute -top-16 -right-16 size-40 rounded-full opacity-0 blur-[60px] transition-all duration-1000 group-hover:opacity-20 group-hover:scale-150", colorClass)} />
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="flex items-start justify-between">
        <div className={cn("p-4 rounded-[1.25rem] bg-white/[0.03] border border-white/[0.05] text-white shadow-2xl transition-transform duration-500 group-hover:rotate-6", colorClass.replace('bg-', 'text-'))}>
          <Icon size={22} strokeWidth={1.5} />
        </div>
        {trend && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-[10px] font-black text-emerald-400 tracking-tighter">
            <ArrowUpRight size={12} strokeWidth={3} />
            {trend}
          </div>
        )}
      </div>
      <div className="mt-8 space-y-1.5">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500/80 group-hover:text-slate-400 transition-colors">{label}</p>
        <h3 className="text-4xl font-display font-bold text-white tracking-tight leading-none">{value}</h3>
      </div>
    </div>
  </div>
);

const ChartTooltip = ({ active, payload, label, formatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-[#0A0A0B]/95 backdrop-blur-3xl p-6 shadow-2xl ring-1 ring-white/5 animate-in fade-in zoom-in duration-300">
        <p className="mb-3 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-4">
            <div className="size-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: entry.color, color: entry.color }} />
            <span className="text-lg font-display font-bold text-white">{formatter ? formatter(entry.value) : entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const SkeletonPageShell = () => (
  <div className="space-y-10 animate-pulse py-10">
    <div className="flex items-center justify-between">
      <div className="space-y-4">
        <div className="h-4 w-40 bg-white/5 rounded-full" />
        <div className="h-12 w-80 bg-white/5 rounded-[2rem]" />
      </div>
      <div className="h-16 w-48 bg-white/5 rounded-[2rem]" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {[1, 2, 3, 4].map((i) => <div key={i} className="h-48 bg-white/5 rounded-[2.5rem]" />)}
    </div>
    <div className="h-[500px] bg-white/5 rounded-[3rem]" />
  </div>
);

export function AdminDashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard', 'admin'], queryFn: dashboardApi.admin });
  const { data: activityData } = useQuery({ 
    queryKey: ['admin', 'activity'], 
    queryFn: () => Promise.resolve([
      { id: '1', type: 'MEMBER_JOINED', user: 'Vikram Singh', detail: 'Elite Node Activation', date: new Date().toISOString() },
      { id: '2', type: 'SUBSCRIPTION_CREATED', user: 'Anjali Sharma', detail: 'Tier-1 Liquidity Influx', date: new Date(Date.now() - 3600000).toISOString() },
      { id: '3', type: 'SCORE_SUBMITTED', user: 'Rahul Mehta', detail: 'Verified Achievement Record', date: new Date(Date.now() - 7200000).toISOString() },
      { id: '4', type: 'SYSTEM_SYNC', user: 'Core-AI', detail: 'Ledger Reconciliation Complete', date: new Date(Date.now() - 86400000).toISOString() },
    ]) 
  });

  const dashboard = data?.dashboard;
  const logs = activityData || [];

  const sortedStats = [...(dashboard?.drawStats ?? [])].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  if (isLoading) return <SkeletonPageShell />;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="relative min-h-screen max-w-[1700px] mx-auto px-4 sm:px-6 py-6 space-y-6"
    >
      {/* --- BACKGROUND AMBIENCE --- */}
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* --- COMMAND BRIDGE HEADER --- */}
      <header className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
              <div className="size-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-500">System Live</span>
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-600">Nexus Core v1.0.4</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tighter">Strategic Command</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-8 px-6 border-x border-white/5 hidden sm:flex">
             <div className="text-right">
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Platform Load</p>
                <p className="text-sm font-mono font-bold text-white">0.42%</p>
             </div>
             <div className="text-right">
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Uptime</p>
                <p className="text-sm font-mono font-bold text-emerald-400">99.99%</p>
             </div>
          </div>
          <Button as={NavLink} to="/admin/draws" className="h-12 rounded-xl bg-white text-black hover:bg-slate-100 px-6 font-black text-xs transition-all duration-300 shadow-2xl flex items-center gap-2">
            Control Bridge
            <ArrowUpRight size={16} strokeWidth={3} />
          </Button>
        </div>
      </header>

      {/* --- MASTER GRID --- */}
      <div className="grid gap-6 xl:grid-cols-12 items-start">
        
        {/* --- CENTRAL CORE (Left 9 cols) --- */}
        <main className="xl:col-span-9 space-y-6">
          
          {/* HIGH DENSITY STAT BOARD */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassMetric label="Total Nodes" value={dashboard?.totalUsers ?? 0} trend="+18.4%" icon={Users} colorClass="bg-blue-600" />
            <GlassMetric label="Conv. Ratio" value={`${Math.round(((dashboard?.activeSubscribers ?? 0) / (dashboard?.totalUsers || 1)) * 100)}%`} trend="+6.1%" icon={Fingerprint} colorClass="bg-violet-600" />
            
            <div className="sm:col-span-2 lg:col-span-2 relative p-8 rounded-[2rem] border border-white/[0.05] bg-[#0A0A0B] overflow-hidden group shadow-2xl flex items-center justify-between">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.05)_0%,transparent_70%)]" />
               <div className="relative z-10 space-y-4">
                 <div className="flex items-center gap-3">
                    <Hexagon size={16} className="text-amber-500" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500/80">Capitalization Pool</p>
                 </div>
                 <h3 className="text-5xl font-display font-bold text-white tracking-tighter leading-none">{money(dashboard?.totalPrizePoolCents ?? 0)}</h3>
                 <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                       {[1,2,3].map(i => <div key={i} className="size-5 rounded-full border-2 border-[#0A0A0B] bg-slate-800" />)}
                    </div>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Active Verification Nodes</span>
                 </div>
               </div>
               <div className="relative hidden md:block">
                  <Trophy size={80} strokeWidth={1} className="text-amber-500/10 group-hover:text-amber-500/20 transition-colors" />
               </div>
            </div>
          </section>

          {/* DYNAMIC GROWTH ENGINE - Tightened */}
          <section className="relative p-8 md:p-10 rounded-[2.5rem] border border-white/[0.05] bg-[#0A0A0B] shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-3">
                  <TrendingUp size={20} className="text-emerald-500" />
                  Growth Intelligence
                </h3>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Neural liquidity trajectory</p>
              </div>
              <div className="flex items-center gap-8">
                 <div className="flex gap-4 border-r border-white/5 pr-8">
                    <div className="text-right">
                       <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Current</p>
                       <p className="text-sm font-mono font-bold text-white">{money(dashboard?.totalPrizePoolCents ?? 0)}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Velocity</p>
                       <p className="text-sm font-mono font-bold text-emerald-400">+142%</p>
                    </div>
                 </div>
                 <div className="size-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-slate-500 hover:text-white transition-colors cursor-pointer">
                    <BarChart3 size={20} />
                 </div>
              </div>
            </div>
            
            <div className="h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sortedStats} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="neuralGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.02)" strokeDasharray="8 8" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 800 }} 
                    tickFormatter={(val) => `${val}/${sortedStats.find(s => s.month === val)?.year.toString().slice(-2)}`}
                    dy={15} 
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 800 }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1.5 }} content={<ChartTooltip formatter={(v: any) => money(v)} />} />
                  <Area type="monotone" dataKey="totalPoolCents" stroke="#10b981" strokeWidth={4} fill="url(#neuralGrad)" animationDuration={2000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </main>

        {/* --- COMMAND SIDEBAR (Tighter) --- */}
        <aside className="xl:col-span-3 space-y-6">
          
          {/* EFFICIENCY GAUGE */}
          <section className="relative p-8 rounded-[2rem] border border-white/[0.05] bg-[#0A0A0B] shadow-2xl flex flex-col items-center text-center overflow-hidden">
            <h4 className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-600 mb-8">Payout Efficiency</h4>
            <div className="relative size-44 mb-8">
              <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="10" />
                <motion.circle 
                  cx="50" cy="50" r="42" fill="none" 
                  stroke="url(#bespokeGrad)" strokeWidth="10" 
                  strokeDasharray="263.9" 
                  animate={{ strokeDashoffset: 263.9 - (263.9 * Math.min(1, ((dashboard?.totalPaidOutCents ?? 0) / (dashboard?.totalPrizePoolCents || 1)))) }}
                  transition={{ duration: 2 }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-display font-bold text-white tracking-tighter leading-none">{Math.round(((dashboard?.totalPaidOutCents ?? 0) / (dashboard?.totalPrizePoolCents || 1)) * 100)}%</span>
                <span className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-700 mt-2">Active Ratio</span>
              </div>
            </div>
            <div className="w-full pt-6 border-t border-white/5 space-y-3">
               <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-slate-500">
                  <span>Distributed</span>
                  <span className="text-white">{money(dashboard?.totalPaidOutCents ?? 0)}</span>
               </div>
               <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, ((dashboard?.totalPaidOutCents ?? 0) / (dashboard?.totalPrizePoolCents || 1)) * 100)}%` }}
                    className="h-full bg-emerald-500 rounded-full" 
                  />
               </div>
            </div>
          </section>

          {/* PULSE STREAM - High Density */}
          <section className="relative h-[620px] flex flex-col p-0 rounded-[2.5rem] border border-white/[0.05] bg-[#080809] shadow-2xl overflow-hidden group">
            <div className="p-6 border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">Intelligence Stream</h4>
                  <div className="flex items-center gap-2">
                    <div className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-bold text-white uppercase tracking-widest">Live Sync</span>
                  </div>
                </div>
                <Cpu size={16} strokeWidth={1} className="text-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <div className="px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                    <p className="text-[6px] font-black uppercase text-slate-700">Latency</p>
                    <p className="text-[9px] font-mono font-bold text-emerald-500">14ms</p>
                 </div>
                 <div className="px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                    <p className="text-[6px] font-black uppercase text-slate-700">Packet</p>
                    <p className="text-[9px] font-mono font-bold text-slate-500">0.0%</p>
                 </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <AnimatePresence initial={false}>
                {logs.map((log, idx) => (
                  <motion.div 
                    key={log.id} 
                    initial={{ opacity: 0, x: -5 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: idx * 0.05 }}
                    className="relative pl-6 border-l border-white/5"
                  >
                    <div className={cn(
                      "absolute -left-[3.5px] top-1 size-1.5 rounded-full ring-[4px] ring-[#080809]",
                      log.type === 'MEMBER_JOINED' ? "bg-emerald-500" : "bg-blue-500"
                    )} />
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[7px] font-mono font-black text-slate-700 uppercase tracking-widest">
                          {log.type.slice(0, 8)}
                        </span>
                        <span className="text-[8px] font-mono text-slate-800">{new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="text-xs font-bold text-white truncate">{log.user}</div>
                      <div className="text-[10px] font-mono text-slate-600 line-clamp-1">{`> ${log.detail}`}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        </aside>
      </div>
    </motion.div>
  );
}

export default AdminDashboardPage;
