"use client";

import type { ComponentProps } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SearchInputProps = Omit<ComponentProps<typeof Input>, "type"> & {
  /** Standalone label above the control (e.g. filter bars). */
  label?: string;
  /** Wrapper layout classes (label + field). */
  wrapperClassName?: string;
};

export function SearchInput({
  label,
  wrapperClassName,
  className,
  id,
  ...props
}: SearchInputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  const field = (
    <div className="relative min-w-0">
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        id={inputId}
        type="search"
        className={cn("h-9 pl-9", className)}
        {...props}
      />
    </div>
  );

  if (!label) {
    return <div className={wrapperClassName}>{field}</div>;
  }

  return (
    <div className={cn("grid gap-1.5", wrapperClassName)}>
      <label
        htmlFor={inputId}
        className="text-xs font-medium text-muted-foreground"
      >
        {label}
      </label>
      {field}
    </div>
  );
}
