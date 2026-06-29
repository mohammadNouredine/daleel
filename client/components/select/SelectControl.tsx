"use client";

import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  canClearSelectValue,
  resolveSelectClearValue,
  resolveSelectedLabel,
  type SelectControlValueProps,
} from "@/components/select/types";

export function SelectControl({
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  disabled = false,
  label,
  description,
  hint,
  className,
  displayValue,
  clearable = false,
  clearValue,
}: SelectControlValueProps) {
  const selectedLabel = resolveSelectedLabel(value, options, displayValue);
  const resolvedClearValue = resolveSelectClearValue(clearable, clearValue);
  const showClear =
    canClearSelectValue(value, clearable, clearValue) && !disabled;

  const control = (
    <div className="relative min-w-0 w-full">
      <Select
        value={value}
        onValueChange={(next) => {
          if (next != null) onValueChange(next);
        }}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn("w-full min-w-0", showClear && "pr-12")}
          disabled={disabled}
        >
          <SelectValue placeholder={placeholder}>
            {selectedLabel || null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showClear && resolvedClearValue !== undefined ? (
        <button
          type="button"
          className="absolute top-1/2 right-2 z-10 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={`Clear ${label ?? "selection"}`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onValueChange(resolvedClearValue);
          }}
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  );

  if (!label && !description && !hint) {
    return <div className={className}>{control}</div>;
  }

  return (
    <div className={cn("grid gap-1.5", className)}>
      {label ? (
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      ) : null}
      {control}
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
      {hint ? (
        <span className="text-[11px] font-normal leading-snug text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
