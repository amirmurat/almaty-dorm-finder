import { useState, useRef, useEffect } from "react";
import { Dorm } from "@/data/dorms";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ZoomIn, ZoomOut, BadgeCheck, RotateCcw, MapPin, Home } from "lucide-react";
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
  const [hoveredDorm, setHoveredDorm] = useState<Dorm | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialZoom = 1;
  const initialPan = { x: 0, y: 0 };

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

  const handleResetView = () => {
    setZoom(initialZoom);
    setPan(initialPan);
    setSelectedDorm(null);
    track("map_reset_view", {});
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.7, Math.min(2.5, zoom + delta));
    
    // Zoom к точке курсора
    const zoomRatio = newZoom / zoom;
    const newPanX = mouseX - (mouseX - pan.x) * zoomRatio;
    const newPanY = mouseY - (mouseY - pan.y) * zoomRatio;
    
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
    track("map_zoom", { action: "wheel", zoom: newZoom });
  };

  // Touch gestures для мобильных
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; distance: number } | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      setTouchStart({ x: (touch1.clientX + touch2.clientX) / 2, y: (touch1.clientY + touch2.clientY) / 2, distance });
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStart) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      const scale = distance / touchStart.distance;
      const newZoom = Math.max(0.7, Math.min(2.5, zoom * scale));
      setZoom(newZoom);
    } else if (e.touches.length === 1 && isDragging) {
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      setPan({ x: newX, y: newY });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTouchStart(null);
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

  // Улучшенная кластеризация
  const clusterThreshold = 50 / zoom;
  const clusteredMarkers = dorms.reduce((acc, dorm) => {
    const existing = acc.find(m => 
      m.count !== undefined &&
      Math.abs(m.mapX - dorm.mapX) < clusterThreshold && 
      Math.abs(m.mapY - dorm.mapY) < clusterThreshold
    );
    
    if (existing && existing.count !== undefined) {
      existing.count++;
      // Добавляем ID всех общежитий в кластере
      if (!existing.clusterIds) existing.clusterIds = [existing.id];
      existing.clusterIds.push(dorm.id);
    } else {
      acc.push({ ...dorm, count: 1, clusterIds: [dorm.id] });
    }
    return acc;
  }, [] as Array<Dorm & { count?: number; clusterIds?: string[] }>);

  // Функция для получения цвета маркера
  const getMarkerColor = (dorm: Dorm) => {
    if (selectedDorm?.id === dorm.id) return "hsl(var(--primary))";
    if (hoveredDorm?.id === dorm.id) return "hsl(var(--primary))";
    if (dorm.verified) return "hsl(var(--success))";
    return "hsl(var(--destructive))";
  };

  return (
    <div className={`relative ${className}`}>
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          aria-label="Увеличить"
          className="bg-background/95 backdrop-blur-sm shadow-md hover:shadow-lg transition-all"
          disabled={zoom >= 2.5}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          aria-label="Уменьшить"
          className="bg-background/95 backdrop-blur-sm shadow-md hover:shadow-lg transition-all"
          disabled={zoom <= 0.7}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleResetView}
          aria-label="Сбросить вид"
          className="bg-background/95 backdrop-blur-sm shadow-md hover:shadow-lg transition-all"
          title="Сбросить вид карты"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Счетчик и легенда */}
      <div className="absolute top-4 left-4 z-10 bg-background/95 backdrop-blur-sm rounded-lg border border-border p-3 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">{dorms.length} общежити{dorms.length === 1 ? 'е' : dorms.length < 5 ? 'я' : 'й'}</span>
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

      {/* Map container */}
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden rounded-lg border border-border bg-muted cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="application"
        aria-label="Интерактивная карта с расположением общежитий"
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
                onMouseEnter={() => setHoveredDorm(marker)}
                onMouseLeave={() => setHoveredDorm(null)}
                className={`relative transition-all duration-200 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full ${
                  selectedDorm?.id === marker.id ? "scale-125 z-30" : hoveredDorm?.id === marker.id ? "scale-110 z-20" : "z-10"
                }`}
                aria-label={`${marker.name}, ${marker.priceKzt.toLocaleString()} ₸`}
                style={{
                  padding: '8px',
                  margin: '-8px',
                  minWidth: '48px',
                  minHeight: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div className="relative pointer-events-none animate-in fade-in duration-300">
                  <svg
                    width={marker.count && marker.count > 1 ? "40" : "32"}
                    height={marker.count && marker.count > 1 ? "48" : "40"}
                    viewBox="0 0 32 40"
                    className="drop-shadow-xl transition-all duration-200"
                  >
                    <path
                      d="M16 0C7.2 0 0 7.2 0 16c0 8.8 16 24 16 24s16-15.2 16-24C32 7.2 24.8 0 16 0z"
                      fill={getMarkerColor(marker)}
                      className="transition-colors duration-200"
                    />
                    <circle cx="16" cy="15" r="6" fill="white" />
                    {marker.verified && (
                      <circle cx="16" cy="15" r="3" fill={getMarkerColor(marker)} opacity="0.3" />
                    )}
                  </svg>
                  {marker.count && marker.count > 1 && (
                    <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-background shadow-lg animate-pulse">
                      {marker.count}
                    </div>
                  )}
                </div>
              </button>

              {/* Popover */}
              {selectedDorm?.id === marker.id && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-30 w-72 bg-background border border-border rounded-lg shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => setSelectedDorm(null)}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full w-8 h-8 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Закрыть"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    ×
                  </button>
                  
                  <div className="space-y-3 pr-6">
                    <div className="flex items-start gap-2">
                      <Home className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-base leading-tight">{marker.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{marker.university}</p>
                      </div>
                      {marker.verified && (
                        <Badge variant="outline" className="gap-1 text-xs flex-shrink-0">
                          <BadgeCheck className="h-3 w-3" />
                          Проверено
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="leading-relaxed">{marker.address}</span>
                    </div>
                    
                    <div className="flex items-baseline gap-2">
                      <div className="text-2xl font-bold text-primary">
                        {marker.priceKzt.toLocaleString()} ₸
                      </div>
                      <div className="text-xs text-muted-foreground">в месяц</div>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {marker.roomTypes.slice(0, 2).map(type => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                      {marker.roomTypes.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{marker.roomTypes.length - 2}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-border">
                      {onViewDetails && (
                        <Button
                          size="default"
                          variant="outline"
                          onClick={() => {
                            track("map_view_details", { dormId: marker.id });
                            onViewDetails(marker);
                            setSelectedDorm(null);
                          }}
                          className="flex-1 min-h-[44px]"
                        >
                          Подробнее
                        </Button>
                      )}
                      {onRequestClick && (
                        <Button
                          size="default"
                          onClick={() => {
                            track("map_open_request", { dormId: marker.id });
                            onRequestClick(marker);
                            setSelectedDorm(null);
                          }}
                          className="flex-1 min-h-[44px]"
                        >
                          Оставить заявку
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
      <div className="mt-2 text-xs text-muted-foreground text-center space-y-1">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span>🖱️ Перетаскивание для перемещения</span>
          <span>🔍 Колесико мыши для масштабирования</span>
          <span>👆 Двойной клик для центрирования</span>
        </div>
        {dorms.length > 0 && (
          <div className="text-xs">
            Показано {clusteredMarkers.length} из {dorms.length} маркеров
            {clusteredMarkers.some(m => m.count && m.count > 1) && " (некоторые сгруппированы)"}
          </div>
        )}
      </div>
    </div>
  );
}
