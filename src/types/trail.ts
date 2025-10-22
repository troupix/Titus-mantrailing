// Common fields for both trail types
interface BaseTrail {
  id?: string;
  _id?: string;
  category: "mantrailing" | "hiking";
  date: string | Date;
  distance?: number; // in meters
  duration?: number; // in seconds
  location?: string;
  notes?: string;
  createdAt?: string;
}

// Mantrailing specific fields (Session schema)
export interface MantrailingTrail extends BaseTrail {
  category: "mantrailing";
  trainer?: string;
  dogName: string;
  handlerName: string;
  trailType?: string;
  startType?: "knowing" | "blind" | string; // départ visuel ou à l'aveugle
  locationCoordinate?: [number, number]; // [lat, lon]
  runnerTrace?: any;
  dogTrace?: any;
  delay?: number; // in seconds
}

// Hiking specific fields (Hike schema)
export interface HikingTrail extends BaseTrail {
  category: "hiking";
  name: string;
  description?: string;
  startLocation?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  elevationGain?: number; // in meters
  difficulty?: "Easy" | "Moderate" | "Hard" | "Expert";
  userTrack?: {
    type: string;
    features: any[];
    properties?: any;
  };
  dogTrack?: {
    type: string;
    features: any[];
    properties?: any;
  };
  userId?: string;
}

// Union type for both trail types
export type Trail = MantrailingTrail | HikingTrail;

export type TrailCategory = "mantrailing" | "hiking";

// Map data structure for displaying trails on map
export interface MapData {
  center: [number, number]; // [lat, lon]
  zoom: number;
  dogPath?: [number, number][]; // For mantrailing: dog path, for hiking: dog companion path
  victimPath?: [number, number][]; // For mantrailing: runner/victim path, for hiking: user path
}

// Helper type guards
export function isMantrailingTrail(trail: Trail): trail is MantrailingTrail {
  return trail.category === "mantrailing";
}

export function isHikingTrail(trail: Trail): trail is HikingTrail {
  return trail.category === "hiking";
}

// GPX parsed data structure
export interface GpxData {
  path: [number, number][]; // [lat, lon]
  distance: number; // in meters
  center: [number, number]; // [lat, lon]
  elevationGain?: number; // in meters
  duration?: number; // in seconds
  startPoint?: [number, number]; // [lat, lon]
  endPoint?: [number, number]; // [lat, lon]
  timestamps?: Date[];
}
