import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'h-12 w-full rounded-[10px] border border-white/8 bg-white/4 px-4 text-sm text-text outline-none transition placeholder:text-muted focus:border-emerald focus:ring-2 focus:ring-emerald/10',
          className,
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';