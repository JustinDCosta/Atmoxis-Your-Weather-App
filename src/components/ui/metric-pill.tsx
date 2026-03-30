import { cn } from "@/lib/utils";

type MetricPillProps = {
  label: string;
  value: string;
  className?: string;
};

export function MetricPill({ label, value, className }: MetricPillProps) {
  return (
    <div
      className={cn(
        "rounded-full border border-line/40 bg-card-elevated/60 px-3.5 py-2 text-xs text-ink-muted md:text-sm",
        className,
      )}
    >
      <span className="mr-1 text-ink/75">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}
