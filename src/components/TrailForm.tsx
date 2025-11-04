import { useState, useEffect } from "react";
import {
  Trail,
  TrailCategory,
  HikingTrail,
  isMantrailingTrail,
  isHikingTrail,
  MantrailingTrailPayload,
} from "../types/trail";
import { parseGPXFile } from "../utils/gpxParser";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { X, Upload, FileText, Trash2, Info } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { GpxTraceEditor } from "./GpxTraceEditor";
import {
  createHike,
  updateHike,
  saveTrail,
  updateTrail,
  deleteTrail,
  deleteHike,
  uploadHikePhotos,
} from "../utils/api";
import { LocationSearchMap } from "./LocationSearchMap";
import DogHomePageIcon from "./DogHomePageIcon";
import HikeIcon from "./HikeIcon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { activityFormRegistry } from "./ActivityFormRegistry";

interface TrailFormProps {
  trail?: Trail;
  onSaveSuccess: () => void;
  onCancel: () => void;
}

export function TrailForm({ trail, onSaveSuccess, onCancel }: TrailFormProps) {
  const [category, setCategory] = useState<TrailCategory>(
    trail?.category || "mantrailing"
  );

  // Common fields
  const [date, setDate] = useState(
    trail?.date || new Date().toISOString().split("T")[0]
  );
  const [location, setLocation] = useState(trail?.location || "");
  const [locationCoordinate, setLocationCoordinate] = useState<
    [number, number]
  >(() => {
    if (trail) {
      if (isMantrailingTrail(trail) && trail.locationCoordinate) {
        return trail.locationCoordinate;
      } else if (isHikingTrail(trail) && trail.startLocation) {
        // Convert [lon, lat] to [lat, lon] for Leaflet
        return [
          trail.startLocation.coordinates[1],
          trail.startLocation.coordinates[0],
        ];
      }
    }
    return [46.2563, 5.6554]; // Default: Oyonnax
  });
  const [distance, setDistance] = useState(trail?.distance || 0);
  const [duration, setDuration] = useState(trail?.duration || 0);
  const [notes, setNotes] = useState(trail?.notes || "");

  // Mantrailing specific fields
  const [selectedDogId, setSelectedDogId] = useState<string>(() => {
    if (trail && isMantrailingTrail(trail) && trail.dog) {
      return trail.dog._id;
    }
    return ""; // Default to empty, user must select a dog
  });
  const [handlerName, setHandlerName] = useState(
    (trail && isMantrailingTrail(trail) ? trail.handlerName : "") || ""
  );
  const [trainer, setTrainer] = useState(
    trail && isMantrailingTrail(trail) ? trail.trainer || "" : ""
  );
  const [trailType, setTrailType] = useState(
    trail && isMantrailingTrail(trail) ? trail.trailType || "" : ""
  );
  const [startType, setStartType] = useState(
    trail && isMantrailingTrail(trail)
      ? trail.startType || "knowing"
      : "knowing"
  );
  const [delay, setDelay] = useState(
    trail && isMantrailingTrail(trail) ? trail.delay || 0 : 0
  );

  // Photo upload fields
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (trail && isHikingTrail(trail) && trail.photos) {
      setExistingPhotos(trail.photos);
    }
  }, [trail]);

  // Hiking specific fields
  const [name, setName] = useState(
    trail && isHikingTrail(trail) ? trail.name : ""
  );
  const [description, setDescription] = useState(
    trail && isHikingTrail(trail) ? trail.description || "" : ""
  );
  const [difficulty, setDifficulty] = useState<
    "Easy" | "Moderate" | "Hard" | "Expert"
  >(
    trail && isHikingTrail(trail) ? trail.difficulty || "Moderate" : "Moderate"
  );
  const [elevationGain, setElevationGain] = useState(
    trail && isHikingTrail(trail) ? trail.elevationGain || 0 : 0
  );

  // GPX files and data
  const [dogGpxFile, setDogGpxFile] = useState<File | null>(null);
  const [userGpxFile, setUserGpxFile] = useState<File | null>(null);
  const [dogGpxData, setDogGpxData] = useState<any>(null);
  const [userGpxData, setUserGpxData] = useState<any>(null);
  const [gpxError, setGpxError] = useState("");

  // State for live preview of trace editing. The path is what the map uses.
  const [previewDogPath, setPreviewDogPath] = useState<[number, number][] | null>(null); 
  const [previewUserPath, setPreviewUserPath] = useState<[number, number][] | null>(null);

  useEffect(() => {
    const parseFeatureCollection = (featureCollection: any) => {
      if (!featureCollection || featureCollection.type !== 'FeatureCollection' || !featureCollection.features?.[0]) return null;
      const feature = featureCollection.features[0];
      if (feature.geometry?.type !== 'LineString') return null;
      const path = feature.geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]);
      if (path.length > 0) {
        const avgLat = path.reduce((sum: number, p: [number, number]) => sum + p[0], 0) / path.length;
        const avgLon = path.reduce((sum: number, p: [number, number]) => sum + p[1], 0) / path.length;
        return {
          path,
          center: [avgLat, avgLon],
          timestamps: feature.properties?.timestamps,
        };
      }
      return null;
    };

    if (trail) {
      if (isMantrailingTrail(trail)) {
        const dogGpxData = parseFeatureCollection(trail.dogTrace);
        if (dogGpxData) setDogGpxData({ ...dogGpxData, distance: trail.distance });
        const userGpxData = parseFeatureCollection(trail.runnerTrace);
        if (userGpxData) setUserGpxData({ ...userGpxData, distance: 0 });
      } else if (isHikingTrail(trail)) {
        const userGpxData = parseFeatureCollection(trail.userTrack);
        if (userGpxData) setUserGpxData({ ...userGpxData, distance: trail.distance });
        const dogGpxData = parseFeatureCollection(trail.dogTrack);
        if (dogGpxData) setDogGpxData({ ...dogGpxData, distance: 0 });
      }
    }
  }, [trail]);

  const handleGPXUpload =
    (type: "dog" | "user") =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.name.endsWith(".gpx")) {
        setGpxError("Veuillez sélectionner un fichier GPX valide");
        return;
      }

      try {
        const content = await file.text();
        const gpxData = parseGPXFile(content);
        console.log("Parsed GPX Data:", gpxData);

        if (!gpxData) {
          setGpxError("Erreur lors de l'analyse du fichier GPX");
          return;
        }

        if (gpxData.center) {
          setLocationCoordinate(gpxData.center as [number, number]);
        }

        if (gpxData.timestamps && gpxData.timestamps.length > 0) {
          const trailDate = new Date(gpxData.timestamps[0]);
          const formattedDate = trailDate.toISOString().split('T')[0];
          setDate(formattedDate);
        }

        if (type === "dog") {
          setDogGpxFile(file);
          setDogGpxData(gpxData);
          // For mantrailing, dog track determines the distance
          if (category === "mantrailing") {
            setDistance(gpxData.distance);
          }
        } else {
          setUserGpxFile(file);
          setUserGpxData(gpxData);
          // For hiking, user track determines the distance and elevation
          if (category === "hiking") {
            setDistance(gpxData.distance);
            if (gpxData.elevationGain) {
              setElevationGain(gpxData.elevationGain);
            }
          }
        }

        // Auto-fill duration if available and not already set
        if (gpxData.duration) {
          setDuration(gpxData.duration);
        }

        setGpxError("");
      } catch (error) {
        setGpxError("Erreur lors de la lecture du fichier GPX");
        console.error(error);
      }
    };

  const handleRemoveGPX = (type: "dog" | "user") => () => {
    if (type === "dog") {
      setDogGpxFile(null);
      setDogGpxData(null);
      setPreviewDogPath(null);
    } else {
      setUserGpxFile(null);
      setUserGpxData(null);
      setPreviewUserPath(null);
    }
    setGpxError("");
  };

  const handlePreviewDogPath = (previewPath: [number, number][], newTimestamps?: (string | Date)[]) => {
    setPreviewDogPath(previewPath);
  };


  const handleUpdateDogPath = (newPath: [number, number][], newTimestamps?: (string | Date)[]) => {
    if (!dogGpxData) return;

    const calculateDistance = (points: [number, number][]): number => {
      if (points.length < 2) return 0;
      let totalDistance = 0;
      for (let i = 0; i < points.length - 1; i++) {
        const R = 6371e3;
        const φ1 = (points[i][0] * Math.PI) / 180;
        const φ2 = (points[i + 1][0] * Math.PI) / 180;
        const Δφ = ((points[i + 1][0] - points[i][0]) * Math.PI) / 180;
        const Δλ = ((points[i + 1][1] - points[i][1]) * Math.PI) / 180;
        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        totalDistance += R * c;
      }
      return Math.round(totalDistance);
    };

    const calculateDuration = (timestamps?: (string | Date)[]): number => {
      if (!timestamps || timestamps.length < 2) return 0;
      try {
        const startTime = new Date(timestamps[0]).getTime();
        const endTime = new Date(timestamps[timestamps.length - 1]).getTime();
        return Math.round((endTime - startTime) / 1000);
      } catch (e) {
        return 0;
      }
    };

    const newDistance = calculateDistance(newPath);
    const avgLat =
      newPath.reduce((sum, point) => sum + point[0], 0) / newPath.length;
    const avgLon =
      newPath.reduce((sum, point) => sum + point[1], 0) / newPath.length;

    setDogGpxData({
      ...dogGpxData,
      path: newPath,
      distance: newDistance,
      center: [avgLat, avgLon],
      timestamps: newTimestamps,
    });

    if (category === "mantrailing") {
      setDistance(newDistance);
      setDuration(calculateDuration(newTimestamps));
    }
    setPreviewDogPath(null); // Clear preview on final update
  };

  const handlePreviewUserPath = (previewPath: [number, number][], newTimestamps?: (string | Date)[]) => {
    setPreviewUserPath(previewPath);
  };

  const handleUpdateUserPath = (newPath: [number, number][], newTimestamps?: (string | Date)[]) => {
    if (!userGpxData) return;

    const calculateDistance = (points: [number, number][]): number => {
      if (points.length < 2) return 0;
      let totalDistance = 0;
      for (let i = 0; i < points.length - 1; i++) {
        const R = 6371e3;
        const φ1 = (points[i][0] * Math.PI) / 180;
        const φ2 = (points[i + 1][0] * Math.PI) / 180;
        const Δφ = ((points[i + 1][0] - points[i][0]) * Math.PI) / 180;
        const Δλ = ((points[i + 1][1] - points[i][1]) * Math.PI) / 180;
        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        totalDistance += R * c;
      }
      return Math.round(totalDistance);
    };

    const calculateDuration = (timestamps?: (string | Date)[]): number => {
      if (!timestamps || timestamps.length < 2) return 0;
      try {
        const startTime = new Date(timestamps[0]).getTime();
        const endTime = new Date(timestamps[timestamps.length - 1]).getTime();
        return Math.round((endTime - startTime) / 1000);
      } catch (e) {
        return 0;
      }
    };

    const newDistance = calculateDistance(newPath);
    const avgLat =
      newPath.reduce((sum, point) => sum + point[0], 0) / newPath.length;
    const avgLon =
      newPath.reduce((sum, point) => sum + point[1], 0) / newPath.length;

    setUserGpxData({
      ...userGpxData,
      path: newPath,
      distance: newDistance,
      center: [avgLat, avgLon],
      timestamps: newTimestamps,
    });

    if (category === "hiking") {
      setDistance(newDistance);
      setDuration(calculateDuration(newTimestamps));
    }
    setPreviewUserPath(null); // Clear preview on final update
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const createGeoJSONFeatureCollection = (gpxData: any) => {
      if (!gpxData) return undefined;
      const coordinates = gpxData.path.map((p: [number, number]) => [p[1], p[0]]);
      return {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: coordinates,
            },
            properties: {
              timestamps: gpxData.timestamps,
            },
          },
        ],
      };
    };

    try {
      if (category === "mantrailing") {
        const mantrailingData: MantrailingTrailPayload & {
          id?: string;
        } = {
          category: "mantrailing",
          dog: selectedDogId,
          handlerName,
          trainer,
          date,
          location,
          distance,
          duration,
          notes,
          trailType,
          startType,
          delay,
          locationCoordinate: dogGpxData?.startPoint || locationCoordinate,
          dogTrace: createGeoJSONFeatureCollection(dogGpxData),
          runnerTrace: createGeoJSONFeatureCollection(userGpxData),
        };

        if (trail && (trail.id || trail._id)) {
          await updateTrail(
            trail.id || trail._id || "",
            mantrailingData as MantrailingTrailPayload
          );
        } else {
          await saveTrail(mantrailingData as MantrailingTrailPayload);
        }
      } else { // hiking
        const hikingData: Omit<HikingTrail, "id" | "_id"> & { id?: string } = {
          category: "hiking",
          name,
          description,
          date,
          distance,
          duration,
          elevationGain,
          difficulty,
          startLocation:
            userGpxData?.startPoint || locationCoordinate
              ? {
                  type: "Point",
                  coordinates: userGpxData?.startPoint
                    ? [userGpxData.startPoint[1], userGpxData.startPoint[0]]
                    : [locationCoordinate[1], locationCoordinate[0]],
                }
              : undefined,
          userTrack: createGeoJSONFeatureCollection(userGpxData),
          dogTrack: createGeoJSONFeatureCollection(dogGpxData),
          photos: existingPhotos, // This line was missing or incorrectly placed
        };

        let currentHikeId = trail?.id || trail?._id;
        let savedHike;

        if (currentHikeId) {
          // Update existing hike with potentially modified existingPhotos
          savedHike = await updateHike(
            currentHikeId,
            hikingData as Omit<HikingTrail, "id" | "_id">
          );
          currentHikeId = savedHike._id || savedHike.id;
        } else {
          // Create new hike with existingPhotos (which would be empty initially)
          savedHike = await createHike(hikingData as HikingTrail);
          currentHikeId = savedHike._id || savedHike.id;
        }

        // If there are new photos selected, upload them
        if (selectedPhotos.length > 0 && currentHikeId) {
          const formData = new FormData();
          selectedPhotos.forEach((photo) => {
            formData.append("photos", photo);
          });
          await uploadHikePhotos(currentHikeId, formData);
        }
      }
      onSaveSuccess();
    } catch (error) {
      console.error("Failed to save trail:", error);
    }
  };

  const handleDelete = async () => {
    if (!trail) return;

    try {
      if (category === "mantrailing") {
        await deleteTrail(trail.id || trail._id || "");
      } else {
        await deleteHike(trail.id || trail._id || "");
      }
      onSaveSuccess();
    } catch (error) {
      console.error("Failed to delete trail:", error);
    }
  };

  const ActivityForm = activityFormRegistry[category];

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-2 border-blue-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-green-100">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                {category === "mantrailing" ? (
                  <DogHomePageIcon className="h-6 w-6" />
                ) : (
                  <HikeIcon className="h-6 w-6" />
                )}
                {trail ? "Modifier" : "Nouvelle"}{" "}
                {category === "mantrailing"
                  ? "piste de mantrailing"
                  : "randonnée"}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onCancel}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Selection */}
              <div className="space-y-3">
                <Label className="text-blue-900">Type d'activité *</Label>
                <RadioGroup
                  value={category}
                  onValueChange={(value) => setCategory(value as TrailCategory)}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`flex items-center space-x-2 border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        category === "mantrailing"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <RadioGroupItem value="mantrailing" id="mantrailing" />
                      <label
                        htmlFor="mantrailing"
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <DogHomePageIcon className="h-5 w-5 text-blue-600" />
                        <span>Mantrailing</span>
                      </label>
                    </div>
                    <div
                      className={`flex items-center space-x-2 border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        category === "hiking"
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <RadioGroupItem value="hiking" id="hiking" />
                      <label
                        htmlFor="hiking"
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <HikeIcon className="h-5 w-5 text-green-600" />
                        <span>Randonnée</span>
                      </label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Common Fields */}
              <div className="space-y-4">
                <h3 className="text-lg text-blue-900">
                  Informations générales
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={
                        typeof date === "string"
                          ? date.split("T")[0]
                          : date.toISOString().split("T")[0]
                      }
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Lieu</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ex: Oyonnax"
                    />
                  </div>
                </div>
              </div>

              {ActivityForm && (
                <ActivityForm
                  selectedDogId={selectedDogId}
                  setSelectedDogId={setSelectedDogId}
                  handlerName={handlerName}
                  setHandlerName={setHandlerName}
                  trainer={trainer}
                  setTrainer={setTrainer}
                  trailType={trailType}
                  setTrailType={setTrailType}
                  startType={startType}
                  setStartType={setStartType}
                  delay={delay}
                  setDelay={setDelay}
                  name={name}
                  setName={setName}
                  description={description}
                  setDescription={setDescription}
                  difficulty={difficulty}
                  setDifficulty={setDifficulty}
                  elevationGain={elevationGain}
                  setElevationGain={setElevationGain}
                  selectedPhotos={selectedPhotos}
                  setSelectedPhotos={setSelectedPhotos}
                  existingPhotos={existingPhotos}
                  setExistingPhotos={setExistingPhotos}
                />
              )}

              {/* GPX Upload */}
              <div className="space-y-4">
                <h3 className="text-lg text-blue-900">Fichiers GPX</h3>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Les fichiers GPX permettent d'extraire automatiquement la
                    distance, la durée, le dénivelé et la localisation.
                  </AlertDescription>
                </Alert>

                {/* Primary track (Dog for mantrailing, User for hiking) */}
                <div className="space-y-3">
                  <Label
                    className={
                      category === "mantrailing"
                        ? "text-blue-900"
                        : "text-green-900"
                    }
                  >
                    {category === "mantrailing"
                      ? "Trace du chien"
                      : "Votre trace"}
                  </Label>

                  {!(category === "mantrailing"
                    ? dogGpxFile || dogGpxData
                    : userGpxFile || userGpxData) && (
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-${
                        category === "mantrailing" ? "blue" : "green"
                      }-400 transition-colors ${
                        category === "mantrailing"
                          ? "border-blue-200"
                          : "border-green-200"
                      }`}
                    >
                      <label
                        htmlFor={`${category}-primary-gpx-upload`}
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <div
                          className={`p-2 rounded-full ${
                            category === "mantrailing"
                              ? "bg-blue-100"
                              : "bg-green-100"
                          }`}
                        >
                          <Upload
                            className={`h-5 w-5 ${
                              category === "mantrailing"
                                ? "text-blue-600"
                                : "text-green-600"
                            }`}
                          />
                        </div>
                        <div>
                          <p
                            className={`text-sm ${
                              category === "mantrailing"
                                ? "text-blue-900"
                                : "text-green-900"
                            }`}
                          >
                            {category === "mantrailing"
                              ? "Trace du chien"
                              : "Votre trace"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Fichier .gpx
                          </p>
                        </div>
                      </label>
                      <input
                        id={`${category}-primary-gpx-upload`}
                        type="file"
                        accept=".gpx"
                        onChange={handleGPXUpload(
                          category === "mantrailing" ? "dog" : "user"
                        )}
                        className="hidden"
                      />
                    </div>
                  )}

                  {((category === "mantrailing" &&
                    (dogGpxFile || dogGpxData)) ||
                    (category === "hiking" &&
                      (userGpxFile || userGpxData))) && (
                    <div
                      className={`bg-gradient-to-r rounded-lg p-3 border-2 ${
                        category === "mantrailing"
                          ? "from-blue-50 to-blue-100 border-blue-200"
                          : "from-green-50 to-green-100 border-green-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <FileText
                          className={`h-5 w-5 mt-0.5 ${
                            category === "mantrailing"
                              ? "text-blue-600"
                              : "text-green-600"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm ${
                              category === "mantrailing"
                                ? "text-blue-900"
                                : "text-green-900"
                            }`}
                          >
                            {category === "mantrailing"
                              ? dogGpxFile?.name || "Trace du chien (existante)"
                              : userGpxFile?.name || "Votre trace (existante)"}
                          </p>
                          {((category === "mantrailing" && dogGpxData) ||
                            (category === "hiking" && userGpxData)) && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {Math.round(
                                (category === "mantrailing"
                                  ? dogGpxData.distance
                                  : userGpxData.distance) || 0
                              )}
                              m •{" "}
                              {(category === "mantrailing"
                                ? dogGpxData
                                : userGpxData
                              )?.path?.length || 0}{" "}
                              points
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleRemoveGPX(
                            category === "mantrailing" ? "dog" : "user"
                          )}
                          className={`h-8 w-8 ${
                            category === "mantrailing"
                              ? "text-blue-700 hover:text-blue-900 hover:bg-blue-200"
                              : "text-green-700 hover:text-green-900 hover:bg-green-200"
                          }`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Secondary track (Runner for mantrailing, Dog for hiking) */}
                <div className="space-y-3">
                  <Label className="text-orange-900">
                    {category === "mantrailing"
                      ? "Trace de la victime / coureur"
                      : "Trace du chien (optionnelle)"}
                  </Label>

                  {!(category === "mantrailing"
                    ? userGpxFile || userGpxData
                    : dogGpxFile || dogGpxData) && (
                    <div className="border-2 border-dashed border-orange-200 rounded-lg p-4 text-center hover:border-orange-400 transition-colors">
                      <label
                        htmlFor={`${category}-secondary-gpx-upload`}
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <div className="bg-orange-100 p-2 rounded-full">
                          <Upload className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-orange-900">
                            {category === "mantrailing"
                              ? "Trace de la victime / coureur"
                              : "Trace du chien"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Fichier .gpx (optionnel)
                          </p>
                        </div>
                      </label>
                      <input
                        id={`${category}-secondary-gpx-upload`}
                        type="file"
                        accept=".gpx"
                        onChange={handleGPXUpload(
                          category === "mantrailing" ? "user" : "dog"
                        )}
                        className="hidden"
                      />
                    </div>
                  )}

                  {((category === "mantrailing" &&
                    (userGpxFile || userGpxData)) ||
                    (category === "hiking" && (dogGpxFile || dogGpxData))) && (
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-orange-900">
                            {category === "mantrailing"
                              ? userGpxFile?.name ||
                                "Trace de la victime (existante)"
                              : dogGpxFile?.name ||
                                "Trace du chien (existante)"}
                          </p>
                          {((category === "mantrailing" && userGpxData) ||
                            (category === "hiking" && dogGpxData)) && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {Math.round(
                                (category === "mantrailing"
                                  ? userGpxData.distance
                                  : dogGpxData.distance) || 0
                              )}
                              m •{" "}
                              {(category === "mantrailing"
                                ? userGpxData
                                : dogGpxData
                              )?.path?.length || 0}{" "}
                              points
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleRemoveGPX(
                            category === "mantrailing" ? "user" : "dog"
                          )}
                          className="text-orange-700 hover:text-orange-900 hover:bg-orange-200 h-8 w-8"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {gpxError && (
                  <Alert variant="destructive">
                    <AlertDescription>{gpxError}</AlertDescription>
                  </Alert>
                )}
</div>

              {/* Location Search Map - Always Visible */}
              <div className="space-y-4">
                <h3 className="text-lg text-blue-900">Localisation</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Recherchez un lieu ou cliquez sur la carte pour définir la localisation.
                    {(dogGpxData || userGpxData) && " Les traces GPX sont affichées en bleu (chien) et orange (victime/personne)."}
                  </p>
                  <LocationSearchMap
                    center={
                      (category === "mantrailing" ? dogGpxData?.center : userGpxData?.center) || 
                      (category === "mantrailing" ? userGpxData?.center : dogGpxData?.center) || 
                      locationCoordinate
                    }
                    zoom={dogGpxData || userGpxData ? 15 : 12}
                    dogPath={previewDogPath || dogGpxData?.path}
                    victimPath={previewUserPath || userGpxData?.path}
                    onLocationChange={(locationText, coordinates) => {
                      setLocation(locationText);
                      setLocationCoordinate(coordinates);
                    }}
                    locationValue={location}
                  />
                </div>
              </div>
                {/* Trace Editors */}
                 <div className="space-y-4">
                {((category === "mantrailing" && dogGpxData) ||
                  (category === "hiking" && userGpxData)) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-900">
                      💡 <strong>Ajustez vos traces :</strong> Déplacez les curseurs pour sélectionner la portion de trace à conserver.
                    </p>
                  </div>
                )}

                {category === "mantrailing" && dogGpxData && (
                  <div className="mt-4">
                    <GpxTraceEditor
                      path={dogGpxData.path}
                      timestamps={dogGpxData.timestamps}
                      label="Trace du chien"
                      color="#3b82f6"
                      onUpdate={handleUpdateDogPath}
                      onPreview={handlePreviewDogPath}
                    />
                  </div>
                )}

                {category === "hiking" && userGpxData && (
                  <div className="mt-4">
                    <GpxTraceEditor
                      path={userGpxData.path}
                      timestamps={userGpxData.timestamps}
                      label="Votre trace"
                      color="#22c55e"
                      onUpdate={handleUpdateUserPath}
                      onPreview={handlePreviewUserPath}
                    />
                  </div>
                )}

                {category === "mantrailing" && userGpxData && (
                  <div className="mt-4">
                    <GpxTraceEditor
                      path={userGpxData.path}
                      timestamps={userGpxData.timestamps}
                      label="Trace de la victime"
                      color="#f97316"
                      onUpdate={handleUpdateUserPath}
                      onPreview={handlePreviewUserPath}
                    />
                  </div>
                )}

                {category === "hiking" && dogGpxData && (
                  <div className="mt-4">
                    <GpxTraceEditor
                      path={dogGpxData.path}
                      timestamps={dogGpxData.timestamps}
                      label="Trace du chien"
                      color="#3b82f6"
                      onUpdate={handleUpdateDogPath}
                      onPreview={handlePreviewDogPath}
                    />
                  </div>
                )}

                
              </div>

              {/* Activity Specific Fields */}
              <div className="space-y-4">
                <h3 className="text-lg text-blue-900">
                  {category === "mantrailing"
                    ? "Informations sur la piste"
                    : "Détails de la randonnée"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="distance">Distance (m)</Label>
                    <Input
                      id="distance"
                      type="number"
                      value={distance}
                      onChange={(e) => setDistance(Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Durée (secondes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ajoutez vos observations..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Enregistrer
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                  Annuler
                </Button>
                {trail && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Êtes-vous sûr de vouloir supprimer cette trace ?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}