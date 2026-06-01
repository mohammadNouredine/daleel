"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type UseInViewOptions = {
  rootMargin?: string
  threshold?: number | number[]
  once?: boolean
  enabled?: boolean
}

export function useInView({
  rootMargin = "0px",
  threshold = 0,
  once = false,
  enabled = true,
}: UseInViewOptions = {}) {
  const [inView, setInView] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const elementRef = useRef<Element | null>(null)

  const setRef = useCallback(
    (node: Element | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }

      elementRef.current = node

      if (!node || !enabled) {
        if (!enabled) {
          setInView(false)
        }
        return
      }

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          const isIntersecting = entry?.isIntersecting ?? false
          setInView(isIntersecting)
          if (isIntersecting && once && observerRef.current) {
            observerRef.current.disconnect()
            observerRef.current = null
          }
        },
        { rootMargin, threshold }
      )

      observerRef.current.observe(node)
    },
    [enabled, once, rootMargin, threshold]
  )

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  return { ref: setRef, inView }
}
