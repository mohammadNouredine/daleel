import { PropertyDetailPage } from "@/features/dashboard/pages/properties/PropertyDetailPage"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function DashboardPropertyDetailRoute({
  params,
}: PageProps) {
  const { id } = await params
  return <PropertyDetailPage listingId={id} />
}
