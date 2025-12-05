/**
 * Utility for Geocoding using OpenStreetMap Nominatim API (Free).
 * Note: This has usage limits (1 req/sec). For production, consider Mapbox or Google Maps.
 */

interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    state?: string; // Emirate
    postcode?: string;
    country?: string;
  };
}

export async function reverseGeocode(lat: number, lng: number): Promise<{
  displayName: string;
  city: string;
  area: string;
  emirate: string;
} | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "User-Agent": "AwtharMarketplace/1.0", // Required by OSM
        },
      }
    );

    if (!res.ok) return null;

    const data: GeocodingResult = await res.json();
    
    // Extract relevant fields
    const city = data.address.city || data.address.town || data.address.village || "";
    const area = data.address.suburb || "";
    const emirate = data.address.state || "";

    return {
      displayName: data.display_name,
      city,
      area,
      emirate,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}
