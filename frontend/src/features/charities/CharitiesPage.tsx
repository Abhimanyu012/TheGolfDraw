import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SectionHeading } from '@/components/ui/section-heading';
import { charityApi } from '@/lib/requests';
import { BadgeCheck, HandCoins } from 'lucide-react';
import { SkeletonCard } from '@/components/ui/skeleton';

type FilterMode = 'all' | 'featured' | 'active';

export default function CharitiesPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const { data, isLoading, isError } = useQuery({
    queryKey: ['charities', query],
    queryFn: () => charityApi.list(query),
  });

  const charities = useMemo(() => {
    const items = data?.charities ?? [];
    return items.filter((charity) => {
      if (filter === 'featured') return charity.isFeatured;
      if (filter === 'active') return charity.isActive;
      return true;
    });
  }, [data?.charities, filter]);

  const featured = useMemo(() => charities.find((charity) => charity.isFeatured) ?? charities[0], [charities]);

  return (
    <motion.div
      key={isLoading ? 'loading' : 'loaded'}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="page-shell py-16"
    >
      <SectionHeading
        eyebrow="Impact selection"
        title="Align with a Purpose"
        description="Select the cause your membership supports. Our Impact Partners are globally verified for transparency and measurable sustainable change."
      />
      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="relative max-w-lg">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <Input className="pl-11" placeholder="Search charities" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {([
            ['all', 'All'],
            ['featured', 'Featured'],
            ['active', 'Active'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={
                filter === key
                  ? 'rounded-full border border-emerald/25 bg-emerald/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald'
                  : 'rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted transition hover:text-text'
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 space-y-8">
          <SkeletonCard lines={6} />
          <div className="mt-8 columns-1 gap-4 space-y-4 md:columns-2 xl:columns-3">
            <SkeletonCard lines={4} />
            <SkeletonCard lines={4} />
            <SkeletonCard lines={4} />
          </div>
        </div>
      ) : (
        <>
          {featured ? (
            <Card className="mt-8 overflow-hidden p-0">
              <div className="relative h-[240px] sm:h-[300px]">
                <img
                  src={featured.imageUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1400&q=80'}
                  alt={featured.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,5,10,0.4),rgba(5,5,10,0.8))]" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="inline-flex rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gold">Featured charity</div>
                  <h2 className="mt-3 font-display text-3xl font-semibold text-white">{featured.name}</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-200/85">{featured.description}</p>
                </div>
              </div>
            </Card>
          ) : null}

          <div className="mt-8 columns-1 gap-4 space-y-4 md:columns-2 xl:columns-3">
            {isError ? <Card>We could not load charities right now.</Card> : null}
            {charities.map((charity) => (
              <Card key={charity.id} className="mb-4 break-inside-avoid space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-display text-xl font-semibold">{charity.name}</div>
                  {charity.isFeatured ? <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">Featured</span> : null}
                </div>
                <p className="line-clamp-4 text-sm leading-7 text-muted">{charity.description}</p>
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted">
                  <span>{charity.isActive ? 'Active cause' : 'Paused'}</span>
                  <BadgeCheck size={14} className={charity.isActive ? 'text-emerald' : 'text-muted'} />
                </div>
                <Link className="inline-flex items-center gap-2 text-sm font-semibold text-emerald" to={`/charities/${charity.slug}`}>
                  View details
                  <HandCoins size={14} />
                </Link>
              </Card>
            ))}
            {!isError && charities.length === 0 ? <Card>No charities match your current filters.</Card> : null}
          </div>
        </>
      )}
    </motion.div>
  );
}

