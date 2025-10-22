import { useEffect, useRef } from "react";

interface MapData {
  center: [number, number];
  zoom: number;
  dogPath?: [number, number][];
  victimPath?: [number, number][];
}

interface TrailMapProps {
  mapData: MapData;
}

export function TrailMap({ mapData }: TrailMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const showLegend = (mapData.dogPath && mapData.dogPath.length > 0) || (mapData.victimPath && mapData.victimPath.length > 0);

  useEffect(() => {
    let map: any;

    const loadLeaflet = async () => {
      if (!mapRef.current) return;

      if (!(window as any).L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        document.head.appendChild(script);
        await new Promise(resolve => { script.onload = resolve; });
      }

      // Small delay to ensure Leaflet is fully available on the window object
      await new Promise(resolve => setTimeout(resolve, 50));

      const L = (window as any).L;
      if (!L || !mapRef.current) return;

      // If a map instance already exists, remove it before creating a new one
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      map = L.map(mapRef.current).setView(mapData.center, mapData.zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;

      // --- Path drawing logic moved here ---
      const layers: any[] = [];

      if (mapData.dogPath && mapData.dogPath.length > 0) {
        const dogPolyline = L.polyline(mapData.dogPath, { color: '#3b82f6', weight: 3, opacity: 0.8 }).addTo(map);
        layers.push(dogPolyline);
      }

      if (mapData.victimPath && mapData.victimPath.length > 0) {
        const victimPolyline = L.polyline(mapData.victimPath, { color: '#f97316', weight: 3, opacity: 0.8, dashArray: '10, 10' }).addTo(map);
        layers.push(victimPolyline);
      }

      if (layers.length > 0) {
        const group = L.featureGroup(layers);
        map.fitBounds(group.getBounds(), { padding: [50, 50] });
      } else {
        map.setView(mapData.center, mapData.zoom);
      }

      // Force map to re-evaluate its size
      setTimeout(() => map.invalidateSize(), 100);
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapData]); // Re-run this entire effect when mapData changes

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="w-full h-[400px] rounded-lg overflow-hidden border border-border"
      />
      {showLegend && (
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-200 z-[1000]">
          <p className="text-xs text-gray-500 mb-2">Légende</p>
          <div className="space-y-2 text-sm">
            {mapData.dogPath && mapData.dogPath.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-0.5 bg-blue-500 rounded"></div>
                <span className="text-gray-700">Chien/Personne</span>
              </div>
            )}
            {mapData.victimPath && mapData.victimPath.length > 0 && (
              <div className="flex items-center gap-3">
                <svg width="32" height="2" className="flex-shrink-0">
                  <line x1="0" y1="1" x2="32" y2="1" stroke="#f97316" strokeWidth="2" strokeDasharray="4,4" />
                </svg>
                <span className="text-gray-700">Victime/Maître</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
