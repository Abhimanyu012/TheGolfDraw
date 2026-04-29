import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Globe, Heart, Star, Image as ImageIcon, ChevronRight, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SectionHeading } from '@/components/ui/section-heading';
import { charityApi } from '@/lib/requests';
import { queryClient } from '@/app/queryClient';
import { SkeletonCard } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

export default function CharitiesAdminPage() {
  const { data, isLoading } = useQuery({ queryKey: ['charities'], queryFn: () => charityApi.list() });
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    isFeatured: false
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', imageUrl: '', isFeatured: false });
    setIsAdding(false);
    setEditingId(null);
  };

  const create = useMutation({
    mutationFn: () => charityApi.create(formData),
    onSuccess: () => {
      toast.success('Charity onboarded successfully');
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['charities'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Onboarding failed'),
  });

  const update = useMutation({
    mutationFn: (id: string) => charityApi.update(id, formData),
    onSuccess: () => {
      toast.success('Charity profile updated');
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['charities'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Update failed'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => charityApi.delete(id),
    onSuccess: () => {
      toast.success('Charity removed from directory');
      queryClient.invalidateQueries({ queryKey: ['charities'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Deactivation failed'),
  });

  const handleEdit = (charity: any) => {
    setFormData({
      name: charity.name,
      description: charity.description,
      imageUrl: charity.imageUrl || '',
      isFeatured: !!charity.isFeatured
    });
    setEditingId(charity.id);
    setIsAdding(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeading eyebrow="Philanthropy" title="Partner Charities" description="Curate the causes your members support through their gameplay." />
        <Button onClick={() => setIsAdding(true)} className="rounded-2xl h-12 px-6 font-bold tracking-wide">
          <Plus size={18} className="mr-2" />
          Onboard New Charity
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="material-card border-emerald/20 bg-emerald/[0.02] backdrop-blur-xl p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold tracking-tight">
                  {editingId ? 'Edit Charity Profile' : 'New Charity Onboarding'}
                </h3>
                <button onClick={resetForm} className="text-muted hover:text-text transition-colors"><X size={20} /></button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Organization Name</label>
                    <Input 
                      className="bg-black/20 border-white/8 rounded-xl h-11" 
                      placeholder="e.g. Save the Fairways" 
                      value={formData.name} 
                      onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Logo/Image URL</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/50" size={16} />
                      <Input 
                        className="pl-11 bg-black/20 border-white/8 rounded-xl h-11" 
                        placeholder="https://images.unsplash.com/..." 
                        value={formData.imageUrl} 
                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} 
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Impact Mission</label>
                  <Textarea 
                    className="bg-black/20 border-white/8 rounded-xl h-[108px] resize-none" 
                    placeholder="Describe the charity's mission and how the funds will be used..." 
                    value={formData.description} 
                    onChange={e => setFormData({ ...formData, description: e.target.value })} 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <button 
                  onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-xs font-bold uppercase tracking-widest",
                    formData.isFeatured ? "bg-gold/10 border-gold/30 text-gold shadow-[0_0_15px_rgba(212,175,55,0.1)]" : "bg-white/5 border-white/10 text-muted"
                  )}
                >
                  <Star size={14} fill={formData.isFeatured ? "currentColor" : "none"} />
                  Featured Partner
                </button>
                <div className="flex items-center gap-3">
                  <Button variant="secondary" onClick={resetForm} className="rounded-xl px-6">Cancel</Button>
                  <Button 
                    className="rounded-xl px-8 font-bold" 
                    busy={create.isPending || update.isPending}
                    onClick={() => editingId ? update.mutate(editingId) : create.mutate()}
                  >
                    <Save size={16} className="mr-2" />
                    {editingId ? 'Save Changes' : 'Confirm Onboarding'}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <>
            <SkeletonCard lines={4} />
            <SkeletonCard lines={4} />
            <SkeletonCard lines={4} />
          </>
        ) : (
          data?.charities?.map((charity, idx) => (
            <motion.div
              key={charity.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="material-card h-full flex flex-col p-0 overflow-hidden border-white/5 bg-white/2 backdrop-blur-xl group hover:border-emerald/30 transition-all duration-500">
                <div className="relative h-48 w-full overflow-hidden bg-black/40">
                  {charity.imageUrl ? (
                    <img 
                      src={charity.imageUrl} 
                      alt={charity.name} 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted/20">
                      <Heart size={64} className="stroke-[1]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e14] via-transparent to-transparent" />
                  {charity.isFeatured && (
                    <div className="absolute top-4 right-4 bg-gold text-black text-[10px] font-black px-2 py-0.5 rounded shadow-lg flex items-center gap-1 uppercase tracking-tighter">
                      <Star size={10} fill="currentColor" />
                      Featured
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h4 className="font-display text-lg font-bold tracking-tight text-text group-hover:text-emerald transition-colors">
                    {charity.name}
                  </h4>
                  <p className="mt-3 text-sm text-muted leading-relaxed line-clamp-3 flex-1 italic">
                    "{charity.description}"
                  </p>
                  
                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge tone="emerald" className="px-2 py-0.5">Active</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(charity)}
                        className="p-2.5 rounded-xl bg-white/5 text-muted hover:bg-white/10 hover:text-text transition-all"
                        title="Edit Charity"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="p-2.5 rounded-xl bg-danger/5 text-danger/60 hover:bg-danger/20 hover:text-danger transition-all"
                        title="Remove Charity"
                        onClick={() => remove.mutate(charity.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
