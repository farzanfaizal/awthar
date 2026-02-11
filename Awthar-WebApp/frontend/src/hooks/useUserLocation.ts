"use client";

import { useState, useCallback, useRef } from "react";

interface UserLocationState {
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  loading: boolean;
  error: string | null;
}

export function useUserLocation() {
  const [state, setState] = useState<UserLocationState>({
    latitude: null,
    longitude: null,
    locationName: null,
    loading: false,
    error: null,
  });

  const mountedRef = useRef(true);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({ ...prev, error: "Geolocation is not supported by your browser" }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let locationName = "Your Location";

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address;
            locationName = addr?.city || addr?.town || addr?.suburb || addr?.state || "Your Location";
          }
        } catch {
          // Reverse geocoding failed, use default name
        }

        setState({
          latitude,
          longitude,
          locationName,
          loading: false,
          error: null,
        });
      },
      (error) => {
        let message = "Failed to get your location";
        if (error.code === error.PERMISSION_DENIED) message = "Location access denied. Please enable it in your browser settings.";
        else if (error.code === error.POSITION_UNAVAILABLE) message = "Location information is unavailable.";
        else if (error.code === error.TIMEOUT) message = "Location request timed out.";
        setState((prev) => ({ ...prev, loading: false, error: message }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const clearLocation = useCallback(() => {
    setState({ latitude: null, longitude: null, locationName: null, loading: false, error: null });
  }, []);

  return { ...state, requestLocation, clearLocation, hasLocation: state.latitude !== null };
}
