import React, { useEffect } from "react";
import { MantrailingTrail } from "../types/trail";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MapPin, Clock, Ruler, User, Award } from "lucide-react";
import { MapContainer, Marker, TileLayer, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import { Icon, LatLngBounds } from 'leaflet';
import DogHomePageIcon from "./DogHomePageIcon";
import { useAuth } from "../contexts/AuthContext";
import { formatDuration, formatDistance } from "../utils/utils";

interface MantrailingDetailsProps {
  trail: MantrailingTrail;
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

export function MantrailingDetails({ trail }: MantrailingDetailsProps) {
  const { user } = useAuth();
  const isTrainer = user?.role.includes("trainer");

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

    victimPath = getCoordinatesFromTrack(trail.runnerTrace);
    dogPath = getCoordinatesFromTrack(trail.dogTrace);

    if (trail.locationCoordinate) {
      center = trail.locationCoordinate;
    } else if (victimPath && victimPath.length > 0) {
      const avgLat = victimPath.reduce((sum, p) => sum + p[0], 0) / victimPath.length;
      const avgLon = victimPath.reduce((sum, p) => sum + p[1], 0) / victimPath.length;
      center = [avgLat, avgLon];
    }

    return { center, zoom: 15, dogPath, victimPath };
  };

  const mapData = getMapData();

  return (
    <div className="space-y-6">
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
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Information Card */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
            <CardTitle className="text-blue-900">
              Informations de la piste
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <DogHomePageIcon className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Chien</p>
                <p className="text-blue-900">{typeof trail.dog === "object" ? trail.dog.name : ""}</p>
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
            {trail.notes && (
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">Notes</p>
                <p className="text-gray-700 whitespace-pre-wrap">{trail.notes}</p>
              </div>
            )}
            {isTrainer && trail.trainerComment && (
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">Commentaire du formateur (privé)</p>
                <p className="text-gray-700 whitespace-pre-wrap">{trail.trainerComment}</p>
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
            <div className="h-96 relative z-0">
              {mapData.center &&
                <MapContainer
                  key={trail.id || trail._id} // Force re-render when trail changes
                  style={{ height: "100%", width: "100%" }}
                  center={mapData.center}
                  zoom={mapData.zoom}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url={process.env.REACT_APP_TILE_PROVIDER_URL!}
                  />
                  <FitBounds dogTrace={mapData.dogPath} runnerTrace={mapData.victimPath} />
                  {mapData.dogPath && <Polyline pathOptions={{ color: 'red' }} positions={mapData.dogPath} />}
                  {mapData.victimPath && <Marker position={mapData.victimPath[mapData.victimPath.length - 1]} icon={new Icon({ iconUrl: require('../assets/flag.png'), iconAnchor: [8, 16] })} />}
                  {mapData.victimPath && <Polyline pathOptions={{ color: 'blue' }} positions={mapData.victimPath} />}
                  {trail.locationCoordinate && <Marker position={trail.locationCoordinate} icon={new Icon({ iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41] })} />}
                </MapContainer>
              }
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}