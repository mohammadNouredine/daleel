"use client"

import { useEffect, useState } from "react"

export type UserLocationStatus =
  | "idle"
  | "loading"
  | "ready"
  | "denied"
  | "unsupported"

export type UserCoordinates = {
  lat: number
  lng: number
}

type UseUserLocationOptions = {
  /** When false, geolocation is not requested. */
  enabled?: boolean
}

export function useUserLocation(options?: UseUserLocationOptions) {
  const enabled = options?.enabled ?? true
  const [coords, setCoords] = useState<UserCoordinates | null>(null)
  const [status, setStatus] = useState<UserLocationStatus>("idle")

  useEffect(() => {
    if (!enabled) {
      return
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unsupported")
      return
    }

    setStatus("loading")

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setStatus("ready")
      },
      () => {
        setStatus("denied")
      },
      {
        enableHighAccuracy: false,
        timeout: 15_000,
        maximumAge: 5 * 60 * 1000,
      }
    )
  }, [enabled])

  return { coords, status }
}
