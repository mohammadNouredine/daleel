import {
  HelpRequestStatus,
  HelpType,
  type CreateHelpRequestNeedInput,
  type HelpRequest,
  type HelpRequestNeedKindValue,
  type HelpRequestNeedLine,
  type HelpRequestStatusValue,
  type HelpTypeValue,
  HelpRequestNeedKind,
} from "../types"

export function createNeedLineId(): string {
  return `need_${crypto.randomUUID().slice(0, 8)}`
}

export function defaultNeedKindForHelpType(
  helpType: HelpTypeValue
): HelpRequestNeedKindValue {
  if (helpType === HelpType.FINANCIAL) return HelpRequestNeedKind.FINANCIAL
  if (helpType === HelpType.TRANSPORT) return HelpRequestNeedKind.SERVICE
  return HelpRequestNeedKind.ITEM
}

export function defaultUnitForKind(
  kind: HelpRequestNeedKindValue
): string {
  if (kind === HelpRequestNeedKind.FINANCIAL) return "USD"
  if (kind === HelpRequestNeedKind.SERVICE) return "rides"
  return ""
}

export function normalizeNeedLine(
  line: HelpRequestNeedLine
): HelpRequestNeedLine {
  const required = Math.max(0, line.required)
  const fulfilled = Math.max(0, Math.min(required, line.fulfilled))
  return {
    ...line,
    label: line.label.trim(),
    required,
    fulfilled,
    unit: line.unit?.trim() || undefined,
    notes: line.notes?.trim() || undefined,
  }
}

export function normalizeNeedLines(
  lines: HelpRequestNeedLine[]
): HelpRequestNeedLine[] {
  return lines.map(normalizeNeedLine)
}

export function getNeedRemaining(line: HelpRequestNeedLine): number {
  return Math.max(0, line.required - line.fulfilled)
}

export function formatNeedQuantity(
  line: HelpRequestNeedLine,
  amount: number
): string {
  const unit = line.unit?.trim()
  if (line.kind === HelpRequestNeedKind.FINANCIAL) {
    const currency = unit ?? "USD"
    if (currency === "USD") {
      return `$${amount.toLocaleString()}`
    }
    return `${amount.toLocaleString()} ${currency}`
  }
  return `${amount.toLocaleString()}${unit ? ` ${unit}` : ""}`
}

export function formatNeedLineSummary(line: HelpRequestNeedLine): string {
  return `${formatNeedQuantity(line, line.required)} — ${line.label}`
}

export function formatNeedLineSelectLabel(line: HelpRequestNeedLine): string {
  const unitSuffix = line.unit?.trim() ? ` ${line.unit.trim()}` : ""
  return `${line.label} (${line.fulfilled}/${line.required}${unitSuffix})`
}

/** One-line teaser for list cards */
export function getNeedsCardSummary(needs: HelpRequestNeedLine[]): string {
  const progress = computeNeedsProgress(needs)
  const remaining = needs.filter((line) => getNeedRemaining(line) > 0)

  if (needs.length === 0) {
    return "Described in request details"
  }

  if (progress.isFullyFulfilled) {
    return `All ${progress.totalLines} need${progress.totalLines === 1 ? "" : "s"} covered`
  }

  if (remaining.length === 1) {
    const line = remaining[0]
    return `Still needed: ${formatNeedQuantity(line, getNeedRemaining(line))} ${line.label}`
  }

  const preview = remaining
    .slice(0, 2)
    .map((line) => line.label)
    .join(", ")
  const suffix =
    remaining.length > 2 ? ` +${remaining.length - 2} more` : ""

  return `${remaining.length} items still needed — ${preview}${suffix}`
}

export type RequestNeedsProgress = {
  totalRequired: number
  totalFulfilled: number
  percent: number
  completedLines: number
  totalLines: number
  isFullyFulfilled: boolean
  hasPartialProgress: boolean
}

export function computeNeedsProgress(
  needs: HelpRequestNeedLine[]
): RequestNeedsProgress {
  const lines = normalizeNeedLines(needs)
  const totalRequired = lines.reduce((sum, line) => sum + line.required, 0)
  const totalFulfilled = lines.reduce((sum, line) => sum + line.fulfilled, 0)
  const completedLines = lines.filter(
    (line) => line.fulfilled >= line.required
  ).length

  const percent =
    totalRequired > 0
      ? Math.min(100, Math.round((totalFulfilled / totalRequired) * 100))
      : 0

  return {
    totalRequired,
    totalFulfilled,
    percent,
    completedLines,
    totalLines: lines.length,
    isFullyFulfilled:
      lines.length > 0 && lines.every((line) => line.fulfilled >= line.required),
    hasPartialProgress: lines.some(
      (line) => line.fulfilled > 0 && line.fulfilled < line.required
    ),
  }
}

export function deriveStatusFromNeeds(
  needs: HelpRequestNeedLine[],
  currentStatus: HelpRequestStatusValue
): HelpRequestStatusValue {
  if (
    currentStatus === HelpRequestStatus.EXPIRED ||
    currentStatus === HelpRequestStatus.CANCELLED
  ) {
    return currentStatus
  }

  const { isFullyFulfilled, hasPartialProgress, totalFulfilled } =
    computeNeedsProgress(needs)

  if (isFullyFulfilled) return HelpRequestStatus.FULFILLED
  if (hasPartialProgress || totalFulfilled > 0) {
    return HelpRequestStatus.PARTIALLY_FULFILLED
  }
  return HelpRequestStatus.ACTIVE
}

export function applyNeedLineFulfillment(
  request: HelpRequest,
  lineId: string,
  adjustmentType: "add" | "remove" | "set",
  amount: number
): HelpRequest {
  const now = new Date().toISOString()
  const needs = request.needs.map((line) => {
    if (line.id !== lineId) return line

    let fulfilled = line.fulfilled
    if (adjustmentType === "add") {
      fulfilled = line.fulfilled + amount
    } else if (adjustmentType === "remove") {
      fulfilled = line.fulfilled - amount
    } else {
      fulfilled = amount
    }

    return normalizeNeedLine({ ...line, fulfilled })
  })

  return {
    ...request,
    needs,
    status: deriveStatusFromNeeds(needs, request.status),
    updatedAt: now,
  }
}

export function buildNeedsFromCreateInput(
  inputs: CreateHelpRequestNeedInput[]
): HelpRequestNeedLine[] {
  return inputs.map((input) =>
    normalizeNeedLine({
      id: input.id ?? createNeedLineId(),
      label: input.label,
      required: input.required,
      fulfilled: 0,
      unit: input.unit,
      kind: input.kind,
      notes: input.notes,
    })
  )
}
