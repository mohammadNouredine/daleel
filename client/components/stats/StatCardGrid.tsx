import { cn } from "@/lib/utils";
import { StatCard } from "./StatCard";

export type StatGridItem<K extends string = string> = {
  key: K;
  label: string;
};

export type StatCardGridProps<T extends Record<string, number | undefined>> = {
  data: T | undefined;
  items: readonly StatGridItem<Extract<keyof T, string>>[];
  loading?: boolean;
  className?: string;
};

export function StatCardGrid<T extends Record<string, number | undefined>>({
  data,
  items,
  loading,
  className,
}: StatCardGridProps<T>) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6",
        className,
      )}
    >
      {items.map(({ key, label }) => (
        <StatCard
          key={String(key)}
          label={label}
          value={data?.[key]}
          loading={loading}
        />
      ))}
    </div>
  );
}
