import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps<E extends ElementType = 'button'> = {
  as?: E;
  variant?: Variant;
  busy?: boolean;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<E>, 'as' | 'className' | 'children' | 'disabled'>;

const styles: Record<Variant, string> = {
  primary:
    'bg-emerald text-[#05050A] hover:brightness-110 hover:scale-[1.02] focus-visible:ring-emerald/35',
  secondary:
    'border border-white/15 bg-transparent text-text hover:bg-white/5 hover:scale-[1.02] focus-visible:ring-white/20',
  ghost: 'bg-transparent text-text hover:bg-white/6 focus-visible:ring-white/20',
  danger: 'border border-danger bg-transparent text-danger hover:bg-danger/10 focus-visible:ring-danger/30',
};

export function Button<E extends ElementType = 'button'>({ className, variant = 'primary', busy, children, as, ...props }: ButtonProps<E>) {
  const Component = as ?? 'button';
  const isNativeButton = Component === 'button';
  const { disabled, ...rest } = props as ButtonProps<'button'>;

  return (
    <Component
      className={cn(
        'relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-all duration-300 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale',
        styles[variant],
        className,
      )}
      {...rest}
      {...(isNativeButton ? { disabled: disabled || busy } : { 'aria-disabled': disabled || busy || undefined })}
      aria-busy={busy || undefined}
    >
      <span className={cn('flex items-center gap-2 transition-opacity duration-300', busy && 'opacity-0')}>
        {children}
      </span>
      {busy && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}
    </Component>
  );
}