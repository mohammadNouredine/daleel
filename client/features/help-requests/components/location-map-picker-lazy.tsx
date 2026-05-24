"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

export const LocationMapPicker = dynamic(
  () =>
    import("./location-map-picker").then((mod) => mod.LocationMapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 sm:h-60">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    ),
  }
)
