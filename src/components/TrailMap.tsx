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
  const dogPathLayerRef = useRef<any>(null);
  const victimPathLayerRef = useRef<any>(null);

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

      const L = (window as any).L;
      if (!L || !mapRef.current || mapInstanceRef.current) {
        // If Leaflet is not loaded, mapRef is null, or map already exists, do nothing.
        return;
      }

      map = L.map(mapRef.current).setView(mapData.center, mapData.zoom);
      L.tileLayer(process.env.REACT_APP_TILE_PROVIDER_URL!, {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        // Clean up map instance on component unmount
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount to initialize the map

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    // Clear existing path layers
    if (dogPathLayerRef.current) {
      mapInstanceRef.current.removeLayer(dogPathLayerRef.current);
      dogPathLayerRef.current = null;
    }
    if (victimPathLayerRef.current) {
      mapInstanceRef.current.removeLayer(victimPathLayerRef.current);
      victimPathLayerRef.current = null;
    }

    const layers: any[] = [];

    // Add dog path
    if (mapData.dogPath && mapData.dogPath.length > 0) {
      dogPathLayerRef.current = L.polyline(mapData.dogPath, { color: '#3b82f6', weight: 3, opacity: 0.8 }).addTo(mapInstanceRef.current);
      layers.push(dogPathLayerRef.current);
    }

    // Add victim path
    if (mapData.victimPath && mapData.victimPath.length > 0) {
      victimPathLayerRef.current = L.polyline(mapData.victimPath, { color: '#f97316', weight: 3, opacity: 0.8, dashArray: '10, 10' }).addTo(mapInstanceRef.current);
      layers.push(victimPathLayerRef.current);
    }

    // Adjust map view to fit paths or set to center/zoom
    if (layers.length > 0) {
      const group = L.featureGroup(layers);
      mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });
    } else {
      mapInstanceRef.current.setView(mapData.center, mapData.zoom);
    }

    // Invalidate size after updates to ensure correct rendering, especially if container size changes
    // This is safer here as it operates on an existing map instance.
    mapInstanceRef.current.invalidateSize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapData, mapInstanceRef.current]); // Re-run when mapData changes or map instance becomes available

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
