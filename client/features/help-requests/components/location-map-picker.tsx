"use client"

import { useEffect, useState } from "react"
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet"
import type { LatLng } from "leaflet"
import L from "leaflet"
import { Loader2, MapPin } from "lucide-react"
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

type LocationMapPickerProps = {
  latitude?: string
  longitude?: string
  onLocationResolved: (payload: {
    latitude: string
    longitude: string
    governorate: string
    district: string
    city: string
    street?: string
  }) => void
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

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
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
  const [error, setError] = useState<string | null>(null)

  const center: [number, number] = pin ?? [
    LEBANON_MAP_CENTER.lat,
    LEBANON_MAP_CENTER.lng,
  ]

  const handlePick = async (coords: LatLng) => {
    const lat = coords.lat
    const lng = coords.lng
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
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <MapPin className="size-3.5 shrink-0" />
        Tap the map to drop a pin and auto-fill location fields
      </p>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-input",
          "h-52 sm:h-60 [&_.leaflet-container]:z-0"
        )}
      >
        <MapContainer
          center={center}
          zoom={pin ? 13 : 8}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onPick={handlePick} />
          {pin ? <RecenterMap center={pin} /> : null}
          {pin ? <Marker position={pin} icon={markerIcon} /> : null}
        </MapContainer>
        {isResolving ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : null}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {pin && !isResolving ? (
        <p className="text-xs text-muted-foreground tabular-nums">
          Pin: {pin[0].toFixed(5)}, {pin[1].toFixed(5)}
        </p>
      ) : null}
    </div>
  )
}
