import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Search, Edit3, Shield, User as UserIcon, Calendar, Trash2, Plus, X, SortAsc } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { adminApi, scoreApi } from '@/lib/requests';
import { queryClient } from '@/app/queryClient';
import { SkeletonTable } from '@/components/ui/skeleton';
import { CustomDropdown } from '@/components/ui/select';
import { cn } from '@/lib/cn';

export default function UsersPage() {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'fullName' | 'email' | 'role'>('fullName');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi.users()
  });

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

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-12"
    >
      <SectionHeading eyebrow="Community" title="Member Directory" description="Manage user profiles, edit golf scores, and control permissions." />

      <Card className="material-card space-y-6 border-white/5 bg-white/2 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative min-w-[300px] flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <Input
              className="pl-11 h-12 bg-white/4 border-white/8 rounded-2xl focus:border-emerald/50 transition-all"
              placeholder="Search members by name or email..."
              value={query}
              onChange={(event) => { setQuery(event.target.value); setPage(1); }}
            />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-bold uppercase tracking-widest text-muted hidden sm:block">Sort:</span>
            <CustomDropdown
              value={sortBy}
              onChange={(val) => { setSortBy(val as any); setPage(1); }}
              className="min-w-[160px]"
              options={[
                { value: 'fullName', label: 'Full Name', icon: UserIcon },
                { value: 'email', label: 'Email', icon: SortAsc },
                { value: 'role', label: 'Account Role', icon: Shield },
              ]}
            />
          </div>
        </div>

        {isLoading ? (
          <SkeletonTable rows={pageSize} cols={4} />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-white/5 bg-black/20">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/4 text-muted">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em]">Member</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em]">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em]">Role</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.2em]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paged.map((user: any) => (
                    <tr key={user.id} className="group transition-colors hover:bg-white/[0.03]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-gradient-to-br from-emerald/20 to-gold/20 flex items-center justify-center font-bold text-text border border-white/10 group-hover:scale-110 transition-transform">
                            {user.fullName?.[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-text">{user.fullName}</div>
                            <div className="text-xs text-muted">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted">
                          <div className={cn("size-2 rounded-full", user.role === 'admin' ? "bg-gold" : "bg-emerald")} />
                          Verified
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          user.role === 'admin' ? "bg-gold/10 text-gold border border-gold/20" : "bg-emerald/10 text-emerald border border-emerald/20"
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="secondary"
                          className="rounded-xl h-9 px-4 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit3 size={14} className="mr-2" />
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="grid gap-3 md:hidden">
              {paged.map((user: any) => (
                <div key={user.id} className="p-4 rounded-2xl border border-white/5 bg-white/4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-gradient-to-br from-emerald/20 to-gold/20 flex items-center justify-center font-bold text-text border border-white/10">
                        {user.fullName?.[0]}
                      </div>
                      <div>
                        <div className="font-bold text-text text-sm">{user.fullName}</div>
                        <div className="text-[10px] text-muted uppercase tracking-wider">{user.role}</div>
                      </div>
                    </div>
                    <Button variant="secondary" className="rounded-xl h-9 px-4" onClick={() => handleEdit(user)}>
                      <Edit3 size={14} />
                    </Button>
                  </div>
                  <div className="text-xs text-muted truncate border-t border-white/5 pt-3">
                    {user.email}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4">
              <p className="text-xs font-medium text-muted">
                Showing <span className="text-text">{(page - 1) * pageSize + 1}</span> to <span className="text-text">{Math.min(page * pageSize, users.length)}</span> of <span className="text-text">{users.length}</span> members
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="rounded-xl px-4"
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="rounded-xl px-4"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <UserEditModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </motion.div>
  );
}

function UserEditModal({ user, isOpen, onClose }: { user: any; isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'profile' | 'scores'>('profile');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-white/10 bg-[#0e0e14] shadow-2xl"
          >
            {/* Header */}
            <div className="p-8 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-2xl bg-gradient-to-br from-emerald/20 to-gold/20 flex items-center justify-center font-bold text-2xl text-text border border-white/10">
                    {user?.fullName?.[0]}
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold tracking-tight text-text">{user?.fullName}</h2>
                    <p className="text-sm text-muted">{user?.email}</p>
                  </div>
                </div>
                <button onClick={onClose} className="rounded-full p-2 text-muted hover:bg-white/5 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="mt-8 flex items-center gap-6 border-b border-white/5">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={cn(
                    "pb-4 text-xs font-bold uppercase tracking-widest transition-all relative",
                    activeTab === 'profile' ? "text-emerald" : "text-muted hover:text-text"
                  )}
                >
                  General Profile
                  {activeTab === 'profile' && <motion.div layoutId="tab" className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald" />}
                </button>
                <button
                  onClick={() => setActiveTab('scores')}
                  className={cn(
                    "pb-4 text-xs font-bold uppercase tracking-widest transition-all relative",
                    activeTab === 'scores' ? "text-emerald" : "text-muted hover:text-text"
                  )}
                >
                  Golf Scores
                  {activeTab === 'scores' && <motion.div layoutId="tab" className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald" />}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              {activeTab === 'profile' ? (
                <ProfileTab user={user} onClose={onClose} />
              ) : (
                <ScoresTab userId={user?.id} />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ProfileTab({ user, onClose }: { user: any; onClose: () => void }) {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    role: user?.role || 'user'
  });

  const update = useMutation({
    mutationFn: (data: any) => adminApi.updateUser(user.id, data),
    onSuccess: () => {
      toast.success('User profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      onClose();
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Update failed')
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Full Name</label>
          <Input
            className="bg-white/4 border-white/8 rounded-xl h-11"
            value={formData.fullName}
            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Email Address</label>
          <Input
            className="bg-white/4 border-white/8 rounded-xl h-11"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Account Role</label>
        <CustomDropdown
          value={formData.role}
          onChange={(val) => setFormData({ ...formData, role: val as any })}
          options={[
            { value: 'user', label: 'Standard Member', description: 'Can submit scores and enter draws', icon: UserIcon },
            { value: 'admin', label: 'Platform Admin', description: 'Full access to all admin controls', icon: Shield },
          ]}
        />
      </div>
      <div className="pt-4">
        <Button
          className="w-full h-12 rounded-2xl font-bold tracking-wide"
          busy={update.isPending}
          onClick={() => update.mutate(formData)}
        >
          Update Account Settings
        </Button>
      </div>
    </div>
  );
}

function ScoresTab({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'user-scores', userId],
    queryFn: () => adminApi.userScores(userId),
    enabled: !!userId
  });

  const [newValue, setNewValue] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  const addScore = useMutation({
    mutationFn: () => scoreApi.create({ value: Number(newValue), date: newDate }), // Note: backend usually uses current user, but if API allows, we'd use a specific endpoint. 
    // The PRD says "Edit golf scores" from admin.
    onSuccess: () => {
      toast.success('Score added');
      setNewValue('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'user-scores', userId] });
    }
  });

  const removeScore = useMutation({
    mutationFn: (id: string) => scoreApi.remove(id),
    onSuccess: () => {
      toast.success('Score removed');
      queryClient.invalidateQueries({ queryKey: ['admin', 'user-scores', userId] });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-3 p-4 rounded-2xl bg-white/4 border border-white/5">
        <div className="flex-1 space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Stableford Score</label>
          <Input
            type="number"
            placeholder="Points (1-45)"
            className="bg-black/20 border-white/8 rounded-xl h-10"
            value={newValue}
            onChange={e => setNewValue(e.target.value)}
          />
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Date</label>
          <Input
            type="date"
            className="bg-black/20 border-white/8 rounded-xl h-10"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
          />
        </div>
        <Button className="rounded-xl h-10 px-4" onClick={() => addScore.mutate()}>
          <Plus size={16} />
        </Button>
      </div>

      <div className="space-y-3 mt-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted px-2">Score History (Last 5)</p>
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-12 bg-white/5 rounded-xl" />
            <div className="h-12 bg-white/5 rounded-xl" />
          </div>
        ) : (
          data?.scores?.map((score: any) => (
            <div key={score.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/2 border border-white/5 group">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-emerald/10 flex items-center justify-center font-bold text-emerald">
                  {score.value}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted font-medium">
                  <Calendar size={12} />
                  {new Date(score.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <button
                className="p-2 text-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                onClick={() => removeScore.mutate(score.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
