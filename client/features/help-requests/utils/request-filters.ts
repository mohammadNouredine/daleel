import type {
  HelpRequest,
  HelpRequestStatusValue,
  HelpTypeValue,
  PriorityLevelValue,
} from "../types"
import { HelpRequestStatus } from "../types"

export type HelpRequestFilters = {
  helpType: HelpTypeValue | "all"
  governorate: string
  priority: PriorityLevelValue | "all"
}

export const DEFAULT_HELP_REQUEST_FILTERS: HelpRequestFilters = {
  helpType: "all",
  governorate: "all",
  priority: "all",
}

export function isActionableRequest(status: HelpRequestStatusValue): boolean {
  return (
    status === HelpRequestStatus.ACTIVE ||
    status === HelpRequestStatus.PARTIALLY_FULFILLED
  )
}

export function isArchiveRequest(status: HelpRequestStatusValue): boolean {
  return !isActionableRequest(status)
}

export function partitionRequests(requests: HelpRequest[]) {
  const active: HelpRequest[] = []
  const archive: HelpRequest[] = []

  for (const request of requests) {
    if (isActionableRequest(request.status)) {
      active.push(request)
    } else {
      archive.push(request)
    }
  }

  return { active, archive }
}

export function filterHelpRequests(
  requests: HelpRequest[],
  filters: HelpRequestFilters
): HelpRequest[] {
  return requests.filter((request) => {
    if (filters.helpType !== "all" && request.helpType !== filters.helpType) {
      return false
    }
    if (
      filters.governorate !== "all" &&
      request.location?.governorate !== filters.governorate
    ) {
      return false
    }
    if (
      filters.priority !== "all" &&
      request.priorityLevel !== filters.priority
    ) {
      return false
    }
    return true
  })
}

export function extractGovernorates(requests: HelpRequest[]): string[] {
  const set = new Set<string>()
  for (const request of requests) {
    if (request.location?.governorate) {
      set.add(request.location.governorate)
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}

export function hasActiveFilters(filters: HelpRequestFilters): boolean {
  return (
    filters.helpType !== "all" ||
    filters.governorate !== "all" ||
    filters.priority !== "all"
  )
}
