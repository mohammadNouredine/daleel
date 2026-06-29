import { cn } from "@/lib/utils";

export type StatCardProps = {
  label: string;
  value: number | undefined;
  loading?: boolean;
  className?: string;
};

export function StatCard({
  label,
  value,
  loading,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card/50 px-4 py-3",
        className,
      )}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">
        {loading ? "—" : (value ?? 0)}
      </p>
    </div>
  );
}
