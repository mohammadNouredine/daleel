"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InfiniteScrollSentinel } from "@/components/data/InfiniteScrollSentinel";
import { useInfiniteScrollTrigger } from "@/lib/hooks/use-infinite-scroll-trigger";
import { useIsAuthenticated } from "@/features/auth/hooks/use-is-authenticated";
import { HomeFooter } from "@/features/home/components/HomeFooter";
import { HomeHeader } from "@/features/home/components/HomeHeader";
import { SectionHeader } from "@/features/home/components/SectionHeader";
import { usePropertyListingsInfinite } from "../hooks/use-property-listings-infinite";
import type { PropertyListing } from "../types";
import { MyListingsNavLink } from "./MyListingsNavLink";
import {
  DEFAULT_PROPERTY_LISTING_UI_FILTERS,
  extractGovernoratesFromListings,
  toListFilters,
  type PropertyListingUiFilters,
} from "../utils/property-listing-filters";
import { PropertyListingCard } from "./PropertyListingCard";
import { PropertyListingCardSkeleton } from "./PropertyListingCardSkeleton";
import { PropertyListingFiltersBar } from "./PropertyListingFiltersBar";
import { CreatePropertyListingDialog } from "./CreatePropertyListingDialog";

export function PropertyListingsView() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const [filters, setFilters] = useState<PropertyListingUiFilters>(
    DEFAULT_PROPERTY_LISTING_UI_FILTERS,
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<PropertyListing | null>(
    null,
  );

  const listFilters = useMemo(() => toListFilters(filters), [filters]);

  const query = usePropertyListingsInfinite({ filters: listFilters });

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  const governorates = useMemo(
    () => extractGovernoratesFromListings(items),
    [items],
  );

  const { sentinelRef } = useInfiniteScrollTrigger({
    hasNextPage: query.hasNextPage ?? false,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    enabled: !query.isLoading && !query.isError,
  });

  const openCreate = () => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    setEditingListing(null);
    setCreateOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setCreateOpen(open);
    if (!open) {
      setEditingListing(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <HomeHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <SectionHeader
            title="Available Housing & Shelters"
            subtitle="Browse verified rentals, sales, and emergency shelter listings across Lebanon."
            badge="Live"
          />
          <div className="flex justify-end">
            <Button type="button" className="gap-1.5" onClick={openCreate}>
              <Plus className="size-4" />
              Add property
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <PropertyListingFiltersBar
            filters={filters}
            governorates={governorates}
            onChange={setFilters}
            className="flex-1"
          />
        </div>

        <div className="mt-8">
          {query.isLoading ? (
            <PropertyListingCardSkeleton />
          ) : query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
              <p className="text-sm text-destructive">
                Could not load listings. Please try again.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => query.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
              <p className="text-sm font-medium">No listings to show yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Only approved, available listings appear here. Publish a new
                listing or ask an admin to approve pending ones.
              </p>
              <Button
                type="button"
                className="mt-4 gap-1.5"
                onClick={openCreate}
              >
                <Plus className="size-4" />
                Add property
              </Button>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((listing, index) => (
                  <li key={listing._id}>
                    <PropertyListingCard listing={listing} index={index} />
                  </li>
                ))}
              </ul>
              <InfiniteScrollSentinel
                sentinelRef={sentinelRef}
                isFetchingNextPage={query.isFetchingNextPage}
                hasNextPage={query.hasNextPage ?? false}
                isError={query.isFetchNextPageError}
                onRetry={() => query.fetchNextPage()}
              />
            </>
          )}
        </div>
      </main>
      <HomeFooter />

      <CreatePropertyListingDialog
        open={createOpen}
        onOpenChange={handleDialogOpenChange}
        editingListing={editingListing}
      />
    </div>
  );
}
