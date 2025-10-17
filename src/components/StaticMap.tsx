import { useState, useRef, useEffect } from "react";
import { Dorm } from "@/data/dorms";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ZoomIn, ZoomOut, BadgeCheck } from "lucide-react";
import { track } from "@/lib/tracking";
import basemapImage from "/assets/almaty-map.jpg";

interface StaticMapProps {
  dorms: Dorm[];
  onDormClick?: (dorm: Dorm) => void;
  onViewDetails?: (dorm: Dorm) => void;
  onRequestClick?: (dorm: Dorm) => void;
  highlightedDormId?: string;
  className?: string;
}

export function StaticMap({
  dorms,
  onDormClick,
  onViewDetails,
  onRequestClick,
  highlightedDormId,
  className = ""
}: StaticMapProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedDorm, setSelectedDorm] = useState<Dorm | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 0.3, 2.5);
    setZoom(newZoom);
    track("map_zoom", { action: "in", zoom: newZoom });
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 0.3, 0.7);
    setZoom(newZoom);
    track("map_zoom", { action: "out", zoom: newZoom });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".marker")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPan({ x: newX, y: newY });
    track("map_pan", { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const centerX = rect.width / 2 - clickX;
    const centerY = rect.height / 2 - clickY;
    setPan({ x: centerX, y: centerY });
  };

  const handleMarkerClick = (dorm: Dorm, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDorm(dorm);
    onDormClick?.(dorm);
    track("map_marker_click", { dormId: dorm.id, dormName: dorm.name });
  };

  const handleKeyDown = (e: React.KeyboardEvent, dorm: Dorm) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedDorm(dorm);
      onDormClick?.(dorm);
      track("map_marker_click", { dormId: dorm.id, dormName: dorm.name, via: "keyboard" });
    }
  };

  useEffect(() => {
    if (highlightedDormId) {
      const dorm = dorms.find(d => d.id === highlightedDormId);
      if (dorm) {
        setSelectedDorm(dorm);
      }
    }
  }, [highlightedDormId, dorms]);

  // Simple clustering: if markers are too close at current zoom
  const clusterThreshold = 40 / zoom;
  const clusteredMarkers = dorms.reduce((acc, dorm) => {
    const existing = acc.find(m => 
      Math.abs(m.mapX - dorm.mapX) < clusterThreshold && 
      Math.abs(m.mapY - dorm.mapY) < clusterThreshold
    );
    
    if (existing && existing.count !== undefined) {
      existing.count++;
    } else {
      acc.push({ ...dorm, count: 1 });
    }
    return acc;
  }, [] as Array<Dorm & { count?: number }>);

  return (
    <div className={`relative ${className}`}>
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          aria-label="Zoom in"
          className="bg-background/95 backdrop-blur-sm"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          aria-label="Zoom out"
          className="bg-background/95 backdrop-blur-sm"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Map container */}
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden rounded-lg border border-border bg-muted cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        role="application"
        aria-label="Interactive map showing dormitory locations"
      >
        {/* Basemap */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center",
            transition: isDragging ? "none" : "transform 0.2s ease-out"
          }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={basemapImage}
            alt="Almaty city map"
            className="w-full h-full object-cover"
            draggable={false}
          />

          {/* Markers */}
          {clusteredMarkers.map((marker) => (
            <div
              key={marker.id}
              className="marker absolute"
              style={{
                left: `${(marker.mapX / 1024) * 100}%`,
                top: `${(marker.mapY / 1024) * 100}%`,
                transform: "translate(-50%, -100%)"
              }}
            >
              <button
                onClick={(e) => handleMarkerClick(marker, e)}
                onKeyDown={(e) => handleKeyDown(e, marker)}
                className={`relative transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded-full ${
                  selectedDorm?.id === marker.id ? "scale-125" : ""
                }`}
                aria-label={`${marker.name}, ${marker.priceKzt.toLocaleString()} KZT`}
              >
                <div className="relative">
                  <svg
                    width="32"
                    height="40"
                    viewBox="0 0 32 40"
                    className="drop-shadow-lg"
                  >
                    <path
                      d="M16 0C7.2 0 0 7.2 0 16c0 8.8 16 24 16 24s16-15.2 16-24C32 7.2 24.8 0 16 0z"
                      fill={selectedDorm?.id === marker.id ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                    />
                    <circle cx="16" cy="15" r="6" fill="white" />
                  </svg>
                  {marker.count && marker.count > 1 && (
                    <div className="absolute -top-1 -right-1 bg-background text-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-primary">
                      +{marker.count - 1}
                    </div>
                  )}
                </div>
              </button>

              {/* Popover */}
              {selectedDorm?.id === marker.id && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20 w-64 bg-background border border-border rounded-lg shadow-xl p-4 animate-scale-in">
                  <button
                    onClick={() => setSelectedDorm(null)}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                    aria-label="Close"
                  >
                    ×
                  </button>
                  
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <h3 className="font-semibold text-sm flex-1">{marker.name}</h3>
                      {marker.verified && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <BadgeCheck className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{marker.address}</p>
                    
                    <div className="text-lg font-bold text-primary">
                      {marker.priceKzt.toLocaleString()} ₸/mo
                    </div>

                    <div className="flex gap-2 pt-2">
                      {onViewDetails && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            track("map_view_details", { dormId: marker.id });
                            onViewDetails(marker);
                          }}
                          className="flex-1"
                        >
                          View Details
                        </Button>
                      )}
                      {onRequestClick && (
                        <Button
                          size="sm"
                          onClick={() => {
                            track("map_open_request", { dormId: marker.id });
                            onRequestClick(marker);
                          }}
                          className="flex-1"
                        >
                          Request
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2 text-xs text-muted-foreground text-center">
        Double-click to center • Drag to pan • Use +/– to zoom
      </div>
    </div>
  );
}
