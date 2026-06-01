"use client"

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"
import { ChevronDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { DEFAULT_PHONE_CODE, findPhoneCode } from "./phone-codes"
import { countryCodeToFlag, filterPhoneCodes } from "./phone-utils"

const POPUP_MIN_WIDTH = 288
const POPUP_MAX_WIDTH = 360

type PhoneCodeSelectProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

type PopupPosition = {
  top: number
  left: number
  width: number
}

export function PhoneCodeSelect({
  value,
  onChange,
  disabled = false,
  className,
}: PhoneCodeSelectProps) {
  const listboxId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [position, setPosition] = useState<PopupPosition | null>(null)

  const selected =
    findPhoneCode(value || DEFAULT_PHONE_CODE) ??
    findPhoneCode(DEFAULT_PHONE_CODE)

  const filtered = useMemo(() => filterPhoneCodes(query), [query])

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const width = Math.min(
      POPUP_MAX_WIDTH,
      Math.max(POPUP_MIN_WIDTH, rect.width, 300)
    )
    let left = rect.left

    if (left + width > window.innerWidth - 8) {
      left = window.innerWidth - width - 8
    }
    if (left < 8) {
      left = 8
    }

    setPosition({
      top: rect.bottom + 6,
      left,
      width,
    })
  }, [])

  const scrollSelectedIntoView = useCallback(() => {
    const selectedValue = selected?.value ?? DEFAULT_PHONE_CODE
    const node =
      itemRefs.current.get(selectedValue) ??
      listRef.current?.querySelector<HTMLButtonElement>(
        `[data-phone-code="${selectedValue}"]`
      )

    node?.scrollIntoView({ block: "center", behavior: "auto" })
  }, [selected?.value])

  const openPicker = useCallback(() => {
    if (disabled) return
    setQuery("")
    const allItems = filterPhoneCodes("")
    const selectedIndex = allItems.findIndex(
      (item) => item.value === (selected?.value ?? DEFAULT_PHONE_CODE)
    )
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0)
    setOpen(true)
  }, [disabled, selected?.value])

  const closePicker = useCallback(() => {
    setOpen(false)
    setQuery("")
  }, [])

  const selectItem = useCallback(
    (dialCode: string) => {
      onChange(dialCode)
      closePicker()
      triggerRef.current?.focus()
    },
    [closePicker, onChange]
  )

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null)
      return
    }

    updatePosition()

    const handleReposition = () => updatePosition()
    window.addEventListener("resize", handleReposition)
    window.addEventListener("scroll", handleReposition, true)

    return () => {
      window.removeEventListener("resize", handleReposition)
      window.removeEventListener("scroll", handleReposition, true)
    }
  }, [open, updatePosition])

  useEffect(() => {
    if (!open) return

    const frame = requestAnimationFrame(() => {
      searchRef.current?.focus()
      scrollSelectedIntoView()
    })

    return () => cancelAnimationFrame(frame)
  }, [open, scrollSelectedIntoView])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (triggerRef.current?.contains(target) || listRef.current?.contains(target)) {
        return
      }
      closePicker()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        closePicker()
        triggerRef.current?.focus()
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [closePicker, open])

  useEffect(() => {
    if (highlightedIndex >= filtered.length) {
      setHighlightedIndex(Math.max(0, filtered.length - 1))
    }
  }, [filtered.length, highlightedIndex])

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setHighlightedIndex((prev) =>
        Math.min(prev + 1, Math.max(0, filtered.length - 1))
      )
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      setHighlightedIndex((prev) => Math.max(prev - 1, 0))
      return
    }

    if (event.key === "Enter") {
      event.preventDefault()
      const item = filtered[highlightedIndex]
      if (item) {
        selectItem(item.value)
      }
      return
    }

    if (event.key === "Tab") {
      closePicker()
    }
  }

  useEffect(() => {
    if (!open || !listRef.current) return
    const highlighted = filtered[highlightedIndex]
    if (!highlighted) return
    itemRefs.current.get(highlighted.value)?.scrollIntoView({
      block: "nearest",
    })
  }, [filtered, highlightedIndex, open])

  const popup =
    open && position && typeof document !== "undefined"
      ? createPortal(
          <div
            role="presentation"
            className="fixed z-200 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10"
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
            }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="border-b border-border p-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchRef}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setHighlightedIndex(0)
                  }}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search country or code…"
                  className="h-8 pl-8"
                  aria-controls={listboxId}
                  aria-autocomplete="list"
                />
              </div>
            </div>

            <div
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-label="Country dial code"
              className="max-h-60 overflow-y-auto overscroll-contain p-1"
            >
              {filtered.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No country matches your search.
                </p>
              ) : (
                filtered.map((item, index) => {
                  const isSelected = item.value === selected?.value
                  const isHighlighted = index === highlightedIndex

                  return (
                    <button
                      key={`${item.code}-${item.value}`}
                      ref={(node) => {
                        if (node) {
                          itemRefs.current.set(item.value, node)
                        } else {
                          itemRefs.current.delete(item.value)
                        }
                      }}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      data-phone-code={item.value}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                        isHighlighted && "bg-accent text-accent-foreground",
                        isSelected && !isHighlighted && "bg-muted/60",
                        !isHighlighted && !isSelected && "hover:bg-muted/50"
                      )}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => selectItem(item.value)}
                    >
                      <span
                        aria-hidden
                        className="text-base leading-none shrink-0"
                      >
                        {countryCodeToFlag(item.code)}
                      </span>
                      <span className="min-w-0 flex-1 whitespace-normal leading-snug">
                        {item.label}
                      </span>
                      <span className="shrink-0 font-medium tabular-nums text-muted-foreground">
                        {item.value}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </div>,
          document.body
        )
      : null

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        className={cn(
          "h-8 w-full justify-between gap-1 px-2 font-normal",
          className
        )}
        onClick={() => {
          if (open) {
            closePicker()
          } else {
            openPicker()
          }
        }}
        onKeyDown={(event) => {
          if (
            event.key === "ArrowDown" ||
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault()
            if (!open) openPicker()
          }
        }}
      >
        {selected ? (
          <span className="flex min-w-0 items-center gap-1.5">
            <span aria-hidden className="text-base leading-none">
              {countryCodeToFlag(selected.code)}
            </span>
            <span className="font-medium tabular-nums">{selected.value}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">Code</span>
        )}
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </Button>
      {popup}
    </>
  )
}
