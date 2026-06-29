"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data/DataTable";
import { SelectControl } from "@/components/select/SelectControl";
import { SearchInput } from "@/components/search";
import { CreatePropertyListingDialog } from "@/features/property-listings/components/CreatePropertyListingDialog";
import { PropertyListingAdminSummary } from "@/features/property-listings/components/PropertyListingAdminSummary";
import { PropertyListingRowActions } from "@/features/property-listings/components/PropertyListingRowActions";
import { useAdminPropertyListings } from "@/features/property-listings/hooks/use-admin-property-listings";
import {
  ListingType,
  PropertyListingStatus,
  type PropertyListing,
  type PropertyListingStatusValue,
} from "@/features/property-listings/types";
import {
  formatListingLocation,
  formatListingPriceLabel,
} from "@/features/property-listings/utils/property-listing-display";
import {
  formatPropertyListingStatus,
  propertyListingStatusBadgeClass,
} from "@/features/property-listings/utils/property-listing-status";
import { canViewPropertiesFromProfile } from "@/features/property-listings/utils/property-permissions";
import { cn } from "@/lib/utils";
import { DashboardPageHeader } from "../../components/DashboardPageHeader";
import { useDashboardAuth } from "../../providers/DashboardAuthProvider";

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All statuses" },
  ...Object.values(PropertyListingStatus).map((status) => ({
    value: status,
    label: formatPropertyListingStatus(status),
  })),
];

const LISTING_TYPE_FILTER_OPTIONS = [
  { value: "", label: "All types" },
  { value: ListingType.RENT, label: "Rent" },
  { value: ListingType.SALE, label: "Sale" },
  { value: ListingType.SHELTER, label: "Shelter" },
  { value: ListingType.SHORT_TERM, label: "Short term" },
  { value: ListingType.ROOMMATE, label: "Roommate" },
  { value: ListingType.FREE_STAY, label: "Free stay" },
];

export function PropertiesDirectoryPage() {
  const router = useRouter();
  const { profile } = useDashboardAuth();
  const canView = canViewPropertiesFromProfile(profile);

  const [statusFilter, setStatusFilter] = useState<
    PropertyListingStatusValue | ""
  >("");
  const [listingTypeFilter, setListingTypeFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [editingListing, setEditingListing] = useState<PropertyListing | null>(
    null,
  );
  const [editOpen, setEditOpen] = useState(false);

  const {
    items,
    summary,
    isLoading,
    isError,
    error,
    refetch,
    pagination,
    resetPagination,
  } = useAdminPropertyListings(
    {
      status: statusFilter,
      listingType: listingTypeFilter as "" | PropertyListing["listingType"],
      q: appliedSearch,
    },
    canView,
  );

  const columns = useMemo<ColumnDef<PropertyListing>[]>(
    () => [
      {
        id: "title",
        header: "Title",
        cell: ({ row }) => (
          <span className="line-clamp-2 font-medium">{row.original.title}</span>
        ),
      },
      {
        id: "location",
        header: "Location",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatListingLocation(row.original)}
          </span>
        ),
      },
      {
        id: "type",
        header: "Type",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.listingType}</span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            className={cn(
              "border-0",
              propertyListingStatusBadgeClass(row.original.status),
            )}
          >
            {formatPropertyListingStatus(row.original.status)}
          </Badge>
        ),
      },
      {
        id: "price",
        header: "Price",
        cell: ({ row }) => formatListingPriceLabel(row.original),
      },
      {
        id: "updated",
        header: "Updated",
        cell: ({ row }) =>
          new Date(row.original.updatedAt).toLocaleDateString(undefined, {
            dateStyle: "medium",
          }),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <PropertyListingRowActions
            listing={row.original}
            profile={profile}
            onEdit={(listing) => {
              setEditingListing(listing);
              setEditOpen(true);
            }}
          />
        ),
      },
    ],
    [profile],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedSearch(searchInput.trim());
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    resetPagination();
  }, [appliedSearch, statusFilter, listingTypeFilter, resetPagination]);

  if (!canView) {
    return (
      <>
        <DashboardPageHeader
          title="Properties"
          description="Browse and manage all property listings."
        />
        <div className="rounded-xl border border-dashed border-border/80 bg-card/50 px-6 py-14 text-center text-sm text-muted-foreground">
          You do not have permission to view properties.
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardPageHeader
        title="Properties"
        description="Browse and manage all property listings on the platform."
      />

      <PropertyListingAdminSummary
        summary={summary}
        loading={isLoading}
        className="mb-6"
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <SearchInput
          label="Search"
          wrapperClassName="min-w-[10rem] flex-1 sm:max-w-xs"
          placeholder="Title or city"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <SelectControl
          label="Status"
          value={statusFilter}
          options={STATUS_FILTER_OPTIONS}
          clearable
          clearValue=""
          onValueChange={(value) =>
            setStatusFilter(value as PropertyListingStatusValue | "")
          }
        />
        <SelectControl
          label="Listing type"
          value={listingTypeFilter}
          options={LISTING_TYPE_FILTER_OPTIONS}
          clearable
          clearValue=""
          onValueChange={(value) => setListingTypeFilter(value)}
        />
      </div>

      <DataTable
        data={items}
        columns={columns}
        loading={isLoading}
        error={isError ? (error as Error) : null}
        onRetry={() => void refetch()}
        getRowId={(row) => row._id}
        onRowClick={(row) => router.push(`/dashboard/properties/${row._id}`)}
        pagination={pagination}
        emptyTitle="No properties found"
        emptyDescription="Try different filters or add listings from the public site."
      />

      <CreatePropertyListingDialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditingListing(null);
        }}
        editingListing={editingListing}
      />
    </>
  );
}
