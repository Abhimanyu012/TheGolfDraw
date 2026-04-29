import { cn } from '@/lib/cn';

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-32 w-full rounded-2xl border border-line bg-white/5 px-4 py-3 text-sm text-text outline-none transition placeholder:text-muted focus:border-emerald/70 focus:ring-2 focus:ring-emerald/15',
        className,
      )}
      {...props}
    />
  );
}