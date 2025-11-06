import React, { useState } from "react";
import { HikingTrail } from "../types/trail";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogOverlay } from "./ui/dialog";
import { MapPin, Clock, Ruler, TrendingUp, Award, FileText } from "lucide-react";
import { WeatherDetails } from "./WeatherDetails";
import { TrailMap } from "./TrailMap";
import DogHomePageIcon from "./DogHomePageIcon";
import { formatDuration, formatDistance } from "../utils/utils";

interface HikingDetailsProps {
  trail: HikingTrail;
  maxDogMasterDistance: number | null;
}

export function HikingDetails({ trail, maxDogMasterDistance }: HikingDetailsProps) {
  const [showModal, setShowModal] = useState(false);
  const [currentImage, setCurrentImage] = useState('');

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

    victimPath = getCoordinatesFromTrack(trail.userTrack);
    dogPath = getCoordinatesFromTrack(trail.dogTrack);

    if (trail.startLocation) {
      center = [trail.startLocation.coordinates[1], trail.startLocation.coordinates[0]]; // Convert lon,lat to lat,lon
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

        {trail.elevationGain !== undefined && (
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

        {trail.difficulty && (
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
        <Card className="border-2 border-green-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
            <CardTitle className="text-green-900">
              Détails de la randonnée
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {trail.description && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-green-900">{trail.description}</p>
                </div>
              </div>
            )}

            {maxDogMasterDistance !== null && (
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
            <div className="h-96">
              <TrailMap key={trail.id || trail._id} mapData={mapData} />
            </div>
            {(mapData.dogPath || mapData.victimPath) && (
              <div className="p-4 bg-gray-50 border-t flex gap-6 text-sm relative z-0">
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
          </CardContent>
        </Card>
      </div>

      {trail.weather && <WeatherDetails weather={trail.weather} />}

      {/* Photos Section */}
      {trail.photos && trail.photos.length > 0 && (
        <Card className="border-2 border-green-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
            <CardTitle className="text-green-900">Photos</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {trail.photos.map((photoUrl, index) => (
              <img
                key={index}
                src={photoUrl}
                alt={`Hike ${index + 1}`}
                className="w-full h-48 object-cover rounded-md shadow-md cursor-pointer transform transition-transform duration-200 hover:scale-105"
                onClick={() => {
                  setCurrentImage(photoUrl);
                  setShowModal(true);
                }}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Image Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogOverlay />
        <DialogContent className="w-[80vw] max-w-none p-0 max-h-[90vh]">
          <img src={currentImage} alt="Enlarged" className="w-full h-full object-contain" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
