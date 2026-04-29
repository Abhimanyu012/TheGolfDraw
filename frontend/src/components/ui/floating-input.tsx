
import React from 'react';
import { cn } from '@/lib/cn';

type FloatingInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
};

export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, id, className, ...props }, ref) => {
  return (
    <div className="relative">
      <input
        id={id}
        ref={ref}
        className={cn(
          'peer h-12 w-full rounded-[10px] border border-white/10 bg-white/5 px-4 pt-5 text-sm text-white outline-none transition placeholder-transparent focus:border-emerald focus:ring-2 focus:ring-emerald/10',
          className,
        )}
        placeholder={label}
        {...props}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:text-[11px] peer-focus:uppercase peer-focus:tracking-[0.18em] peer-focus:text-emerald peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.18em]"
      >
        {label}
      </label>
    </div>
  );
}
);

FloatingInput.displayName = 'FloatingInput';
