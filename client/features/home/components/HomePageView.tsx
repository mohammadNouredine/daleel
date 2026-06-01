import { CommunityActivity } from "./CommunityActivity"
import { HomeFooter } from "./HomeFooter"
import { HomeHeader } from "./HomeHeader"
import { HomeSearch } from "./HomeSearch"
import { HousingListingsSection } from "./HousingListingsSection"
import { PopularCategories } from "./PopularCategories"
import { PrimaryServices } from "./PrimaryServices"
import { TrustStrip } from "./TrustStrip"
import { UrgentRequestsSection } from "./UrgentRequestsSection"

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
