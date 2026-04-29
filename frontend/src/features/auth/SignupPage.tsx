import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Crown, HandCoins, ShieldCheck, UserPlus } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FloatingInput } from '@/components/ui/floating-input';
import { Select } from '@/components/ui/select';
import { charityApi } from '@/lib/requests';

const schema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  charityId: z.string().min(1, 'Please select a charity'),
  charityContributionPercent: z.number().min(10, 'Minimum contribution is 10%').max(100),
});

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [busy, setBusy] = useState(false);
  const [charities, setCharities] = useState<Array<{ id: string; name: string }>>([]);
  const [charityLoadError, setCharityLoadError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'up' | 'down'>('checking');
  const user = useAuthStore((state) => state.user);
  const isCheckingSession = useAuthStore((state) => state.isCheckingSession);

  useEffect(() => {
    if (!isCheckingSession && user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, isCheckingSession, navigate]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      charityId: '',
      charityContributionPercent: 10,
    },
  });
  const contribution = form.watch('charityContributionPercent');
  const password = form.watch('password') ?? '';

  const strength = password.length >= 12 ? 'Strong' : password.length >= 8 ? 'Medium' : 'Weak';

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
      if (!error.response) {
        return 'Cannot connect to backend. Make sure backend is running on port 5002.';
      }
      return `Request failed (${error.response.status}). Please try again.`;
    }
    return fallback;
  };

  useEffect(() => {
    let mounted = true;

    api
      .get('/health')
      .then(() => {
        if (!mounted) return;
        setBackendStatus('up');
      })
      .catch(() => {
        if (!mounted) return;
        setBackendStatus('down');
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    charityApi
      .list()
      .then(({ charities }) => {
        if (!mounted) return;
        const list = charities ?? [];
        setCharities(list);
        if (list.length === 0) {
          setCharityLoadError('No active charities available. Please contact admin to add charities first.');
          return;
        }
        if (list.length > 0 && !form.getValues('charityId')) {
          form.setValue('charityId', list[0].id, { shouldValidate: true });
        }
        setCharityLoadError(null);
      })
      .catch((error) => {
        if (!mounted) return;
        setCharities([]);
        setCharityLoadError(getErrorMessage(error, 'Unable to load charities.'));
      });

    return () => {
      mounted = false;
    };
  }, []);

  const onSubmit = form.handleSubmit(
    async (values) => {
      setBusy(true);
      try {
        if (charities.length === 0) {
          toast.error('Signup unavailable: no active charities found.');
          return;
        }
        const { data } = await api.post('/api/auth/signup', values);
        setSession({ token: data.token, user: data.user });
        toast.success('Account created');
        navigate('/dashboard');
      } catch (error) {
        console.error('Signup failed:', error);
        toast.error(getErrorMessage(error, 'Signup failed'));
      } finally {
        setBusy(false);
      }
    },
    () => {
      toast.error('Please fix the highlighted fields before submitting.');
    },
  );

  return (
    <div className="page-shell grid min-h-[calc(100vh-88px)] gap-6 py-8 lg:grid-cols-[1fr_1fr] lg:items-stretch">
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="relative hidden overflow-hidden rounded-2xl border border-white/8 lg:block">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, rgba(5,5,10,0.85) 0%, rgba(5,5,10,0.7) 50%, rgba(5,5,10,0.95) 100%), url(https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative z-10 flex h-full flex-col justify-end p-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-xs uppercase tracking-[0.24em] text-muted backdrop-blur-md">
            <Crown size={14} /> The Golf Draw Membership
          </div>
          <h1 className="mt-5 max-w-lg font-display text-5xl font-bold leading-tight text-white">Play with purpose every month.</h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-white/90">Select a charity, set your giving percentage, and enter the monthly draw ecosystem.</p>
          <div className="mt-4 text-xs uppercase tracking-[0.22em] text-white/70">Join 12,400+ members</div>
        </div>
      </motion.div>

      <Card className="w-full space-y-5 lg:max-w-2xl lg:justify-self-end lg:self-center">
        <div className="space-y-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-emerald">
            <UserPlus size={18} />
          </div>
          <div className="text-xs uppercase tracking-[0.24em] text-muted">Join the platform</div>
          <h2 className="font-display text-3xl font-bold">Create your subscription profile</h2>
          <p className="flex items-start gap-2 text-sm leading-6 text-muted"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-gold" />Pick a charity, set your contribution percentage, and start your membership.</p>
        </div>

        {backendStatus !== 'up' ? (
          <div className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
            {backendStatus === 'checking'
              ? 'Checking backend connection...'
              : 'Backend is not reachable at http://localhost:5002. Start backend and refresh this page.'}
          </div>
        ) : null}

        {Object.keys(form.formState.errors).length > 0 ? (
          <div className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
            Please correct the highlighted fields before creating your account.
          </div>
        ) : null}



        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit} noValidate>
          <div className="md:col-span-2">
            <FloatingInput id="signup-name" label="Full name" className="text-text" {...form.register('fullName')} />
            {form.formState.errors.fullName ? <p className="mt-2 text-xs text-danger">{form.formState.errors.fullName.message}</p> : null}
          </div>
          <div className="md:col-span-2">
            <FloatingInput id="signup-email" type="email" label="Email" className="text-text" {...form.register('email')} />
            {form.formState.errors.email ? <p className="mt-2 text-xs text-danger">{form.formState.errors.email.message}</p> : null}
          </div>
          <div className="space-y-3 md:col-span-2">
            <FloatingInput id="signup-password" type="password" label="Password" className="text-text" {...form.register('password')} />
            <div className="rounded-xl border border-white/8 bg-white/4 p-3">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-muted">
                <span>Password strength</span>
                <span className={strength === 'Strong' ? 'text-emerald' : strength === 'Medium' ? 'text-gold' : 'text-danger'}>{strength}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={strength === 'Strong' ? 'h-full w-full bg-emerald' : strength === 'Medium' ? 'h-full w-2/3 bg-gold' : 'h-full w-1/3 bg-danger'}
                />
              </div>
            </div>
            {form.formState.errors.password ? <p className="mt-2 text-xs text-danger">{form.formState.errors.password.message}</p> : null}
          </div>
          <div>
            <Select className="text-text" {...form.register('charityId')}>
              <option value="">Select charity</option>
              {charities.map((charity) => (
                <option key={charity.id} value={charity.id}>{charity.name}</option>
              ))}
            </Select>
            {charityLoadError ? <p className="mt-2 text-xs text-danger">{charityLoadError}</p> : null}
            {form.formState.errors.charityId ? <p className="mt-2 text-xs text-danger">{form.formState.errors.charityId.message}</p> : null}
          </div>
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-muted">
              <span>Contribution share (10% - 100%)</span>
              <span className="font-data text-emerald">{contribution}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[rgb(var(--color-emerald))]"
              {...form.register('charityContributionPercent', { valueAsNumber: true })}
            />
            {form.formState.errors.charityContributionPercent ? <p className="mt-2 text-xs text-danger">{form.formState.errors.charityContributionPercent.message}</p> : null}
          </div>
          <div className="md:col-span-2">
            <Button className="w-full" busy={busy} type="submit">
              Create account
            </Button>
          </div>
        </form>
        <p className="text-sm text-muted">
          Already have an account? <NavLink className="text-emerald" to="/login">Log in</NavLink>
        </p>
      </Card>
    </div>
  );
}
