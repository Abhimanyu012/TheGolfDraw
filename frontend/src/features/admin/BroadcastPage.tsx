import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Send, Mail, Eye, Bell, ShieldAlert, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SectionHeading } from '@/components/ui/section-heading';
import { adminApi } from '@/lib/requests';
import { cn } from '@/lib/cn';

export default function BroadcastPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  const broadcast = useMutation({
    mutationFn: () => adminApi.broadcast({ subject, message }),
    onSuccess: () => {
      toast.success('System broadcast delivered');
      setSubject('');
      setMessage('');
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Broadcast delivery failed'),
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeading 
          eyebrow="Intelligence" 
          title="System Broadcast" 
          description="Deliver critical updates or exclusive announcements to the entire membership base." 
        />
        <div className="flex items-center gap-2 rounded-2xl border border-gold/20 bg-gold/5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gold">
          <ShieldAlert size={14} />
          High Priority Channel
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        {/* Composer */}
        <Card className="material-card space-y-6 border-white/5 bg-white/2 backdrop-blur-xl p-6 md:p-8">
          <div className="flex items-center gap-3 border-b border-white/5 pb-6">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald/10 text-emerald">
              <Mail size={20} />
            </div>
            <h3 className="font-display text-xl font-bold">Compose Update</h3>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Email Subject</label>
              <Input 
                placeholder="Enter a compelling subject line..." 
                className="h-12 bg-white/4 border-white/8 rounded-xl focus:border-emerald/50"
                value={subject} 
                onChange={(event) => setSubject(event.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Message Content</label>
              <Textarea 
                placeholder="Write your message here. Markdown is supported..." 
                className="min-h-[240px] bg-white/4 border-white/8 rounded-xl focus:border-emerald/50 resize-none p-4"
                value={message} 
                onChange={(event) => setMessage(event.target.value)} 
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                className="flex-1 h-12 rounded-2xl font-bold" 
                busy={broadcast.isPending} 
                disabled={!subject || !message}
                onClick={() => broadcast.mutate()}
              >
                <Send size={16} className="mr-2" />
                Dispatch Broadcast
              </Button>
              <Button 
                variant="secondary" 
                className="rounded-2xl h-12 px-6"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye size={16} className="mr-2" />
                {showPreview ? 'Hide' : 'Preview'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Preview Panel */}
        <div className="relative h-full min-h-[400px]">
          <AnimatePresence mode="wait">
            {showPreview ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full"
              >
                <Card className="material-card h-full border-emerald/20 bg-[#0e0e14] p-0 overflow-hidden">
                  <div className="bg-white/4 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald">Live Email Preview</span>
                    <Sparkles size={14} className="text-emerald" />
                  </div>
                  <div className="p-8 space-y-8">
                    {/* Mock Template Header */}
                    <div className="flex justify-center">
                      <div className="font-display text-lg font-bold tracking-tight text-white">
                        The Golf <span className="text-emerald">Draw</span>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <h1 className="text-center font-display text-2xl font-bold text-white">
                        {subject || '[Subject Appears Here]'}
                      </h1>
                      <p className="text-sm text-slate-400">Hello Member,</p>
                      <div className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                        {message || 'Your message content will be formatted within our premium template architecture...'}
                      </div>
                      <div className="pt-6 flex justify-center">
                        <div className="h-12 px-8 bg-emerald rounded-xl flex items-center justify-center font-bold text-black text-sm">
                          Access Dashboard
                        </div>
                      </div>
                    </div>

                    <div className="pt-12 border-t border-white/5 text-center text-[10px] text-muted uppercase tracking-widest">
                      Official Platform Update · The Golf Draw
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-full flex-col items-center justify-center rounded-[32px] border border-dashed border-white/10 bg-white/[0.02] text-center p-8"
              >
                <div className="size-16 rounded-3xl bg-white/5 flex items-center justify-center text-muted mb-4">
                  <Bell size={24} />
                </div>
                <h4 className="font-display text-lg font-bold text-muted">Preview Awaiting Input</h4>
                <p className="text-sm text-muted/60 mt-2 max-w-[280px]">
                  Draft your broadcast message to see how it will appear to your members.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
