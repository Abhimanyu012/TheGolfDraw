import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Crown, LogIn, ShieldCheck, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FloatingInput } from '@/components/ui/floating-input';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const user = useAuthStore((state) => state.user);
  const isCheckingSession = useAuthStore((state) => state.isCheckingSession);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isCheckingSession && user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, isCheckingSession, navigate]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
      if (!error.response) {
        return 'Network error: Unable to connect to our services. Please check your internet connection.';
      }
      return `Connection issue: Request could not be completed (${error.response.status}).`;
    }
    return fallback;
  };

  const onSubmit = form.handleSubmit(
    async (values) => {
      setBusy(true);
      try {
        const { data } = await api.post('/api/auth/login', values);
        setSession({ token: data.token, user: data.user });
        toast.success('Logged in');
        navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
      } catch (error) {
        console.error('Login failed:', error);
        toast.error(getErrorMessage(error, 'Login failed'));
      } finally {
        setBusy(false);
      }
    },
    () => {
      toast.error('Please fix the highlighted fields before submitting.');
    },
  );

  return (
    <div className="page-shell grid min-h-[calc(100vh-88px)] gap-6 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="relative hidden overflow-hidden rounded-2xl border border-white/8 lg:block">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, rgba(5,5,10,0.85) 0%, rgba(5,5,10,0.7) 50%, rgba(5,5,10,0.95) 100%), url(https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative z-10 flex h-full flex-col justify-end p-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-xs uppercase tracking-[0.24em] text-muted backdrop-blur-md">
            <Crown size={14} /> The Golf Draw
          </div>
          <h1 className="mt-5 max-w-lg font-display text-5xl font-bold leading-tight text-white">Premium performance. Real-world impact.</h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-white/90">"I can track my scores, monitor my draw entries, and see the charity split without leaving one dashboard."</p>
          <div className="mt-4 text-xs uppercase tracking-[0.22em] text-white/70">Join 12,400+ members</div>
        </div>
      </motion.div>

      <Card className="w-full space-y-5 lg:max-w-lg lg:justify-self-end lg:self-center">
        <div className="space-y-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-emerald">
            <LogIn size={18} />
          </div>
          <div className="text-xs uppercase tracking-[0.24em] text-muted">Welcome back</div>
          <h2 className="font-display text-3xl font-bold">Sign in</h2>
          <p className="text-sm leading-6 text-muted">Access your subscription, score history, and reward eligibility.</p>
        </div>



        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div>
            <FloatingInput id="login-email" type="email" label="Email" className="text-text" {...form.register('email')} />
            {form.formState.errors.email ? <p className="mt-2 text-xs text-danger">{form.formState.errors.email.message}</p> : null}
          </div>
          <div className="space-y-2">
            <FloatingInput id="login-password" type="password" label="Password" className="text-text" {...form.register('password')} />
            <div className="flex justify-end px-1">
              <NavLink to="/forgot-password" className="text-[11px] font-bold uppercase tracking-wider text-muted transition-colors hover:text-emerald">
                Forgot password?
              </NavLink>
            </div>
            {form.formState.errors.password ? <p className="mt-2 text-xs text-danger">{form.formState.errors.password.message}</p> : null}
          </div>
          <Button className="w-full" busy={busy} type="submit">
            Sign in
          </Button>
        </form>
        <p className="text-sm text-muted">
          Need an account? <NavLink className="text-emerald" to="/signup">Create one</NavLink>
        </p>
      </Card>
    </div>
  );
}
