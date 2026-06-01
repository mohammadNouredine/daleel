import {
  Baby,
  BookOpen,
  Car,
  Eye,
  Home,
  Lock,
  Package,
  Pill,
  ShieldCheck,
  Soup,
  Users,
  Wallet,
} from "lucide-react"
import type {
  CommunityActivityItem,
  HomeCategory,
  HousingListingPreview,
  TrustIndicator,
  UrgentHelpRequestPreview,
} from "./types"

export const HOME_SEARCH_PLACEHOLDER =
  "Search housing, shelter, medicine support, food assistance, rent help..."

export const HOME_CATEGORIES: HomeCategory[] = [
  { id: "housing", label: "Housing", icon: Home },
  { id: "shelter", label: "Shelter", icon: Home },
  { id: "medicine", label: "Medicine", icon: Pill },
  { id: "food", label: "Food", icon: Soup },
  { id: "rent", label: "Rent", icon: Wallet },
  { id: "education", label: "Education", icon: BookOpen },
  { id: "transportation", label: "Transportation", icon: Car },
  { id: "financial", label: "Financial Aid", icon: Wallet },
]

export const POPULAR_CATEGORIES: HomeCategory[] = [
  { id: "housing", label: "Housing", icon: Home },
  { id: "shelter", label: "Shelter", icon: Home },
  { id: "medicine", label: "Medicine", icon: Pill },
  { id: "food", label: "Food", icon: Soup },
  { id: "transportation", label: "Transportation", icon: Car },
  { id: "education", label: "Education", icon: BookOpen },
  { id: "baby", label: "Baby Supplies", icon: Baby },
  { id: "financial", label: "Financial Aid", icon: Wallet },
  { id: "emergency", label: "Emergency Supplies", icon: Package },
]

export const URGENT_HELP_REQUESTS: UrgentHelpRequestPreview[] = [
  {
    id: "1",
    category: "Medicine",
    categoryColor: "violet",
    title: "Need support for my father's cancer treatment",
    location: "Beirut, Lebanon",
    urgency: "Critical",
    raised: 250,
    goal: 500,
    currency: "USD",
    authorName: "Sara M.",
    authorInitials: "SM",
  },
  {
    id: "2",
    category: "Rent",
    categoryColor: "orange",
    title: "Urgent rent assistance for displaced family",
    location: "Tripoli, Lebanon",
    urgency: "High",
    raised: 120,
    goal: 400,
    currency: "USD",
    authorName: "Ahmad K.",
    authorInitials: "AK",
  },
  {
    id: "3",
    category: "Food",
    categoryColor: "emerald",
    title: "Weekly groceries for 6 family members",
    location: "Saida, Lebanon",
    urgency: "High",
    raised: 80,
    goal: 200,
    currency: "USD",
    authorName: "Layla H.",
    authorInitials: "LH",
  },
  {
    id: "4",
    category: "Medicine",
    categoryColor: "violet",
    title: "Insulin and supplies for elderly parent",
    location: "Zahle, Lebanon",
    urgency: "Critical",
    raised: 180,
    goal: 300,
    currency: "USD",
    authorName: "Omar F.",
    authorInitials: "OF",
  },
  {
    id: "5",
    category: "Shelter",
    categoryColor: "blue",
    title: "Temporary shelter after home damage",
    location: "Bekaa, Lebanon",
    urgency: "Critical",
    raised: 50,
    goal: 350,
    currency: "USD",
    authorName: "Nadia R.",
    authorInitials: "NR",
  },
]

export const HOUSING_LISTINGS: HousingListingPreview[] = [
  {
    id: "h1",
    title: "1 Bedroom Apartment",
    type: "Apartment",
    location: "Beirut, Lebanon",
    priceLabel: "$300 / month",
    isFree: false,
    imageUrl:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    beds: 1,
    baths: 1,
    areaSqm: 45,
  },
  {
    id: "h2",
    title: "Community Shelter Space",
    type: "Shelter",
    location: "Tripoli, Lebanon",
    priceLabel: "Free",
    isFree: true,
    imageUrl:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
    capacity: "12 beds",
    amenities: ["Meals", "Safe"],
  },
  {
    id: "h3",
    title: "Shared Room — Short Stay",
    type: "Room",
    location: "Saida, Lebanon",
    priceLabel: "$120 / month",
    isFree: false,
    imageUrl:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    beds: 1,
    amenities: ["Shared bath", "Utilities"],
  },
  {
    id: "h4",
    title: "Temporary Housing Unit",
    type: "Temporary",
    location: "Zahle, Lebanon",
    priceLabel: "Free",
    isFree: true,
    imageUrl:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    capacity: "Family of 4",
    amenities: ["Kitchen", "Heating"],
  },
  {
    id: "h5",
    title: "2 Bedroom Home",
    type: "Apartment",
    location: "Jounieh, Lebanon",
    priceLabel: "$450 / month",
    isFree: false,
    imageUrl:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
    beds: 2,
    baths: 1,
    areaSqm: 72,
  },
]

export const COMMUNITY_ACTIVITY: CommunityActivityItem[] = [
  { id: "a1", message: "Medicine request approved in Beirut", timeAgo: "12m ago" },
  { id: "a2", message: "New housing listing added in Tripoli", timeAgo: "28m ago" },
  { id: "a3", message: "Food request fulfilled in Saida", timeAgo: "1h ago" },
  { id: "a4", message: "Shelter listing updated in Bekaa", timeAgo: "2h ago" },
  { id: "a5", message: "Rent assistance request published", timeAgo: "3h ago" },
]

export const TRUST_INDICATORS: TrustIndicator[] = [
  {
    id: "verified",
    label: "Verified Requests",
    description: "Reviewed before publishing",
    icon: ShieldCheck,
  },
  {
    id: "community",
    label: "Community Driven",
    description: "Powered by volunteers",
    icon: Users,
  },
  {
    id: "transparent",
    label: "Transparent Tracking",
    description: "See fulfillment progress",
    icon: Eye,
  },
  {
    id: "secure",
    label: "Safe & Secure",
    description: "Your data is protected",
    icon: Lock,
  },
]

export const PRIMARY_SERVICE_HOUSING_IMAGE =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80"

export const PRIMARY_SERVICE_HELP_IMAGE =
  "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&q=80"
