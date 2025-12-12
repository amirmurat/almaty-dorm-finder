// Wrapper для динамической загрузки карты (чтобы избежать SSR проблем)
import { lazy, Suspense } from "react";
import { Dorm } from "@/data/dorms";

const InteractiveMap = lazy(() => import("./InteractiveMap").then(module => ({ default: module.InteractiveMap })));

interface MapWrapperProps {
  dorms: Dorm[];
  onDormClick?: (dorm: Dorm) => void;
  onViewDetails?: (dorm: Dorm) => void;
  onRequestClick?: (dorm: Dorm) => void;
  highlightedDormId?: string;
  className?: string;
}

export function MapWrapper(props: MapWrapperProps) {
  return (
    <Suspense fallback={
      <div className={`flex items-center justify-center h-full bg-muted rounded-lg border border-border ${props.className}`}>
        <div className="text-center text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Загрузка карты...</p>
        </div>
      </div>
    }>
      <InteractiveMap {...props} />
    </Suspense>
  );
}

