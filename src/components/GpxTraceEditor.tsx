import { useState, useEffect } from "react";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Scissors, RotateCcw, MapPin } from "lucide-react";

interface GpxTraceEditorProps {
  path: [number, number][];
  label: string;
  color: string;
  onUpdate: (newPath: [number, number][]) => void;
  onPreview?: (newPath: [number, number][]) => void;
}

export function GpxTraceEditor({ path, label, color, onUpdate, onPreview }: GpxTraceEditorProps) {
  const [range, setRange] = useState<[number, number]>([0, path.length - 1]);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);

  useEffect(() => {
    setRange([0, path.length - 1]);
  }, [path.length]);

  useEffect(() => {
    if (onPreview) {
      const newPath = path.slice(range[0], range[1] + 1);
      onPreview(newPath);
    }
  }, [range, path, onPreview]);

  const calculateDistance = (points: [number, number][]): number => {
    if (points.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const R = 6371e3; // Earth's radius in meters
      const φ1 = points[i][0] * Math.PI / 180;
      const φ2 = points[i + 1][0] * Math.PI / 180;
      const Δφ = (points[i + 1][0] - points[i][0]) * Math.PI / 180;
      const Δλ = (points[i + 1][1] - points[i][1]) * Math.PI / 180;

      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      totalDistance += R * c;
    }
    return Math.round(totalDistance);
  };

  const selectedPath = path.slice(range[0], range[1] + 1);
  const selectedDistance = calculateDistance(selectedPath);
  const originalDistance = calculateDistance(path);

  const handleMouseDown = (type: 'start' | 'end') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(type);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newIndex = Math.round(percentage * (path.length - 1));

    if (isDragging === 'start') {
      setRange([Math.min(newIndex, range[1] - 1), range[1]]);
    } else {
      setRange([range[0], Math.max(newIndex, range[0] + 1)]);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const handleApply = () => {
    onUpdate(selectedPath);
  };

  const handleReset = () => {
    setRange([0, path.length - 1]);
  };

  const startPercentage = (range[0] / (path.length - 1)) * 100;
  const endPercentage = (range[1] / (path.length - 1)) * 100;

  const isModified = range[0] !== 0 || range[1] !== path.length - 1;

  return (
    <div className="space-y-4 p-4 border-2 rounded-lg bg-gradient-to-br from-white to-gray-50" style={{ borderColor: color + '40' }}>
      <div className="flex items-center justify-between">
        <Label className="text-sm" style={{ color }}>{label}</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-8"
            disabled={!isModified}
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Réinitialiser
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleApply}
            className="h-8 text-white hover:opacity-90"
            style={{ backgroundColor: color }}
            disabled={!isModified}
          >
            <Scissors className="h-3 w-3 mr-1" />
            Appliquer
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="bg-gray-50 p-2 rounded border border-gray-200">
          <p className="text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Points
          </p>
          <p className="text-gray-900 mt-1">{selectedPath.length} / {path.length}</p>
        </div>
        <div className="bg-gray-50 p-2 rounded border border-gray-200">
          <p className="text-muted-foreground">Distance sélection</p>
          <p className="text-gray-900 mt-1">{selectedDistance}m</p>
        </div>
        <div className="bg-gray-50 p-2 rounded border border-gray-200">
          <p className="text-muted-foreground">Distance originale</p>
          <p className="text-gray-900 mt-1">{originalDistance}m</p>
        </div>
      </div>

      {/* Visual Timeline */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground mb-1">Portion de la trace</div>
        <div className="h-3 bg-gray-200 rounded-full relative overflow-hidden shadow-inner">
          {/* Excluded parts with pattern */}
          <div 
            className="absolute h-full bg-gradient-to-r from-gray-300 to-gray-400 left-0 opacity-60"
            style={{ width: `${startPercentage}%` }}
          />
          <div 
            className="absolute h-full bg-gradient-to-l from-gray-300 to-gray-400 right-0 opacity-60"
            style={{ width: `${100 - endPercentage}%` }}
          />
          {/* Selected part with gradient */}
          <div 
            className="absolute h-full shadow-md"
            style={{ 
              background: `linear-gradient(to right, ${color}dd, ${color})`,
              left: `${startPercentage}%`,
              width: `${endPercentage - startPercentage}%`
            }}
          />
        </div>

        {/* Slider */}
        <div 
          className="relative h-12 cursor-crosshair select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Track */}
          <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full" />
          
          {/* Selected range */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full"
            style={{ 
              backgroundColor: color,
              left: `${startPercentage}%`,
              width: `${endPercentage - startPercentage}%`
            }}
          />

          {/* Start handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 bg-white shadow-md cursor-grab active:cursor-grabbing transition-transform hover:scale-110"
            style={{ 
              borderColor: color,
              left: `${startPercentage}%`,
              transform: `translateX(-50%) translateY(-50%)`,
              zIndex: isDragging === 'start' ? 20 : 10
            }}
            onMouseDown={handleMouseDown('start')}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            </div>
          </div>

          {/* End handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 bg-white shadow-md cursor-grab active:cursor-grabbing transition-transform hover:scale-110"
            style={{ 
              borderColor: color,
              left: `${endPercentage}%`,
              transform: `translateX(-50%) translateY(-50%)`,
              zIndex: isDragging === 'end' ? 20 : 10
            }}
            onMouseDown={handleMouseDown('end')}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            </div>
          </div>

          {/* Labels */}
          <div className="absolute -bottom-1 w-full flex justify-between text-xs text-muted-foreground">
            <span>Début</span>
            <span>Fin</span>
          </div>
        </div>
      </div>

      {/* Point indicators */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <div>
          <span>Point départ: </span>
          <span className="text-gray-900">{range[0] + 1}</span>
        </div>
        <div>
          <span>Point arrivée: </span>
          <span className="text-gray-900">{range[1] + 1}</span>
        </div>
      </div>

      {/* Modified indicator */}
      {isModified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded px-3 py-2 text-xs text-yellow-800">
          ⚠️ Modifications non appliquées - Cliquez sur "Appliquer" pour sauvegarder les changements
        </div>
      )}
    </div>
  );
}
