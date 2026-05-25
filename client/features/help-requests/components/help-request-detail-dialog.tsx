"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  getStatusBadgeClass,
  getSubCategoryTagClass,
  getVerifiedBadgeClass,
} from "../utils/request-visuals"
import { MapPin, Phone, Users } from "lucide-react"
import { RequestNeedsProgress } from "./request-needs-progress"

type HelpRequestDetailDialogProps = {
  request: HelpRequest
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HelpRequestDetailDialog({
  request,
  open,
  onOpenChange,
}: HelpRequestDetailDialogProps) {
  const locationLabel = [
    request.location.city,
    request.location.district,
    request.location.governorate,
    request.location.street,
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 space-y-2 px-6 pt-6 pb-2">
          <DialogTitle className="text-left leading-snug">
            {request.title}
          </DialogTitle>
          <DialogDescription className="text-left text-sm leading-relaxed">
            {request.description}
          </DialogDescription>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Badge
              variant="outline"
              className={getPriorityBadgeClass(request.priorityLevel)}
            >
              {PRIORITY_LABELS[request.priorityLevel]}
            </Badge>
            <Badge
              variant="outline"
              className={getStatusBadgeClass(request.status)}
            >
              {STATUS_LABELS[request.status]}
            </Badge>
            {request.isVerified ? (
              <Badge variant="outline" className={getVerifiedBadgeClass()}>
                Verified
              </Badge>
            ) : null}
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6">
          <div className="space-y-5">
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

            <RequestNeedsProgress needs={request.needs} />

            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="inline-flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                {locationLabel}
              </p>
              {request.beneficiariesCount ? (
                <p className="inline-flex items-center gap-2">
                  <Users className="size-4 shrink-0" />
                  {request.beneficiariesCount} beneficiaries
                </p>
              ) : null}
              {request.contactPhone ? (
                <p className="inline-flex items-center gap-2">
                  <Phone className="size-4 shrink-0" />
                  <a
                    href={`tel:${request.contactPhone}`}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {request.contactPhone}
                  </a>
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
