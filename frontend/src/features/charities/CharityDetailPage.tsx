import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { HandCoins, HeartHandshake, Leaf, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { charityApi } from '@/lib/requests';

export default function CharityDetailPage() {
  const { slug = '' } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ['charity', slug], queryFn: () => charityApi.detail(slug), enabled: Boolean(slug) });

  if (isLoading) {
    return <div className="page-shell py-16 text-muted">Loading charity…</div>;
  }

  const charity = data?.charity;

  if (!charity) {
    return <div className="page-shell py-16">Charity not found.</div>;
  }

  return (
    <div className="page-shell py-16">
      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="space-y-5 lg:col-span-7">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-emerald">
            <HandCoins size={18} />
          </div>
          <div className="text-xs uppercase tracking-[0.24em] text-muted">Charity profile</div>
          <h1 className="font-display text-4xl font-bold">{charity.name}</h1>
          <p className="max-w-3xl text-sm leading-8 text-muted">{charity.description}</p>
          <Link to="/signup" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald">
            Support this charity
            <HandCoins size={14} />
          </Link>
        </Card>

        <Card className="space-y-4 lg:col-span-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-emerald" size={18} />
            <h2 className="font-display text-2xl font-semibold">Impact breakdown</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Membership giving', value: 68 },
              { label: 'Program support', value: 22 },
              { label: 'Platform reserve', value: 10 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm text-muted">
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,rgb(var(--color-emerald)),rgba(255,255,255,0.85))]" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <Leaf className="text-gold" size={16} />
              <div className="mt-2 text-xs uppercase tracking-[0.22em] text-muted">Focus</div>
              <div className="mt-1 font-display text-lg font-semibold text-text">Visible community support</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <HeartHandshake className="text-emerald" size={16} />
              <div className="mt-2 text-xs uppercase tracking-[0.22em] text-muted">Connection</div>
              <div className="mt-1 font-display text-lg font-semibold text-text">Member-first giving</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
