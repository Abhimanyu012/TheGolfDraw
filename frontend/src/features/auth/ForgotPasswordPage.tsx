import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Crown, Key, Mail, ChevronLeft } from 'lucide-react';
import { authApi } from '@/lib/requests';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FloatingInput } from '@/components/ui/floating-input';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
    },
  });

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
      return `Request failed (${error.response?.status ?? 'Unknown'}). Please try again.`;
    }
    return fallback;
  };

  const onSubmit = form.handleSubmit(
    async (values) => {
      setBusy(true);
      try {
        await authApi.forgotPassword(values);
        setSubmitted(true);
        toast.success('Reset link sent');
      } catch (error) {
        console.error('Forgot password failed:', error);
        toast.error(getErrorMessage(error, 'Failed to send reset link'));
      } finally {
        setBusy(false);
      }
    },
    () => {
      toast.error('Please enter a valid email address.');
    },
  );

  return (
    <div className="page-shell grid min-h-[calc(100vh-88px)] gap-6 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="relative hidden overflow-hidden rounded-2xl border border-white/8 lg:block">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, rgba(5,5,10,0.85) 0%, rgba(5,5,10,0.7) 50%, rgba(5,5,10,0.95) 100%), url(https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative z-10 flex h-full flex-col justify-end p-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-xs uppercase tracking-[0.24em] text-muted backdrop-blur-md">
            <Crown size={14} /> The Golf Draw
          </div>
          <h1 className="mt-5 max-w-lg font-display text-5xl font-bold leading-tight text-white">Secure. Reliable. Ethical.</h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-white/90">Forgot your access? No problem. We'll have you back in your dashboard in minutes.</p>
          <div className="mt-4 text-xs uppercase tracking-[0.22em] text-white/70">Trusted by 12,400+ members</div>
        </div>
      </motion.div>

      <Card className="w-full space-y-5 lg:max-w-lg lg:justify-self-end lg:self-center">
        {submitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-center py-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald/10 text-emerald">
              <Mail size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-3xl font-bold">Check your email</h2>
              <p className="text-sm leading-6 text-muted px-4">
                We've sent a password reset link to <span className="font-bold text-text">{form.getValues('email')}</span>. 
                The link will expire in 1 hour.
              </p>
            </div>
            <div className="pt-4">
              <NavLink to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-emerald">
                <ChevronLeft size={16} /> Back to Sign in
              </NavLink>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="space-y-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-emerald">
                <Key size={18} />
              </div>
              <div className="text-xs uppercase tracking-[0.24em] text-muted">Account Recovery</div>
              <h2 className="font-display text-3xl font-bold">Forgot password?</h2>
              <p className="text-sm leading-6 text-muted">Enter your email and we'll send you a link to reset your password.</p>
            </div>

            <form className="space-y-6" onSubmit={onSubmit} noValidate>
              <div>
                <FloatingInput id="forgot-email" type="email" label="Email Address" className="text-text" {...form.register('email')} />
                {form.formState.errors.email ? <p className="mt-2 text-xs text-danger">{form.formState.errors.email.message}</p> : null}
              </div>
              <div className="space-y-4">
                <Button className="w-full h-12 rounded-2xl" busy={busy} type="submit">
                  Send reset link
                </Button>
                <NavLink to="/login" className="flex items-center justify-center gap-2 text-sm font-bold text-muted hover:text-text transition-colors">
                  <ChevronLeft size={16} /> Back to Sign in
                </NavLink>
              </div>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
