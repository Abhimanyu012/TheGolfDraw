import { cn } from '@/lib/cn';

export function ProgressRing({ value, label, size = 132 }: { value: number; label: string; size?: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#progress-gradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
          <defs>
            <linearGradient id="progress-gradient" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--color-emerald))" />
              <stop offset="100%" stopColor="rgb(var(--color-gold))" />
            </linearGradient>
          </defs>
        </svg>
        <div className={cn('absolute inset-0 flex flex-col items-center justify-center')}> 
          <div className="font-display text-3xl font-bold text-text">{clamped}%</div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-muted">{label}</div>
        </div>
      </div>
    </div>
  );
}