"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { ServiceWithProvider } from "@/types";

// Fix for default marker icons in React Leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const highlightedIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [30, 46],
  iconAnchor: [15, 46],
  popupAnchor: [0, -46],
  shadowSize: [41, 41],
});

interface MapViewProps {
  services: ServiceWithProvider[];
  center: [number, number];
  zoom?: number;
  className?: string;
  onMarkerClick?: (service: ServiceWithProvider) => void;
  highlightedServiceId?: string;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function FitBounds({ services, hasUserCenter }: { services: ServiceWithProvider[]; hasUserCenter: boolean }) {
  const map = useMap();

  const bounds = useMemo(() => {
    const points = services
      .filter((s) => s.latitude && s.longitude)
      .map((s) => [parseFloat(s.latitude!.toString()), parseFloat(s.longitude!.toString())] as [number, number]);
    if (points.length < 2) return null;
    return L.latLngBounds(points);
  }, [services]);

  useEffect(() => {
    if (!hasUserCenter && bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [bounds, hasUserCenter, map]);

  return null;
}

export function MapView({
  services,
  center,
  zoom = 11,
  className = "h-full w-full rounded-xl overflow-hidden",
  onMarkerClick,
  highlightedServiceId,
}: MapViewProps) {
  const hasUserCenter = center[0] !== 25.2048 || center[1] !== 55.2708;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      className={className}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={center} />
      <FitBounds services={services} hasUserCenter={hasUserCenter} />

      <MarkerClusterGroup chunkedLoading maxClusterRadius={50}>
        {services.map((service) => {
          if (!service.latitude || !service.longitude) return null;
          const isHighlighted = highlightedServiceId === service.id;

          return (
            <Marker
              key={service.id}
              position={[
                parseFloat(service.latitude.toString()),
                parseFloat(service.longitude.toString()),
              ]}
              icon={isHighlighted ? highlightedIcon : undefined}
              eventHandlers={
                onMarkerClick
                  ? { click: () => onMarkerClick(service) }
                  : undefined
              }
            >
              <Popup>
                <div className="w-[200px] p-1">
                  {service.images?.[0] && (
                    <div className="aspect-video rounded-md overflow-hidden mb-2 bg-muted relative">
                      <Image
                        src={service.images[0]}
                        alt={service.titleEn}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                    </div>
                  )}
                  <h3 className="font-semibold text-sm truncate mb-1">
                    {service.titleEn}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold text-sm">
                      {service.pricingType === "fixed"
                        ? `${service.priceMin} AED`
                        : `${service.priceMin} AED/hr`}
                    </span>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Star className="w-3 h-3 fill-warning text-warning mr-1" />
                      {service.provider?.rating || "New"}
                    </div>
                  </div>
                  <Link
                    href={`/service/${service.id}`}
                    className="block mt-2 text-xs text-center bg-primary text-primary-foreground py-1 rounded hover:bg-primary/90 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
