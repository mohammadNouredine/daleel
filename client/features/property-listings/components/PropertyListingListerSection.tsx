"use client"

import { Building2, Phone, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/UserAvatar"
import { cn } from "@/lib/utils"
import type { PropertyListing, PropertyListingListedBy } from "../types"
import { verifiedListingBadgeClass } from "../utils/property-listing-display"

function normalizeWhatsAppUrl(value: string): string {
  const digits = value.replace(/\D/g, "")
  return digits ? `https://wa.me/${digits}` : value
}

type PropertyListingListerSectionProps = {
  listing: PropertyListing
}

function listerSubtitle(role: PropertyListingListedBy["role"]): string {
  switch (role) {
    case "ADMIN":
      return "Official Daleel listing"
    case "ORGANIZATION":
      return "Verified organization"
    case "VOLUNTEER":
      return "Volunteer lister"
    default:
      return "Individual lister"
  }
}

function listerCardClass(role: PropertyListingListedBy["role"]): string {
  switch (role) {
    case "ADMIN":
      return "border-teal-200/80 bg-teal-50/50 dark:border-teal-900/50 dark:bg-teal-950/30"
    case "ORGANIZATION":
      return "border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/25"
    default:
      return "border-border/80 bg-muted/25"
  }
}

function listerIconClass(role: PropertyListingListedBy["role"]): string {
  switch (role) {
    case "ADMIN":
      return "bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300"
    case "ORGANIZATION":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
    default:
      return ""
  }
}

export function PropertyListingListerSection({
  listing,
}: PropertyListingListerSectionProps) {
  const { listedBy, contactPhone, contactWhatsapp } = listing
  const hasContact = Boolean(contactPhone?.trim() || contactWhatsapp?.trim())

  if (!listedBy && !hasContact) {
    return null
  }

  return (
    <section className="mt-8 border-t border-border pt-6">
      <h2 className="text-sm font-semibold tracking-tight text-foreground">
        Listed by
      </h2>

      {listedBy ? (
        <div
          className={cn(
            "mt-4 flex items-start gap-3 rounded-xl border p-4",
            listerCardClass(listedBy.role)
          )}
        >
          {listedBy.role === "ADMIN" ? (
            <div
              className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-full",
                listerIconClass(listedBy.role)
              )}
            >
              <Building2 className="size-5" aria-hidden />
            </div>
          ) : (
            <UserAvatar
              src={listedBy.profileImage}
              name={listedBy.displayLabel}
              size="lg"
            />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium leading-snug">{listedBy.displayLabel}</p>
              {listedBy.isTrustedLister ? (
                <Badge className={verifiedListingBadgeClass()}>
                  <ShieldCheck className="size-3" aria-hidden />
                  Verified
                </Badge>
              ) : null}
            </div>
            <p
              className={cn(
                "mt-0.5 text-sm",
                listedBy.role === "ADMIN"
                  ? "text-teal-800/80 dark:text-teal-200/80"
                  : listedBy.role === "ORGANIZATION"
                    ? "text-emerald-800/80 dark:text-emerald-200/80"
                    : "text-muted-foreground"
              )}
            >
              {listerSubtitle(listedBy.role)}
            </p>
          </div>
        </div>
      ) : null}

      {hasContact ? (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Contact
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {contactPhone?.trim() ? (
              <a
                href={`tel:${contactPhone.trim()}`}
                className="inline-flex items-center gap-2 rounded-lg border border-sky-200/80 bg-sky-50/60 px-3 py-2 text-sm text-sky-900 transition-colors hover:bg-sky-100/80 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-100 dark:hover:bg-sky-950/60"
              >
                <Phone className="size-4 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden />
                <span>{contactPhone.trim()}</span>
              </a>
            ) : null}
            {contactWhatsapp?.trim() ? (
              <a
                href={normalizeWhatsAppUrl(contactWhatsapp.trim())}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-200/80 bg-emerald-50/60 px-3 py-2 text-sm text-emerald-900 transition-colors hover:bg-emerald-100/80 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100 dark:hover:bg-emerald-950/60"
              >
                <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                  W
                </span>
                <span>{contactWhatsapp.trim()}</span>
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}
