import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { PlusCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SectionHeading } from '@/components/ui/section-heading';
import { charityApi } from '@/lib/requests';
import { queryClient } from '@/app/queryClient';
import { SkeletonCard } from '@/components/ui/skeleton';

export default function CharitiesAdminPage() {
  const { data, isLoading } = useQuery({ queryKey: ['charities'], queryFn: () => charityApi.list() });
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const create = useMutation({
    mutationFn: () => charityApi.create({ name, description }),
    onSuccess: () => {
      toast.success('Charity created');
      setName('');
      setDescription('');
      queryClient.invalidateQueries({ queryKey: ['charities'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Could not create charity'),
  });

  const update = useMutation({
    mutationFn: ({ id, nextName }: { id: string; nextName: string }) => charityApi.update(id, { name: nextName }),
    onSuccess: () => {
      toast.success('Charity updated');
      setEditingId(null);
      setEditingName('');
      queryClient.invalidateQueries({ queryKey: ['charities'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Could not update charity'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => charityApi.delete(id),
    onSuccess: () => {
      toast.success('Charity deleted');
      queryClient.invalidateQueries({ queryKey: ['charities'] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Could not delete charity'),
  });

  return (
    <motion.div
      key={isLoading ? 'loading' : 'loaded'}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      <SectionHeading eyebrow="Charities" title="Create and manage active charities" />
      <Card className="space-y-4">
        <Input placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} />
        <Textarea placeholder="Description" value={description} onChange={(event) => setDescription(event.target.value)} />
        <Button busy={create.isPending} onClick={() => create.mutate()}><PlusCircle size={14} /> Create charity</Button>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          <>
            <SkeletonCard lines={3} />
            <SkeletonCard lines={3} />
          </>
        ) : (
          data?.charities?.map((charity) => (
            <Card key={charity.id} className="space-y-3">
              {editingId === charity.id ? (
                <>
                  <Input value={editingName} onChange={(event) => setEditingName(event.target.value)} />
                  <div className="flex items-center gap-2">
                    <Button busy={update.isPending} onClick={() => update.mutate({ id: charity.id, nextName: editingName })}>Save</Button>
                    <Button variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="font-medium text-text">{charity.name}</div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={() => { setEditingId(charity.id); setEditingName(charity.name); }}>Edit</Button>
                    <Button variant="danger" busy={remove.isPending} onClick={() => remove.mutate(charity.id)}>Delete</Button>
                  </div>
                </>
              )}
            </Card>
          ))
        )}
      </div>
    </motion.div>
  );
}

