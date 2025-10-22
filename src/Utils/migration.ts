/**
 * This script provides a function to migrate mantrailing track data from a GPX-based
 * JSON structure to a standard GeoJSON format.
 *
 * The primary function, `convertGpxToGeoJSON`, takes an object representing the parsed
 * GPX data (specifically the `dogTrack` or `runnerTrack` objects) and transforms it
 * into a GeoJSON FeatureCollection. This new format is standardized and easily
 * usable with mapping libraries like Leaflet or Mapbox.
 *
 * The migration logic extracts latitude, longitude, and timestamp from each track
 * point (`trkpt`) and formats them into a `LineString` geometry and a `timestamps`
 * property, respectively.
 *
 * Usage Example (within your application):
 *
 * import { convertGpxToGeoJSON } from './migration';
 *
 * const oldTrackData = { ... }; // Your existing dogTrack/runnerTrack object
 * const newGeoJsonTrack = convertGpxToGeoJSON(oldTrackData);
 *
 * // Now `newGeoJsonTrack` can be used or stored in the new format.
 * if (newGeoJsonTrack) {
 *   // Save to database, pass to a map component, etc.
 * }
 */

// This represents the structure of the GPX data after being parsed from XML,
// likely by a library like xml2js, which the user's example resembles.
interface GpxPoint {
  $: {
    lat: string;
    lon: string;
  };
  ele: string | string[];
  time: string | string[];
}

interface GpxTrackSegment {
  trkpt: GpxPoint[];
}

interface GpxTrack {
  name: string | string[];
  trkseg: GpxTrackSegment[];
}

// This is the root object provided by the user for `dogTrack` or `runnerTrack`
export interface ParsedGpx {
  trk: GpxTrack[];
  // Includes other metadata like '$'
  [key: string]: any;
}


export interface GeoJsonFeature {
  type: "Feature";
  geometry: {
    type: "LineString";
    coordinates: number[][];
  };
  properties: {
    timestamps: string[];
  };
}

export interface GeoJsonFeatureCollection {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}

/**
 * Converts GPX track data (in a specific JSON format from xml2js)
 * into a GeoJSON FeatureCollection.
 * @param gpxData The parsed GPX data for a single track (dogTrack or runnerTrack).
 * @returns A GeoJSON FeatureCollection or null if the input is invalid.
 */
export function convertGpxToGeoJSON(gpxData: ParsedGpx): GeoJsonFeatureCollection | null {
  // Basic validation of the input structure
  if (!gpxData || !gpxData.trk || !gpxData.trk[0] || !gpxData.trk[0].trkseg || !gpxData.trk[0].trkseg[0] || !gpxData.trk[0].trkseg[0].trkpt) {
    console.error("Invalid GPX data structure provided.");
    return null;
  }

  const points = gpxData.trk[0].trkseg[0].trkpt;

  const coordinates: number[][] = [];
  const timestamps: string[] = [];

  for (const point of points) {
    const lat = parseFloat(point.$.lat);
    const lon = parseFloat(point.$.lon);
    // The time value might be a plain string or inside an array depending on the XML parser
    const time = Array.isArray(point.time) ? point.time[0] : point.time;

    if (!isNaN(lat) && !isNaN(lon) && time) {
      // GeoJSON coordinates are [longitude, latitude]
      coordinates.push([lon, lat]);
      timestamps.push(time as string);
    }
  }

  const geoJSON: GeoJsonFeatureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: coordinates,
        },
        properties: {
          timestamps: timestamps,
        },
      },
    ],
  };

  return geoJSON;
}
