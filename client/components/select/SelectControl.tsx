"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  clearValue,
}: SelectControlValueProps) {
  const selectedLabel = resolveSelectedLabel(value, options, displayValue);
  const showClear = canClearSelectValue(value, clearValue) && !disabled;

  const control = (
    <div className="flex min-w-0 items-center gap-1">
      <Select
        value={value}
        onValueChange={(next) => {
          if (next != null) onValueChange(next);
        }}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn("w-full min-w-0 flex-1", showClear && "pr-1")}
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
      {showClear ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground"
          aria-label={`Clear ${label ?? "selection"}`}
          onClick={() => onValueChange(clearValue!)}
        >
          <X className="size-3.5" />
        </Button>
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
