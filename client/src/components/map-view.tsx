import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Service, ProviderProfile, User, Category } from '@shared/schema';
import { getImageUrl } from '@/lib/image-utils';
import { Link } from 'wouter';
import { Star } from 'lucide-react';
import { useEffect } from 'react';

// Fix for default marker icons in React Leaflet with Vite/Webpack
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type ServiceWithRelations = Service & {
  provider: ProviderProfile & { user: User };
  category: Category;
};

interface MapViewProps {
  services: ServiceWithRelations[];
  center: [number, number];
  zoom?: number;
  className?: string;
}

// Component to update map view when center changes
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export function MapView({ services, center, zoom = 11, className = "h-full w-full rounded-xl overflow-hidden" }: MapViewProps) {
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
      
      {services.map((service) => {
        if (!service.latitude || !service.longitude) return null;
        
        // Offset slightly if multiple services are at exact same location?
        // For now, just plot them.
        return (
          <Marker 
            key={service.id} 
            position={[parseFloat(service.latitude.toString()), parseFloat(service.longitude.toString())]}
          >
            <Popup>
              <div className="w-[200px] p-1">
                <div className="aspect-video rounded-md overflow-hidden mb-2 bg-muted">
                  <img 
                    src={getImageUrl(service.images?.[0])} 
                    alt={service.titleEn}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-sm truncate mb-1">{service.titleEn}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold text-sm">
                    {service.pricingType === 'fixed' ? 
                      `${service.priceMin} AED` : 
                      `${service.priceMin} AED/hr`}
                  </span>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Star className="w-3 h-3 fill-warning text-warning mr-1" />
                    {service.provider.rating || "New"}
                  </div>
                </div>
                <Link href={`/service/${service.id}`} className="block mt-2 text-xs text-center bg-primary text-primary-foreground py-1 rounded hover:bg-primary/90 transition-colors">
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
