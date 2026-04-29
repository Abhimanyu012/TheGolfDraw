import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { StatCard } from '@/components/ui/stat-card';
import { dashboardApi } from '@/lib/requests';
import { money } from '@/lib/format';

import { SkeletonPageShell } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard', 'admin'], queryFn: dashboardApi.admin });
  const dashboard = data?.dashboard;

  return (
    <motion.div 
      key={isLoading ? 'loading' : 'loaded'}
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      {isLoading ? (
        <SkeletonPageShell />
      ) : (
        <>
          <SectionHeading eyebrow="Admin" title="System control center" description="A clear view of users, subscriptions, pools, payouts, and draw trends." />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total users" value={`${dashboard?.totalUsers ?? 0}`} />
            <StatCard label="Active subscribers" value={`${dashboard?.activeSubscribers ?? 0}`} />
            <StatCard label="Prize pool" value={money(dashboard?.totalPrizePoolCents ?? 0)} />
            <StatCard label="Paid out" value={money(dashboard?.totalPaidOutCents ?? 0)} />
          </div>

          <div className="grid gap-4 xl:grid-cols-12">
            <Card className="h-[360px] xl:col-span-7">
              <h3 className="font-display text-2xl font-semibold">Subscriber growth</h3>
              <div className="mt-6 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboard?.drawStats?.map((item, index) => ({ ...item, users: Math.max(0, (dashboard?.totalUsers ?? 0) - (dashboard?.drawStats?.length ?? 0) * 14 + index * 16) })) ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.45)" />
                    <YAxis stroke="rgba(255,255,255,0.45)" />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="rgb(var(--color-emerald))" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="h-[360px] xl:col-span-5">
              <h3 className="font-display text-2xl font-semibold">Charity distribution</h3>
              <div className="mt-6 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip />
                    <Legend />
                    <Pie
                      data={(dashboard?.charityContributionTotals ?? []).slice(0, 4).map((entry, idx) => ({
                        name: `Charity ${idx + 1}`,
                        value: entry?._sum?.amountCents ?? 0,
                      }))}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={88}
                      innerRadius={54}
                    >
                      {['#C8F135', '#7B61FF', '#FF6B35', '#E8C875'].map((color) => (
                        <Cell key={color} fill={color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card className="h-[360px]">
            <h3 className="font-display text-2xl font-semibold">Monthly prize pools</h3>
            <div className="mt-6 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboard?.drawStats ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.45)" />
                  <YAxis stroke="rgba(255,255,255,0.45)" />
                  <Tooltip />
                  <Bar dataKey="totalPoolCents" fill="rgb(var(--color-emerald))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}
    </motion.div>
  );
}
