import * as React from 'react';
import { ChevronDown, Check, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

// ─── Native Select ─────────────────────────────────────────────────────────────
// Used by react-hook-form register(). Fully styled with glassmorphism + custom arrow.
export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        className={cn(
          'h-12 w-full appearance-none rounded-2xl px-4 pr-11 text-sm outline-none',
          'border border-white/10 bg-black/40 backdrop-blur-sm text-text',
          'transition-all duration-200',
          'hover:border-white/20 hover:bg-black/50',
          'focus:border-emerald/50 focus:ring-2 focus:ring-emerald/10 focus:bg-black/60',
          'disabled:cursor-not-allowed disabled:opacity-50',
          '[&>option]:bg-[#0e0e14] [&>option]:text-text [&>option]:py-2',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted transition-transform duration-200"
        aria-hidden="true"
      />
    </div>
  );
});
Select.displayName = 'Select';

// ─── CustomDropdown ────────────────────────────────────────────────────────────
export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  disabled?: boolean;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Controls where the panel opens. Defaults to 'bottom'. Use 'top' for selects near the bottom of the viewport. */
  placement?: 'bottom' | 'top';
}

export function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  className,
  disabled = false,
  placement = 'bottom',
}: CustomDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  // ── Close on outside click or Escape ──
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [open]);

  // ── Keyboard navigation inside panel ──
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
    if (!open) return;
    const enabledOptions = options.filter((o) => !o.disabled);
    const currentIdx = enabledOptions.findIndex((o) => o.value === value);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = enabledOptions[Math.min(currentIdx + 1, enabledOptions.length - 1)];
      if (next) onChange(next.value);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = enabledOptions[Math.max(currentIdx - 1, 0)];
      if (prev) onChange(prev.value);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* ── Trigger button ── */}
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-disabled={disabled}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={cn(
          // Layout
          'flex h-12 w-full items-center justify-between gap-3 rounded-2xl px-4 text-sm outline-none',
          // Glassmorphism surface
          'border border-white/10 bg-black/40 backdrop-blur-sm',
          // Transition
          'transition-all duration-200',
          // States
          'hover:border-white/20 hover:bg-black/50',
          open && 'border-emerald/50 bg-black/60 ring-2 ring-emerald/10',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          {selected?.icon && (
            <selected.icon size={15} className="shrink-0 text-emerald" />
          )}
          <span className={cn('truncate text-left', selected ? 'text-text' : 'text-muted')}>
            {selected?.label ?? placeholder}
          </span>
        </div>
        <ChevronDown
          size={15}
          aria-hidden="true"
          className={cn(
            'shrink-0 text-muted transition-transform duration-300',
            open && 'rotate-180 text-emerald',
          )}
        />
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          role="listbox"
          aria-label="Options"
          className={cn(
            // Position
            'absolute z-[200] w-full overflow-hidden',
            placement === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2',
            // Glassmorphism panel
            'rounded-2xl border border-white/10 bg-[#0e0e14]/95 backdrop-blur-xl',
            // Shadow
            'shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.04)]',
            // Entrance animation
            'animate-in fade-in-0 zoom-in-95 duration-150',
          )}
        >
          <div className="max-h-60 overflow-y-auto overscroll-contain p-1.5">
            {options.map((option) => {
              const isSelected = option.value === value;
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  onClick={() => {
                    if (!option.disabled) {
                      onChange(option.value);
                      setOpen(false);
                    }
                  }}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm',
                    'transition-all duration-100',
                    // Active touch feedback on mobile
                    'active:scale-[0.98]',
                    isSelected
                      ? 'bg-emerald/10 text-emerald'
                      : 'text-text hover:bg-white/5',
                    option.disabled && 'cursor-not-allowed opacity-40',
                  )}
                >
                  {/* Icon */}
                  {Icon && (
                    <Icon
                      size={15}
                      className={cn(
                        'shrink-0',
                        isSelected ? 'text-emerald' : 'text-muted group-hover:text-text',
                      )}
                    />
                  )}

                  {/* Label + description */}
                  <div className="min-w-0 flex-1">
                    <div
                      className={cn(
                        'truncate font-medium leading-none',
                        isSelected ? 'text-emerald' : 'text-text',
                      )}
                    >
                      {option.label}
                    </div>
                    {option.description && (
                      <div className="mt-1 truncate text-[10px] leading-none text-muted">
                        {option.description}
                      </div>
                    )}
                  </div>

                  {/* Checkmark */}
                  {isSelected && (
                    <Check size={13} className="shrink-0 text-emerald" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}