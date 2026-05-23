import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  HELP_TYPE_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  SUB_CATEGORY_LABELS,
} from "../constants"
import type { HelpRequest } from "../types"
import { HelpRequestStatus, PriorityLevel } from "../types"
import { MapPin, Users } from "lucide-react"

type HelpRequestCardProps = {
  request: HelpRequest
}

function statusBadgeVariant(
  status: HelpRequest["status"]
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case HelpRequestStatus.FULFILLED:
      return "outline"
    case HelpRequestStatus.CANCELLED:
    case HelpRequestStatus.EXPIRED:
      return "secondary"
    case HelpRequestStatus.PARTIALLY_FULFILLED:
      return "default"
    default:
      return "default"
  }
}

function priorityBadgeVariant(
  priority: HelpRequest["priorityLevel"]
): "default" | "secondary" | "destructive" | "outline" {
  switch (priority) {
    case PriorityLevel.CRITICAL:
      return "destructive"
    case PriorityLevel.HIGH:
      return "default"
    case PriorityLevel.LOW:
      return "outline"
    default:
      return "secondary"
  }
}

export function HelpRequestCard({ request }: HelpRequestCardProps) {
  const progress =
    request.quantity.required > 0
      ? Math.min(
          100,
          Math.round(
            (request.quantity.fulfilled / request.quantity.required) * 100
          )
        )
      : 0

  const locationLabel = [
    request.location.city,
    request.location.district,
    request.location.governorate,
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{request.title}</CardTitle>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={statusBadgeVariant(request.status)}>
              {STATUS_LABELS[request.status]}
            </Badge>
            <Badge variant={priorityBadgeVariant(request.priorityLevel)}>
              {PRIORITY_LABELS[request.priorityLevel]}
            </Badge>
            {request.isVerified ? (
              <Badge variant="outline">Verified</Badge>
            ) : null}
          </div>
        </div>
        <CardDescription className="line-clamp-2">
          {request.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-md bg-muted px-2 py-1">
            {HELP_TYPE_LABELS[request.helpType]}
          </span>
          <span className="rounded-md bg-muted px-2 py-1">
            {SUB_CATEGORY_LABELS[request.subCategory]}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              Fulfilled {request.quantity.fulfilled} / {request.quantity.required}
              {request.quantity.unit ? ` ${request.quantity.unit}` : ""}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                progress >= 100
                  ? "bg-primary"
                  : progress > 0
                    ? "bg-primary/70"
                    : "bg-muted-foreground/30"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5 shrink-0" />
            {locationLabel}
          </span>
          {request.beneficiariesCount ? (
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5 shrink-0" />
              {request.beneficiariesCount} beneficiaries
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
