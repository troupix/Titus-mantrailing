import { GpxData } from "../types/trail";

export function parseGPXFile(gpxContent: string): GpxData | null {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(gpxContent, "text/xml");

    // Check for parsing errors
    if (xmlDoc.querySelector("parsererror")) {
      console.error("Error parsing GPX file");
      return null;
    }

    // Extract track points
    const trkpts = Array.from(xmlDoc.querySelectorAll("trkpt"));
    
    if (trkpts.length === 0) {
      console.error("No track points found in GPX file");
      return null;
    }

    const path: [number, number][] = [];
    const elevations: number[] = [];
    const timestamps: Date[] = [];

    trkpts.forEach((trkpt) => {
      const lat = parseFloat(trkpt.getAttribute("lat") || "0");
      const lon = parseFloat(trkpt.getAttribute("lon") || "0");
      path.push([lat, lon]);

      // Extract elevation if available
      const eleElement = trkpt.querySelector("ele");
      if (eleElement) {
        const elevation = parseFloat(eleElement.textContent || "0");
        elevations.push(elevation);
      }

      // Extract timestamp if available
      const timeElement = trkpt.querySelector("time");
      if (timeElement && timeElement.textContent) {
        timestamps.push(new Date(timeElement.textContent));
      }
    });

    // Calculate distance using Haversine formula
    const distance = calculateTotalDistance(path);

    // Calculate center point
    const avgLat = path.reduce((sum, point) => sum + point[0], 0) / path.length;
    const avgLon = path.reduce((sum, point) => sum + point[1], 0) / path.length;
    const center: [number, number] = [avgLat, avgLon];

    // Calculate elevation gain
    let elevationGain = 0;
    if (elevations.length > 1) {
      for (let i = 1; i < elevations.length; i++) {
        const diff = elevations[i] - elevations[i - 1];
        if (diff > 0) {
          elevationGain += diff;
        }
      }
    }

    // Calculate duration from timestamps
    let duration: number | undefined;
    if (timestamps.length >= 2) {
      const startTime = timestamps[0].getTime();
      const endTime = timestamps[timestamps.length - 1].getTime();
      duration = Math.round((endTime - startTime) / 1000); // in seconds
    }

    const startPoint: [number, number] = path[0];
    const endPoint: [number, number] = path[path.length - 1];

    return {
      path,
      distance: Math.round(distance),
      center,
      elevationGain: Math.round(elevationGain),
      duration,
      startPoint,
      endPoint,
      timestamps: timestamps.length > 0 ? timestamps : undefined,
    };
  } catch (error) {
    console.error("Error parsing GPX file:", error);
    return null;
  }
}

function calculateTotalDistance(points: [number, number][]): number {
  if (points.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalDistance += calculateDistance(points[i], points[i + 1]);
  }
  return totalDistance;
}

function calculateDistance(point1: [number, number], point2: [number, number]): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (point1[0] * Math.PI) / 180;
  const φ2 = (point2[0] * Math.PI) / 180;
  const Δφ = ((point2[0] - point1[0]) * Math.PI) / 180;
  const Δλ = ((point2[1] - point1[1]) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Convert GPX data to GeoJSON format for storage
export function gpxToGeoJSON(gpxData: GpxData) {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: gpxData.path.map(([lat, lon]) => [lon, lat]), // GeoJSON uses [lon, lat]
        },
        properties: {
          distance: gpxData.distance,
          elevationGain: gpxData.elevationGain,
          duration: gpxData.duration,
        },
      },
    ],
  };
}

// Convert GeoJSON back to path format
export function geoJSONToPath(geoJSON: any): [number, number][] {
  try {
    if (geoJSON.features && geoJSON.features.length > 0) {
      const coordinates = geoJSON.features[0].geometry.coordinates;
      // Convert [lon, lat] to [lat, lon]
      return coordinates.map(([lon, lat]: [number, number]) => [lat, lon]);
    }
    return [];
  } catch (error) {
    console.error("Error converting GeoJSON to path:", error);
    return [];
  }
}

// Format duration for display
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  } else if (minutes > 0) {
    return `${minutes}min ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

// Format distance for display
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Math.round(meters)} m`;
}
