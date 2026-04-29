import * as React from 'react';
import { cn } from '@/lib/cn';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        'h-12 w-full rounded-[10px] border border-white/8 bg-[#11131a] px-4 text-sm text-text outline-none transition focus:border-emerald focus:ring-2 focus:ring-emerald/10 [&>option]:bg-[#11131a] [&>option]:text-text',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
);

Select.displayName = 'Select';