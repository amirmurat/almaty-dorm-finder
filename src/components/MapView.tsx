import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Dorm } from "@/data/dorms";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issue with webpack
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import icon2x from "leaflet/dist/images/marker-icon-2x.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: icon2x,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  dorms: Dorm[];
  selectedDormId?: string;
  onMarkerClick?: (dormId: string) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

function MapController({ dorms, selectedDormId, center }: { dorms: Dorm[], selectedDormId?: string, center?: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, 14);
    } else if (dorms.length > 0) {
      const bounds = L.latLngBounds(dorms.map(d => [d.lat, d.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [dorms, center, map]);

  useEffect(() => {
    if (selectedDormId) {
      const dorm = dorms.find(d => d.id === selectedDormId);
      if (dorm) {
        map.setView([dorm.lat, dorm.lng], 15);
      }
    }
  }, [selectedDormId, dorms, map]);

  return null;
}

function MapContent({ dorms, selectedDormId, onMarkerClick, center }: { dorms: Dorm[], selectedDormId?: string, onMarkerClick?: (dormId: string) => void, center?: [number, number] }) {
  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        minZoom={10}
        maxZoom={18}
      />
      {dorms.map((dorm) => (
        <Marker
          key={dorm.id}
          position={[dorm.lat, dorm.lng]}
          eventHandlers={{
            click: () => onMarkerClick?.(dorm.id),
          }}
        >
          <Popup>
            <div className="text-sm">
              <h3 className="font-semibold mb-1">{dorm.name}</h3>
              <p className="text-muted-foreground text-xs mb-1">{dorm.university}</p>
              <p className="font-bold text-primary">{dorm.priceKzt.toLocaleString()} ₸/mo</p>
              <p className="text-xs text-muted-foreground">{dorm.distanceKm} km from center</p>
            </div>
          </Popup>
        </Marker>
      ))}
      <MapController dorms={dorms} selectedDormId={selectedDormId} center={center} />
    </>
  );
}

export function MapView({ dorms, selectedDormId, onMarkerClick, height = "400px", center, zoom = 12 }: MapViewProps) {
  const defaultCenter: [number, number] = center || [43.2220, 76.9250];

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <MapContent 
          dorms={dorms} 
          selectedDormId={selectedDormId} 
          onMarkerClick={onMarkerClick}
          center={center}
        />
      </MapContainer>
    </div>
  );
}
