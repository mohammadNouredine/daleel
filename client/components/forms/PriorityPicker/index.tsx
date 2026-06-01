"use client"

import { useCallback, useRef } from "react"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"
import type { PriorityLevelValue } from "@/features/help-requests/types"
import { useFormContext } from "react-hook-form"
import {
  getPriorityFromPointer,
  PRIORITY_GRADIENT,
  PRIORITY_SEGMENTS,
  type PrioritySegmentConfig,
} from "./priority-segments"

type PriorityPickerBaseProps = {
  label?: string
  description?: string
  className?: string
  segments?: PrioritySegmentConfig[]
}

type PriorityPickerControlledProps = PriorityPickerBaseProps & {
  value: PriorityLevelValue
  onChange: (value: PriorityLevelValue) => void
  name?: never
}

type PriorityPickerFormProps = PriorityPickerBaseProps & {
  name: string
  value?: never
  onChange?: never
}

export type PriorityPickerProps =
  | PriorityPickerControlledProps
  | PriorityPickerFormProps

function PrioritySegmentBar({
  value,
  onChange,
  segments = PRIORITY_SEGMENTS,
  className,
}: {
  value: PriorityLevelValue
  onChange: (value: PriorityLevelValue) => void
  segments?: PrioritySegmentConfig[]
  className?: string
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const selectedIndex = Math.max(
    0,
    segments.findIndex((s) => s.value === value)
  )
  const selected = segments[selectedIndex] ?? segments[2]
  const segmentCount = segments.length

  const fillPercent = ((selectedIndex + 1) / segmentCount) * 100
  const tagLeftPercent = ((selectedIndex + 0.5) / segmentCount) * 100

  const selectAtClientX = useCallback(
    (clientX: number) => {
      const rect = trackRef.current?.getBoundingClientRect()
      if (!rect) return
      const index = getPriorityFromPointer(clientX, rect, segmentCount)
      const next = segments[index]
      if (next) {
        onChange(next.value)
      }
    },
    [onChange, segmentCount, segments, value]
  )

  const handleTrackClick = (event: React.MouseEvent<HTMLDivElement>) => {
    selectAtClientX(event.clientX)
  }

  const handleTrackKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault()
      const next = Math.max(0, selectedIndex - 1)
      onChange(segments[next].value)
    }
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault()
      const next = Math.min(segmentCount - 1, selectedIndex + 1)
      onChange(segments[next].value)
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative pt-9">
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 transition-[left] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{ left: `${tagLeftPercent}%` }}
          aria-hidden
        >
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide shadow-md transition-colors duration-500",
              selected.tagClass
            )}
          >
            {selected.label}
          </span>
        </div>

        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          aria-valuemin={0}
          aria-valuemax={segmentCount - 1}
          aria-valuenow={selectedIndex}
          aria-valuetext={selected.label}
          aria-label="Priority level"
          onClick={handleTrackClick}
          onKeyDown={handleTrackKeyDown}
          className={cn(
            "group relative w-full cursor-pointer rounded-full outline-none",
            "focus-visible:ring-2 focus-visible:ring-offset-2",
            selected.ringClass
          )}
        >
          <div className="relative h-3.5 overflow-hidden rounded-full ring-1 ring-border/50 sm:h-4">
            <div
              className="absolute inset-0 opacity-35 transition-opacity duration-300 group-hover:opacity-45"
              style={{ background: PRIORITY_GRADIENT }}
            />

            <div
              className="absolute inset-y-0 left-0 transition-[width,background-color] duration-500 ease-[cubic-bezier(0.34,1.2,0.64,1)]"
              style={{
                width: `${fillPercent}%`,
                backgroundColor: selected.color,
              }}
            />

            <div
              className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden transition-[width] duration-500 ease-[cubic-bezier(0.34,1.2,0.64,1)]"
              style={{ width: `${fillPercent}%` }}
            >
              <div
                className="absolute inset-0 animate-priority-shimmer opacity-25"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
                  backgroundSize: "200% 100%",
                }}
              />
            </div>

            {Array.from({ length: segmentCount - 1 }, (_, index) => (
              <div
                key={index}
                className="pointer-events-none absolute top-0.5 bottom-0.5 z-2 w-px -translate-x-1/2 bg-background/90 shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:bg-background/70"
                style={{
                  left: `${((index + 1) / segmentCount) * 100}%`,
                }}
                aria-hidden
              />
            ))}

            <div
              className="absolute top-1/2 z-3 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.85)] transition-[left,box-shadow] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              style={{
                left: `${fillPercent}%`,
                boxShadow: `0 0 14px ${selected.color}, 0 0 4px ${selected.color}`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Less urgent</span>
        <span>Critical</span>
      </div>
    </div>
  )
}

function PriorityPickerFormInner({
  name,
  label,
  description,
  className,
  segments,
}: PriorityPickerFormProps) {
  const form = useFormContext()

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label ? <FormLabel>{label}</FormLabel> : null}
          {description ? (
            <FormDescription>{description}</FormDescription>
          ) : null}
          <FormControl>
            <PrioritySegmentBar
              value={field.value as PriorityLevelValue}
              onChange={field.onChange}
              segments={segments}
              className={className}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function PriorityPicker(props: PriorityPickerProps) {
  const { label = "Priority", description, className, segments } = props

  if ("name" in props && props.name) {
    return (
      <PriorityPickerFormInner
        name={props.name}
        label={label}
        description={description}
        className={className}
        segments={segments}
      />
    )
  }

  const { value, onChange } = props as PriorityPickerControlledProps

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <p className="text-sm font-medium leading-none">{label}</p>
      ) : null}
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      <PrioritySegmentBar
        value={value}
        onChange={onChange}
        segments={segments}
      />
    </div>
  )
}
