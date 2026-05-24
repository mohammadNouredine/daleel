export type ParsedMapAddress = {
  governorate: string
  district: string
  city: string
  street?: string
}

type NominatimAddress = {
  state?: string
  county?: string
  city?: string
  town?: string
  village?: string
  suburb?: string
  city_district?: string
  road?: string
  neighbourhood?: string
}

type NominatimResponse = {
  address?: NominatimAddress
  display_name?: string
}

function pickCity(address: NominatimAddress): string {
  return (
    address.city ??
    address.town ??
    address.village ??
    address.suburb ??
    address.neighbourhood ??
    ""
  )
}

function pickDistrict(address: NominatimAddress, city: string): string {
  return address.county ?? address.city_district ?? city
}

export function parseNominatimAddress(
  address: NominatimAddress | undefined
): ParsedMapAddress {
  if (!address) {
    return { governorate: "", district: "", city: "" }
  }

  const city = pickCity(address)
  const district = pickDistrict(address, city)
  const governorate = address.state ?? district ?? city

  return {
    governorate,
    district,
    city: city || district || governorate,
    street: address.road,
  }
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ParsedMapAddress> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: "json",
    addressdetails: "1",
    zoom: "14",
  })

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
    {
      headers: {
        Accept: "application/json",
        "User-Agent": "DaleelApp/1.0 (humanitarian help requests)",
      },
    }
  )

  if (!response.ok) {
    throw new Error("Could not resolve this location. Try another pin.")
  }

  const data = (await response.json()) as NominatimResponse
  return parseNominatimAddress(data.address)
}
