import React, { useEffect, useState } from "react";
import { Trail, isMantrailingTrail, isHikingTrail } from "../types/trail";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Edit, MapPin, Clock, Ruler, User, TrendingUp, Award, Calendar, FileText, Trash2 } from "lucide-react";
import { TrailMap } from "./TrailMap";
import { deleteTrail, deleteHike } from "../utils/api";

import { MapContainer, Marker, TileLayer, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import { Icon, LatLngBounds } from 'leaflet';
import DogHomePageIcon from "./DogHomePageIcon";
import TrailIcon from "./TrailIcon";
import HikeIcon from "./HikeIcon";

interface TrailDetailProps {
  trail: Trail;
  onEdit: (trail: Trail) => void;
  onDeleteSuccess: () => void;
}

// A new component to handle fitting the map to the bounds of the traces
const FitBounds = ({ dogTrace, runnerTrace }: { dogTrace?: [number, number][], runnerTrace?: [number, number][] }) => {
  const map = useMap();

  useEffect(() => {
    if (!dogTrace && !runnerTrace) return;

    const allPoints = [
      ...(dogTrace || []),
      ...(runnerTrace || []),
    ];

    if (allPoints.length > 0) {
      map.fitBounds(new LatLngBounds(allPoints as L.LatLngExpression[]), { padding: [50, 50] });
    }
  }, [map, dogTrace, runnerTrace]);

  return null;
};

export function TrailDetail({ trail, onEdit, onDeleteSuccess }: TrailDetailProps) {
  const isAllowedToCreate = localStorage.getItem('isAllowedToCreate') === 'true';
  const [maxDogMasterDistance, setMaxDogMasterDistance] = useState<number | null>(null);

  useEffect(() => {
    if (isHikingTrail(trail) && trail.dogTrack && trail.userTrack) {
      const getTrackPointsFromGeoJSON = (featureCollection: any): { lat: number, lon: number, time: number }[] | undefined => {
        if (!featureCollection || featureCollection.type !== 'FeatureCollection' || !featureCollection.features?.[0]) {
          return undefined;
        }
        const feature = featureCollection.features[0];
        if (feature.geometry?.type !== 'LineString') {
          return undefined;
        }
        const coordinates = feature.geometry.coordinates; // [lon, lat]
        const timestamps = feature.properties?.timestamps;

        return coordinates.map((coord: [number, number], index: number) => ({
          lat: coord[1],
          lon: coord[0],
          time: new Date(timestamps[index]).getTime(),
        }));
      };

      const calculateDistance = (point1: {lat: number, lon: number}, point2: {lat: number, lon: number}): number => {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = (point1.lat * Math.PI) / 180;
        const φ2 = (point2.lat * Math.PI) / 180;
        const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
        const Δλ = ((point2.lon - point1.lon) * Math.PI) / 180;

        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
      }

      const dogPoints = getTrackPointsFromGeoJSON(trail.dogTrack);
      const userPoints = getTrackPointsFromGeoJSON(trail.userTrack);

      if (dogPoints && userPoints && dogPoints.length > 0 && userPoints.length > 0) {
        let maxDist = 0;
        for (const dogPoint of dogPoints) {
          const userIndex = userPoints.findIndex(p => p.time > dogPoint.time);

          let userPosition;

          if (userIndex === 0) {
            userPosition = userPoints[0];
          } else if (userIndex === -1) {
            userPosition = userPoints[userPoints.length - 1];
          } else {
            const p1 = userPoints[userIndex - 1];
            const p2 = userPoints[userIndex];
            const timeDiff = p2.time - p1.time;

            if (timeDiff <= 0) {
              userPosition = p1;
            } else {
              const ratio = (dogPoint.time - p1.time) / timeDiff;
              userPosition = {
                lat: p1.lat + ratio * (p2.lat - p1.lat),
                lon: p1.lon + ratio * (p2.lon - p1.lon),
              };
            }
          }
          console.log(dogPoint, userPosition, calculateDistance(dogPoint, userPosition));
          const distance = calculateDistance(dogPoint, userPosition);
          if (distance > maxDist) {
            maxDist = distance;
          }
        }
        
        setMaxDogMasterDistance(maxDist);
      }
    }
  }, [trail]);


  const handleDelete = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette piste ?")) {
      try {
        if (isMantrailingTrail(trail)) {
          await deleteTrail(trail.id || trail._id || '');
        } else {
          await deleteHike(trail.id || trail._id || '');
        }
        onDeleteSuccess();
      } catch (error) {
        console.error("Failed to delete trail:", error);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else if (minutes > 0) {
      return `${minutes}min ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  // Get display title based on trail type
  const getTitle = () => {
    if (isMantrailingTrail(trail)) {
      return `${trail.dogName} - ${new Date(trail.date).toLocaleDateString('fr-FR')}`;
    } else {
      return trail.name;
    }
  };

  // Extract map data from trail - now only for hiking
  const getMapData = () => {
    let dogPath: [number, number][] | undefined;
    let victimPath: [number, number][] | undefined;
    let center: [number, number] = [46.2044, 6.1432]; // Default center

    const getCoordinatesFromTrack = (featureCollection: any) => {
      if (!featureCollection || featureCollection.type !== 'FeatureCollection' || !featureCollection.features?.[0]) return undefined;
      const feature = featureCollection.features[0];
      if (feature.geometry && feature.geometry.type === 'LineString') {
        return feature.geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]);
      }
      return undefined;
    };

    if (isHikingTrail(trail)) {
      victimPath = getCoordinatesFromTrack(trail.userTrack);
      dogPath = getCoordinatesFromTrack(trail.dogTrack);

      if (trail.startLocation) {
        center = [trail.startLocation.coordinates[1], trail.startLocation.coordinates[0]]; // Convert lon,lat to lat,lon
      } else if (victimPath && victimPath.length > 0) {
        const avgLat = victimPath.reduce((sum, p) => sum + p[0], 0) / victimPath.length;
        const avgLon = victimPath.reduce((sum, p) => sum + p[1], 0) / victimPath.length;
        center = [avgLat, avgLon];
      }
    }

    return { center, zoom: 15, dogPath, victimPath };
  };

  const mapData = getMapData();

  const runnerTrace = isMantrailingTrail(trail) && trail.runnerTrace?.trk[0]?.trkseg[0]?.trkpt ? trail.runnerTrace.trk[0].trkseg[0].trkpt.map((point: any) => [parseFloat(point.$.lat), parseFloat(point.$.lon)]) : undefined;
  const dogTrace = isMantrailingTrail(trail) && trail.dogTrace?.trk[0]?.trkseg[0]?.trkpt ? trail.dogTrace.trk[0].trkseg[0].trkpt.map((point: any) => [parseFloat(point.$.lat), parseFloat(point.$.lon)]) : undefined;
  
  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <Card className={`bg-gradient-to-r ${
          trail.category === "mantrailing" 
            ? "from-blue-600 to-blue-700" 
            : "from-green-600 to-green-700"
        } text-white border-0 shadow-xl`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <CardTitle className="text-3xl">{getTitle()}</CardTitle>
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                    {trail.category === "mantrailing" ? (
                      <>
                        <TrailIcon className="h-3 w-3 mr-1" />
                        Mantrailing
                      </>
                    ) : (
                      <>
                        <HikeIcon className="h-3 w-3 mr-1" />
                        Randonnée
                      </>
                    )}
                  </Badge>
                </div>
                {trail.location && (
                  <div className="flex items-center gap-2 text-blue-100">
                    <MapPin className="h-4 w-4" />
                    <span>{trail.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-blue-100">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(trail.date).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
              {isAllowedToCreate && (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEdit(trail)}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Modifier
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-2 border-blue-200 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Ruler className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Distance</p>
                  <p className="text-xl text-blue-900">{trail.distance ? formatDistance(trail.distance) : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-3 rounded-full">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Durée</p>
                  <p className="text-xl text-orange-900">{trail.duration ? formatDuration(trail.duration) : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {isHikingTrail(trail) && trail.elevationGain !== undefined && (
            <Card className="border-2 border-green-200 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-full">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dénivelé +</p>
                    <p className="text-xl text-green-900">{trail.elevationGain} m</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isHikingTrail(trail) && trail.difficulty && (
            <Card className="border-2 border-purple-200 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Difficulté</p>
                    <p className="text-xl text-purple-900">
                      {trail.difficulty === "Easy" ? "Facile" :
                       trail.difficulty === "Moderate" ? "Modérée" :
                       trail.difficulty === "Hard" ? "Difficile" : "Expert"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}


        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Information Card */}
          <Card className="border-2 border-blue-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="text-blue-900">
                {trail.category === "mantrailing" ? "Informations de la piste" : "Détails de la randonnée"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {isMantrailingTrail(trail) && (
                <>
                  <div className="flex items-start gap-3">
                    <DogHomePageIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Chien</p>
                      <p className="text-blue-900">{trail.dogName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Conducteur</p>
                      <p className="text-blue-900">{trail.handlerName}</p>
                    </div>
                  </div>
                  {trail.trainer && (
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Maître / Formateur</p>
                        <p className="text-blue-900">{trail.trainer}</p>
                      </div>
                    </div>
                  )}
                  {trail.trailType && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Type de piste</p>
                        <p className="text-blue-900">{trail.trailType}</p>
                      </div>
                    </div>
                  )}
                  {trail.startType && (
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Type de départ</p>
                        <p className="text-blue-900">
                          {trail.startType === "knowing" ? "Départ visuel / Knowing" : 
                           trail.startType === "blind" ? "Départ à l'aveugle / Blind" : 
                           trail.startType}
                        </p>
                      </div>
                    </div>
                  )}
                  {trail.delay !== undefined && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Délai</p>
                        <p className="text-blue-900">{formatDuration(trail.delay)}</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {isHikingTrail(trail) && trail.description && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-green-900">{trail.description}</p>
                  </div>
                </div>
              )}

              {isHikingTrail(trail) && maxDogMasterDistance !== null && (
                <div className="flex items-start gap-3">
                  <DogHomePageIcon className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Éloignement max. du chien</p>
                    <p className="text-green-900">{formatDistance(maxDogMasterDistance)}</p>
                  </div>
                </div>
              )}

              {trail.notes && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Notes</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{trail.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Map Card */}
          <Card className="border-2 border-blue-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Carte du parcours
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isMantrailingTrail(trail) ? (
                <div className="h-96">
                  {trail.locationCoordinate && trail.locationCoordinate.length === 2 &&
                    <MapContainer 
                      key={trail.id || trail._id} // Force re-render when trail changes
                      style={{ height: "100%", width: "100%" }} 
                      center={trail.locationCoordinate} 
                      zoom={16} 
                      scrollWheelZoom={true}
                    >
                      <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url={process.env.REACT_APP_TILE_PROVIDER_URL!}
                      />
                      <FitBounds dogTrace={dogTrace} runnerTrace={runnerTrace} />
                      {dogTrace && <Polyline pathOptions={{ color: 'red' }} positions={dogTrace} />}
                      {runnerTrace && <Marker position={runnerTrace[runnerTrace.length - 1]} icon={new Icon({ iconUrl: require('../assets/flag.png'), iconAnchor: [8, 16] })} />}
                      {runnerTrace && <Polyline pathOptions={{ color: 'blue' }} positions={runnerTrace} />}
                      {trail.locationCoordinate && <Marker position={trail.locationCoordinate} icon={new Icon({ iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41] })} />}
                    </MapContainer>
                  }
                </div>
              ) : (
                <>
                  <div className="h-96">
                    <TrailMap key={trail.id || trail._id} mapData={mapData} />
                  </div>
                  {(mapData.dogPath || mapData.victimPath) && (
                    <div className="p-4 bg-gray-50 border-t flex gap-6 text-sm">
                      {mapData.dogPath && (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-1 bg-blue-600 rounded"></div>
                          <span className="text-gray-700">
                            Trace du chien
                          </span>
                        </div>
                      )}
                      {mapData.victimPath && (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-1 bg-orange-600 rounded"></div>
                          <span className="text-gray-700">
                            Votre trace
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}