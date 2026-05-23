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
import {
  getHelpTypeTagClass,
  getPriorityBadgeClass,
  getProgressFillClass,
  getProgressLabelClass,
  getProgressTrackClass,
  getStatusBadgeClass,
  getSubCategoryTagClass,
  getVerifiedBadgeClass,
} from "../utils/request-visuals"
import { MapPin, Users } from "lucide-react"

type HelpRequestCardProps = {
  request: HelpRequest
  /** Active list: focus on what still needs help. Archive: show closure status. */
  variant?: "active" | "archive"
}

export function HelpRequestCard({
  request,
  variant = "active",
}: HelpRequestCardProps) {
  const isArchive = variant === "archive"
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
    <Card
      className={cn(
        "transition-shadow hover:shadow-md",
        isArchive && "border-dashed bg-muted/30 opacity-90"
      )}
    >
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{request.title}</CardTitle>
          <div className="flex flex-wrap gap-1.5">
            {isArchive ? (
              <Badge
                variant="outline"
                className={getStatusBadgeClass(request.status)}
              >
                {STATUS_LABELS[request.status]}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className={getPriorityBadgeClass(request.priorityLevel)}
              >
                {PRIORITY_LABELS[request.priorityLevel]}
              </Badge>
            )}
            {request.isVerified ? (
              <Badge variant="outline" className={getVerifiedBadgeClass()}>
                Verified
              </Badge>
            ) : null}
          </div>
        </div>
        <CardDescription className="line-clamp-2">
          {request.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 text-xs font-medium">
          <span
            className={cn(
              "rounded-md px-2 py-1",
              getHelpTypeTagClass(request.helpType)
            )}
          >
            {HELP_TYPE_LABELS[request.helpType]}
          </span>
          <span
            className={cn(
              "rounded-md px-2 py-1",
              getSubCategoryTagClass()
            )}
          >
            {SUB_CATEGORY_LABELS[request.subCategory]}
          </span>
        </div>

        {!isArchive ? (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                Fulfilled {request.quantity.fulfilled} /{" "}
                {request.quantity.required}
                {request.quantity.unit ? ` ${request.quantity.unit}` : ""}
              </span>
              <span className={getProgressLabelClass(progress)}>
                {progress}%
              </span>
            </div>
            <div
              className={cn(
                "h-2.5 overflow-hidden rounded-full",
                getProgressTrackClass()
              )}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${progress}% fulfilled`}
            >
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-out",
                  getProgressFillClass(progress)
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {request.quantity.fulfilled} / {request.quantity.required}
            {request.quantity.unit ? ` ${request.quantity.unit}` : ""} fulfilled ·{" "}
            {STATUS_LABELS[request.status]}
          </p>
        )}

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
