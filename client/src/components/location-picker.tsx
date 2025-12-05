import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin } from "lucide-react";
import { useUserLocation } from "@/hooks/useUserLocation";

// Fix Leaflet icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  value?: { lat: number; lng: number } | null;
  onChange: (location: { lat: number; lng: number }) => void;
  className?: string;
}

function MapClickEvents({ onChange }: { onChange: (loc: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng);
    },
  });
  return null;
}

// Helper to center map when value changes externally (e.g. "Use my location")
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom());
  }, [center, map]);
  return null;
}

export function LocationPicker({ value, onChange, className = "h-[300px] w-full rounded-lg overflow-hidden border" }: LocationPickerProps) {
  const { latitude, longitude, loading: locating, requestLocation } = useUserLocation();
  
  // Default center (Dubai) if no value
  const center: [number, number] = useMemo(() => {
    if (value) return [value.lat, value.lng];
    return [25.2048, 55.2708]; 
  }, [value]);

  // Effect to handle "Use my location" result
  useEffect(() => {
    if (latitude && longitude) {
      onChange({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude]); // Only trigger when hook updates

  return (
    <div className="space-y-2">
      <div className={className}>
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickEvents onChange={onChange} />
          <MapUpdater center={center} />
          
          {value && <Marker position={[value.lat, value.lng]} />}
        </MapContainer>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={requestLocation}
        disabled={locating}
        className="w-full"
      >
        {locating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MapPin className="w-4 h-4 mr-2" />}
        Use Current Location
      </Button>
    </div>
  );
}
