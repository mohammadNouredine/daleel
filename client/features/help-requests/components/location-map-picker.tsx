"use client"

import { useCallback, useEffect, useState } from "react"
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet"
import type { LatLng } from "leaflet"
import L from "leaflet"
import { Loader2, LocateFixed, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LEBANON_MAP_CENTER } from "../constants"
import { reverseGeocode } from "../utils/geocoding"
import "leaflet/dist/leaflet.css"

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export type ResolvedLocationPayload = {
  latitude: string
  longitude: string
  governorate: string
  district: string
  city: string
  street?: string
}

type LocationMapPickerProps = {
  latitude?: string
  longitude?: string
  onLocationResolved: (payload: ResolvedLocationPayload) => void
  className?: string
}

function MapClickHandler({ onPick }: { onPick: (coords: LatLng) => void }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng)
    },
  })
  return null
}

function RecenterMap({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

function getGeolocationErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return "Location permission denied. Allow access or pick a point on the map."
    case 2:
      return "Current location unavailable. Try again or pick on the map."
    case 3:
      return "Location request timed out. Try again."
    default:
      return "Could not get your current location."
  }
}

export function LocationMapPicker({
  latitude,
  longitude,
  onLocationResolved,
  className,
}: LocationMapPickerProps) {
  const [pin, setPin] = useState<[number, number] | null>(() => {
    const lat = latitude ? Number(latitude) : NaN
    const lng = longitude ? Number(longitude) : NaN
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) return [lat, lng]
    return null
  })
  const [isResolving, setIsResolving] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const lat = latitude ? Number(latitude) : NaN
    const lng = longitude ? Number(longitude) : NaN
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      setPin([lat, lng])
    }
  }, [latitude, longitude])

  const resolveCoordinates = useCallback(
    async (lat: number, lng: number) => {
      setPin([lat, lng])
      setIsResolving(true)
      setError(null)

      try {
        const address = await reverseGeocode(lat, lng)
        onLocationResolved({
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
          governorate: address.governorate,
          district: address.district,
          city: address.city,
          street: address.street,
        })
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to resolve location"
        )
        onLocationResolved({
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
          governorate: "",
          district: "",
          city: "",
        })
      } finally {
        setIsResolving(false)
      }
    },
    [onLocationResolved]
  )

  const handlePick = (coords: LatLng) => {
    void resolveCoordinates(coords.lat, coords.lng)
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.")
      return
    }

    setIsLocating(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false)
        void resolveCoordinates(
          position.coords.latitude,
          position.coords.longitude
        )
      },
      (positionError) => {
        setIsLocating(false)
        setError(getGeolocationErrorMessage(positionError.code))
      },
      {
        enableHighAccuracy: true,
        timeout: 15_000,
        maximumAge: 0,
      }
    )
  }

  const center: [number, number] = pin ?? [
    LEBANON_MAP_CENTER.lat,
    LEBANON_MAP_CENTER.lng,
  ]
  const mapZoom = pin ? 14 : 8
  const isBusy = isResolving || isLocating

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          Tap the map or use your current location
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full shrink-0 sm:w-auto"
          disabled={isBusy}
          onClick={handleUseCurrentLocation}
        >
          {isLocating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LocateFixed className="size-4" />
          )}
          Use current location
        </Button>
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-input",
          "h-52 sm:h-60 [&_.leaflet-container]:z-0"
        )}
      >
        <MapContainer
          center={center}
          zoom={mapZoom}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onPick={handlePick} />
          {pin ? <RecenterMap center={pin} zoom={mapZoom} /> : null}
          {pin ? <Marker position={pin} icon={markerIcon} /> : null}
        </MapContainer>
        {isBusy ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : null}
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {pin && !isBusy ? (
        <p className="text-xs text-muted-foreground tabular-nums">
          Pin: {pin[0].toFixed(5)}, {pin[1].toFixed(5)}
        </p>
      ) : null}
    </div>
  )
}
