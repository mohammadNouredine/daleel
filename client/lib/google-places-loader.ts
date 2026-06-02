"use client"

declare global {
  interface Window {
    google?: any
  }
}

let loadPromise: Promise<any> | null = null

export function loadGooglePlacesApi(): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Places is client-only"))
  }

  if (window.google?.maps?.places) {
    return Promise.resolve(window.google)
  }

  if (loadPromise) {
    return loadPromise
  }

  // Requires Maps JavaScript API with Places + Geocoding enabled.
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return Promise.reject(
      new Error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY")
    )
  }

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.google?.maps?.places) {
        resolve(window.google)
      } else {
        reject(new Error("Google Places failed to initialize"))
      }
    }
    script.onerror = () => reject(new Error("Failed to load Google Places"))
    document.head.appendChild(script)
  })

  return loadPromise
}
