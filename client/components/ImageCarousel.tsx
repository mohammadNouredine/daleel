"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type TouchEvent,
} from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type ImageCarouselSlide = {
  src: string
  alt?: string
}

type ImageCarouselProps = {
  images: ImageCarouselSlide[]
  className?: string
  imageClassName?: string
  sizes?: string
  priority?: boolean
  /** Dots (cards) or counter pill (detail hero), like Airbnb. */
  indicator?: "dots" | "counter" | "none"
  showArrows?: boolean
  /** Hide arrows until hover/focus-within (listing cards). */
  arrowsOnHover?: boolean
  loop?: boolean
  stopPropagationOnControls?: boolean
  defaultAlt?: string
}

const SWIPE_THRESHOLD_PX = 40

export function ImageCarousel({
  images,
  className,
  imageClassName,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
  indicator = "dots",
  showArrows = true,
  arrowsOnHover = false,
  loop = true,
  stopPropagationOnControls = false,
  defaultAlt = "Photo",
}: ImageCarouselProps) {
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const touchDeltaX = useRef(0)
  const didSwipe = useRef(false)

  const count = images.length

  useEffect(() => {
    setIndex((current) => (count === 0 ? 0 : Math.min(current, count - 1)))
  }, [count])

  const goTo = useCallback(
    (next: number) => {
      if (count <= 1) return

      if (loop) {
        setIndex(((next % count) + count) % count)
        return
      }

      setIndex(Math.max(0, Math.min(count - 1, next)))
    },
    [count, loop]
  )

  const goPrev = useCallback(() => goTo(index - 1), [goTo, index])
  const goNext = useCallback(() => goTo(index + 1), [goTo, index])

  const stopControlEvent = useCallback(
    (event: MouseEvent) => {
      if (stopPropagationOnControls) {
        event.preventDefault()
        event.stopPropagation()
      }
    },
    [stopPropagationOnControls]
  )

  const onTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
    touchDeltaX.current = 0
    didSwipe.current = false
  }

  const onTouchMove = (event: TouchEvent) => {
    if (touchStartX.current == null) return
    const currentX = event.touches[0]?.clientX ?? touchStartX.current
    touchDeltaX.current = currentX - touchStartX.current
  }

  const onTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) >= SWIPE_THRESHOLD_PX) {
      didSwipe.current = true
      if (touchDeltaX.current < 0) {
        goNext()
      } else {
        goPrev()
      }
    }
    touchStartX.current = null
    touchDeltaX.current = 0
  }

  const onClickCapture = (event: MouseEvent) => {
    if (didSwipe.current) {
      event.preventDefault()
      event.stopPropagation()
      didSwipe.current = false
    }
  }

  if (count === 0) {
    return null
  }

  if (count === 1) {
    const slide = images[0]
    return (
      <div className={cn("relative overflow-hidden bg-muted", className)}>
        <Image
          src={slide.src}
          alt={slide.alt ?? defaultAlt}
          fill
          className={cn("object-cover", imageClassName)}
          sizes={sizes}
          priority={priority}
        />
      </div>
    )
  }

  const canGoPrev = loop || index > 0
  const canGoNext = loop || index < count - 1

  return (
    <div
      className={cn(
        "group/carousel relative overflow-hidden bg-muted",
        className
      )}
      role="region"
      aria-roledescription="carousel"
      aria-label={`Image gallery, ${index + 1} of ${count}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClickCapture={onClickCapture}
    >
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((slide, slideIndex) => (
          <div
            key={`${slide.src}-${slideIndex}`}
            className="relative h-full min-w-full shrink-0"
            aria-hidden={slideIndex !== index}
          >
            <Image
              src={slide.src}
              alt={slide.alt ?? `${defaultAlt} ${slideIndex + 1}`}
              fill
              className={cn("object-cover", imageClassName)}
              sizes={sizes}
              priority={priority && slideIndex === 0}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {showArrows ? (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            disabled={!canGoPrev}
            onClick={(event) => {
              stopControlEvent(event)
              goPrev()
            }}
            className={cn(
              "absolute left-3 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border-0 bg-white/95 text-foreground shadow-md transition-all hover:scale-105 hover:bg-white disabled:pointer-events-none disabled:opacity-0",
              arrowsOnHover &&
                "opacity-0 group-hover/carousel:opacity-100 group-focus-within/carousel:opacity-100"
            )}
          >
            <ChevronLeft className="size-4" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            disabled={!canGoNext}
            onClick={(event) => {
              stopControlEvent(event)
              goNext()
            }}
            className={cn(
              "absolute right-3 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border-0 bg-white/95 text-foreground shadow-md transition-all hover:scale-105 hover:bg-white disabled:pointer-events-none disabled:opacity-0",
              arrowsOnHover &&
                "opacity-0 group-hover/carousel:opacity-100 group-focus-within/carousel:opacity-100"
            )}
          >
            <ChevronRight className="size-4" strokeWidth={2.5} />
          </button>
        </>
      ) : null}

      {indicator === "dots" ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5"
          aria-hidden
        >
          {images.map((slide, dotIndex) => (
            <span
              key={`dot-${slide.src}-${dotIndex}`}
              className={cn(
                "h-1.5 rounded-full bg-white shadow-sm transition-all duration-200",
                dotIndex === index ? "w-4 opacity-100" : "w-1.5 opacity-60"
              )}
            />
          ))}
        </div>
      ) : null}

      {indicator === "counter" ? (
        <div
          className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-md bg-black/70 px-2.5 py-1 text-xs font-medium text-white shadow-sm"
          aria-hidden
        >
          {index + 1} / {count}
        </div>
      ) : null}
    </div>
  )
}
