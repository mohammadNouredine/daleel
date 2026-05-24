"use client"

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
  getPrioritySegment,
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
  const selected = getPrioritySegment(value)

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className="flex h-3 w-full overflow-hidden rounded-full ring-1 ring-border/60 sm:h-3.5"
        role="radiogroup"
        aria-label="Priority level"
      >
        {segments.map((segment) => {
          const isSelected = segment.value === value
          return (
            <button
              key={segment.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={segment.label}
              onClick={() => onChange(segment.value)}
              className={cn(
                "min-w-0 flex-1 transition-all duration-200",
                "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
                segment.ringClass,
                isSelected ? segment.activeClass : segment.idleClass,
                isSelected && "scale-y-125 shadow-sm"
              )}
            />
          )
        })}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Less urgent</span>
        <span
          className={cn(
            "rounded-md px-2 py-0.5 font-medium text-white shadow-sm",
            selected.activeClass
          )}
        >
          {selected.label}
        </span>
        <span className="text-muted-foreground">Critical</span>
      </div>
    </div>
  )
}

export function PriorityPicker(props: PriorityPickerProps) {
  const { label = "Priority", description, className, segments } = props

  if ("name" in props && props.name) {
    const form = useFormContext()

    return (
      <FormField
        control={form.control}
        name={props.name}
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
