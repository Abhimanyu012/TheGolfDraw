import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SectionHeading } from '@/components/ui/section-heading';
import { adminApi } from '@/lib/requests';

export default function BroadcastPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const broadcast = useMutation({
    mutationFn: () => adminApi.broadcast({ subject, message }),
    onSuccess: () => {
      toast.success('Broadcast sent');
      setSubject('');
      setMessage('');
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Could not send broadcast'),
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      <SectionHeading eyebrow="Broadcast" title="Broadcast to Members" description="Send a system-wide message to all active subscribers via email." />
      <Card className="space-y-4">
        <Input placeholder="Subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
        <Textarea placeholder="Message" value={message} onChange={(event) => setMessage(event.target.value)} />
        <Button busy={broadcast.isPending} onClick={() => broadcast.mutate()}><Send size={14} /> Send</Button>
      </Card>
    </motion.div>
  );
}
