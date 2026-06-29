import { StatCardGrid, type StatGridItem } from "@/components/stats";
import type { AdminPropertyListingSummary } from "../types";

const ADMIN_PROPERTY_LISTING_SUMMARY_ITEMS = [
  { key: "total", label: "Total properties" },
  { key: "forRent", label: "For rent" },
  { key: "forSale", label: "For sale" },
  { key: "pendingApproval", label: "Pending approval" },
  { key: "hidden", label: "Hidden" },
  { key: "deleted", label: "Deleted" },
] as const satisfies readonly StatGridItem<
  keyof AdminPropertyListingSummary
>[];

type PropertyListingAdminSummaryProps = {
  summary: AdminPropertyListingSummary | undefined;
  loading?: boolean;
  className?: string;
};

export function PropertyListingAdminSummary({
  summary,
  loading,
  className,
}: PropertyListingAdminSummaryProps) {
  return (
    <StatCardGrid
      data={summary}
      items={ADMIN_PROPERTY_LISTING_SUMMARY_ITEMS}
      loading={loading}
      className={className}
    />
  );
}
