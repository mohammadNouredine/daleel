"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatWhatsAppUrl } from "@/components/forms/Phone/phone-utils";
import { HELP_TYPE_LABELS, SUB_CATEGORY_LABELS } from "../constants";
import type { HelpRequest } from "../types";
import {
  getPriorityDialogAccentClass,
  getPriorityDialogHeaderTintClass,
} from "../utils/request-visuals";
import { BadgeCheck, MapPin, MessageCircle, Phone, Users } from "lucide-react";
import { RequestNeedsProgress } from "./request-needs-progress";

type HelpRequestDetailDialogProps = {
  request: HelpRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

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
    .join(", ");

  const accentClass = getPriorityDialogAccentClass(request.priorityLevel);
  const headerTint = getPriorityDialogHeaderTintClass(request.priorityLevel);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[min(90vh,720px)] max-w-lg flex-col gap-0 overflow-hidden border-l-4 p-0 sm:max-w-lg",
          accentClass,
        )}
      >
        <DialogHeader
          className={cn("shrink-0 space-y-2 px-6 pt-6 pb-3", headerTint)}
        >
          <div className="flex items-start gap-2">
            <DialogTitle className=" text-left leading-snug">
              {request.title}
            </DialogTitle>
            {request.isVerified ? (
              <span
                className="inline-flex shrink-0 items-center gap-1 text-emerald-600 dark:text-emerald-400"
                title="Verified request"
              >
                <BadgeCheck className="size-5" aria-hidden />
                <span className="sr-only">Verified</span>
              </span>
            ) : null}
          </div>
          <DialogDescription className="text-left text-sm leading-relaxed">
            {request.description}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6 pt-4">
          <div className="space-y-5">
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
                <div className="flex flex-col gap-2">
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

                  <p className="inline-flex items-center gap-2">
                    <MessageCircle className="size-4 shrink-0" />
                    <a
                      href={formatWhatsAppUrl(request.contactPhone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                      onClick={(event) => event.stopPropagation()}
                    >
                      Message on WhatsApp
                    </a>
                  </p>
                </div>
              ) : null}
            </div>

            <p className="text-xs text-muted-foreground">
              {HELP_TYPE_LABELS[request.helpType]} ·{" "}
              {SUB_CATEGORY_LABELS[request.subCategory]}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
