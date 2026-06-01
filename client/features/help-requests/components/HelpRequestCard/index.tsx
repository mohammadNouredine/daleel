"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useHelpRequestReference } from "@/features/reference/hooks/use-help-request-reference";
import { getReferenceLabel } from "@/features/reference/utils/reference-labels";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "../../constants";
import type { HelpRequest, HelpRequestApprovalStatusValue } from "../../types";
import { HelpRequestApprovalStatus } from "../../types";
import {
  getPriorityBadgeClass,
  getStatusBadgeClass,
} from "../../utils/request-visuals";
import { getNeedsCardSummary } from "../../utils/request-needs";
import { formatHelpRequestLocationLabel } from "../../utils/help-request-location";
import {
  HandHelping,
  MapPin,
  Pencil,
  Settings2,
  Trash2,
  Users,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequestNeedsProgress } from "../RequestNeedsProgress";
import { HelpRequestDetailDialog } from "./HelpRequestDetailDialog";

type HelpRequestCardProps = {
  request: HelpRequest;
  variant?: "active" | "archive";
  showApprovalStatus?: boolean;
  canEdit?: boolean;
  canManage?: boolean;
  canDelete?: boolean;
  onEdit?: () => void;
  onManage?: () => void;
  onDelete?: () => void;
};

function getApprovalBadgeClass(status: HelpRequestApprovalStatusValue): string {
  switch (status) {
    case HelpRequestApprovalStatus.APPROVED:
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    case HelpRequestApprovalStatus.REJECTED:
      return "border-destructive/30 bg-destructive/10 text-destructive";
    default:
      return "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300";
  }
}

const APPROVAL_LABELS: Record<HelpRequestApprovalStatusValue, string> = {
  [HelpRequestApprovalStatus.PENDING]: "Pending review",
  [HelpRequestApprovalStatus.APPROVED]: "Approved",
  [HelpRequestApprovalStatus.REJECTED]: "Rejected",
};

function stopCardNavigation(event: React.MouseEvent) {
  event.stopPropagation();
}

export function HelpRequestCard({
  request,
  variant = "active",
  showApprovalStatus = false,
  canEdit = false,
  canManage = false,
  canDelete = false,
  onEdit,
  onManage,
  onDelete,
}: HelpRequestCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const { helpTypes, subCategories } = useHelpRequestReference();
  const isArchive = variant === "archive";
  const summary = getNeedsCardSummary(request.needs);

  const locationLabel = formatHelpRequestLocationLabel(request.location);

  const showOwnerActions = canEdit || canManage || canDelete;

  const openDetails = () => setDetailOpen(true);

  return (
    <>
      <Card
        className={cn(
          "transition-shadow hover:shadow-md",
          isArchive && "border-dashed bg-muted/30 opacity-90",
        )}
      >
        <div
          role="button"
          tabIndex={0}
          className="cursor-pointer rounded-t-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={openDetails}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openDetails();
            }
          }}
          aria-label={`View details for ${request.title}`}
        >
          <CardHeader className="gap-3 pb-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-start gap-1.5">
                <CardTitle className="text-base leading-snug">
                  {request.title}
                </CardTitle>
                {request.isVerified ? (
                  <BadgeCheck
                    className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                    aria-label="Verified"
                  />
                ) : null}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {showApprovalStatus ? (
                  <Badge
                    variant="outline"
                    className={getApprovalBadgeClass(request.approvalStatus)}
                  >
                    {APPROVAL_LABELS[request.approvalStatus]}
                  </Badge>
                ) : null}
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
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {summary}
            </p>
          </CardHeader>

          <CardContent className="space-y-3 pt-0">
            <RequestNeedsProgress
              needs={request.needs}
              variant={variant}
              compact
            />

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {locationLabel ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5 shrink-0" />
                  {locationLabel}
                </span>
              ) : null}
              {request.beneficiariesCount ? (
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3.5 shrink-0" />
                  {request.beneficiariesCount} beneficiaries
                </span>
              ) : null}
            </div>

            <p className="text-xs text-muted-foreground">
              {getReferenceLabel(helpTypes, request.helpType)} ·{" "}
              {getReferenceLabel(subCategories, request.subCategory)}
            </p>
          </CardContent>
        </div>

        <CardContent
          className="border-t border-border/60 pt-3"
          onClick={stopCardNavigation}
        >
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="h-8"
              onClick={openDetails}
            >
              <HandHelping className="size-3.5" />
              Help
            </Button>
            {showOwnerActions ? (
              <>
                {canEdit ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={onEdit}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                ) : null}
                {canManage ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={onManage}
                  >
                    <Settings2 className="size-3.5" />
                    Manage
                  </Button>
                ) : null}
                {canDelete ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                ) : null}
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <HelpRequestDetailDialog
        request={request}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
