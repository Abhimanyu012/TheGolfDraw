import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams, NavLink } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Crown, ShieldCheck, CheckCircle2, ChevronLeft } from 'lucide-react';
import { authApi } from '@/lib/requests';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FloatingInput } from '@/components/ui/floating-input';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: '',
      confirmPassword: '',
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
      if (!token) {
        toast.error('Invalid reset token. Please request a new link.');
        return;
      }

      setBusy(true);
      try {
        await authApi.resetPassword({ token, password: values.password });
        setSuccess(true);
        toast.success('Password updated successfully');
      } catch (error) {
        console.error('Reset password failed:', error);
        toast.error(getErrorMessage(error, 'Failed to update password'));
      } finally {
        setBusy(false);
      }
    },
    () => {
      toast.error('Please fix the highlighted errors.');
    },
  );

  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-88px)] items-center justify-center p-6">
        <Card className="max-w-md w-full text-center space-y-6 py-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger">
            <ShieldCheck size={32} />
          </div>
          <div className="space-y-2 px-4">
            <h2 className="font-display text-2xl font-bold">Invalid Link</h2>
            <p className="text-sm text-muted leading-relaxed">
              This password reset link is invalid or has already been used. 
              Please request a new one.
            </p>
          </div>
          <div className="pt-4">
            <NavLink to="/forgot-password" className="inline-flex h-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 px-8 text-sm font-bold transition-colors hover:bg-white/10">
              Request new link
            </NavLink>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-shell grid min-h-[calc(100vh-88px)] gap-6 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="relative hidden overflow-hidden rounded-2xl border border-white/8 lg:block">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, rgba(5,5,10,0.85) 0%, rgba(5,5,10,0.7) 50%, rgba(5,5,10,0.95) 100%), url(https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative z-10 flex h-full flex-col justify-end p-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-xs uppercase tracking-[0.24em] text-muted backdrop-blur-md">
            <Crown size={14} /> The Golf Draw
          </div>
          <h1 className="mt-5 max-w-lg font-display text-5xl font-bold leading-tight text-white">Reset. Reconnect. Return.</h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-white/90">Your security is our priority. Set a new, strong password to continue your premium membership experience.</p>
        </div>
      </motion.div>

      <Card className="w-full space-y-5 lg:max-w-lg lg:justify-self-end lg:self-center">
        {success ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-center py-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald/10 text-emerald">
              <CheckCircle2 size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-3xl font-bold">Password Reset</h2>
              <p className="text-sm text-muted">Your password has been updated successfully. You can now sign in with your new credentials.</p>
            </div>
            <div className="pt-4">
              <Button onClick={() => navigate('/login')} className="w-full h-12 rounded-2xl">
                Sign in to Dashboard
              </Button>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="space-y-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-emerald">
                <ShieldCheck size={18} />
              </div>
              <div className="text-xs uppercase tracking-[0.24em] text-muted">Security Update</div>
              <h2 className="font-display text-3xl font-bold">New password</h2>
              <p className="text-sm leading-6 text-muted">Please enter your new password below. Make it strong and unique.</p>
            </div>

            <form className="space-y-5" onSubmit={onSubmit} noValidate>
              <div>
                <FloatingInput id="reset-password" type="password" label="New Password" className="text-text" {...form.register('password')} />
                {form.formState.errors.password ? <p className="mt-2 text-xs text-danger">{form.formState.errors.password.message}</p> : null}
              </div>
              <div>
                <FloatingInput id="reset-confirm" type="password" label="Confirm New Password" className="text-text" {...form.register('confirmPassword')} />
                {form.formState.errors.confirmPassword ? <p className="mt-2 text-xs text-danger">{form.formState.errors.confirmPassword.message}</p> : null}
              </div>
              <div className="pt-2">
                <Button className="w-full h-12 rounded-2xl" busy={busy} type="submit">
                  Update password
                </Button>
              </div>
              <NavLink to="/login" className="flex items-center justify-center gap-2 text-sm font-bold text-muted hover:text-text transition-colors">
                <ChevronLeft size={16} /> Back to Sign in
              </NavLink>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
