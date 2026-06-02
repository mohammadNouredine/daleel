"use client"

import { loadGooglePlacesApi } from "./google-places-loader"

export type PlaceSuggestion = {
  placeId: string
  description: string
}

export type PlaceSelection = {
  placeId: string
  latitude: number
  longitude: number
  address: {
    governorate?: string
    district?: string
    city?: string
    street?: string
  }
}

function extractAddress(details: any) {
  const components = details.address_components ?? []
  const byType = (type: string) =>
    components.find((c: { types?: string[]; long_name?: string }) =>
      (c.types ?? []).includes(type)
    )?.long_name

  return {
    governorate: byType("administrative_area_level_1"),
    district: byType("administrative_area_level_2"),
    city: byType("locality") ?? byType("administrative_area_level_3"),
    street: [byType("route"), byType("street_number")].filter(Boolean).join(" "),
  }
}

export async function fetchPlaceSuggestions(
  input: string
): Promise<PlaceSuggestion[]> {
  if (!input.trim()) return []
  const google = await loadGooglePlacesApi()
  const service = new google.maps.places.AutocompleteService()

  return new Promise((resolve) => {
    service.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: "lb" },
        types: ["(regions)"],
      },
      (predictions: any[] | null, status: string) => {
        if (
          status !== google.maps.places.PlacesServiceStatus.OK ||
          !predictions
        ) {
          resolve([])
          return
        }
        resolve(
          predictions.map((p) => ({
            placeId: p.place_id,
            description: p.description,
          }))
        )
      }
    )
  })
}

export async function fetchPlaceDetails(
  placeId: string
): Promise<PlaceSelection | null> {
  const google = await loadGooglePlacesApi()
  const service = new google.maps.places.PlacesService(
    document.createElement("div")
  )

  return new Promise((resolve) => {
    service.getDetails(
      {
        placeId,
        fields: ["geometry.location", "address_component"],
      },
      (result: any, status: string) => {
        if (
          status !== google.maps.places.PlacesServiceStatus.OK ||
          !result?.geometry?.location
        ) {
          resolve(null)
          return
        }

        resolve({
          placeId,
          latitude: result.geometry.location.lat(),
          longitude: result.geometry.location.lng(),
          address: extractAddress(result),
        })
      }
    )
  })
}
