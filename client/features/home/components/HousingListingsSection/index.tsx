import { HOUSING_LISTINGS } from "../../mock-data"
import { HorizontalScrollRow } from "../HorizontalScrollRow"
import { HousingListingCard } from "./HousingListingCard"
import { SectionHeader } from "../SectionHeader"

export function HousingListingsSection() {
  return (
    <section
      id="housing-listings"
      className="mx-auto mt-10 max-w-6xl scroll-mt-20 sm:mt-12"
    >
      <div className="px-4 sm:px-6">
        <SectionHeader
          title="Available Housing & Shelters"
          badge="New"
          viewAllHref="/properties"
          viewAllLabel="View all housing"
        />
      </div>
      <HorizontalScrollRow
        className="mt-4 sm:mt-5"
        ariaLabel="Housing and shelter listings"
      >
        {HOUSING_LISTINGS.map((listing, index) => (
          <HousingListingCard
            key={listing.id}
            listing={listing}
            index={index}
          />
        ))}
      </HorizontalScrollRow>
    </section>
  )
}
