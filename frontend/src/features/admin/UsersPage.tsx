import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SectionHeading } from '@/components/ui/section-heading';
import { adminApi } from '@/lib/requests';

import { SkeletonTable } from '@/components/ui/skeleton';
import { Select } from '@/components/ui/select';

export default function UsersPage() {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'fullName' | 'email' | 'role'>('fullName');
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'users'], queryFn: () => adminApi.users() });

  const users = useMemo(() => {
    const rows = (data?.users ?? []) as Array<any>;
    const filtered = rows.filter((user) => {
      const text = `${user.fullName ?? ''} ${user.email ?? ''}`.toLowerCase();
      return text.includes(query.toLowerCase());
    });
    filtered.sort((a, b) => {
      const av = a?.[sortBy] ?? '';
      const bv = b?.[sortBy] ?? '';
      return String(av).localeCompare(String(bv));
    });
    return filtered;
  }, [data?.users, query, sortBy]);

  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
  const paged = users.slice((page - 1) * pageSize, page * pageSize);

  return (
    <motion.div 
      key={isLoading ? 'loading' : 'loaded'}
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      <SectionHeading eyebrow="Users" title="Manage members and their charity settings" />
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={15} />
            <Input className="pl-10" placeholder="Search users" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
          </div>
          <Select className="max-w-[180px]" value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
            <option value="fullName">Sort: Name</option>
            <option value="email">Sort: Email</option>
            <option value="role">Sort: Role</option>
          </Select>
        </div>

        {isLoading ? (
          <SkeletonTable rows={pageSize} cols={3} />
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-white/8">
              <table className="min-w-full text-sm">
                <thead className="bg-white/4 text-left text-xs uppercase tracking-[0.18em] text-muted">
                  <tr>
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((user: any) => (
                    <tr key={user.id} className="border-t border-white/8 transition-colors hover:bg-white/2">
                      <td className="px-4 py-3 font-medium text-text">{user.fullName}</td>
                      <td className="px-4 py-3 text-muted">{user.email}</td>
                      <td className="px-4 py-3 text-muted">{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-sm text-muted">
              <span>Page {page} of {totalPages}</span>
              <div className="flex items-center gap-2">
                <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-full border border-white/10 px-3 py-1 transition disabled:opacity-50 hover:bg-white/5">Prev</button>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-full border border-white/10 px-3 py-1 transition disabled:opacity-50 hover:bg-white/5">Next</button>
              </div>
            </div>
          </>
        )}
      </Card>
    </motion.div>
  );
}
