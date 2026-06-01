import { URGENT_HELP_REQUESTS } from "../mock-data"
import { HorizontalScrollRow } from "./horizontal-scroll-row"
import { SectionHeader } from "./section-header"
import { UrgentRequestCard } from "./urgent-request-card"

export function UrgentRequestsSection() {
  return (
    <section className="mx-auto mt-10 max-w-6xl sm:mt-12">
      <div className="px-4 sm:px-6">
        <SectionHeader
          title="Urgent Help Requests"
          subtitle="People currently seeking support."
          badge="Live needs"
          badgeVariant="destructive"
          viewAllHref="/help-requests"
          viewAllLabel="View all requests"
        />
      </div>
      <HorizontalScrollRow
        className="mt-4 sm:mt-5"
        ariaLabel="Urgent help requests"
      >
        {URGENT_HELP_REQUESTS.map((request, index) => (
          <UrgentRequestCard
            key={request.id}
            request={request}
            index={index}
          />
        ))}
      </HorizontalScrollRow>
    </section>
  )
}
