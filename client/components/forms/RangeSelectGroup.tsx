"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import { FieldHelpHint } from "./FieldHelpHint";

type RangeSelectGroupProps = {
  name: string;
  min: number;
  max: number;
  multiple?: boolean;
  label: string;
  description?: string;
  helpText?: string;
  /** Inline buttons for min..quickMax; higher values appear in a dropdown from "⋯". */
  quickMax?: number;
};

function getOptionButtonClassName(active: boolean) {
  return cn(
    "inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-md border px-2 text-sm transition-colors",
    active
      ? "border-primary bg-primary/10 text-primary"
      : "border-border bg-background hover:bg-muted",
  );
}

export function RangeSelectGroup({
  name,
  min,
  max,
  multiple = false,
  label,
  description,
  helpText,
  quickMax,
}: RangeSelectGroupProps) {
  const form = useFormContext();
  const [moreOpen, setMoreOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const moreAnchorRef = useRef<HTMLButtonElement>(null);

  const effectiveQuickMax =
    quickMax !== undefined ? Math.min(quickMax, max) : undefined;
  const hasMore = effectiveQuickMax !== undefined && effectiveQuickMax < max;

  const quickOptions = Array.from(
    { length: (effectiveQuickMax ?? max) - min + 1 },
    (_, i) => min + i,
  );
  const extendedOptions = hasMore
    ? Array.from(
        { length: max - effectiveQuickMax! },
        (_, i) => effectiveQuickMax! + 1 + i,
      )
    : [];

  useEffect(() => {
    if (!moreOpen) return;

    const close = () => setMoreOpen(false);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [moreOpen]);

  const openMoreMenu = () => {
    const rect = moreAnchorRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMenuPosition({
      top: rect.bottom + 4,
      left: rect.left,
    });
    setMoreOpen(true);
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const selected = multiple
          ? ((field.value as string[] | undefined) ?? [])
          : [String(field.value ?? "")];

        const toggle = (value: number, fromDropdown = false) => {
          const str = String(value);
          if (multiple) {
            const next = selected.includes(str)
              ? selected.filter((v) => v !== str)
              : [...selected, str];
            field.onChange(next);
          } else {
            field.onChange(str);
          }
          if (fromDropdown) {
            setMoreOpen(false);
          }
        };

        const current = String(field.value ?? "");
        const currentNum = Number(current);
        const pinnedExtended =
          hasMore &&
          current !== "" &&
          !Number.isNaN(currentNum) &&
          currentNum > effectiveQuickMax!;

        const moreDropdown =
          moreOpen && menuPosition && typeof document !== "undefined"
            ? createPortal(
                <>
                  <button
                    type="button"
                    aria-label="Close menu"
                    className="fixed inset-0 z-[200] cursor-default bg-transparent"
                    onClick={() => setMoreOpen(false)}
                  />
                  <div
                    className="fixed z-[201] flex max-w-[min(100vw-1rem,14rem)] flex-wrap gap-1.5 rounded-md border border-border bg-popover p-1.5 shadow-md"
                    style={{
                      top: menuPosition.top,
                      left: menuPosition.left,
                    }}
                    role="menu"
                  >
                    {extendedOptions.map((option) => {
                      const str = String(option);
                      const active = selected.includes(str);
                      return (
                        <button
                          key={option}
                          type="button"
                          role="menuitem"
                          onClick={() => toggle(option, true)}
                          className={getOptionButtonClassName(active)}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </>,
                document.body,
              )
            : null;

        const moreBoxActive = pinnedExtended || moreOpen;

        return (
          <FormItem>
            <div className="flex items-center gap-1.5">
              <FormLabel>{label}</FormLabel>
              {helpText ? <FieldHelpHint text={helpText} /> : null}
            </div>
            {description ? (
              <FormDescription>{description}</FormDescription>
            ) : null}
            <FormControl>
              <div className="flex flex-wrap items-center gap-1.5">
                {quickOptions.map((option) => {
                  const str = String(option);
                  const active = selected.includes(str);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggle(option)}
                      className={getOptionButtonClassName(active)}
                    >
                      {option}
                    </button>
                  );
                })}
                {hasMore ? (
                  <div
                    className={cn(
                      "relative inline-flex h-8 min-w-8 shrink-0 overflow-hidden rounded-md border transition-[border-color,background-color,box-shadow] duration-200",
                      moreBoxActive
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border bg-background",
                    )}
                  >
                    {pinnedExtended ? (
                      <button
                        ref={moreAnchorRef}
                        type="button"
                        aria-expanded={moreOpen}
                        aria-haspopup="menu"
                        aria-label={`${currentNum}, more options`}
                        onClick={() =>
                          moreOpen ? setMoreOpen(false) : openMoreMenu()
                        }
                        className={cn(
                          "relative flex h-full w-full min-w-8 cursor-pointer items-center justify-center px-2 text-sm font-medium text-primary transition-colors duration-200",
                          "animate-in fade-in zoom-in-95 hover:bg-primary/15",
                          moreOpen && "bg-primary/15",
                        )}
                      >
                        <span>{currentNum}</span>
                        <span
                          className="pointer-events-none absolute right-0.5 top-0 flex size-4 items-center justify-center text-primary/90 animate-in fade-in zoom-in-95 slide-in-from-bottom-1 duration-200"
                          aria-hidden
                        >
                          <MoreHorizontal className="size-3" />
                        </span>
                      </button>
                    ) : (
                      <button
                        ref={moreAnchorRef}
                        type="button"
                        aria-expanded={moreOpen}
                        aria-haspopup="menu"
                        aria-label="More options"
                        onClick={() =>
                          moreOpen ? setMoreOpen(false) : openMoreMenu()
                        }
                        className={cn(
                          "flex h-full w-full items-center justify-center transition-colors duration-200",
                          moreOpen
                            ? "text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <MoreHorizontal
                          className={cn(
                            "size-4 transition-transform duration-200",
                            moreOpen && "scale-110",
                          )}
                        />
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            </FormControl>
            {moreDropdown}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
