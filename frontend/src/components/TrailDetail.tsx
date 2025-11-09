import React, { useEffect, useState } from "react";
import { Trail, isMantrailingTrail, isHikingTrail, HikingTrail } from "../types/trail";
import { deleteTrail, deleteHike } from "../utils/api";
import { MantrailingDetails } from "./MantrailingDetails";
import { HikingDetails } from "./HikingDetails";
import { Button } from "./ui/button";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";

export function TrailDetail({ trail, onEdit, onDeleteSuccess, onBack, dogName }: {
  trail: Trail;
  onEdit?: (trail: Trail) => void;
  onDeleteSuccess?: () => void;
  onBack?: () => void; // New prop for trainer dashboard navigation
  dogName?: string; // To display in the back button
}) {
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
        const trailId = trail.id || trail._id;
        if (!trailId) throw new Error("Trail ID is missing");

        if (isMantrailingTrail(trail)) {
          await deleteTrail(trailId);
        } else {
          await deleteHike(trailId);
        }
        onDeleteSuccess?.();
      } catch (error) {
        console.error("Failed to delete trail:", error);
      }
    }
  };

  const trailName = isMantrailingTrail(trail) ? trail.location : (trail as HikingTrail).name;

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à {dogName || "la fiche"}
              </Button>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{trailName || "Détail de la piste"}</h1>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && <Button variant="outline" size="icon" onClick={() => onEdit(trail)}><Edit className="h-4 w-4" /></Button>}
            {onDeleteSuccess && <Button variant="destructive" size="icon" onClick={handleDelete}><Trash2 className="h-4 w-4" /></Button>}
          </div>
        </div>

        {isMantrailingTrail(trail) ? (
          <MantrailingDetails
            trail={trail}
          />
        ) : isHikingTrail(trail) ? (
          <HikingDetails
            trail={trail as HikingTrail}
            maxDogMasterDistance={maxDogMasterDistance}
          />
        ) : null}
      </div>
    </div>
  );
}