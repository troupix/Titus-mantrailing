import { Dog } from ".";

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

// Mantrailing specific fields (Trail schema)
export interface MantrailingTrail extends BaseTrail {
  category: "mantrailing";
  trainer?: string;
  dog: Dog;
  handlerName: string;
  trailType?: string;
  startType?: "knowing" | "blind" | string; // départ visuel ou à l'aveugle
  locationCoordinate?: [number, number]; // [lat, lon]
  runnerTrace?: any;
  dogTrace?: any;
  delay?: number; // in seconds
  trainerComment?: string;
  weather?: {
    temperature?: number;
    conditions?: string;
    windDirection?: string;
    windSpeed?: number;
    humidity?: number;
  };
}

export interface MantrailingTrailPayload extends Omit<MantrailingTrail, 'dog'> {
  dog: string; // Represents the dog's ID when sending data to the backend

  handlerName: string;
  trailType?: string;
  startType?: "knowing" | "blind" | string; // départ visuel ou à l'aveugle
  locationCoordinate?: [number, number]; // [lat, lon]
  runnerTrace?: any;
  dogTrace?: any;
  delay?: number; // in seconds
  trainerComment?: string;
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
  difficulty?: "Easy" | "Moderate" | "Hard" | "Expert";
  elevationGain?: number | null; // in meters
  userTrack?: {
    type: string;
    features: any[];
    properties?: any; 
  } | null; // Allow null for userTrack
  dogTrack?: {
    type: string;
    features: any[];
  } | null; // Allow null for dogTrack
  userId?: string;
  photos?: string[];
  weather?: {
    temperature?: number;
    conditions?: string;
    windDirection?: string;
    windSpeed?: number;
    humidity?: number;
  };
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
