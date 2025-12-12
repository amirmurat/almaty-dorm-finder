import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Dorm } from "@/data/dorms";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, Home, MapPin } from "lucide-react";
import { track } from "@/lib/tracking";

// Фикс для иконок маркеров в Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconRetinaUrl: iconRetina,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Кастомные иконки для разных типов общежитий
const createCustomIcon = (color: string, isSelected: boolean = false) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${isSelected ? '40px' : '32px'};
        height: ${isSelected ? '50px' : '40px'};
        background-color: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 16px;
          font-weight: bold;
        ">🏠</div>
      </div>
    `,
    iconSize: [isSelected ? 40 : 32, isSelected ? 50 : 40],
    iconAnchor: [isSelected ? 20 : 16, isSelected ? 50 : 40],
    popupAnchor: [0, isSelected ? -50 : -40],
  });
};

interface MapControllerProps {
  highlightedDormId?: string;
  dorms: Dorm[];
}

function MapController({ highlightedDormId, dorms }: MapControllerProps) {
  const map = useMap();
  
  useEffect(() => {
    if (highlightedDormId) {
      const dorm = dorms.find(d => d.id === highlightedDormId);
      if (dorm?.geo) {
        map.setView([dorm.geo.lat, dorm.geo.lng], 14, {
          animate: true,
          duration: 0.5
        });
      }
    }
  }, [highlightedDormId, dorms, map]);

  return null;
}

interface InteractiveMapProps {
  dorms: Dorm[];
  onDormClick?: (dorm: Dorm) => void;
  onViewDetails?: (dorm: Dorm) => void;
  onRequestClick?: (dorm: Dorm) => void;
  highlightedDormId?: string;
  className?: string;
}

export function InteractiveMap({
  dorms,
  onDormClick,
  onViewDetails,
  onRequestClick,
  highlightedDormId,
  className = ""
}: InteractiveMapProps) {
  const [selectedDorm, setSelectedDorm] = useState<Dorm | null>(null);
  
  // Центр Алматы
  const center: [number, number] = [43.2220, 76.8512];
  const zoom = 12;

  // Фильтруем общежития с координатами
  const dormsWithCoords = dorms.filter(d => d.geo?.lat && d.geo?.lng);

  const handleMarkerClick = (dorm: Dorm) => {
    setSelectedDorm(dorm);
    onDormClick?.(dorm);
    track("map_marker_click", { dormId: dorm.id, dormName: dorm.name });
  };

  const getMarkerColor = (dorm: Dorm) => {
    if (selectedDorm?.id === dorm.id) return "#3b82f6"; // blue
    if (dorm.verified) return "#10b981"; // green
    return "#ef4444"; // red
  };

  if (dormsWithCoords.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full bg-muted rounded-lg border border-border ${className}`}>
        <div className="text-center text-muted-foreground">
          <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Нет общежитий с координатами для отображения на карте</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Счетчик и легенда */}
      <div className="absolute top-4 left-4 z-[1000] bg-background/95 backdrop-blur-sm rounded-lg border border-border p-3 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">
            {dormsWithCoords.length} общежити{dormsWithCoords.length === 1 ? 'е' : dormsWithCoords.length < 5 ? 'я' : 'й'}
          </span>
        </div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span>Проверенные</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive"></div>
            <span>Обычные</span>
          </div>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
        className="z-0"
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController highlightedDormId={highlightedDormId} dorms={dormsWithCoords} />

        {dormsWithCoords.map((dorm) => (
          <Marker
            key={dorm.id}
            position={[dorm.geo!.lat, dorm.geo!.lng]}
            icon={createCustomIcon(getMarkerColor(dorm), selectedDorm?.id === dorm.id)}
            eventHandlers={{
              click: () => handleMarkerClick(dorm),
            }}
          >
            <Popup
              className="custom-popup"
              closeButton={true}
              autoClose={false}
              closeOnClick={false}
            >
              <div className="space-y-3 min-w-[250px]">
                <div className="flex items-start gap-2">
                  <Home className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-base leading-tight">{dorm.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{dorm.university}</p>
                  </div>
                  {dorm.verified && (
                    <Badge variant="outline" className="gap-1 text-xs flex-shrink-0">
                      <BadgeCheck className="h-3 w-3" />
                      Проверено
                    </Badge>
                  )}
                </div>
                
                <div className="text-sm text-muted-foreground flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{dorm.address}</span>
                </div>
                
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-primary">
                    {dorm.priceKzt.toLocaleString()} ₸
                  </div>
                  <div className="text-xs text-muted-foreground">в месяц</div>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {dorm.roomTypes.slice(0, 2).map(type => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                  {dorm.roomTypes.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{dorm.roomTypes.length - 2}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  {onViewDetails && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        track("map_view_details", { dormId: dorm.id });
                        onViewDetails(dorm);
                        setSelectedDorm(null);
                      }}
                      className="flex-1 min-h-[36px]"
                    >
                      Подробнее
                    </Button>
                  )}
                  {onRequestClick && (
                    <Button
                      size="sm"
                      onClick={() => {
                        track("map_open_request", { dormId: dorm.id });
                        onRequestClick(dorm);
                        setSelectedDorm(null);
                      }}
                      className="flex-1 min-h-[36px]"
                    >
                      Оставить заявку
                    </Button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Подсказка */}
      <div className="mt-2 text-xs text-muted-foreground text-center">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span>🖱️ Перетаскивание для перемещения</span>
          <span>🔍 Колесико мыши для масштабирования</span>
          <span>📍 Клик на маркер для информации</span>
        </div>
      </div>
    </div>
  );
}

