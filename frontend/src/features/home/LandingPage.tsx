import { type SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import CountUp from 'react-countup';
import { ArrowRight, BarChart3, ChevronRight, Crown, HeartHandshake, ShieldCheck, Trophy } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { GolfMotionBackground } from '@/features/home/GolfMotionBackground';
import { useSession } from '@/app/providers';

const heroBg = 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=1920&q=80'; // Moody dusk landscape
const charityBg = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920&q=80'; // Ethical community impact
const winnersBg = 'https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?w=1920&q=80'; // Abstract gold achievement
const textureBg = 'https://images.unsplash.com/photo-1550747540-3dffba27252f?w=1920&q=80'; // Deep green macro texture
const subscriptionBg = 'https://images.unsplash.com/photo-1518005020251-582c789765c7?w=1920&q=80'; // Minimalist luxury architecture

const steps = [
  { id: '01', title: 'Subscribe', body: 'Choose a plan and activate your The Golf Draw membership instantly.', icon: Crown },
  { id: '02', title: 'Enter Scores', body: 'Track your five latest scores and keep eligibility visible at all times.', icon: BarChart3 },
  { id: '03', title: 'Win & Give', body: 'Join monthly prize draws while your subscription supports verified charities.', icon: HeartHandshake },
];

const charities = [
  { name: 'CRY India', raised: '₹82,43,000', progress: 72, image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&q=80' },
  { name: 'Goonj', raised: '₹61,04,500', progress: 61, image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=900&q=80' },
  { name: 'Isha Vidhya', raised: '₹96,59,200', progress: 79, image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=900&q=80' },
];

const charityImageFallback = 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=900&q=80';

const testimonials = [
  {
    quote: 'The platform feels like private wealth software, but every month it actually helps real people.',
    name: 'Oliver Grant',
    meta: 'HCP 9 · Supports UNICEF',
  },
  {
    quote: 'I joined for the draw system and stayed for the charity transparency. It is incredibly polished.',
    name: 'Michael Sutton',
    meta: 'HCP 12 · Supports WWF',
  },
  {
    quote: 'Subscription, score tracking, and giving all in one dashboard. Exactly the experience I wanted.',
    name: 'James Porter',
    meta: 'HCP 7 · Supports Red Cross',
  },
];

// Framer Motion Variants
const wordVariants: any = {
  hidden: { opacity: 0, y: 60, rotateX: -20 },
  visible: (i: number) => ({
    opacity: 1, y: 0, rotateX: 0,
    transition: { delay: i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  })
};

const jackpotVariants: any = {
  hidden: { opacity: 0, scale: 0.7, filter: 'blur(20px)' },
  visible: {
    opacity: 1, scale: 1, filter: 'blur(0px)',
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
  }
};

function AnimatedStat({ value, prefix = '', label }: { value: number; prefix?: string; label: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="space-y-1">
      <div className="stat-number">
        {isInView ? (
          <CountUp
            start={0}
            end={value}
            duration={2.5}
            separator=","
            prefix={prefix}
            useEasing={true}
            easingFn={(t, b, c, d) => c * (-Math.pow(2, -10 * t / d) + 1) + b}
          />
        ) : '0'}
      </div>
      <div className="stat-label">
        {label}
      </div>
    </div>
  );
}

function DrawCountdown() {
  const nextDraw = useMemo(() => {
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth() + 1, 1, 19, 0, 0);
    return date;
  }, []);

  const [left, setLeft] = useState('00d 00h 00m');

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const diff = Math.max(nextDraw.getTime() - now, 0);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      setLeft(`${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`);
    };

    update();
    const timer = setInterval(update, 30000);
    return () => clearInterval(timer);
  }, [nextDraw]);

  return <span className="countdown-number">{left}</span>;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, isCheckingSession } = useSession();

  useEffect(() => {
    if (!isCheckingSession && user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, isCheckingSession, navigate]);

  const onCharityImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    if (img.dataset.fallbackApplied === '1') return;
    img.dataset.fallbackApplied = '1';
    img.src = charityImageFallback;
  };

  return (
    <div className="relative overflow-hidden">
      <section
        className="relative min-h-screen overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(5,5,10,0.75) 0%, rgba(5,5,10,0.55) 50%, rgba(5,5,10,0.85) 100%), url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <GolfMotionBackground />
        <svg className="grain-filter" aria-hidden="true">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>

        <div className="page-shell relative z-10 flex min-h-screen flex-col justify-center py-28">
          <h1 className="hero-headline mt-8">
            <div className="line-1">
              {"Play Golf.".split(" ").map((word, i) => (
                <motion.span key={i} custom={i} variants={wordVariants} initial="hidden" animate="visible" style={{ display: 'inline-block', marginRight: '0.25em' }}>{word}</motion.span>
              ))}
            </div>
            <div className="line-2">
              {"Change Lives.".split(" ").map((word, i) => (
                <motion.span key={i} custom={i + 2} variants={wordVariants} initial="hidden" animate="visible" style={{ display: 'inline-block', marginRight: '0.25em' }}>{word}</motion.span>
              ))}
            </div>
            <div className="line-3">
              {"Win Big.".split(" ").map((word, i) => (
                <motion.span key={i} custom={i + 4} variants={wordVariants} initial="hidden" animate="visible" style={{ display: 'inline-block', marginRight: '0.25em' }}>{word}</motion.span>
              ))}
            </div>
          </h1>

          <p className="hero-sub mt-8">
            The world's first subscription platform where your <span style={{color: '#4CAF7A', fontWeight: 600}}>golf scores</span> fund <span style={{color: '#C87941', fontWeight: 600}}>charity</span> and enter you into monthly <span style={{color: '#D4AF37', fontWeight: 600}}>prize draws</span>.
          </p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button as={NavLink} to="/signup">
              Subscribe Now <ArrowRight size={16} />
            </Button>
            <Button as={NavLink} to="/pricing" variant="secondary">
              See How It Works <ChevronRight size={16} />
            </Button>
          </motion.div>

          <div className="hero-light-beam mt-14" />

          <Card className="relative mt-12 grid gap-6 border-white/10 bg-black/35 p-6 backdrop-blur-xl sm:grid-cols-3">
            <AnimatedStat value={24000000} prefix="₹" label="Raised" />
            <AnimatedStat value={12400} prefix="" label="Members" />
            <AnimatedStat value={1800000} prefix="₹" label="Prize Pool" />
          </Card>
        </div>
      </section>

      <section className="section-space relative page-shell pt-10">
        <div className="dot-grid absolute inset-0 rounded-[2rem] opacity-[0.2]" aria-hidden="true" />
        <div className="relative z-10">
          <SectionHeading
            eyebrow="The Workflow"
            title="Simple. Ethical. Rewarding."
            description="We've distilled the complex world of charitable giving and prize draws into a seamless membership experience."
          />
          <div className="mt-12 grid gap-12 lg:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <motion.div key={step.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.45 }}>
                  <div className="group relative h-full pt-12">
                    <div className="step-bg-number -left-4 -top-8">{step.id}</div>
                    <div className="relative z-10">
                      <div className="step-number mb-6">{step.id} —</div>
                      <div className="flex items-center gap-6 mb-4">
                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/[0.03] text-emerald ring-1 ring-white/10 transition-all duration-500 group-hover:bg-emerald group-hover:text-black group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                          <Icon size={24} strokeWidth={1.5} />
                        </div>
                      </div>
                      <h3 className="step-title">{step.title}</h3>
                      <p className="step-desc mt-3">{step.body}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="relative overflow-hidden py-24"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(5,5,10,0.95) 30%, rgba(5,5,10,0.7) 100%), url(${textureBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="page-shell relative z-10">
          <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 text-gold">
                <Trophy size={18} />
                <span className="jackpot-label">Monthly Sweepstakes</span>
              </div>
              <motion.div variants={jackpotVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <h2 className="mt-4 jackpot-amount">₹4,52,000</h2>
              </motion.div>
              <p className="section-desc mt-6">
                Active members are automatically entered into our tiered prize structure, including the Jackpot, 4-Match, and 3-Match pools.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Button as={NavLink} to="/draws" className="min-w-[200px] justify-between h-14 bg-gold text-black hover:bg-gold/90 border-none">
                  Check Eligibility <ArrowRight size={18} />
                </Button>
                <div className="flex flex-col justify-center px-6">
                  <div className="countdown-label mb-1">Draw Closes In</div>
                  <DrawCountdown />
                </div>
              </div>
            </div>

            <div className="grid w-full max-w-md gap-3">
              <motion.div whileHover={{ y: -4, borderColor: 'rgba(212,175,55,0.2)' }} className="group rounded-3xl border border-white/10 bg-black/45 p-6 backdrop-blur-2xl transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="jackpot-label">4-Match Tier</div>
                    <div className="mt-2 tier-amount">₹1,58,000</div>
                  </div>
                  <div className="rounded-full bg-white/5 p-2 transition-colors group-hover:bg-gold/10 group-hover:text-gold">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </motion.div>
              <motion.div whileHover={{ y: -4, borderColor: 'rgba(212,175,55,0.2)' }} className="group rounded-3xl border border-white/10 bg-black/45 p-6 backdrop-blur-2xl transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="jackpot-label">3-Match Tier</div>
                    <div className="mt-2 tier-amount">₹94,000</div>
                  </div>
                  <div className="rounded-full bg-white/5 p-2 transition-colors group-hover:bg-gold/10 group-hover:text-gold">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="section-space relative py-32"
        style={{
          backgroundImage: `radial-gradient(circle at 0% 0%, rgba(16,185,129,0.05) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(36,18,70,0.15) 0%, transparent 50%), url(${charityBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
        }}
      >
        <div className="page-shell relative z-10">
          <div className="flex flex-col gap-16">
            <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <SectionHeading
                  eyebrow="Global Impact"
                  title="Transparent, Verified, Meaningful."
                  description="We partner with world-class charities to ensure every penny from your subscription creates measurable positive change."
                />
              </div>
              <div className="grid grid-cols-3 gap-8 border-l border-white/10 pl-8">
                <div className="space-y-1">
                  <div className="font-data text-3xl font-bold">27</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted">Partners</div>
                </div>
                <div className="space-y-1">
                  <div className="font-data text-3xl font-bold text-emerald">100%</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted">Audited</div>
                </div>
                <div className="space-y-1">
                  <div className="font-data text-3xl font-bold">₹2.4Cr</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted">Donated</div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {charities.map((charity) => (
                <div key={charity.name} className="group relative overflow-hidden rounded-[2.5rem] bg-white/[0.02] p-2 ring-1 ring-white/10 transition-all hover:bg-white/[0.04]">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
                    <img src={charity.image} alt={charity.name} loading="lazy" onError={onCharityImageError} className="h-full w-full object-cover transition duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex items-center justify-between">
                        <h3 className="charity-name">{charity.name}</h3>
                        <ShieldCheck className="text-emerald" size={20} />
                      </div>
                      <div className="mt-4 space-y-3">
                        <div className="flex justify-between text-[11px] uppercase tracking-[0.15em] text-white/60">
                          <span>Target Progress</span>
                          <span>{charity.progress}%</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/10">
                          <motion.div initial={{ width: 0 }} whileInView={{ width: `${charity.progress}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full rounded-full bg-emerald shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-white/40 uppercase tracking-widest">Raised</span>
                          <span className="charity-amount">{charity.raised}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center">
              <Button as={NavLink} to="/charities" variant="ghost" className="group text-muted hover:text-white">
                View All Impact Partners <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section
        className="section-space relative py-32"
        style={{
          backgroundImage: `linear-gradient(to bottom, #05050a 0%, #0a0a0f 100%)`,
        }}
      >
        <div className="page-shell relative z-10">
          <SectionHeading 
            eyebrow="Membership" 
            title="Elevate Your Experience" 
            description="Select a membership option to begin your journey. Fully transparent, instantly rewarding, and tailored for absolute clarity." 
          />
          <div className="mt-16 flex flex-col items-center justify-center gap-6 lg:flex-row">
            <Card className="w-full max-w-sm space-y-8 border-white/5 bg-white/[0.02] p-10 transition-transform hover:scale-[1.02]">
              <div>
                <h3 className="plan-name">Monthly Access</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="plan-currency">₹</span>
                  <span className="plan-price">199</span>
                  <span className="plan-period">/mo</span>
                </div>
              </div>
              <ul className="space-y-4 pt-4">
                {['Automatic Draw Entry', 'Full Scoring Dashboard', 'Direct Charity Impact', 'Cancel Anytime'].map(check => (
                  <li key={check} className="plan-feature">
                    {check}
                  </li>
                ))}
              </ul>
              <Button as={NavLink} to="/signup" className="w-full h-14 bg-white/5 border-white/10 text-white hover:bg-white/10">
                Join Monthly
              </Button>
            </Card>

            <Card className="relative w-full max-w-sm space-y-8 border-emerald/20 bg-emerald/[0.03] p-10 ring-1 ring-emerald/20 transition-transform hover:scale-[1.02]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-emerald px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-black">
                Most Professional
              </div>
              <div>
                <h3 className="plan-name text-emerald">Annual Platinum</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="plan-currency">₹</span>
                  <span className="plan-price">1,999</span>
                  <span className="plan-period">/yr</span>
                </div>
              </div>
              <ul className="space-y-4 pt-4">
                {['Save over 25% Yearly', 'Priority Member Support', 'Platinum Badging', 'Continuous Contribution', 'Exclusive Rewards'].map(check => (
                  <li key={check} className="plan-feature">
                    {check}
                  </li>
                ))}
              </ul>
              <Button as={NavLink} to="/signup" className="w-full h-14 bg-emerald text-black hover:bg-emerald/90">
                Go Premium
              </Button>
            </Card>
          </div>
        </div>
      </section>

      <section className="section-space relative bg-[#05050a] py-32">
        <div className="page-shell relative z-10">
          <div className="flex flex-col gap-20">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-px bg-gradient-to-b from-transparent to-emerald mb-8" />
              <h2 className="impact-quote max-w-4xl mx-auto text-center">
                The platform feels like private wealth software, but every month it actually helps real people.
              </h2>
              <div className="mt-10">
                <div className="text-xl font-semibold text-white/95">Oliver Grant</div>
                <div className="text-[12px] font-bold uppercase tracking-[0.3em] text-emerald mt-2">HCP 9 · Platinum Member</div>
              </div>
            </div>

            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Platform Trust', val: '4.9/5' },
                { label: 'Active Members', val: '12.4K' },
                { label: 'Charity ROI', val: '100%' },
                { label: 'Member Retention', val: '98%' }
              ].map(stat => (
                <div key={stat.label} className="text-center group">
                  <div className="metric-value mb-3 group-hover:text-emerald transition-colors">{stat.val}</div>
                  <div className="metric-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 bg-[#05050a] pt-24 pb-12">
        <div className="page-shell">
          <div className="flex flex-col gap-16 lg:flex-row lg:justify-between">
            <div className="max-w-md">
              <div className="nav-logo">The Golf <span>Draw</span></div>
              <p className="mt-6 text-[16px] leading-relaxed text-white/80">
                The premier private club and charity platform. We combine subscription services, monthly draws, and high-impact giving tailored for those who demand excellence in all facets of life.
              </p>
              <div className="mt-10 flex gap-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
                {/* Trust Badges Placeholder */}
                <div className="h-8 w-12 bg-white/10 rounded" />
                <div className="h-8 w-12 bg-white/10 rounded" />
                <div className="h-8 w-12 bg-white/10 rounded" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 sm:grid-cols-3">
              <div className="space-y-6">
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">Platform</div>
                <ul className="space-y-4 text-sm text-muted">
                  <li><NavLink to="/pricing" className="nav-link">Membership</NavLink></li>
                  <li><NavLink to="/draws" className="nav-link">Prize Draws</NavLink></li>
                  <li><NavLink to="/charities" className="nav-link">Impact Partners</NavLink></li>
                </ul>
              </div>
              <div className="space-y-6">
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">Legal</div>
                <ul className="space-y-4 text-sm text-muted">
                  <li><span className="nav-link cursor-pointer">Terms of Service</span></li>
                  <li><span className="nav-link cursor-pointer">Privacy Policy</span></li>
                  <li><span className="nav-link cursor-pointer">Cookie Policy</span></li>
                </ul>
              </div>
              <div className="hidden sm:block space-y-6">
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">Support</div>
                <ul className="space-y-4 text-sm text-muted">
                  <li><span className="nav-link cursor-pointer">Help Center</span></li>
                  <li><span className="nav-link cursor-pointer">Member Payouts</span></li>
                  <li><span className="nav-link cursor-pointer">Contact</span></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-24 border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted">
              © {new Date().getFullYear()} The Golf Draw Platform.
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted/60">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" /> Platform Status: Operational
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
