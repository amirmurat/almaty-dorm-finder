import { Link } from "react-router-dom";
import { MapPin, CheckCircle2 } from "lucide-react";
import { Dorm } from "@/data/dorms";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DormCardProps {
  dorm: Dorm;
  onRequestClick: (dorm: Dorm) => void;
}

export function DormCard({ dorm, onRequestClick }: DormCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-muted relative">
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div className="text-4xl mb-2">🏠</div>
            <div className="text-sm">{dorm.photos[0]}</div>
          </div>
        </div>
        {dorm.verified && (
          <div className="absolute top-2 right-2 bg-success text-success-foreground px-2 py-1 rounded-md flex items-center gap-1 text-xs font-medium">
            <CheckCircle2 size={14} />
            Verified
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
            <div className="text-xs text-muted-foreground">per month</div>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <MapPin size={14} className="mr-1" />
          {dorm.distanceKm} km from center
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
        
        <div className="flex gap-2">
          <Link to={`/dorms/${dorm.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              View details
            </Button>
          </Link>
          <Button 
            onClick={() => onRequestClick(dorm)} 
            size="sm" 
            className="flex-1"
          >
            Request
          </Button>
        </div>
      </div>
    </div>
  );
}
