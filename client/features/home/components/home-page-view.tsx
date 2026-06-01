import { CommunityActivity } from "./community-activity"
import { HomeFooter } from "./home-footer"
import { HomeHeader } from "./home-header"
import { HomeSearch } from "./home-search"
import { HousingListingsSection } from "./housing-listings-section"
import { PopularCategories } from "./popular-categories"
import { PrimaryServices } from "./primary-services"
import { TrustStrip } from "./trust-strip"
import { UrgentRequestsSection } from "./urgent-requests-section"

export function HomePageView() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <HomeHeader />
      <main className="flex-1 pb-8">
        <HomeSearch />
        <PrimaryServices />
        <UrgentRequestsSection />
        <HousingListingsSection />
        <PopularCategories />
        <CommunityActivity />
        <TrustStrip />
      </main>
      <HomeFooter />
    </div>
  )
}
