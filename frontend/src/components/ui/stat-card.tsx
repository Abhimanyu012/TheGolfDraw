import { Card } from '@/components/ui/card';

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="space-y-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">{label}</div>
      <div className="font-display text-3xl font-bold text-text">{value}</div>
      {hint ? <div className="text-sm text-muted">{hint}</div> : null}
    </Card>
  );
}