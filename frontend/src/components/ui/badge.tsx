import { cn } from "@/lib/cn";

type Tone = "emerald" | "gold" | "muted" | "danger" | "line";

const toneStyles: Record<Tone, string> = {
  emerald: "bg-emerald/12 text-emerald border-emerald/20",
  gold: "bg-gold/12 text-gold border-gold/20",
  muted: "bg-muted/12 text-muted border-white/8",
  danger: "bg-danger/12 text-danger border-danger/25",
  line: "bg-white/4 text-text border-white/8",
};

export function Badge({
  className,
  tone = "muted",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        toneStyles[tone],
        className,
      )}
      {...props}
    />
  );
}
