import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Search } from "lucide-react";

interface LocationSearchMapProps {
  center: [number, number];
  zoom: number;
  dogPath?: [number, number][];
  victimPath?: [number, number][];
  onLocationChange?: (location: string, coordinates: [number, number]) => void;
  locationValue?: string;
}

export function LocationSearchMap({
  center,
  zoom,
  dogPath,
  victimPath,
  onLocationChange,
  locationValue = "",
}: LocationSearchMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const dogPathLayerRef = useRef<any>(null);
  const victimPathLayerRef = useRef<any>(null);
  const [locationText, setLocationText] = useState(locationValue);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const hasInitialized = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!hasInitialized.current) {
      setLocationText(locationValue);
      hasInitialized.current = true;
    }
  }, [locationValue]);

  useEffect(() => {
    if (!mapRef.current) return;

    const loadLeaflet = async () => {
      // Load CSS
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Load JS
      if (!(window as any).L) {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        document.head.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      if (!isMounted.current) return;

      const L = (window as any).L;
      if (!L || mapInstanceRef.current) return;

      if (!mapRef.current) return;

      // Initialize map
      const map = L.map(mapRef.current).setView(center, zoom);

      L.tileLayer(process.env.REACT_APP_TILE_PROVIDER_URL!, {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add click event listener
      map.on("click", (e: any) => {
        const coordinates: [number, number] = [e.latlng.lat, e.latlng.lng];

        // Remove existing marker
        if (markerRef.current) {
          markerRef.current.remove();
        }

        // Add new marker
        markerRef.current = L.marker(coordinates).addTo(map);

        // Update location
        if (onLocationChange) {
          onLocationChange(locationText, coordinates);
        }
      });

      mapInstanceRef.current = map;
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    // Remove old dog path
    if (dogPathLayerRef.current) {
      dogPathLayerRef.current.remove();
      dogPathLayerRef.current = null;
    }

    // Add new dog path if available
    if (dogPath && dogPath.length > 0) {
      dogPathLayerRef.current = L.polyline(dogPath, {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.7
      }).addTo(mapInstanceRef.current);
    }
  }, [dogPath]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    // Remove old victim path
    if (victimPathLayerRef.current) {
      victimPathLayerRef.current.remove();
      victimPathLayerRef.current = null;
    }

    // Add new victim path if available
    if (victimPath && victimPath.length > 0) {
      victimPathLayerRef.current = L.polyline(victimPath, {
        color: '#f97316',
        weight: 3,
        opacity: 0.7
      }).addTo(mapInstanceRef.current);
    }
  }, [victimPath]);

  
  const handleSearch = async (query: string) => {
    setLocationText(query);

    if (query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Use Nominatim API for geocoding
        const response = await fetch(
          `${process.env.REACT_APP_NOMINATIM_API_URL}?format=json&q=${encodeURIComponent(
            query
          )}&limit=5`
        );
        const results = await response.json();
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleSelectResult = (result: any) => {
    const label = result.display_name;
    const coordinates: [number, number] = [
      parseFloat(result.lat),
      parseFloat(result.lon),
    ];

    setLocationText(label);
    setShowResults(false);
    setSearchResults([]);

    if (onLocationChange) {
      onLocationChange(label, coordinates);
    }

    // Update map view and marker
    if (mapInstanceRef.current) {
      const L = (window as any).L;
      mapInstanceRef.current.setView(coordinates, 14);

      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Add new marker
      markerRef.current = L.marker(coordinates).addTo(mapInstanceRef.current);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative z-[1001]">
        <div className="relative bg-white rounded-lg shadow-sm border border-gray-200">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            value={locationText}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Rechercher un lieu..."
            className="pl-9 pr-4 border-0 focus-visible:ring-0"
          />
        </div>

        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto z-[1002]">
            {" "}
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleSelectResult(result)}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors text-sm border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-900">
                  {result.display_name}
                </div>
              </button>
            ))}
          </div>
        )}

        {isSearching && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-3 z-[1002]">
            {" "}
            <p className="text-sm text-gray-600">Recherche en cours...</p>
          </div>
        )}
      </div>

      <div className="relative w-full h-96 rounded-lg overflow-hidden border-2 border-blue-200 z-[1000]">
        {" "}
        <div ref={mapRef} className="w-full h-full" />
      </div>
    </div>
  );
}
