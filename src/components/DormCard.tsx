import { Link, useNavigate } from "react-router-dom";
import { MapPin, CheckCircle2 } from "lucide-react";
import { Dorm } from "@/data/dorms";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DormCardProps {
  dorm: Dorm;
  onRequestClick: (dorm: Dorm) => void;
}

export function DormCard({ dorm, onRequestClick }: DormCardProps) {
  const navigate = useNavigate();
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Не переходим, если клик был на кнопку
    if ((e.target as HTMLElement).closest('button, a')) {
      return;
    }
    navigate(`/dorms/${dorm.id}`);
  };

  return (
    <div 
      className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/dorms/${dorm.id}`);
        }
      }}
      aria-label={`${dorm.name} - ${dorm.priceKzt.toLocaleString()} ₸ в месяц`}
    >
      <div className="aspect-video bg-muted relative overflow-hidden">
        {dorm.photos[0] && dorm.photos[0].startsWith('http') ? (
          <>
            <img 
              src={dorm.photos[0]} 
              alt={dorm.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Fallback если изображение не загрузилось
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.parentElement?.querySelector('.image-fallback') as HTMLElement;
                if (fallback) {
                  fallback.style.display = 'flex';
                }
              }}
            />
            <div 
              className="image-fallback absolute inset-0 flex items-center justify-center text-muted-foreground bg-muted"
              style={{ display: 'none' }}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">🏠</div>
                <div className="text-sm">Фото недоступно</div>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="text-4xl mb-2">🏠</div>
              <div className="text-sm">{dorm.photos[0] || 'Фото'}</div>
            </div>
          </div>
        )}
        {dorm.verified && (
          <div className="absolute top-2 right-2 bg-success text-success-foreground px-2 py-1 rounded-md flex items-center gap-1 text-xs font-medium z-10 shadow-md">
            <CheckCircle2 size={14} />
            Проверено
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1 line-clamp-1">{dorm.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{dorm.university}</p>
          </div>
          <div className="text-right ml-2">
            <div className="font-bold text-lg text-primary">{dorm.priceKzt.toLocaleString()} ₸</div>
            <div className="text-xs text-muted-foreground">в месяц</div>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <MapPin size={14} className="mr-1" />
          {dorm.distanceKm} км от центра
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {dorm.roomTypes.map(type => (
            <Badge key={type} variant="secondary" className="text-xs">
              {type}
            </Badge>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {dorm.amenities.slice(0, 3).join(" • ")}
          {dorm.amenities.length > 3 && " • ..."}
        </div>
        
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Link to={`/dorms/${dorm.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Подробнее
            </Button>
          </Link>
          <Button 
            onClick={() => onRequestClick(dorm)} 
            size="sm" 
            className="flex-1"
          >
            Оставить заявку
          </Button>
        </div>
      </div>
    </div>
  );
}
