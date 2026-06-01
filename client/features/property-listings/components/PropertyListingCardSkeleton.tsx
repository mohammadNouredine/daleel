import { CardGridSkeleton } from "@/components/data/CardGridSkeleton"

type PropertyListingCardSkeletonProps = {
  count?: number
}

export function PropertyListingCardSkeleton({
  count = 6,
}: PropertyListingCardSkeletonProps) {
  return <CardGridSkeleton count={count} />
}
