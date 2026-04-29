import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Users, CreditCard, Trophy, Landmark, Activity, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { dashboardApi } from '@/lib/requests';
import { money } from '@/lib/format';
import { SkeletonPageShell } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

function PremiumStatCard({ label, value, icon: Icon, colorClass }: any) {
  return (
    <Card className="material-card relative overflow-hidden group p-5 md:p-6 border-white/10 bg-white/[0.03]">
      <div className={cn("absolute -right-4 -top-4 size-20 md:size-24 blur-3xl opacity-10 transition-opacity group-hover:opacity-25", colorClass)} />
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-muted">{label}</p>
          <h3 className="font-display text-2xl md:text-3xl font-bold text-text tracking-tight">{value}</h3>
        </div>
        <div className={cn("rounded-2xl p-2.5 md:p-3 bg-white/5 backdrop-blur-md border border-white/5", colorClass.replace('bg-', 'text-'))}>
          <Icon size={18} className="md:w-5 md:h-5" />
        </div>
      </div>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard', 'admin'], queryFn: dashboardApi.admin });
  const dashboard = data?.dashboard;

  const chartTheme = {
    grid: "rgba(255, 255, 255, 0.03)",
    text: "rgba(240, 237, 232, 0.4)",
    emerald: "#A8E063",
    gold: "#D4AF37",
    violet: "#7B61FF",
  };

  // Sort draw stats chronologically for the charts
  const sortedStats = [...(dashboard?.drawStats ?? [])].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  return (
    <motion.div 
      key={isLoading ? 'loading' : 'loaded'}
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6 md:space-y-8 pb-12"
    >
      {isLoading ? (
        <SkeletonPageShell />
      ) : (
        <>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeading eyebrow="Intelligence" title="Global Overview" description="Monitoring member activity and reward distributions." />
            <div className="hidden sm:flex items-center gap-3 rounded-2xl border border-white/5 bg-white/4 px-5 py-2.5 text-xs font-semibold text-muted">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald"></span>
              </span>
              System Pulse: <span className="text-text">Active</span>
            </div>
          </div>

          <div className="grid gap-3 md:gap-4 grid-cols-2 xl:grid-cols-4">
            <PremiumStatCard label="Members" value={`${dashboard?.totalUsers ?? 0}`} icon={Users} colorClass="bg-emerald" />
            <PremiumStatCard label="Active Subs" value={`${dashboard?.activeSubscribers ?? 0}`} icon={CreditCard} colorClass="bg-blue-400" />
            <PremiumStatCard label="Total Pool" value={money(dashboard?.totalPrizePoolCents ?? 0)} icon={Trophy} colorClass="bg-gold" />
            <PremiumStatCard label="Distributed" value={money(dashboard?.totalPaidOutCents ?? 0)} icon={Landmark} colorClass="bg-orange-400" />
          </div>

          <div className="grid gap-6 xl:grid-cols-12">
            {/* Draw Pool History - 100% Real Data */}
            <Card className="material-card h-[380px] md:h-[420px] xl:col-span-8 border-white/5 bg-white/2 backdrop-blur-xl p-5 md:p-8">
              <div className="flex items-center justify-between mb-8 md:mb-10">
                <div>
                  <h3 className="font-display text-lg md:text-xl font-bold tracking-tight">Draw Capitalization</h3>
                  <p className="text-[10px] text-muted mt-1 uppercase tracking-widest font-medium">Historical pool performance</p>
                </div>
              </div>
              <div className="h-[280px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sortedStats}>
                    <CartesianGrid vertical={false} stroke={chartTheme.grid} strokeDasharray="6 6" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 600 }} 
                      tickFormatter={(val) => `${val}/${sortedStats.find(s => s.month === val)?.year.toString().slice(-2)}`}
                      dy={10} 
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 600 }} tickFormatter={(val) => `₹${val/100000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0e0e14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                      itemStyle={{ color: '#F0EDE8', fontSize: '11px', fontWeight: 'bold' }}
                      formatter={(val: any) => [money(val), 'Total Pool']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalPoolCents" 
                      stroke={chartTheme.gold} 
                      strokeWidth={3} 
                      dot={{ r: 3, fill: chartTheme.gold, strokeWidth: 0 }} 
                      activeDot={{ r: 5, fill: chartTheme.gold, stroke: '#fff', strokeWidth: 2 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Charity Distribution - 100% Real Data */}
            <Card className="material-card h-[380px] md:h-[420px] xl:col-span-4 border-white/5 bg-white/2 backdrop-blur-xl p-5 md:p-8">
              <div className="text-center mb-6 md:mb-8">
                <h3 className="font-display text-lg md:text-xl font-bold tracking-tight">Fund Allocation</h3>
                <p className="text-[10px] text-muted mt-1 uppercase tracking-widest font-medium">Real-time charitable split</p>
              </div>
              <div className="h-[240px] md:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0e0e14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }} 
                      formatter={(val: any) => money(val)}
                    />
                    <Pie
                      data={dashboard?.charityContributionTotals ?? []}
                      dataKey="totalCents"
                      nameKey="name"
                      outerRadius="85%"
                      innerRadius="65%"
                      paddingAngle={8}
                      stroke="none"
                    >
                      {[chartTheme.emerald, chartTheme.gold, chartTheme.violet, '#FF6B35', '#2DD4BF'].map((color, idx) => (
                        <Cell key={idx} fill={color} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Bar Chart - Winner Count per month */}
          <Card className="material-card h-[380px] md:h-[420px] border-white/5 bg-white/2 backdrop-blur-xl p-5 md:p-8">
            <div className="flex items-center justify-between mb-8 md:mb-10">
              <div>
                <h3 className="font-display text-lg md:text-xl font-bold tracking-tight">Reward Frequency</h3>
                <p className="text-[10px] text-muted mt-1 uppercase tracking-widest font-medium">Total monthly winner distributions</p>
              </div>
            </div>
            <div className="h-[280px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedStats}>
                  <CartesianGrid vertical={false} stroke={chartTheme.grid} strokeDasharray="6 6" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 600 }} 
                    tickFormatter={(val) => `${val}/${sortedStats.find(s => s.month === val)?.year.toString().slice(-2)}`}
                    dy={10} 
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 10, fontWeight: 600 }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ backgroundColor: '#0e0e14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}
                    formatter={(val: any) => [val.length, 'Total Winners']}
                  />
                  <Bar dataKey="winners" fill={chartTheme.emerald} radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}
    </motion.div>
  );
}
